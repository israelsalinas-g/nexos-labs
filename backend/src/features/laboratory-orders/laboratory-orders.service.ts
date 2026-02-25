import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { LaboratoryOrder } from '../../entities/laboratory-order.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { Patient } from '../../entities/patient.entity';
import { Doctor } from '../../entities/doctor.entity';
import { TestProfile } from '../../entities/test-profile.entity';

import { OrderStatus } from '../../common/enums/order-status.enums';
import { OrderPriority } from '../../common/enums/order-priority.enums';
import { PaginationResult } from '../../common/interfaces';

import { CreateLaboratoryOrderDto } from '../../dto/create-laboratory-order.dto';
import { UpdateLaboratoryOrderDto } from '../../dto/update-laboratory-order.dto';
import { AddTestsToOrderDto } from '../../dto/add-tests-to-order.dto';

@Injectable()
export class LaboratoryOrdersService {
  private readonly logger = new Logger(LaboratoryOrdersService.name);

  constructor(
    @InjectRepository(LaboratoryOrder)
    private readonly laboratoryOrderRepository: Repository<LaboratoryOrder>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(OrderTest)
    private readonly orderTestRepository: Repository<OrderTest>,
    @InjectRepository(TestProfile)
    private readonly testProfileRepository: Repository<TestProfile>
  ) {}

