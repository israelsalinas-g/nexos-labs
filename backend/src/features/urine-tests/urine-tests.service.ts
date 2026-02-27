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
    } as any) as any;

    urineTest.status = urineTest.getAutoStatus ? urineTest.getAutoStatus(createUrineTestDto.status) : createUrineTestDto.status;

    const savedTest = await this.urineTestRepository.save(urineTest);
    return this.findOne((savedTest as any).id);
  }

  async findAll(page: number = 1, limit: number = 10, options?: any): Promise<PaginationResult<UrineTest>> {
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
    if (options?.hasAbnormalResults) {
      // Simplificación: esto dependería de la lógica de negocio real
      query.andWhere('urineTest.gravity > 1.025 OR urineTest.protein != \'Negativo\'');
    }
    if (options?.dateFrom) {
      query.andWhere('urineTest.testDate >= :dateFrom', { dateFrom: options.dateFrom });
    }
    if (options?.dateTo) {
      query.andWhere('urineTest.testDate <= :dateTo', { dateTo: options.dateTo });
    }

    return this.paginateQueryBuilder(query, page, limit);
  }

  async remove(id: string): Promise<void> {
    const urineTest = await this.findOne(id);
    await this.urineTestRepository.remove(urineTest);
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

  async getPendingReview(): Promise<UrineTest[]> {
    return this.urineTestRepository.find({
      where: { status: 'Pendiente' as any, isActive: true },
      relations: ['patient', 'doctor'],
      order: { testDate: 'DESC' },
    });
  }

  async findByPatient(patientId: string): Promise<UrineTest[]> {
    return this.urineTestRepository.find({
      where: { patientId, isActive: true },
      relations: ['patient', 'doctor'],
      order: { testDate: 'DESC' },
    });
  }

  async getMedicalReport(id: string): Promise<any> {
    const test = await this.findOne(id);
    // Lógica para generar reporte médico (simplificada)
    return {
      test,
      generatedAt: new Date(),
      institution: 'NEXOS Residencial',
    };
  }

  async markAsCompleted(id: string, reviewedBy?: string): Promise<UrineTest> {
    const test = await this.findOne(id);
    (test as any).status = 'Completado';
    if (reviewedBy) (test as any).reviewedBy = reviewedBy;
    (test as any).reviewedAt = new Date();
    return this.urineTestRepository.save(test);
  }

  async findAllActive(page: number, limit: number): Promise<PaginationResult<UrineTest>> {
    return this.findAll(page, limit, { isActive: true });
  }

  async findAllIncludingInactive(page: number, limit: number): Promise<PaginationResult<UrineTest>> {
    const query = this.urineTestRepository.createQueryBuilder('urineTest')
      .leftJoinAndSelect('urineTest.patient', 'patient')
      .leftJoinAndSelect('urineTest.doctor', 'doctor')
      .orderBy('urineTest.testDate', 'DESC');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async findInactive(page: number, limit: number): Promise<PaginationResult<UrineTest>> {
    return this.findAll(page, limit, { isActive: false });
  }

  async findByPatientActive(patientId: string, page: number, limit: number): Promise<PaginationResult<UrineTest>> {
    return this.findAll(page, limit, { patientId, isActive: true });
  }

  async deactivate(id: string): Promise<UrineTest> {
    const test = await this.findOne(id);
    test.isActive = false;
    return this.urineTestRepository.save(test);
  }

  async reactivate(id: string): Promise<UrineTest> {
    const test = await this.findOne(id);
    test.isActive = true;
    return this.urineTestRepository.save(test);
  }
}
