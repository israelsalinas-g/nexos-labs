import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSection } from '../../entities/test-section.entity';
import { CreateTestSectionDto } from '../../dto/create-test-section.dto';
import { UpdateTestSectionDto } from '../../dto/update-test-section.dto';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class TestSectionsService extends BaseService<TestSection> {
  protected readonly logger = new Logger(TestSectionsService.name);

  constructor(
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
  ) {
    super(testSectionRepository);
  }

  async create(createDto: CreateTestSectionDto): Promise<TestSection> {
    await this.validateUniqueness(createDto.name, createDto.code);
    const section = this.testSectionRepository.create(createDto);
    return await this.testSectionRepository.save(section);
  }

  async findAll(page = 1, limit = 10, includeInactive = false, search?: string): Promise<PaginationResult<TestSection>> {
    const query = this.testSectionRepository.createQueryBuilder('section')
      .leftJoinAndSelect('section.tests', 'tests')
      .orderBy('section.displayOrder', 'ASC')
      .addOrderBy('section.name', 'ASC');

    if (!includeInactive) query.andWhere('section.isActive = true');
    if (search) {
      query.andWhere(
        '(LOWER(section.name) LIKE LOWER(:search) OR LOWER(section.code) LIKE LOWER(:search) OR LOWER(section.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string): Promise<TestSection> {
    return super.findOne(id, { relations: ['tests'] });
  }

  async update(id: string, updateDto: UpdateTestSectionDto): Promise<TestSection> {
    const section = await this.findOne(id);
    await this.validateUniqueness(
      updateDto.name !== section.name ? updateDto.name : undefined,
      updateDto.code !== section.code ? updateDto.code : undefined,
      id
    );
    Object.assign(section, updateDto);
    return await this.testSectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    if (section.tests?.length > 0) {
      throw new ConflictException(`No se puede eliminar: tiene ${section.tests.length} prueba(s) asociada(s). Desactívela.`);
    }
    await this.testSectionRepository.remove(section);
  }

  async toggleActive(id: string): Promise<TestSection> {
    const section = await this.findOne(id);
    section.isActive = !section.isActive;
    return await this.testSectionRepository.save(section);
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.testSectionRepository.count(),
      this.testSectionRepository.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  private async validateUniqueness(name?: string, code?: string, excludeId?: string): Promise<void> {
    if (name) {
      const q = this.testSectionRepository.createQueryBuilder('s').where('s.name = :name', { name });
      if (excludeId) q.andWhere('s.id != :excludeId', { excludeId });
      if (await q.getOne()) throw new ConflictException(`Ya existe una sección con el nombre "${name}"`);
    }
    if (code) {
      const q = this.testSectionRepository.createQueryBuilder('s').where('s.code = :code', { code });
      if (excludeId) q.andWhere('s.id != :excludeId', { excludeId });
      if (await q.getOne()) throw new ConflictException(`Ya existe una sección con el código "${code}"`);
    }
  }
}
