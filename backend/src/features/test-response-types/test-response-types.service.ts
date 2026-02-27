import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResponseType } from '../../entities/test-response-type.entity';
import { TestResponseOption } from '../../entities/test-response-option.entity';
import { CreateTestResponseTypeDto } from '../../dto/create-test-response-type.dto';
import { UpdateTestResponseTypeDto } from '../../dto/update-test-response-type.dto';
import { BaseService } from '../../common/bases/base.service';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class TestResponseTypesService extends BaseService<TestResponseType> {
  protected readonly logger = new Logger(TestResponseTypesService.name);

  constructor(
    @InjectRepository(TestResponseType)
    private readonly responseTypeRepository: Repository<TestResponseType>,
    @InjectRepository(TestResponseOption)
    private readonly responseOptionRepository: Repository<TestResponseOption>,
  ) {
    super(responseTypeRepository);
  }

  async create(createDto: CreateTestResponseTypeDto): Promise<TestResponseType> {
    const existing = await this.responseTypeRepository.findOne({ where: { slug: createDto.slug } });
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de respuesta con el slug "${createDto.slug}"`);
    }

    const responseType = this.responseTypeRepository.create({
      name: createDto.name,
      slug: createDto.slug,
      inputType: createDto.inputType,
      description: createDto.description,
    });
    const saved = await this.responseTypeRepository.save(responseType);

    if (createDto.options?.length) {
      const options = createDto.options.map((opt, index) =>
        this.responseOptionRepository.create({
          ...opt,
          displayOrder: opt.displayOrder ?? index,
          responseType: saved,
        })
      );
      await this.responseOptionRepository.save(options);
    }

    return this.findOne(saved.id.toString(), { relations: ['options'] });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    options?: any,
  ): Promise<PaginationResult<TestResponseType>> {
    const { search, includeInactive = false } = options || {};
    const query = this.responseTypeRepository.createQueryBuilder('rt')
      .leftJoinAndSelect('rt.options', 'options')
      .orderBy('rt.name', 'ASC')
      .addOrderBy('options.displayOrder', 'ASC');

    if (search) {
      query.andWhere(
        '(LOWER(rt.name) LIKE LOWER(:search) OR LOWER(rt.slug) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    if (!includeInactive) query.andWhere('rt.isActive = true');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findOne(id: string, options?: any): Promise<TestResponseType> {
    const responseType = await this.responseTypeRepository.findOne({
      where: { id: parseInt(id) } as any,
      relations: ['options'],
    });
    if (!responseType) throw new NotFoundException(`Tipo de respuesta con ID ${id} no encontrado`);
    return responseType;
  }

  async findBySlug(slug: string): Promise<TestResponseType> {
    const responseType = await this.responseTypeRepository.findOne({
      where: { slug },
      relations: ['options'],
    });
    if (!responseType) throw new NotFoundException(`Tipo de respuesta con slug "${slug}" no encontrado`);
    return responseType;
  }

  async findAllActive(): Promise<TestResponseType[]> {
    return this.responseTypeRepository.find({
      where: { isActive: true },
      relations: ['options'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdateTestResponseTypeDto): Promise<TestResponseType> {
    const responseType = await this.findOne(id);

    if (updateDto.slug && updateDto.slug !== responseType.slug) {
      const existing = await this.responseTypeRepository.findOne({ where: { slug: updateDto.slug } });
      if (existing && existing.id !== responseType.id) {
        throw new ConflictException(`Ya existe un tipo con el slug "${updateDto.slug}"`);
      }
    }

    const { options, ...typeData } = updateDto;
    Object.assign(responseType, typeData);
    await this.responseTypeRepository.save(responseType);

    if (options !== undefined) {
      // Reemplazar todas las opciones existentes
      await this.responseOptionRepository.delete({ responseType: { id: responseType.id } });
      if (options.length) {
        const newOptions = options.map((opt, index) =>
          this.responseOptionRepository.create({
            ...opt,
            displayOrder: opt.displayOrder ?? index,
            responseType,
          })
        );
        await this.responseOptionRepository.save(newOptions);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const responseType = await this.findOne(id);
    if (responseType.isSystem) {
      throw new ConflictException('No se puede eliminar un tipo de respuesta del sistema. Desactívelo en su lugar.');
    }
    await this.responseTypeRepository.remove(responseType);
  }

  async toggleActive(id: string): Promise<TestResponseType> {
    const responseType = await this.findOne(id);
    responseType.isActive = !responseType.isActive;
    await this.responseTypeRepository.save(responseType);
    return responseType;
  }
}
