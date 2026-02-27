import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResult } from '../../entities/test-result.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { PaginationResult } from '../../common/interfaces';
import { CreateTestResultDto } from '../../dto';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class TestResultsService extends BaseService<TestResult> {
  protected readonly logger = new Logger(TestResultsService.name);

  constructor(
    @InjectRepository(TestResult)
    private readonly testResultRepository: Repository<TestResult>,
    @InjectRepository(OrderTest)
    private readonly orderTestRepository: Repository<OrderTest>,
  ) {
    super(testResultRepository);
  }

  async create(createDto: CreateTestResultDto): Promise<TestResult> {
    const orderTest = await this.orderTestRepository.findOne({
      where: { id: createDto.orderTestId },
      relations: ['order'],
    });
    if (!orderTest) throw new BadRequestException(`Prueba ordenada con ID ${createDto.orderTestId} no encontrada`);

    const testResult = this.testResultRepository.create(createDto);
    return await this.testResultRepository.save(testResult);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    options?: any,
  ): Promise<PaginationResult<TestResult>> {
    const { search, isAbnormal, isCritical, startDate, endDate } = options || {};
    const query = this.testResultRepository.createQueryBuilder('result')
      .leftJoinAndSelect('result.orderTest', 'orderTest')
      .orderBy('result.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(LOWER(result.resultValue) LIKE LOWER(:search) OR LOWER(result.observations) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    if (isAbnormal !== undefined) query.andWhere('result.isAbnormal = :isAbnormal', { isAbnormal });
    if (isCritical !== undefined) query.andWhere('result.isCritical = :isCritical', { isCritical });
    if (startDate && endDate) query.andWhere('result.testedAt BETWEEN :startDate AND :endDate', { startDate, endDate });

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string): Promise<TestResult> {
    return super.findOne(id, { relations: ['orderTest'] });
  }

  async findByPatient(patientId: string, page = 1, limit = 10): Promise<PaginationResult<TestResult>> {
    const query = this.testResultRepository.createQueryBuilder('result')
      .leftJoinAndSelect('result.orderTest', 'orderTest')
      .leftJoin('orderTest.order', 'order')
      .where('order.patientId = :patientId', { patientId })
      .orderBy('result.testedAt', 'DESC');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findByOrderTest(orderTestId: string): Promise<TestResult | null> {
    return this.testResultRepository.findOne({
      where: { orderTestId } as any,
      relations: ['orderTest'],
    });
  }

  async getStats() {
    const [total, abnormal, critical] = await Promise.all([
      this.testResultRepository.count(),
      this.testResultRepository.count({ where: { isAbnormal: true } }),
      this.testResultRepository.count({ where: { isCritical: true } }),
    ]);
    return { total, abnormal, critical, normal: total - abnormal };
  }
}