  async create(createDto: CreateLaboratoryOrderDto): Promise<LaboratoryOrder> {
    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId }
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${createDto.patientId} no encontrado`);
    }

    // Verificar el doctor si se proporciona
    if (createDto.doctorId) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: createDto.doctorId }
      });

      if (!doctor) {
        throw new NotFoundException(`Doctor con ID ${createDto.doctorId} no encontrado`);
      }
    }

    // Generar número de orden
    const orderNumber = await this.generateOrderNumber();

    // Crear la orden
    const order = this.laboratoryOrderRepository.create({
      ...createDto,
      orderNumber,
      status: OrderStatus.PENDING,
      priority: createDto.priority || OrderPriority.NORMAL
    });

    return await this.laboratoryOrderRepository.save(order);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    priority?: OrderPriority,
    search?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginationResult<LaboratoryOrder>> {
    this.logger.log(`Obteniendo órdenes de laboratorio - Página: ${page}, Límite: ${limit}`);

    try {
      const skip = (page - 1) * limit;
      const query = this.laboratoryOrderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.patient', 'patient')
        .leftJoinAndSelect('order.doctor', 'doctor')
        .leftJoinAndSelect('order.tests', 'tests')
        .orderBy('order.createdAt', 'DESC');

      if (status) {
        query.andWhere('order.status = :status', { status });
      }

      if (priority) {
        query.andWhere('order.priority = :priority', { priority });
      }

      if (search) {
        query.andWhere(
          '(LOWER(order.orderNumber) LIKE LOWER(:search) OR ' +
          'LOWER(patient.firstName) LIKE LOWER(:search) OR ' +
          'LOWER(patient.lastName) LIKE LOWER(:search) OR ' +
          'LOWER(doctor.firstName) LIKE LOWER(:search) OR ' +
          'LOWER(doctor.lastName) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      if (startDate && endDate) {
        query.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        });
      }

      const [data, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`Se encontraron ${total} órdenes de laboratorio`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo órdenes de laboratorio: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<LaboratoryOrder> {
    const order = await this.laboratoryOrderRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'tests']
    });

    if (!order) {
      throw new NotFoundException(`Orden de laboratorio con ID ${id} no encontrada`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<LaboratoryOrder> {
    const order = await this.laboratoryOrderRepository.findOne({
      where: { orderNumber },
      relations: ['patient', 'doctor', 'tests']
    });

    if (!order) {
      throw new NotFoundException(`Orden de laboratorio ${orderNumber} no encontrada`);
    }

    return order;
  }

  async update(id: string, updateDto: UpdateLaboratoryOrderDto): Promise<LaboratoryOrder> {
    const order = await this.findOne(id);

    // Verificar el doctor si se cambia
    if (updateDto.doctorId && updateDto.doctorId !== order.doctorId) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: updateDto.doctorId }
      });

      if (!doctor) {
        throw new NotFoundException(`Doctor con ID ${updateDto.doctorId} no encontrado`);
      }
    }

    // Actualizar la orden
    Object.assign(order, updateDto);
    return await this.laboratoryOrderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<LaboratoryOrder> {
    const order = await this.findOne(id);
    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return await this.laboratoryOrderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.laboratoryOrderRepository.remove(order);
  }

  async getStats() {
    const total = await this.laboratoryOrderRepository.count();

    // Contar por estado
    const byStatus = await this.laboratoryOrderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    // Contar por prioridad
    const byPriority = await this.laboratoryOrderRepository
      .createQueryBuilder('order')
      .select('order.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.priority')
      .getRawMany();

    // Órdenes por día (últimos 7 días)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const byDate = await this.laboratoryOrderRepository
      .createQueryBuilder('order')
      .select('DATE(order.orderDate)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('order.orderDate >= :lastWeek', { lastWeek })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      })),
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: parseInt(item.count)
      })),
      byDate: byDate.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      }))
    };
  }

  // Método auxiliar para generar números de orden
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;
    
    // Obtener el último número de orden del año actual
    const lastOrder = await this.laboratoryOrderRepository
      .createQueryBuilder('order')
      .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.orderNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    // Formato: ORD-2025-000001
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Agregar pruebas a una orden (soporta TestDefinitions y TestProfiles)
   * Los perfiles se expanden automáticamente a sus pruebas componentes
   */
  async addTests(orderId: string, addTestsDto: AddTestsToOrderDto): Promise<any> {
    this.logger.log(`Agregando pruebas a orden ${orderId}`);

    // Verificar que la orden existe
    const order = await this.laboratoryOrderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${orderId} no encontrada`);
    }

    const createdTests: OrderTest[] = [];
    let sampleCounter = 1;

    // Procesar cada prueba en el array
    for (const test of addTestsDto.tests) {
      // Si es una prueba individual (testDefinitionId)
      if (test.testDefinitionId) {
        for (let i = 0; i < (test.quantity || 1); i++) {
          const orderTestData: any = {
            orderId: order.id,
            testDefinitionId: test.testDefinitionId as any,
            sampleNumber: this.generateSampleNumber(
              addTestsDto.sampleNumberBase,
              sampleCounter++,
              order.id
            )
          };

          // Solo agregar collectedBy si está proporcionado
          if (addTestsDto.collectedBy) {
            orderTestData.collectedBy = addTestsDto.collectedBy;
          }

          const orderTest = this.orderTestRepository.create(orderTestData);
          const saved = (await this.orderTestRepository.save(orderTest)) as unknown as OrderTest;
          createdTests.push(saved);
          this.logger.debug(`Prueba individual agregada: ${saved.id}`);
        }
      }

      // Si es un perfil (testProfileId) - se expande a sus pruebas componentes
      if (test.testProfileId) {
        const profile = await this.testProfileRepository.findOne({
          where: { id: test.testProfileId },
          relations: ['tests']
        });

        if (!profile) {
          this.logger.warn(`Perfil con ID ${test.testProfileId} no encontrado, se omite`);
          continue;
        }

        if (!profile.tests || profile.tests.length === 0) {
          this.logger.warn(`Perfil ${profile.name} no tiene pruebas asociadas, se omite`);
          continue;
        }

        // Crear un OrderTest para cada TestDefinition en el perfil
        for (let i = 0; i < (test.quantity || 1); i++) {
          for (const testDef of profile.tests) {
            const orderTestData: any = {
              orderId: order.id,
              testDefinitionId: testDef.id as any,
              sampleNumber: this.generateSampleNumber(
                addTestsDto.sampleNumberBase,
                sampleCounter++,
                order.id
              )
            };

            // Solo agregar collectedBy si está proporcionado
            if (addTestsDto.collectedBy) {
              orderTestData.collectedBy = addTestsDto.collectedBy;
            }

            const orderTest = this.orderTestRepository.create(orderTestData);
            const saved = (await this.orderTestRepository.save(orderTest)) as unknown as OrderTest;
            createdTests.push(saved);
            this.logger.debug(`Prueba del perfil '${profile.name}' agregada: ${saved.id}`);
          }
        }

        this.logger.log(`Perfil '${profile.name}' expandido a ${profile.tests.length} pruebas`);
      }
    }

    return {
      orderId: order.id,
      totalTestsAdded: createdTests.length,
      tests: createdTests,
      message: `${createdTests.length} pruebas agregadas exitosamente`
    };
  }

  /**
   * Generar número de muestra único
   */
  private generateSampleNumber(
    base: string | undefined,
    counter: number,
    orderId: string
  ): string {
    if (base) {
      return `${base}-${counter.toString().padStart(3, '0')}`;
    }

    // Formato: S-2025-UUID-shortId-Counter (Sample-Year-OrderIdShort-Counter)
    const year = new Date().getFullYear();
    // Usar los primeros 6 caracteres del UUID como identificador corto
    const shortId = orderId.substring(0, 6).toUpperCase();
    return `S-${year}-${shortId}-${counter.toString().padStart(3, '0')}`;
  }
}