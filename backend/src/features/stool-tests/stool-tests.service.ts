import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateStoolTestDto } from '../../dto/create-stool-test.dto';
import { UpdateStoolTestDto } from '../../dto/update-stool-test.dto';
import { Patient } from '../../entities/patient.entity';
import { StoolTest } from '../../entities/stool-test.entity';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class StoolTestsService extends BaseService<StoolTest> {
  protected readonly logger = new Logger(StoolTestsService.name);

  constructor(
    @InjectRepository(StoolTest)
    private stoolTestRepository: Repository<StoolTest>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {
    super(stoolTestRepository);
  }

  async create(createStoolTestDto: CreateStoolTestDto): Promise<StoolTest> {
    const sampleNumber = createStoolTestDto.sampleNumber || await this.generateSampleNumber();

    if (createStoolTestDto.sampleNumber) {
      const existing = await this.stoolTestRepository.findOne({ where: { sampleNumber } });
      if (existing) throw new BadRequestException(`Ya existe un examen con el número: ${sampleNumber}`);
    }

    const stoolTest = this.stoolTestRepository.create({
      ...createStoolTestDto,
      sampleNumber,
      testDate: createStoolTestDto.testDate ? new Date(createStoolTestDto.testDate) : new Date(),
      status: createStoolTestDto.status || 'pending',
      parasites: createStoolTestDto.parasites || [],
      protozoos: createStoolTestDto.protozoos || [],
    });

    return await this.stoolTestRepository.save(stoolTest);
  }

  async findAll(options?: {
    page?: number; limit?: number; patientId?: string;
    status?: string; dateFrom?: string; dateTo?: string; search?: string;
  }): Promise<PaginationResult<StoolTest>> {
    const page = options?.page || 1;
    const limit = options?.limit || 7;

    const query = this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .leftJoinAndSelect('stoolTest.patient', 'patient')
      .leftJoinAndSelect('stoolTest.doctor', 'doctor')
      .orderBy('stoolTest.testDate', 'DESC');

    if (options?.search) {
      query.andWhere(
        '(LOWER(patient.name) LIKE LOWER(:search) OR LOWER(stoolTest.sampleNumber) LIKE LOWER(:search))',
        { search: `%${options.search}%` }
      );
    }
    if (options?.patientId) query.andWhere('stoolTest.patientId = :patientId', { patientId: options.patientId });
    if (options?.status) query.andWhere('stoolTest.status = :status', { status: options.status });
    if (options?.dateFrom) query.andWhere('stoolTest.testDate >= :dateFrom', { dateFrom: new Date(options.dateFrom) });
    if (options?.dateTo) query.andWhere('stoolTest.testDate <= :dateTo', { dateTo: new Date(options.dateTo) });

    return this.paginateQueryBuilder(query, page, limit);
  }

  async update(id: string, updateStoolTestDto: UpdateStoolTestDto): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);

    if (updateStoolTestDto.sampleNumber && updateStoolTestDto.sampleNumber !== stoolTest.sampleNumber) {
      const existing = await this.stoolTestRepository.findOne({ where: { sampleNumber: updateStoolTestDto.sampleNumber } });
      if (existing) throw new BadRequestException(`Ya existe un examen con el número: ${updateStoolTestDto.sampleNumber}`);
    }

    Object.assign(stoolTest, updateStoolTestDto);
    return await this.stoolTestRepository.save(stoolTest);
  }

  async deactivate(id: string): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);
    if (!stoolTest.isActive) throw new BadRequestException('El examen ya está desactivado');
    stoolTest.isActive = false;
    return await this.stoolTestRepository.save(stoolTest);
  }

  async reactivate(id: string): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);
    if (stoolTest.isActive) throw new BadRequestException('El examen ya está activo');
    stoolTest.isActive = true;
    return await this.stoolTestRepository.save(stoolTest);
  }

  async getStatistics() {
    const [total, pending, completed, reviewed, abnormalCount] = await Promise.all([
      this.stoolTestRepository.count(),
      this.stoolTestRepository.count({ where: { status: 'pending' } }),
      this.stoolTestRepository.count({ where: { status: 'completed' } }),
      this.stoolTestRepository.count({ where: { status: 'reviewed' } }),
      this.stoolTestRepository.createQueryBuilder('stool')
        .where('stool.leukocytes != :normal', { normal: 'no se observa' })
        .orWhere('stool.erythrocytes != :normal', { normal: 'no se observa' })
        .getCount(),
    ]);

    const byStatus = await this.stoolTestRepository.createQueryBuilder('stool')
      .select('stool.status', 'status').addSelect('COUNT(*)', 'count')
      .groupBy('stool.status').getRawMany();

    return {
      total, pending, completed, reviewed,
      abnormalFindings: abnormalCount,
      abnormalPercentage: total > 0 ? ((abnormalCount / total) * 100).toFixed(2) : 0,
      byStatus,
    };
  }

  private async generateSampleNumber(): Promise<string> {
    const date = new Date();
    const prefix = `ST${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.stoolTestRepository.count({
      where: { createdAt: Between(new Date(date.setHours(0, 0, 0, 0)), new Date(date.setHours(23, 59, 59, 999))) }
    });
    return `${prefix}${(count + 1).toString().padStart(3, '0')}`;
  }
}
