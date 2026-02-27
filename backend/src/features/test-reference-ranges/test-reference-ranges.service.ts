import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestReferenceRange, RangeGender } from '../../entities/test-reference-range.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { CreateTestReferenceRangeDto } from '../../dto/create-test-reference-range.dto';
import { UpdateTestReferenceRangeDto } from '../../dto/update-test-reference-range.dto';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class TestReferenceRangesService extends BaseService<TestReferenceRange> {
  protected readonly logger = new Logger(TestReferenceRangesService.name);

  constructor(
    @InjectRepository(TestReferenceRange)
    private readonly rangeRepository: Repository<TestReferenceRange>,
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
  ) {
    super(rangeRepository);
  }

  async create(createDto: CreateTestReferenceRangeDto): Promise<TestReferenceRange> {
    const testDefinition = await this.testDefinitionRepository.findOne({
      where: { id: createDto.testDefinitionId },
    });
    if (!testDefinition) {
      throw new NotFoundException(`Prueba con ID ${createDto.testDefinitionId} no encontrada`);
    }

    await this.validateNoOverlap(createDto.testDefinitionId, createDto.gender, createDto.ageMinMonths ?? 0, createDto.ageMaxMonths ?? null);

    const range = this.rangeRepository.create({
      testDefinition,
      gender: createDto.gender,
      ageMinMonths: createDto.ageMinMonths ?? 0,
      ageMaxMonths: createDto.ageMaxMonths ?? null,
      minValue: createDto.minValue,
      maxValue: createDto.maxValue,
      textualRange: createDto.textualRange,
      interpretation: createDto.interpretation,
      unit: createDto.unit,
    });

    return this.rangeRepository.save(range);
  }

  async findByTestDefinition(testDefinitionId: string): Promise<TestReferenceRange[]> {
    return this.rangeRepository.find({
      where: { testDefinition: { id: testDefinitionId } },
      order: { gender: 'ASC', ageMinMonths: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TestReferenceRange> {
    const range = await this.rangeRepository.findOne({
      where: { id: parseInt(id) } as any,
      relations: ['testDefinition'],
    });
    if (!range) throw new NotFoundException(`Rango de referencia con ID ${id} no encontrado`);
    return range;
  }

  async update(id: string, updateDto: UpdateTestReferenceRangeDto): Promise<TestReferenceRange> {
    const range = await this.findOne(id);
    const testDefinitionId = updateDto.testDefinitionId ?? range.testDefinition.id;
    const gender = updateDto.gender ?? range.gender;
    const ageMin = updateDto.ageMinMonths ?? range.ageMinMonths;
    const ageMax = updateDto.ageMaxMonths !== undefined ? updateDto.ageMaxMonths : range.ageMaxMonths;

    await this.validateNoOverlap(testDefinitionId, gender, ageMin, ageMax, parseInt(id));

    Object.assign(range, updateDto);
    return this.rangeRepository.save(range);
  }

  async remove(id: string): Promise<void> {
    const range = await this.findOne(id);
    await this.rangeRepository.remove(range);
  }

  /**
   * Busca el rango de referencia aplicable para un paciente dado.
   * @param testDefinitionId ID de la prueba
   * @param gender Sexo del paciente (M, F)
   * @param ageInMonths Edad del paciente en meses
   */
  async findApplicableRange(testDefinitionId: string, gender: string, ageInMonths: number): Promise<TestReferenceRange | null> {
    const genderConditions = [RangeGender.ANY];
    if (gender === 'M') genderConditions.push(RangeGender.MALE);
    if (gender === 'F') genderConditions.push(RangeGender.FEMALE);

    const ranges = await this.rangeRepository
      .createQueryBuilder('r')
      .where('r.testDefinition = :testDefinitionId', { testDefinitionId })
      .andWhere('r.gender IN (:...genders)', { genders: genderConditions })
      .andWhere('r.ageMinMonths <= :age', { age: ageInMonths })
      .andWhere('(r.ageMaxMonths IS NULL OR r.ageMaxMonths >= :age)', { age: ageInMonths })
      .orderBy('r.gender', 'DESC') // Específico (M/F) antes que ANY
      .getMany();

    return ranges.length > 0 ? ranges[0] : null;
  }

  /**
   * Valida que el nuevo rango no se solape con los existentes
   * para el mismo test, género y rango de edad.
   */
  private async validateNoOverlap(
    testDefinitionId: string,
    gender: RangeGender,
    ageMin: number,
    ageMax: number | null,
    excludeId?: number,
  ): Promise<void> {
    const query = this.rangeRepository
      .createQueryBuilder('r')
      .where('r.testDefinition = :testDefinitionId', { testDefinitionId })
      .andWhere('r.gender = :gender', { gender });

    if (excludeId) query.andWhere('r.id != :excludeId', { excludeId });

    // Solapamiento: el nuevo rango [ageMin, ageMax] solapa con [r.ageMinMonths, r.ageMaxMonths]
    if (ageMax !== null) {
      query.andWhere(
        '(r.ageMinMonths <= :ageMax AND (r.ageMaxMonths IS NULL OR r.ageMaxMonths >= :ageMin))',
        { ageMin, ageMax }
      );
    } else {
      // El nuevo rango no tiene límite → solapa si alguno existente empieza antes del infinito
      query.andWhere('(r.ageMaxMonths IS NULL OR r.ageMaxMonths >= :ageMin)', { ageMin });
    }

    const existing = await query.getOne();
    if (existing) {
      throw new ConflictException(
        `El rango de edad ${ageMin}-${ageMax ?? '∞'} meses se solapa con un rango existente para el mismo test y sexo.`
      );
    }
  }
}
