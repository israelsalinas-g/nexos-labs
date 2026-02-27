import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from '../../dto/create-patient.dto';
import { UpdatePatientDto } from '../../dto/update-patient.dto';
import { BaseService } from '../../common/bases/base.service';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class PatientsService extends BaseService<Patient> {
  protected readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {
    super(patientsRepository);
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    this.logger.log(`Creando nuevo paciente: ${createPatientDto.name}`);

    // Verificar unicidad de DNI e Email
    await this.validateUniqueness(createPatientDto.dni, createPatientDto.email);

    const patient = this.patientsRepository.create({
      ...createPatientDto,
      birthDate: new Date(createPatientDto.birthDate),
    });

    // La edad se calculará o usará la proporcionada
    if (!patient.age) {
      patient.age = patient.calculateAge();
    }

    const savedPatient = await this.patientsRepository.save(patient);
    this.logger.log(`Paciente creado exitosamente con ID: ${savedPatient.id}`);

    return savedPatient;
  }

  async findAll(
    page: number = 1,
    limit: number = 7,
    options?: any
  ): Promise<PaginationResult<Patient>> {
    const search = options?.search;
    const isActive = options?.isActive;

    this.logger.log(`Obteniendo pacientes - Página: ${page}, Límite: ${limit}, Search: "${search}"`);

    const query = this.patientsRepository.createQueryBuilder('patient');

    if (isActive !== undefined) {
      query.andWhere('patient.isActive = :isActive', { isActive });
    }

    if (search && search.trim()) {
      query.andWhere(
        '(patient.name ILIKE :search OR (patient.dni IS NOT NULL AND patient.dni ILIKE :search))',
        { search: `%${search.trim()}%` }
      );
    }

    query.orderBy('patient.createdAt', 'DESC');

    return this.paginateQueryBuilder(query, page, limit);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    this.logger.log(`Actualizando paciente con ID: ${id}`);

    const patient = await this.findOne(id);

    // Verificar unicidad si cambian datos sensibles
    await this.validateUniqueness(updatePatientDto.dni, updatePatientDto.email, id);

    const updateData = { ...updatePatientDto };

    if (updatePatientDto.birthDate) {
      const birthDate = new Date(updatePatientDto.birthDate);
      patient.birthDate = birthDate;
      if (!updatePatientDto.age) {
        updateData.age = patient.calculateAge();
      }
    }

    Object.assign(patient, updateData);
    return await this.patientsRepository.save(patient);
  }

  private async validateUniqueness(dni?: string, email?: string, excludeId?: string): Promise<void> {
    if (dni) {
      const query = this.patientsRepository.createQueryBuilder('patient')
        .where('patient.dni = :dni', { dni });
      if (excludeId) query.andWhere('patient.id != :excludeId', { excludeId });

      if (await query.getOne()) {
        throw new ConflictException(`Ya existe un paciente con DNI: ${dni}`);
      }
    }

    if (email) {
      const query = this.patientsRepository.createQueryBuilder('patient')
        .where('patient.email = :email', { email });
      if (excludeId) query.andWhere('patient.id != :excludeId', { excludeId });

      if (await query.getOne()) {
        throw new ConflictException(`Ya existe un paciente con email: ${email}`);
      }
    }
  }

  async deactivate(id: string): Promise<Patient> {
    return this.update(id, { isActive: false } as any);
  }

  async activate(id: string): Promise<Patient> {
    return this.update(id, { isActive: true } as any);
  }

  async findByDni(dni: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({ where: { dni } });
    if (!patient) throw new NotFoundException(`Paciente con DNI ${dni} no encontrado`);
    return patient;
  }

  async debugTable(): Promise<any> {
    const count = await this.patientsRepository.count();
    const samples = await this.patientsRepository.find({ take: 5 });
    return { count, samples };
  }

  async getStatistics(): Promise<any> {
    this.logger.log('Obteniendo estadísticas de pacientes');

    const total = await this.patientsRepository.count();
    const active = await this.patientsRepository.count({ where: { isActive: true } });

    const ageGroups = await this.patientsRepository
      .createQueryBuilder('patient')
      .select([
        "CASE " +
        "WHEN patient.age < 18 THEN 'Menor de edad' " +
        "WHEN patient.age BETWEEN 18 AND 30 THEN '18-30 años' " +
        "WHEN patient.age BETWEEN 31 AND 50 THEN '31-50 años' " +
        "WHEN patient.age BETWEEN 51 AND 70 THEN '51-70 años' " +
        "ELSE 'Más de 70 años' " +
        "END as group",
        "COUNT(*) as count"
      ])
      .where('patient.isActive = true')
      .groupBy('group')
      .getRawMany();

    const sexStats = await this.patientsRepository
      .createQueryBuilder('patient')
      .select(['patient.sex as sex', 'COUNT(*) as count'])
      .where('patient.isActive = true')
      .groupBy('patient.sex')
      .getRawMany();

    return { total, active, inactive: total - active, byAgeGroup: ageGroups, bySex: sexStats };
  }
}