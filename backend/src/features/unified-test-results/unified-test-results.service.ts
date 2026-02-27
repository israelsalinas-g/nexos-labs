import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestReferenceRange } from '../../entities/test-reference-range.entity';
import { CreateUnifiedTestResultDto, UpdateUnifiedTestResultDto } from '../../dto/create-unified-test-result.dto';

@Injectable()
export class UnifiedTestResultsService {
  private readonly logger = new Logger(UnifiedTestResultsService.name);

  constructor(
    @InjectRepository(UnifiedTestResult)
    private readonly resultRepository: Repository<UnifiedTestResult>,
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestReferenceRange)
    private readonly referenceRangeRepository: Repository<TestReferenceRange>,
  ) {}

  private validatePayload(dto: CreateUnifiedTestResultDto | UpdateUnifiedTestResultDto): void {
    const filled = [
      dto.numericValue !== undefined && dto.numericValue !== null,
      dto.responseOptionId !== undefined && dto.responseOptionId !== null,
      dto.textValue !== undefined && dto.textValue !== null,
    ].filter(Boolean).length;

    if (filled > 1) {
      throw new BadRequestException('Solo un tipo de resultado puede tener valor (numérico, enum o texto)');
    }
  }

  /**
   * Calcula si un valor numérico es anormal según los rangos de referencia
   * del paciente. Devuelve null si no hay rango configurado.
   */
  async calculateAbnormality(
    numericValue: number,
    testDefinitionId: number,
    gender: 'M' | 'F' | 'ANY' = 'ANY',
    ageInMonths?: number,
  ): Promise<boolean | null> {
    const query = this.referenceRangeRepository.createQueryBuilder('r')
      .where('r.testDefinitionId = :testDefinitionId', { testDefinitionId })
      .andWhere('(r.gender = :gender OR r.gender = :any)', { gender, any: 'ANY' })
      .orderBy('r.gender', 'DESC'); // prefiere el rango específico sobre ANY

    if (ageInMonths !== undefined) {
      query
        .andWhere('(r.ageMinMonths IS NULL OR r.ageMinMonths <= :age)', { age: ageInMonths })
        .andWhere('(r.ageMaxMonths IS NULL OR r.ageMaxMonths >= :age)', { age: ageInMonths });
    }

    const range = await query.getOne();
    if (!range || (range.minValue === null && range.maxValue === null)) return null;

    if (range.minValue !== null && numericValue < Number(range.minValue)) return true;
    if (range.maxValue !== null && numericValue > Number(range.maxValue)) return true;
    return false;
  }

  async create(
    dto: CreateUnifiedTestResultDto,
    patientGender?: 'M' | 'F' | 'ANY',
    patientAgeInMonths?: number,
  ): Promise<UnifiedTestResult> {
    this.validatePayload(dto);

    let isAbnormal = dto.isAbnormal;

    // Auto-calculate abnormality for numeric values if not explicitly set
    if (dto.numericValue !== undefined && isAbnormal === undefined) {
      const calc = await this.calculateAbnormality(
        dto.numericValue,
        dto.testDefinitionId,
        patientGender,
        patientAgeInMonths,
      );
      if (calc !== null) isAbnormal = calc;
    }

    const result = this.resultRepository.create({ ...dto, isAbnormal });
    return this.resultRepository.save(result);
  }

  async findByOrderTest(orderTestId: number): Promise<UnifiedTestResult | null> {
    return this.resultRepository.findOne({
      where: { orderTestId },
      relations: ['testDefinition', 'testDefinition.responseType', 'testDefinition.responseType.options', 'responseOption'],
    });
  }

  async findByOrder(orderId: string): Promise<UnifiedTestResult[]> {
    return this.resultRepository.createQueryBuilder('r')
      .innerJoin('r.orderTest', 'ot')
      .where('ot.orderId = :orderId', { orderId })
      .leftJoinAndSelect('r.testDefinition', 'td')
      .leftJoinAndSelect('td.responseType', 'rt')
      .leftJoinAndSelect('rt.options', 'rto')
      .leftJoinAndSelect('r.responseOption', 'ro')
      .getMany();
  }

  async update(id: number, dto: UpdateUnifiedTestResultDto): Promise<UnifiedTestResult> {
    this.validatePayload(dto);
    const result = await this.resultRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException(`Resultado con ID ${id} no encontrado`);

    Object.assign(result, dto);
    return this.resultRepository.save(result);
  }

  async upsert(
    dto: CreateUnifiedTestResultDto,
    patientGender?: 'M' | 'F' | 'ANY',
    patientAgeInMonths?: number,
  ): Promise<UnifiedTestResult> {
    const existing = await this.resultRepository.findOne({ where: { orderTestId: dto.orderTestId } });
    if (existing) {
      return this.update(existing.id, dto);
    }
    return this.create(dto, patientGender, patientAgeInMonths);
  }
}
