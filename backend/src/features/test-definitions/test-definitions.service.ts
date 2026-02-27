import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDefinition, TestSection } from '../../entities';
import { TestResponseType } from '../../entities/test-response-type.entity';
import { CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../../dto';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class TestDefinitionsService extends BaseService<TestDefinition> {
  protected readonly logger = new Logger(TestDefinitionsService.name);

  constructor(
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
    @InjectRepository(TestResponseType)
    private readonly responseTypeRepository: Repository<TestResponseType>,
  ) {
    super(testDefinitionRepository);
  }

  private async resolveResponseType(responseTypeId?: number): Promise<TestResponseType | null> {
    if (!responseTypeId) return null;
    return this.responseTypeRepository.findOne({ where: { id: responseTypeId } });
  }

  async create(createDto: CreateTestDefinitionDto): Promise<TestDefinition> {
    const section = await this.testSectionRepository.findOne({ where: { id: createDto.sectionId as string } });
    if (!section) throw new NotFoundException(`Sección con ID ${createDto.sectionId} no encontrada`);

    if (createDto.code) {
      const existing = await this.testDefinitionRepository.findOne({ where: { code: createDto.code } });
      if (existing) throw new ConflictException(`Ya existe una prueba con el código "${createDto.code}"`);
    }

    const { responseTypeId, ...testData } = createDto as any;
    const test = this.testDefinitionRepository.create(testData as any) as any;
    test.section = section;

    const responseType = await this.resolveResponseType(responseTypeId);
    if (responseType) test.responseType = responseType;

    return await this.testDefinitionRepository.save(test);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    options?: any,
  ): Promise<PaginationResult<TestDefinition>> {
    const { sectionId, includeInactive = false, search } = options || {};
    const query = this.testDefinitionRepository.createQueryBuilder('test')
      .leftJoinAndSelect('test.section', 'section')
      .leftJoinAndSelect('test.profiles', 'profiles')
      .leftJoinAndSelect('test.responseType', 'responseType')
      .leftJoinAndSelect('responseType.options', 'rtOptions')
      .orderBy('test.displayOrder', 'ASC')
      .addOrderBy('test.name', 'ASC');

    if (search) {
      query.andWhere(
        '(LOWER(test.name) LIKE LOWER(:search) OR LOWER(test.code) LIKE LOWER(:search) OR LOWER(test.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    if (sectionId) query.andWhere('test.section.id = :sectionId', { sectionId });
    if (!includeInactive) query.andWhere('test.isActive = true');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string): Promise<TestDefinition> {
    return super.findOne(id, { relations: ['section', 'profiles', 'responseType', 'responseType.options'] });
  }

  async update(id: string, updateDto: UpdateTestDefinitionDto): Promise<TestDefinition> {
    const test = await this.findOne(id);

    if (updateDto.sectionId) {
      const section = await this.testSectionRepository.findOne({ where: { id: updateDto.sectionId as string } });
      if (!section) throw new NotFoundException(`Sección con ID ${updateDto.sectionId} no encontrada`);
      test.section = section;
    }

    if (updateDto.code && updateDto.code !== test.code) {
      const existing = await this.testDefinitionRepository.findOne({ where: { code: updateDto.code } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe una prueba con el código "${updateDto.code}"`);
      }
    }

    const { responseTypeId, ...updateData } = updateDto as any;
    Object.assign(test, updateData);

    const responseType = await this.resolveResponseType(responseTypeId);
    if (responseType) (test as any).responseType = responseType;
    else if (responseTypeId === null) (test as any).responseType = null;

    return await this.testDefinitionRepository.save(test);
  }

  async remove(id: string): Promise<void> {
    const test = await this.findOne(id);
    if (test.profiles?.length > 0) {
      throw new ConflictException(`No se puede eliminar: está incluida en ${test.profiles.length} perfil(es). Desactívela.`);
    }
    await this.testDefinitionRepository.remove(test);
  }

  async toggleActive(id: string): Promise<TestDefinition> {
    const test = await this.findOne(id);
    test.isActive = !test.isActive;
    return await this.testDefinitionRepository.save(test);
  }

  async search(searchTerm: string): Promise<TestDefinition[]> {
    return this.testDefinitionRepository.createQueryBuilder('test')
      .leftJoinAndSelect('test.section', 'section')
      .leftJoinAndSelect('test.responseType', 'responseType')
      .leftJoinAndSelect('responseType.options', 'rtOptions')
      .where('test.isActive = true')
      .andWhere(
        '(LOWER(test.name) LIKE LOWER(:search) OR LOWER(test.code) LIKE LOWER(:search) OR LOWER(test.description) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      )
      .orderBy('test.displayOrder', 'ASC')
      .addOrderBy('test.name', 'ASC')
      .getMany();
  }

  async findBySection(sectionId: string): Promise<TestDefinition[]> {
    const section = await this.testSectionRepository.findOne({ where: { id: sectionId } });
    if (!section) throw new NotFoundException(`Sección con ID ${sectionId} no encontrada`);

    return this.testDefinitionRepository.createQueryBuilder('test')
      .leftJoinAndSelect('test.section', 'section')
      .leftJoinAndSelect('test.responseType', 'responseType')
      .leftJoinAndSelect('responseType.options', 'rtOptions')
      .where('test.section.id = :sectionId', { sectionId })
      .andWhere('test.isActive = true')
      .orderBy('test.displayOrder', 'ASC')
      .addOrderBy('test.name', 'ASC')
      .getMany();
  }

  async findByCode(code: string): Promise<TestDefinition> {
    const test = await this.testDefinitionRepository.findOne({
      where: { code },
      relations: ['section', 'responseType', 'responseType.options'],
    });
    if (!test) throw new NotFoundException(`Prueba con código "${code}" no encontrada`);
    return test;
  }

  async getStats(sectionId?: string) {
    const query = this.testDefinitionRepository.createQueryBuilder('test');
    if (sectionId) query.where('test.section.id = :sectionId', { sectionId });
    const total = await query.getCount();
    const active = await query.clone().andWhere('test.isActive = true').getCount();
    const byResultType = await this.testDefinitionRepository.createQueryBuilder('test')
      .select('test.resultType', 'resultType').addSelect('COUNT(*)', 'count')
      .groupBy('test.resultType').getRawMany();
    return { total, active, inactive: total - active, byResultType };
  }
}
