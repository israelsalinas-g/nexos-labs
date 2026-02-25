import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestProfile } from '../../entities/test-profile.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestSection } from '../../entities/test-section.entity';
import { CreateTestProfileDto } from '../../dto/create-test-profile.dto';
import { UpdateTestProfileDto } from '../../dto/update-test-profile.dto';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class TestProfilesService {
  private readonly logger = new Logger(TestProfilesService.name);

  constructor(
    @InjectRepository(TestProfile)
    private readonly testProfileRepository: Repository<TestProfile>,
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
  ) {}

  async create(createDto: CreateTestProfileDto): Promise<TestProfile> {
    // Verificar que la sección existe
    const section = await this.testSectionRepository.findOne({
      where: { id: createDto.sectionId as string }
    });

    if (!section) {
      throw new NotFoundException(`Sección con ID ${createDto.sectionId} no encontrada`);
    }

    // Verificar código único
    if (createDto.code) {
      const existingByCode = await this.testProfileRepository.findOne({
        where: { code: createDto.code }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe un perfil con el código "${createDto.code}"`);
      }
    }

    // Verificar que todas las pruebas existen
    const tests = await this.testDefinitionRepository.find({
      where: { id: In(createDto.testIds) }
    });

    if (tests.length !== createDto.testIds.length) {
      throw new NotFoundException('Una o más pruebas especificadas no existen');
    }

    const profile = this.testProfileRepository.create({
      section,
      name: createDto.name,
      code: createDto.code,
      description: createDto.description,
      price: createDto.price,
      displayOrder: createDto.displayOrder,
      isActive: createDto.isActive,
      tests
    });

    return await this.testProfileRepository.save(profile);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sectionId?: string,
    includeInactive: boolean = false,
    search?: string
  ): Promise<PaginationResult<TestProfile>> {
    this.logger.log(`Obteniendo perfiles de pruebas - Página: ${page}, Límite: ${limit}`);

    try {
      const skip = (page - 1) * limit;
      const query = this.testProfileRepository
        .createQueryBuilder('profile')
        .leftJoinAndSelect('profile.section', 'section')
        .leftJoinAndSelect('profile.tests', 'tests')
        .orderBy('profile.displayOrder', 'ASC')
        .addOrderBy('profile.name', 'ASC');

      if (search) {
        query.andWhere(
          '(LOWER(profile.name) LIKE LOWER(:search) OR ' +
          'LOWER(profile.code) LIKE LOWER(:search) OR ' +
          'LOWER(profile.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      if (sectionId) {
        query.andWhere('profile.section.id = :sectionId', { sectionId });
      }

      if (!includeInactive) {
        query.andWhere('profile.isActive = :isActive', { isActive: true });
      }

      const [data, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`Se encontraron ${total} perfiles de pruebas`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo perfiles de pruebas: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<TestProfile> {
    const profile = await this.testProfileRepository.findOne({
      where: { id },
      relations: ['section', 'tests']
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return profile;
  }

  async update(id: string, updateDto: UpdateTestProfileDto): Promise<TestProfile> {
    const profile = await this.findOne(id);

    // Verificar nueva sección si se cambia
    if (updateDto.sectionId && updateDto.sectionId !== profile.section?.id) {
      const section = await this.testSectionRepository.findOne({
        where: { id: updateDto.sectionId as string }
      });

      if (!section) {
        throw new NotFoundException(`Sección con ID ${updateDto.sectionId} no encontrada`);
      }
    }

    // Verificar código único
    if (updateDto.code && updateDto.code !== profile.code) {
      const existingByCode = await this.testProfileRepository.findOne({
        where: { code: updateDto.code }
      });

      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(`Ya existe un perfil con el código "${updateDto.code}"`);
      }
    }

    // Actualizar pruebas si se proporcionan nuevas
    if (updateDto.testIds) {
      const tests = await this.testDefinitionRepository.find({
        where: { id: In(updateDto.testIds) }
      });

      if (tests.length !== updateDto.testIds.length) {
        throw new NotFoundException('Una o más pruebas especificadas no existen');
      }

      profile.tests = tests;
    }

    // Actualizar otros campos
    Object.assign(profile, {
      name: updateDto.name ?? profile.name,
      code: updateDto.code ?? profile.code,
      description: updateDto.description ?? profile.description,
      price: updateDto.price ?? profile.price,
      displayOrder: updateDto.displayOrder ?? profile.displayOrder,
      isActive: updateDto.isActive ?? profile.isActive
    });

    return await this.testProfileRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    await this.testProfileRepository.remove(profile);
  }

  async toggleActive(id: string): Promise<TestProfile> {
    const profile = await this.findOne(id);
    profile.isActive = !profile.isActive;
    return await this.testProfileRepository.save(profile);
  }

  async getStats(sectionId?: string) {
    const query = this.testProfileRepository.createQueryBuilder('profile');

    if (sectionId) {
      query.where('profile.section.id = :sectionId', { sectionId });
    }

    const total = await query.getCount();
    const active = await query.clone().andWhere('profile.isActive = :isActive', { isActive: true }).getCount();
    const inactive = total - active;

    return {
      total,
      active,
      inactive
    };
  }
}
