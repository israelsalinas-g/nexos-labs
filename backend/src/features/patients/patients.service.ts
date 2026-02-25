import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from '../../dto/create-patient.dto';
import { UpdatePatientDto } from '../../dto/update-patient.dto';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    this.logger.log(`Creando nuevo paciente: ${createPatientDto.name}`);

    try {
      // Verificar si ya existe un paciente con el mismo DNI (solo si se proporciona)
      if (createPatientDto.dni) {
        const existingPatient = await this.patientsRepository.findOne({
          where: { dni: createPatientDto.dni }
        });

        if (existingPatient) {
          throw new ConflictException(`Ya existe un paciente con DNI: ${createPatientDto.dni}`);
        }
      }

      // Verificar si ya existe un paciente con el mismo email (si se proporciona)
      if (createPatientDto.email) {
        const existingEmail = await this.patientsRepository.findOne({
          where: { email: createPatientDto.email }
        });

        if (existingEmail) {
          throw new ConflictException(`Ya existe un paciente con email: ${createPatientDto.email}`);
        }
      }

      // Calcular edad automáticamente desde fecha de nacimiento
      const birthDate = new Date(createPatientDto.birthDate);
      const today = new Date();
      const calculatedAge = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      const patient = this.patientsRepository.create({
        ...createPatientDto,
        birthDate: birthDate,
        age: createPatientDto.age || calculatedAge, // Usar edad proporcionada o calculada
      });

      const savedPatient = await this.patientsRepository.save(patient);
      this.logger.log(`Paciente creado exitosamente con ID: ${savedPatient.id}, Edad calculada: ${calculatedAge} años`);
      
      return savedPatient;
    } catch (error) {
      this.logger.error(`Error creando paciente: ${error.message}`);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 7,
    search?: string,
    isActive?: boolean
  ): Promise<PaginationResult<Patient>> {
    this.logger.log(`Obteniendo pacientes - Página: ${page}, Límite: ${limit}, Search: "${search}", IsActive: ${isActive}`);

    try {
      // Versión simplificada: usar find básico si no hay filtros complejos
      if (!search && isActive === undefined) {
        this.logger.log('✅ Usando consulta simple sin filtros');
        const skip = (page - 1) * limit;
        
        const [patients, total] = await this.patientsRepository.findAndCount({
          order: { createdAt: 'DESC' },
          skip: skip,
          take: limit
        });

        return {
          data: patients,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }

      // Usar query builder solo si hay filtros
      this.logger.log('🔍 Usando query builder con filtros');
      this.logger.log(`🔹 Search: "${search}" | IsActive: ${isActive}`);
      const skip = (page - 1) * limit;
      
      let query = this.patientsRepository.createQueryBuilder('patient');

      // Filtro por estado activo
      if (isActive !== undefined) {
        query = query.where('patient.isActive = :isActive', { isActive });
      }

      // Búsqueda por nombre o DNI
      if (search && search.trim()) {
        if (isActive !== undefined) {
          // Si ya hay condiciones WHERE, usar andWhere
          query = query.andWhere(
            '(patient.name ILIKE :search OR (patient.dni IS NOT NULL AND patient.dni ILIKE :search))',
            { search: `%${search.trim()}%` }
          );
        } else {
          // Si no hay condiciones previas, usar where
          query = query.where(
            '(patient.name ILIKE :search OR (patient.dni IS NOT NULL AND patient.dni ILIKE :search))',
            { search: `%${search.trim()}%` }
          );
        }
      }

      // Ordenar y paginar
      query = query
        .orderBy('patient.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
      
      const [patients, total] = await query.getManyAndCount();

      return {
        data: patients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo pacientes: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al obtener la lista de pacientes: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Patient> {
    this.logger.log(`Buscando paciente con ID: ${id}`);

    try {
      const patient = await this.patientsRepository.findOne({
        where: { id }
      });

      if (!patient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }

      return patient;
    } catch (error) {
      this.logger.error(`Error buscando paciente: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar el paciente');
    }
  }

  async findByDni(dni: string): Promise<Patient> {
    this.logger.log(`Buscando paciente con DNI: ${dni}`);

    try {
      if (!dni) {
        throw new BadRequestException('DNI es requerido para la búsqueda');
      }

      const patient = await this.patientsRepository.findOne({
        where: { dni }
      });

      if (!patient) {
        throw new NotFoundException(`Paciente con DNI ${dni} no encontrado`);
      }

      return patient;
    } catch (error) {
      this.logger.error(`Error buscando paciente por DNI: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar el paciente por DNI');
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    this.logger.log(`Actualizando paciente con ID: ${id}`);

    try {
      const patient = await this.findOne(id);

      // Verificar conflictos de DNI si se está actualizando (solo si se proporciona)
      if (updatePatientDto.dni && updatePatientDto.dni !== patient.dni) {
        const existingDni = await this.patientsRepository.findOne({
          where: { dni: updatePatientDto.dni }
        });

        if (existingDni) {
          throw new ConflictException(`Ya existe un paciente con DNI: ${updatePatientDto.dni}`);
        }
      }

      // Verificar conflictos de email si se está actualizando
      if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
        const existingEmail = await this.patientsRepository.findOne({
          where: { email: updatePatientDto.email }
        });

        if (existingEmail) {
          throw new ConflictException(`Ya existe un paciente con email: ${updatePatientDto.email}`);
        }
      }

      // Actualizar fecha de nacimiento y recalcular edad si se proporciona
      const updateData = { ...updatePatientDto };
      if (updatePatientDto.birthDate) {
        const newBirthDate = new Date(updatePatientDto.birthDate);
        const today = new Date();
        const calculatedAge = Math.floor((today.getTime() - newBirthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        updateData.birthDate = newBirthDate as any;
        // Solo recalcular edad si no se proporciona explícitamente
        if (!updatePatientDto.age) {
          updateData.age = calculatedAge;
        }
      }

      await this.patientsRepository.update(id, updateData);
      
      const updatedPatient = await this.findOne(id);
      this.logger.log(`Paciente actualizado exitosamente: ${updatedPatient.name}`);
      
      return updatedPatient;
    } catch (error) {
      this.logger.error(`Error actualizando paciente: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Eliminando paciente con ID: ${id}`);

    try {
      const patient = await this.findOne(id);
      
      await this.patientsRepository.remove(patient);
      this.logger.log(`Paciente eliminado exitosamente: ${patient.name}`);
    } catch (error) {
      this.logger.error(`Error eliminando paciente: ${error.message}`);
      throw error;
    }
  }

  async deactivate(id: string): Promise<Patient> {
    this.logger.log(`Desactivando paciente con ID: ${id}`);

    try {
      const patient = await this.findOne(id);
      
      await this.patientsRepository.update(id, { isActive: false });
      
      const deactivatedPatient = await this.findOne(id);
      this.logger.log(`Paciente desactivado exitosamente: ${deactivatedPatient.name}`);
      
      return deactivatedPatient;
    } catch (error) {
      this.logger.error(`Error desactivando paciente: ${error.message}`);
      throw error;
    }
  }

  async activate(id: string): Promise<Patient> {
    this.logger.log(`Activando paciente con ID: ${id}`);

    try {
      const patient = await this.findOne(id);
      
      await this.patientsRepository.update(id, { isActive: true });
      
      const activatedPatient = await this.findOne(id);
      this.logger.log(`Paciente activado exitosamente: ${activatedPatient.name}`);
      
      return activatedPatient;
    } catch (error) {
      this.logger.error(`Error activando paciente: ${error.message}`);
      throw error;
    }
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byAgeGroup: { group: string; count: number }[];
    bySex: { sex: string; count: number }[];
  }> {
    this.logger.log('Obteniendo estadísticas de pacientes');

    try {
      const total = await this.patientsRepository.count();
      const active = await this.patientsRepository.count({ where: { isActive: true } });
      const inactive = total - active;

      // Estadísticas por grupo de edad
      const ageGroups = await this.patientsRepository
        .createQueryBuilder('patient')
        .select([
          'CASE ' +
          'WHEN "patientAge" < 18 THEN \'Menor de edad\' ' +
          'WHEN "patientAge" BETWEEN 18 AND 30 THEN \'18-30 años\' ' +
          'WHEN "patientAge" BETWEEN 31 AND 50 THEN \'31-50 años\' ' +
          'WHEN "patientAge" BETWEEN 51 AND 70 THEN \'51-70 años\' ' +
          'ELSE \'Más de 70 años\' ' +
          'END as group',
          'COUNT(*) as count'
        ])
        .where('patient.isActive = true')
        .groupBy('group')
        .getRawMany();

      // Estadísticas por sexo
      const sexStats = await this.patientsRepository
        .createQueryBuilder('patient')
        .select(['patient.patientSex as sex', 'COUNT(*) as count'])
        .where('patient.isActive = true')
        .groupBy('patient.patientSex')
        .getRawMany();

      return {
        total,
        active,
        inactive,
        byAgeGroup: ageGroups,
        bySex: sexStats,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw new BadRequestException('Error al obtener estadísticas');
    }
  }

  async debugTable(): Promise<any> {
    this.logger.log('🔧 Ejecutando debug de tabla patients');

    try {
      // Información básica de la tabla
      const rawCount = await this.patientsRepository.query('SELECT COUNT(*) FROM patients');
      const tableExists = await this.patientsRepository.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'patients'
        );
      `);
      
      // Estructura de la tabla
      const tableStructure = await this.patientsRepository.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'patients'
        ORDER BY ordinal_position;
      `);
      
      // Todos los registros
      const allRecords = await this.patientsRepository.query('SELECT * FROM patients LIMIT 10');
      
      // Usando TypeORM
      const typeormCount = await this.patientsRepository.count();
      const typeormRecords = await this.patientsRepository.find({ take: 5 });

      return {
        tableExists: tableExists[0]?.exists,
        rawCount: rawCount[0]?.count,
        typeormCount,
        tableStructure,
        rawRecords: allRecords,
        typeormRecords,
        message: 'Debug completo de tabla patients'
      };
    } catch (error) {
      this.logger.error(`Error en debug: ${error.message}`, error.stack);
      return {
        error: error.message,
        message: 'Error ejecutando debug'
      };
    }
  }
}