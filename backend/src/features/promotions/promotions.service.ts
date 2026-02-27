import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Promotion } from '../../entities/promotion.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestProfile } from '../../entities/test-profile.entity';
import { CreatePromotionDto } from '../../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../../dto/update-promotion.dto';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class PromotionsService extends BaseService<Promotion> {
  protected readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(TestDefinition)
    private readonly testDefinitionRepository: Repository<TestDefinition>,
    @InjectRepository(TestProfile)
    private readonly testProfileRepository: Repository<TestProfile>,
  ) {
    super(promotionRepository);
  }

  private validateDates(validFrom: string, validTo: string): void {
    const from = new Date(validFrom);
    const to = new Date(validTo);
    if (to <= from) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  private async resolveItems(testIds?: string[], profileIds?: string[]) {
    const tests = testIds?.length
      ? await this.testDefinitionRepository.find({ where: { id: In(testIds) } })
      : [];
    const profiles = profileIds?.length
      ? await this.testProfileRepository.find({ where: { id: In(profileIds) } })
      : [];
    return { tests, profiles };
  }

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    this.validateDates(dto.validFrom, dto.validTo);

    const { testIds, profileIds, ...data } = dto;
    const { tests, profiles } = await this.resolveItems(testIds, profileIds);

    const promotion = this.promotionRepository.create({ ...data, tests, profiles });
    return this.promotionRepository.save(promotion);
  }

  async findAll(
    page = 1, limit = 10,
    includeInactive = false,
    search?: string,
  ): Promise<PaginationResult<Promotion>> {
    const query = this.promotionRepository.createQueryBuilder('promo')
      .leftJoinAndSelect('promo.tests', 'tests')
      .leftJoinAndSelect('promo.profiles', 'profiles')
      .orderBy('promo.validFrom', 'DESC')
      .addOrderBy('promo.name', 'ASC');

    if (search) {
      query.andWhere(
        '(LOWER(promo.name) LIKE LOWER(:search) OR LOWER(promo.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    if (!includeInactive) query.andWhere('promo.isActive = true');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findActive(): Promise<Promotion[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.promotionRepository.createQueryBuilder('promo')
      .leftJoinAndSelect('promo.tests', 'tests')
      .leftJoinAndSelect('promo.profiles', 'profiles')
      .where('promo.isActive = true')
      .andWhere('promo.validFrom <= :today', { today })
      .andWhere('promo.validTo >= :today', { today })
      .orderBy('promo.name', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['tests', 'profiles'],
    });
    if (!promotion) throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    return promotion;
  }

  async update(id: number, dto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);

    const validFrom = dto.validFrom ?? promotion.validFrom;
    const validTo = dto.validTo ?? promotion.validTo;
    this.validateDates(validFrom, validTo);

    const { testIds, profileIds, ...data } = dto;
    Object.assign(promotion, data);

    if (testIds !== undefined) {
      promotion.tests = testIds.length
        ? await this.testDefinitionRepository.find({ where: { id: In(testIds) } })
        : [];
    }
    if (profileIds !== undefined) {
      promotion.profiles = profileIds.length
        ? await this.testProfileRepository.find({ where: { id: In(profileIds) } })
        : [];
    }

    return this.promotionRepository.save(promotion);
  }

  async toggleActive(id: number): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.isActive = !promotion.isActive;
    return this.promotionRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }
}
