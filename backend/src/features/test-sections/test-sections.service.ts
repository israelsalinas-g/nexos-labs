import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSection } from '../../entities/test-section.entity';
import { CreateTestSectionDto } from '../../dto/create-test-section.dto';
import { UpdateTestSectionDto } from '../../dto/update-test-section.dto';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class TestSectionsService {
  constructor(
    @InjectRepository(TestSection)
    private readonly testSectionRepository: Repository<TestSection>,
  ) {}

  /**
   * Crear una nueva sección de examen
   */
  async create(createDto: CreateTestSectionDto): Promise<TestSection> {
    // Verificar si ya existe una sección con el mismo nombre
    const existingByName = await this.testSectionRepository.findOne({
      where: { name: createDto.name }
    });

    if (existingByName) {
      throw new ConflictException(`Ya existe una sección con el nombre "${createDto.name}"`);
    }

    // Verificar si ya existe una sección con el mismo código (si se proporciona)
    if (createDto.code) {
      const existingByCode = await this.testSectionRepository.findOne({
        where: { code: createDto.code }
      });

      if (existingByCode) {
        throw new ConflictException(`Ya existe una sección con el código "${createDto.code}"`);
      }
    }

    const section = this.testSectionRepository.create(createDto);
    return await this.testSectionRepository.save(section);
  }

  private readonly logger = new Logger(TestSectionsService.name);

  /**
   * Obtener todas las secciones de examen con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    includeInactive: boolean = false,
    search?: string
  ): Promise<PaginationResult<TestSection>> {
    this.logger.log(`Obteniendo secciones - Página: ${page}, Límite: ${limit}, IncludeInactive: ${includeInactive}, Search: "${search}"`);

    try {
      const skip = (page - 1) * limit;
      const query = this.testSectionRepository
        .createQueryBuilder('section')
        .leftJoinAndSelect('section.tests', 'tests')
        .orderBy('section.displayOrder', 'ASC')
        .addOrderBy('section.name', 'ASC')
        .skip(skip)
        .take(limit);

      if (!includeInactive) {
        query.andWhere('section.isActive = :isActive', { isActive: true });
      }

      if (search) {
        query.andWhere(
          '(LOWER(section.name) LIKE LOWER(:search) OR ' +
          'LOWER(section.code) LIKE LOWER(:search) OR ' +
          'LOWER(section.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      const [sections, total] = await query.getManyAndCount();

      return {
        data: sections,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo secciones: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener una sección por su ID
   */
  async findOne(id: string): Promise<TestSection> {
    const section = await this.testSectionRepository.findOne({
      where: { id },
      relations: ['tests']
    });

    if (!section) {
      throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    }

    return section;
  }

  /**
   * Obtener una sección por su código
   */
  async findByCode(code: string): Promise<TestSection> {
    const section = await this.testSectionRepository.findOne({
      where: { code },
      relations: ['tests']
    });

    if (!section) {
      throw new NotFoundException(`Sección con código "${code}" no encontrada`);
    }

    return section;
  }

  /**
   * Actualizar una sección
   */
  async update(id: string, updateDto: UpdateTestSectionDto): Promise<TestSection> {
    const section = await this.findOne(id);

    // Verificar conflictos de nombre si se está actualizando
    if (updateDto.name && updateDto.name !== section.name) {
      const existingByName = await this.testSectionRepository.findOne({
        where: { name: updateDto.name }
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Ya existe una sección con el nombre "${updateDto.name}"`);
      }
    }

    // Verificar conflictos de código si se está actualizando
    if (updateDto.code && updateDto.code !== section.code) {
      const existingByCode = await this.testSectionRepository.findOne({
        where: { code: updateDto.code }
      });

      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(`Ya existe una sección con el código "${updateDto.code}"`);
      }
    }

    Object.assign(section, updateDto);
    return await this.testSectionRepository.save(section);
  }

  /**
   * Eliminar una sección (soft delete - marcar como inactiva)
   */
  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);

    // Verificar si tiene pruebas asociadas
    if (section.tests && section.tests.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la sección porque tiene ${section.tests.length} prueba(s) asociada(s). Desactívela en su lugar.`
      );
    }

    await this.testSectionRepository.remove(section);
  }

  /**
   * Activar/Desactivar una sección
   */
  async toggleActive(id: string): Promise<TestSection> {
    const section = await this.findOne(id);
    section.isActive = !section.isActive;
    return await this.testSectionRepository.save(section);
  }

  /**
   * Obtener estadísticas de secciones
   */
  async getStats() {
    const total = await this.testSectionRepository.count();
    const active = await this.testSectionRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    return {
      total,
      active,
      inactive
    };
  }
}
