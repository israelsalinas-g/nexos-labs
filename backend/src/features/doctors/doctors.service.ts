import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../entities/doctor.entity';
import { CreateDoctorDto } from '../../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../../dto/update-doctor.dto';
import { PaginationResult } from '../../common/interfaces';
import { BaseService } from '../../common/bases/base.service';

@Injectable()
export class DoctorsService extends BaseService<Doctor> {
  protected readonly logger = new Logger(DoctorsService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {
    super(doctorRepository);
  }

  async create(createDto: CreateDoctorDto): Promise<Doctor> {
    await this.validateUniqueness(createDto.email, createDto.licenseNumber);
    const doctor = this.doctorRepository.create(createDto);
    return await this.doctorRepository.save(doctor);
  }

  async findAll(
    page: number = 1,
    limit: number = 7,
    options?: any,
  ): Promise<PaginationResult<Doctor>> {
    const includeInactive = options?.includeInactive === true;
    const staffOnly = options?.staffOnly === true;
    const search = options?.search;

    const query = this.doctorRepository.createQueryBuilder('doctor')
      .orderBy('doctor.lastName', 'ASC')
      .addOrderBy('doctor.firstName', 'ASC');

    if (!includeInactive) query.andWhere('doctor.isActive = true');
    if (staffOnly) query.andWhere('doctor.isStaff = true');
    if (search) {
      query.andWhere(
        '(LOWER(doctor.firstName) LIKE LOWER(:search) OR LOWER(doctor.lastName) LIKE LOWER(:search) OR ' +
        'LOWER(doctor.specialty) LIKE LOWER(:search) OR doctor.licenseNumber LIKE :search)',
        { search: `%${search}%` }
      );
    }

    return this.paginateQueryBuilder(query, page, limit);
  }

  async update(id: string, updateDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    await this.validateUniqueness(
      updateDto.email !== doctor.email ? updateDto.email : undefined,
      updateDto.licenseNumber !== doctor.licenseNumber ? updateDto.licenseNumber : undefined,
      id
    );
    Object.assign(doctor, updateDto);
    return await this.doctorRepository.save(doctor);
  }

  async toggleActive(id: string): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.isActive = !doctor.isActive;
    return await this.doctorRepository.save(doctor);
  }

  async toggleStaff(id: string): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.isStaff = !doctor.isStaff;
    return await this.doctorRepository.save(doctor);
  }

  async getStats() {
    const [total, active, staff] = await Promise.all([
      this.doctorRepository.count(),
      this.doctorRepository.count({ where: { isActive: true } }),
      this.doctorRepository.count({ where: { isStaff: true, isActive: true } }),
    ]);

    const bySpecialty = await this.doctorRepository.createQueryBuilder('doctor')
      .select('doctor.specialty', 'specialty').addSelect('COUNT(*)', 'count')
      .where('doctor.isActive = true').groupBy('doctor.specialty')
      .orderBy('count', 'DESC').getRawMany();

    return {
      total, active, inactive: total - active, staff, external: active - staff,
      bySpecialty: bySpecialty.map(i => ({ specialty: i.specialty, count: parseInt(i.count) }))
    };
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { email } });
  }

  async findByLicense(licenseNumber: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { licenseNumber } });
  }

  private async validateUniqueness(email?: string, licenseNumber?: string, excludeId?: string): Promise<void> {
    if (email) {
      const q = this.doctorRepository.createQueryBuilder('d').where('d.email = :email', { email });
      if (excludeId) q.andWhere('d.id != :excludeId', { excludeId });
      if (await q.getOne()) throw new ConflictException(`Ya existe un médico con el email "${email}"`);
    }
    if (licenseNumber) {
      const q = this.doctorRepository.createQueryBuilder('d').where('d.licenseNumber = :licenseNumber', { licenseNumber });
      if (excludeId) q.andWhere('d.id != :excludeId', { excludeId });
      if (await q.getOne()) throw new ConflictException(`Ya existe un médico con la licencia "${licenseNumber}"`);
    }
  }
}
