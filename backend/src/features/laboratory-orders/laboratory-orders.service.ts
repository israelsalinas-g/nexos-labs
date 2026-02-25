import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class LaboratoryOrdersService extends BaseService<LaboratoryOrder> {
  protected readonly logger = new Logger(LaboratoryOrdersService.name);

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
    private readonly testProfileRepository: Repository<TestProfile>,
  ) {
    super(laboratoryOrderRepository);
  }

  async create(createDto: CreateLaboratoryOrderDto): Promise<LaboratoryOrder> {
    const patient = await this.patientRepository.findOne({ where: { id: createDto.patientId } });
    if (!patient) throw new NotFoundException(`Paciente con ID ${createDto.patientId} no encontrado`);

    if (createDto.doctorId) {
      const doctor = await this.doctorRepository.findOne({ where: { id: createDto.doctorId } });
      if (!doctor) throw new NotFoundException(`Doctor con ID ${createDto.doctorId} no encontrado`);
    }

    const order = this.laboratoryOrderRepository.create({
      ...createDto,
      orderNumber: await this.generateOrderNumber(),
      status: OrderStatus.PENDING,
      priority: createDto.priority || OrderPriority.NORMAL,
    });

    return await this.laboratoryOrderRepository.save(order);
  }

  async findAll(
    page = 1, limit = 10, status?: OrderStatus, priority?: OrderPriority,
    search?: string, startDate?: Date, endDate?: Date,
  ): Promise<PaginationResult<LaboratoryOrder>> {
    const query = this.laboratoryOrderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.patient', 'patient')
      .leftJoinAndSelect('order.doctor', 'doctor')
      .leftJoinAndSelect('order.tests', 'tests')
      .orderBy('order.createdAt', 'DESC');

    if (status) query.andWhere('order.status = :status', { status });
    if (priority) query.andWhere('order.priority = :priority', { priority });
    if (search) {
      query.andWhere(
        '(LOWER(order.orderNumber) LIKE LOWER(:search) OR LOWER(patient.name) LIKE LOWER(:search) OR LOWER(doctor.firstName) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    if (startDate && endDate) query.andWhere('order.orderDate BETWEEN :startDate AND :endDate', { startDate, endDate });

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string): Promise<LaboratoryOrder> {
    return super.findOne(id, { relations: ['patient', 'doctor', 'tests'] });
  }

  async update(id: string, updateDto: UpdateLaboratoryOrderDto): Promise<LaboratoryOrder> {
    const order = await this.findOne(id);

    if (updateDto.doctorId && updateDto.doctorId !== order.doctorId) {
      const doctor = await this.doctorRepository.findOne({ where: { id: updateDto.doctorId } });
      if (!doctor) throw new NotFoundException(`Doctor con ID ${updateDto.doctorId} no encontrado`);
    }

    Object.assign(order, updateDto);
    return await this.laboratoryOrderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<LaboratoryOrder> {
    const order = await this.findOne(id);
    order.status = status;
    if (status === OrderStatus.DELIVERED) order.deliveredAt = new Date();
    return await this.laboratoryOrderRepository.save(order);
  }

  async getStats() {
    const [total, byStatus, byPriority] = await Promise.all([
      this.laboratoryOrderRepository.count(),
      this.laboratoryOrderRepository.createQueryBuilder('order')
        .select('order.status', 'status').addSelect('COUNT(*)', 'count')
        .groupBy('order.status').getRawMany(),
      this.laboratoryOrderRepository.createQueryBuilder('order')
        .select('order.priority', 'priority').addSelect('COUNT(*)', 'count')
        .groupBy('order.priority').getRawMany(),
    ]);

    return {
      total,
      byStatus: byStatus.map(i => ({ status: i.status, count: parseInt(i.count) })),
      byPriority: byPriority.map(i => ({ priority: i.priority, count: parseInt(i.count) })),
    };
  }

  async addTests(orderId: string, addTestsDto: AddTestsToOrderDto): Promise<any> {
    const order = await this.findOne(orderId);
    const createdTests: OrderTest[] = [];
    let sampleCounter = 1;

    for (const test of addTestsDto.tests) {
      if (test.testDefinitionId) {
        for (let i = 0; i < (test.quantity || 1); i++) {
          const orderTest = this.orderTestRepository.create({
            orderId: order.id,
            testDefinitionId: test.testDefinitionId as any,
            sampleNumber: this.buildSampleNumber(addTestsDto.sampleNumberBase, sampleCounter++, order.id),
            ...(addTestsDto.collectedBy && { collectedBy: addTestsDto.collectedBy }),
          } as any);
          createdTests.push(await this.orderTestRepository.save(orderTest) as unknown as OrderTest);
        }
      }

      if (test.testProfileId) {
        const profile = await this.testProfileRepository.findOne({
          where: { id: test.testProfileId }, relations: ['tests'],
        });
        if (!profile?.tests?.length) continue;

        for (let i = 0; i < (test.quantity || 1); i++) {
          for (const testDef of profile.tests) {
            const orderTest = this.orderTestRepository.create({
              orderId: order.id,
              testDefinitionId: testDef.id as any,
              sampleNumber: this.buildSampleNumber(addTestsDto.sampleNumberBase, sampleCounter++, order.id),
              ...(addTestsDto.collectedBy && { collectedBy: addTestsDto.collectedBy }),
            } as any);
            createdTests.push(await this.orderTestRepository.save(orderTest) as unknown as OrderTest);
          }
        }
      }
    }

    return { orderId: order.id, totalTestsAdded: createdTests.length, tests: createdTests };
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;
    const lastOrder = await this.laboratoryOrderRepository.createQueryBuilder('order')
      .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.orderNumber', 'DESC').getOne();

    const nextNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  private buildSampleNumber(base: string | undefined, counter: number, orderId: string): string {
    if (base) return `${base}-${counter.toString().padStart(3, '0')}`;
    const shortId = orderId.substring(0, 6).toUpperCase();
    return `S-${new Date().getFullYear()}-${shortId}-${counter.toString().padStart(3, '0')}`;
  }
}