import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDefinition, TestSection } from '../../entities';
import { CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../../dto';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class TestDefinitionsService {
  private readonly logger = new Logger(TestDefinitionsService.name);

  constructor(
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
  ) {}

  /**
   * Crear una nueva definición de prueba
   */
  async create(createDto: CreateTestDefinitionDto): Promise<TestDefinition> {
    // Verificar que la sección existe
    const section = await this.testSectionRepository.findOne({
      where: { id: createDto.sectionId as string }
    });

    if (!section) {
      throw new NotFoundException(`Sección con ID ${createDto.sectionId} no encontrada`);
    }

    // Verificar si ya existe una prueba con el mismo código (si se proporciona)
    if (createDto.code) {
      const existingByCode = await this.testDefinitionRepository.findOne({
        where: { code: createDto.code }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe una prueba con el código "${createDto.code}"`);
      }
    }

  const test = this.testDefinitionRepository.create(createDto);
  // Assign the loaded section entity so TypeORM sets the foreign key correctly
  test.section = section;
  return await this.testDefinitionRepository.save(test);
  }

  /**
   * Obtener todas las definiciones de pruebas con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    sectionId?: string,
    includeInactive: boolean = false,
    search?: string
  ): Promise<PaginationResult<TestDefinition>> {
    this.logger.log(`Obteniendo definiciones de pruebas - Página: ${page}, Límite: ${limit}`);

    try {
      const skip = (page - 1) * limit;
      const query = this.testDefinitionRepository
        .createQueryBuilder('test')
        .leftJoinAndSelect('test.section', 'section')
        .leftJoinAndSelect('test.profiles', 'profiles')
        .orderBy('test.displayOrder', 'ASC')
        .addOrderBy('test.name', 'ASC');

      if (search) {
        query.andWhere(
          '(LOWER(test.name) LIKE LOWER(:search) OR ' +
          'LOWER(test.code) LIKE LOWER(:search) OR ' +
          'LOWER(test.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      if (sectionId) {
        query.andWhere('test.section.id = :sectionId', { sectionId });
      }

      if (!includeInactive) {
        query.andWhere('test.isActive = :isActive', { isActive: true });
      }

      const [data, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`Se encontraron ${total} definiciones de pruebas`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo definiciones de pruebas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener una definición de prueba por su ID
   */
  async findOne(id: string): Promise<TestDefinition> {
    const test = await this.testDefinitionRepository.findOne({
      where: { id },
      // relation names must match the entity properties
      relations: ['section', 'profiles']
    });

    if (!test) {
      throw new NotFoundException(`Prueba con ID ${id} no encontrada`);
    }

    return test;
  }

  /**
   * Obtener una prueba por su código
   */
  async findByCode(code: string): Promise<TestDefinition> {
    const test = await this.testDefinitionRepository.findOne({
      where: { code },
      relations: ['section', 'profiles']
    });

    if (!test) {
      throw new NotFoundException(`Prueba con código "${code}" no encontrada`);
    }

    return test;
  }

  /**
   * Obtener pruebas por sección
   */
  async findBySection(sectionId: string): Promise<TestDefinition[]> {
    return await this.testDefinitionRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.section', 'section')
      .where('test.section.id = :sectionId', { sectionId })
      .andWhere('test.isActive = :isActive', { isActive: true })
      .orderBy('test.displayOrder', 'ASC')
      .addOrderBy('test.name', 'ASC')
      .getMany();
  }

  /**
   * Actualizar una definición de prueba
   */
  async update(id: string, updateDto: UpdateTestDefinitionDto): Promise<TestDefinition> {
    const test = await this.findOne(id);

    // Verificar la nueva sección si se está cambiando
    if (updateDto.sectionId) {
      const section = await this.testSectionRepository.findOne({
        where: { id: updateDto.sectionId as string }
      });

      if (!section) {
        throw new NotFoundException(`Sección con ID ${updateDto.sectionId} no encontrada`);
      }
      // Assign the relation so the section change is persisted
      test.section = section;
    }

    // Verificar conflictos de código si se está actualizando
    if (updateDto.code && updateDto.code !== test.code) {
      const existingByCode = await this.testDefinitionRepository.findOne({
        where: { code: updateDto.code }
      });

      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(`Ya existe una prueba con el código "${updateDto.code}"`);
      }
    }

    Object.assign(test, updateDto);
    return await this.testDefinitionRepository.save(test);
  }

  /**
   * Eliminar una definición de prueba
   */
  async remove(id: string): Promise<void> {
    const test = await this.findOne(id);
    
    // Verificar si está en algún perfil
    if (test.profiles && test.profiles.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la prueba porque está incluida en ${test.profiles.length} perfil(es). Desactívela en su lugar.`
      );
    }

    await this.testDefinitionRepository.remove(test);
  }

  /**
   * Activar/Desactivar una prueba
   */
  async toggleActive(id: string): Promise<TestDefinition> {
    const test = await this.findOne(id);
    test.isActive = !test.isActive;
    return await this.testDefinitionRepository.save(test);
  }

  /**
   * Obtener estadísticas de pruebas
   */
  async getStats(sectionId?: string) {
    const query = this.testDefinitionRepository.createQueryBuilder('test');

    if (sectionId) {
      query.where('test.section.id = :sectionId', { sectionId });
    }

    const total = await query.getCount();
    const active = await query.clone().andWhere('test.isActive = :isActive', { isActive: true }).getCount();
    const inactive = total - active;

    // Contar por tipo de resultado
    const byResultType = await this.testDefinitionRepository
      .createQueryBuilder('test')
      .select('test.resultType', 'resultType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('test.resultType')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      byResultType: byResultType.map(item => ({
        type: item.resultType,
        count: parseInt(item.count)
      }))
    };
  }

  /**
   * Buscar pruebas por nombre
   */
  async search(searchTerm: string): Promise<TestDefinition[]> {
    return await this.testDefinitionRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.section', 'section')
      .where('LOWER(test.name) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orWhere('LOWER(test.code) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .andWhere('test.isActive = :isActive', { isActive: true })
      .orderBy('test.name', 'ASC')
      .getMany();
  }
}
