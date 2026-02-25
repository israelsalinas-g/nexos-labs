import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResult } from '../../entities/test-result.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { PaginationResult } from '../../common/interfaces';
import { CreateTestResultDto } from '../../dto';

@Injectable()
export class TestResultsService {
  private readonly logger = new Logger(TestResultsService.name);

  constructor(
    @InjectRepository(TestResult)
    private readonly testResultRepository: Repository<TestResult>,
    @InjectRepository(OrderTest)
    private readonly orderTestRepository: Repository<OrderTest>
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isAbnormal?: boolean,
    isCritical?: boolean,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginationResult<TestResult>> {
    this.logger.log(`Obteniendo resultados de pruebas - Página: ${page}, Límite: ${limit}`);

    try {
      const skip = (page - 1) * limit;
      const query = this.testResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.orderTest', 'orderTest')
        .orderBy('result.createdAt', 'DESC');

      if (search) {
        query.andWhere(
          '(LOWER(result.resultValue) LIKE LOWER(:search) OR ' +
          'LOWER(result.observations) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      if (isAbnormal !== undefined) {
        query.andWhere('result.isAbnormal = :isAbnormal', { isAbnormal });
      }

      if (isCritical !== undefined) {
        query.andWhere('result.isCritical = :isCritical', { isCritical });
      }

      if (startDate && endDate) {
        query.andWhere('result.testedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        });
      }

      const [data, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`Se encontraron ${total} resultados de pruebas`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo resultados de pruebas: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<TestResult> {
    const result = await this.testResultRepository.findOne({
      where: { id },
      relations: ['orderTest']
    });

    if (!result) {
      throw new NotFoundException(`Resultado de prueba con ID ${id} no encontrado`);
    }

    return result;
  }

  async findByOrderTest(orderTestId: number): Promise<TestResult> {
    const result = await this.testResultRepository.findOne({
      where: { orderTestId },
      relations: ['orderTest']
    });

    if (!result) {
      throw new NotFoundException(`Resultado para la prueba ordenada con ID ${orderTestId} no encontrado`);
    }

    return result;
  }

  async getStats() {
    const total = await this.testResultRepository.count();
    
    const [abnormalCount, criticalCount] = await Promise.all([
      this.testResultRepository.count({ where: { isAbnormal: true } }),
      this.testResultRepository.count({ where: { isCritical: true } })
    ]);

    // Obtener distribución por rango de fechas (últimos 7 días)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const byDate = await this.testResultRepository
      .createQueryBuilder('result')
      .select('DATE(result.testedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('result.testedAt >= :lastWeek', { lastWeek })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total,
      abnormal: abnormalCount,
      critical: criticalCount,
      normal: total - abnormalCount,
      byDate: byDate.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      }))
    };
  }

  async create(createTestResultDto: CreateTestResultDto): Promise<TestResult> {
    this.logger.log(`Creando nuevo resultado de prueba para orderTestId: ${createTestResultDto.orderTestId}`);

    try {
      // Verificar que la prueba ordenada existe
      const orderTest = await this.orderTestRepository.findOne({
        where: { id: createTestResultDto.orderTestId },
        relations: ['order']
      });

      if (!orderTest) {
        throw new BadRequestException(`Prueba ordenada con ID ${createTestResultDto.orderTestId} no encontrada`);
      }

      // Crear el resultado
      const testResult = this.testResultRepository.create(createTestResultDto);
      const savedResult = await this.testResultRepository.save(testResult);

      this.logger.log(`Resultado de prueba creado exitosamente con ID: ${savedResult.id}`);
      return savedResult;
    } catch (error) {
      this.logger.error(`Error creando resultado de prueba: ${error.message}`);
      throw error;
    }
  }

  async findByPatient(patientId: string, page: number = 1, limit: number = 10): Promise<PaginationResult<TestResult>> {
    this.logger.log(`Obteniendo resultados de pruebas para paciente: ${patientId}, Página: ${page}, Límite: ${limit}`);

    try {
      const skip = (page - 1) * limit;
      
      // Usar query builder para hacer join con OrderTest y LaboratoryOrder para filtrar por patientId
      const [data, total] = await this.testResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.orderTest', 'orderTest')
        .leftJoin('orderTest.order', 'order')
        .where('order.patientId = :patientId', { patientId })
        .orderBy('result.testedAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      if (total === 0) {
        this.logger.warn(`No se encontraron resultados para el paciente: ${patientId}`);
      }

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo resultados por paciente: ${error.message}`);
      throw error;
    }
  }
}