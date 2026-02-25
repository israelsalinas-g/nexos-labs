import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UrineTest } from '../../entities/urine-test.entity';
import { CreateUrineTestDto } from '../../dto/create-urine-test.dto';
import { UpdateUrineTestDto } from '../../dto/update-urine-test.dto';
import { Patient } from '../../entities/patient.entity';
import { BaseService } from '../../common/bases/base.service';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class UrineTestsService extends BaseService<UrineTest> {
  protected readonly logger = new Logger(UrineTestsService.name);

  constructor(
    @InjectRepository(UrineTest)
    private urineTestRepository: Repository<UrineTest>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {
    super(urineTestRepository);
  }

  async create(createUrineTestDto: CreateUrineTestDto): Promise<UrineTest> {
    const sampleNumber = createUrineTestDto.sampleNumber || await this.generateSampleNumber();

    // Verificar si ya existe
    if (createUrineTestDto.sampleNumber) {
      const existing = await this.urineTestRepository.findOne({ where: { sampleNumber } });
      if (existing) throw new BadRequestException(`Ya existe un examen con el número: ${sampleNumber}`);
    }

    const patient = await this.patientRepository.findOne({ where: { id: createUrineTestDto.patientId } });
    if (!patient) throw new BadRequestException('Paciente no encontrado');

    const urineTest = this.urineTestRepository.create({
      ...createUrineTestDto,
      sampleNumber,
      testDate: new Date(createUrineTestDto.testDate || new Date()),
    });

    urineTest.status = urineTest.getAutoStatus(createUrineTestDto.status);

    const savedTest = await this.urineTestRepository.save(urineTest);
    return this.findOne(savedTest.id);
  }

  async findAll(options?: any): Promise<PaginationResult<UrineTest>> {
    const page = options?.page || 1;
    const limit = options?.limit || 7;

    const query = this.urineTestRepository.createQueryBuilder('urineTest')
      .leftJoinAndSelect('urineTest.patient', 'patient')
      .leftJoinAndSelect('urineTest.doctor', 'doctor')
      .orderBy('urineTest.testDate', 'DESC');

    if (options?.search) {
      query.andWhere(
        '(LOWER(patient.name) LIKE LOWER(:search) OR LOWER(urineTest.sampleNumber) LIKE LOWER(:search))',
        { search: `%${options.search}%` }
      );
    }

    if (options?.patientId) query.andWhere('urineTest.patientId = :patientId', { patientId: options.patientId });
    if (options?.status) query.andWhere('urineTest.status = :status', { status: options.status });

    return this.paginateQueryBuilder(query, page, limit);
  }

  async update(id: string, updateUrineTestDto: UpdateUrineTestDto): Promise<UrineTest> {
    const urineTest = await this.findOne(id);

    Object.assign(urineTest, updateUrineTestDto);
    if (updateUrineTestDto.testDate) urineTest.testDate = new Date(updateUrineTestDto.testDate);

    urineTest.status = urineTest.getAutoStatus(updateUrineTestDto.status);

    return await this.urineTestRepository.save(urineTest);
  }

  private async generateSampleNumber(): Promise<string> {
    const date = new Date();
    const prefix = `UR${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const count = await this.urineTestRepository.count({
      where: { createdAt: Between(new Date(date.setHours(0, 0, 0, 0)), new Date(date.setHours(23, 59, 59, 999))) }
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}${sequence}`;
  }

  async getStatistics(): Promise<any> {
    const total = await this.urineTestRepository.count();
    const byStatus = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .select('urineTest.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('urineTest.status')
      .getRawMany();

    return { total, byStatus };
  }
}
