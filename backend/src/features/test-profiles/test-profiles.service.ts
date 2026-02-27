import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestProfile } from '../../entities/test-profile.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestSection } from '../../entities/test-section.entity';
import { CreateTestProfileDto } from '../../dto/create-test-profile.dto';
import { UpdateTestProfileDto } from '../../dto/update-test-profile.dto';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class TestProfilesService extends BaseService<TestProfile> {
  protected readonly logger = new Logger(TestProfilesService.name);

  constructor(
    @InjectRepository(TestProfile)
    private readonly testProfileRepository: Repository<TestProfile>,
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
  ) {
    super(testProfileRepository);
  }

  async create(createDto: CreateTestProfileDto): Promise<TestProfile> {
    const section = await this.testSectionRepository.findOne({ where: { id: createDto.sectionId as string } });
    if (!section) throw new NotFoundException(`Sección con ID ${createDto.sectionId} no encontrada`);

    if (createDto.code) {
      const existing = await this.testProfileRepository.findOne({ where: { code: createDto.code } });
      if (existing) throw new ConflictException(`Ya existe un perfil con el código "${createDto.code}"`);
    }

    const tests = await this.testDefinitionRepository.find({ where: { id: In(createDto.testIds) } });
    if (tests.length !== createDto.testIds.length) throw new NotFoundException('Una o más pruebas especificadas no existen');

    const profile = this.testProfileRepository.create({ ...createDto, section, tests });
    return await this.testProfileRepository.save(profile);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    options?: any,
  ): Promise<PaginationResult<TestProfile>> {
    const { sectionId, includeInactive = false, search } = options || {};
    const query = this.testProfileRepository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.section', 'section')
      .leftJoinAndSelect('profile.tests', 'tests')
      .orderBy('profile.displayOrder', 'ASC')
      .addOrderBy('profile.name', 'ASC');

    if (search) {
      query.andWhere(
        '(LOWER(profile.name) LIKE LOWER(:search) OR LOWER(profile.code) LIKE LOWER(:search) OR LOWER(profile.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    if (sectionId) query.andWhere('profile.section.id = :sectionId', { sectionId });
    if (!includeInactive) query.andWhere('profile.isActive = true');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string): Promise<TestProfile> {
    return super.findOne(id, { relations: ['section', 'tests'] });
  }

  async update(id: string, updateDto: UpdateTestProfileDto): Promise<TestProfile> {
    const profile = await this.findOne(id);

    if (updateDto.sectionId && updateDto.sectionId !== profile.section?.id) {
      const section = await this.testSectionRepository.findOne({ where: { id: updateDto.sectionId as string } });
      if (!section) throw new NotFoundException(`Sección con ID ${updateDto.sectionId} no encontrada`);
      profile.section = section;
    }

    if (updateDto.code && updateDto.code !== profile.code) {
      const existing = await this.testProfileRepository.findOne({ where: { code: updateDto.code } });
      if (existing && existing.id !== id) throw new ConflictException(`Ya existe un perfil con el código "${updateDto.code}"`);
    }

    if (updateDto.testIds) {
      const tests = await this.testDefinitionRepository.find({ where: { id: In(updateDto.testIds) } });
      if (tests.length !== updateDto.testIds.length) throw new NotFoundException('Una o más pruebas especificadas no existen');
      profile.tests = tests;
    }

    Object.assign(profile, {
      name: updateDto.name ?? profile.name,
      code: updateDto.code ?? profile.code,
      description: updateDto.description ?? profile.description,
      price: updateDto.price ?? profile.price,
      displayOrder: updateDto.displayOrder ?? profile.displayOrder,
      isActive: updateDto.isActive ?? profile.isActive,
    });

    return await this.testProfileRepository.save(profile);
  }

  async toggleActive(id: string): Promise<TestProfile> {
    const profile = await this.findOne(id);
    profile.isActive = !profile.isActive;
    return await this.testProfileRepository.save(profile);
  }

  async getStats(sectionId?: string) {
    const query = this.testProfileRepository.createQueryBuilder('profile');
    if (sectionId) query.where('profile.section.id = :sectionId', { sectionId });
    const total = await query.getCount();
    const active = await query.clone().andWhere('profile.isActive = true').getCount();
    return { total, active, inactive: total - active };
  }
}
