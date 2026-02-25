import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../entities/doctor.entity';
import { CreateDoctorDto } from '../../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../../dto/update-doctor.dto';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  /**
   * Crear un nuevo médico
   */
  async create(createDto: CreateDoctorDto): Promise<Doctor> {
    // Verificar si ya existe un médico con el mismo email
    const existingByEmail = await this.doctorRepository.findOne({
      where: { email: createDto.email }
    });

    if (existingByEmail) {
      throw new ConflictException(`Ya existe un médico con el email "${createDto.email}"`);
    }

    // Verificar si ya existe un médico con el mismo número de licencia
    const existingByLicense = await this.doctorRepository.findOne({
      where: { licenseNumber: createDto.licenseNumber }
    });

    if (existingByLicense) {
      throw new ConflictException(`Ya existe un médico con la licencia "${createDto.licenseNumber}"`);
    }

    const doctor = this.doctorRepository.create(createDto);
    return await this.doctorRepository.save(doctor);
  }

  private readonly logger = new Logger(DoctorsService.name);

  /**
   * Obtener todos los médicos con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 7,
    includeInactive: boolean = false,
    staffOnly: boolean = false,
    search?: string
  ): Promise<PaginationResult<Doctor>> {
    this.logger.log(`Obteniendo médicos - Página: ${page}, Límite: ${limit}, IncludeInactive: ${includeInactive}, StaffOnly: ${staffOnly}, Search: "${search}"`);

    try {
      const skip = (page - 1) * limit;
      const query = this.doctorRepository
        .createQueryBuilder('doctor')
        .orderBy('doctor.lastName', 'ASC')
        .addOrderBy('doctor.firstName', 'ASC')
        .skip(skip)
        .take(limit);

      if (!includeInactive) {
        query.andWhere('doctor.isActive = :isActive', { isActive: true });
      }

      if (staffOnly) {
        query.andWhere('doctor.isStaff = :isStaff', { isStaff: true });
      }

      if (search) {
        query.andWhere(
          '(LOWER(doctor.firstName) LIKE LOWER(:search) OR ' +
          'LOWER(doctor.lastName) LIKE LOWER(:search) OR ' +
          'LOWER(doctor.specialty) LIKE LOWER(:search) OR ' +
          'doctor.licenseNumber LIKE :search)',
          { search: `%${search}%` }
        );
      }

      const [doctors, total] = await query.getManyAndCount();

      return {
        data: doctors,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo médicos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener un médico por su ID
   */
  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['orders']
    });

    if (!doctor) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    return doctor;
  }

  /**
   * Obtener un médico por su email
   */
  async findByEmail(email: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { email }
    });

    if (!doctor) {
      throw new NotFoundException(`Médico con email "${email}" no encontrado`);
    }

    return doctor;
  }

  /**
   * Obtener un médico por su número de licencia
   */
  async findByLicense(licenseNumber: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { licenseNumber }
    });

    if (!doctor) {
      throw new NotFoundException(`Médico con licencia "${licenseNumber}" no encontrado`);
    }

    return doctor;
  }

  /**
   * Buscar médicos por nombre
   */
  async search(searchTerm: string): Promise<Doctor[]> {
    return await this.doctorRepository
      .createQueryBuilder('doctor')
      .where('LOWER(doctor.firstName) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orWhere('LOWER(doctor.lastName) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orWhere('LOWER(doctor.specialty) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .andWhere('doctor.isActive = :isActive', { isActive: true })
      .orderBy('doctor.lastName', 'ASC')
      .getMany();
  }

  /**
   * Actualizar un médico
   */
  async update(id: string, updateDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    // Verificar conflictos de email si se está actualizando
    if (updateDto.email && updateDto.email !== doctor.email) {
      const existingByEmail = await this.doctorRepository.findOne({
        where: { email: updateDto.email }
      });

      if (existingByEmail && existingByEmail.id !== id) {
        throw new ConflictException(`Ya existe un médico con el email "${updateDto.email}"`);
      }
    }

    // Verificar conflictos de licencia si se está actualizando
    if (updateDto.licenseNumber && updateDto.licenseNumber !== doctor.licenseNumber) {
      const existingByLicense = await this.doctorRepository.findOne({
        where: { licenseNumber: updateDto.licenseNumber }
      });

      if (existingByLicense && existingByLicense.id !== id) {
        throw new ConflictException(`Ya existe un médico con la licencia "${updateDto.licenseNumber}"`);
      }
    }

    Object.assign(doctor, updateDto);
    return await this.doctorRepository.save(doctor);
  }

  /**
   * Eliminar un médico (soft delete - marcar como inactivo)
   */
  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    
    // Verificar si tiene órdenes asociadas
    if (doctor.orders && doctor.orders.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el médico porque tiene ${doctor.orders.length} orden(es) asociada(s). Desactívelo en su lugar.`
      );
    }

    await this.doctorRepository.remove(doctor);
  }

  /**
   * Activar/Desactivar un médico
   */
  async toggleActive(id: string): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.isActive = !doctor.isActive;
    return await this.doctorRepository.save(doctor);
  }

  /**
   * Cambiar estado de staff
   */
  async toggleStaff(id: string): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.isStaff = !doctor.isStaff;
    return await this.doctorRepository.save(doctor);
  }

  /**
   * Obtener estadísticas de médicos
   */
  async getStats() {
    const total = await this.doctorRepository.count();
    const active = await this.doctorRepository.count({ where: { isActive: true } });
    const inactive = total - active;
    const staff = await this.doctorRepository.count({ where: { isStaff: true, isActive: true } });
    const external = active - staff;

    // Contar por especialidad
    const bySpecialty = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('doctor.specialty', 'specialty')
      .addSelect('COUNT(*)', 'count')
      .where('doctor.isActive = :isActive', { isActive: true })
      .groupBy('doctor.specialty')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      staff,
      external,
      bySpecialty: bySpecialty.map(item => ({
        specialty: item.specialty,
        count: parseInt(item.count)
      }))
    };
  }
}
