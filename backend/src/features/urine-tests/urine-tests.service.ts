import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UrineTest } from '../../entities/urine-test.entity';
import { CreateUrineTestDto } from '../../dto/create-urine-test.dto';
import { UpdateUrineTestDto } from '../../dto/update-urine-test.dto';
import { Patient } from '../../entities/patient.entity';
import { NegativePositive } from '../../common/enums/negative-positive.enums';
import { NegativePositive4Plus } from '../../common/enums/negative-positive-4-plus.enums';
import { NegativePositive3Plus } from '../../common/enums/negative-positive-3-plus.enums';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class UrineTestsService {
  private readonly logger = new Logger(UrineTestsService.name);

  constructor(
    @InjectRepository(UrineTest)
    private urineTestRepository: Repository<UrineTest>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  /**
   * Generar número de muestra automático para examen de orina
   * Formato: UR-YYMMDD-XXX
   * Ejemplo: UR251031001 (UR del 31 de octubre de 2025, secuencia 001)
   */
  private async generateSampleNumber(): Promise<string> {
    // Obtener componentes de fecha actual
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Obtener cantidad de exámenes de hoy para generar secuencia
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const testsToday = await this.urineTestRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay)
      }
    });

    // Generar número de secuencia (3 dígitos, con ceros a la izquierda)
    const sequence = (testsToday + 1).toString().padStart(3, '0');

    // Formato: UR + YYMMDD + XXX (UR para Urine Test, seguido de fecha y secuencia)
    const sampleNumber = `UR${year}${month}${day}${sequence}`;

    // Verificar unicidad
    const existingSample = await this.urineTestRepository.findOne({
      where: { sampleNumber }
    });

    if (existingSample) {
      // En el improbable caso de que exista, intentar recursivamente con el siguiente número
      const nextSequence = (parseInt(sequence) + 1).toString().padStart(3, '0');
      return this.generateSampleNumber();
    }

    return sampleNumber;
  }

  /**
   * Validar si un examen está completo (tiene todos los campos importantes)
   */
  private isUrineTestComplete(urineTest: any): boolean {
    const requiredPhysicalFields = ['volume', 'color', 'aspect', 'sediment', 'density'];
    const requiredChemicalFields = ['ph', 'protein', 'glucose', 'bilirubin', 'ketones', 'occultBlood', 'nitrites', 'urobilinogen', 'leukocytes'];
    const requiredMicroscopicFields = ['epithelialCells', 'leukocytesField', 'erythrocytesField', 'bacteria', 'mucousFilaments', 'crystals', 'yeasts', 'cylinders'];

    // Verificar campos físicos
    const physicalComplete = requiredPhysicalFields.every(field => 
      urineTest[field] !== null && urineTest[field] !== undefined && urineTest[field] !== ''
    );

    // Verificar campos químicos
    const chemicalComplete = requiredChemicalFields.every(field => 
      urineTest[field] !== null && urineTest[field] !== undefined && urineTest[field] !== ''
    );

    // Verificar campos microscópicos
    const microscopicComplete = requiredMicroscopicFields.every(field => 
      urineTest[field] !== null && urineTest[field] !== undefined && urineTest[field] !== ''
    );

    return physicalComplete && chemicalComplete && microscopicComplete;
  }

  /**
   * Determinar el estado automático basado en la completitud del examen
   */
  private getAutoStatus(urineTest: any, requestedStatus?: string): string {
    const isComplete = this.isUrineTestComplete(urineTest);
    
    // Si se solicita específicamente 'completed' pero no está completo, rechazar
    if (requestedStatus === 'completed' && !isComplete) {
      throw new BadRequestException(
        'No se puede marcar como completado: faltan campos obligatorios en el examen físico, químico o microscópico'
      );
    }

    // Si está completo y no se especifica estado, auto-completar
    if (isComplete && !requestedStatus) {
      return 'completed';
    }

    // Si se especifica un estado válido y no es 'completed', usarlo
    if (requestedStatus && requestedStatus !== 'completed') {
      return requestedStatus;
    }

    // Estado por defecto para exámenes incompletos
    return isComplete ? 'completed' : 'pending';
  }

  /**
   * Crear un nuevo examen de orina
   */
  async create(createUrineTestDto: CreateUrineTestDto): Promise<UrineTest> {
    try {
      // Generar número de muestra si no se proporciona uno
      if (!createUrineTestDto.sampleNumber) {
        createUrineTestDto.sampleNumber = await this.generateSampleNumber();
      } else {
        // Si se proporciona un número de muestra, verificar que no exista
        const existingSample = await this.urineTestRepository.findOne({
          where: { sampleNumber: createUrineTestDto.sampleNumber }
        });

        if (existingSample) {
          throw new BadRequestException(`Ya existe un examen con el número de muestra: ${createUrineTestDto.sampleNumber}`);
        }
      }

      // Verificar que el paciente existe
      const patient = await this.patientRepository.findOne({
        where: { id: createUrineTestDto.patientId }
      });

      if (!patient) {
        throw new BadRequestException('Paciente no encontrado');
      }

      // Crear objeto para evaluación de completitud y determinar estado
      const testData = {
        ...createUrineTestDto,
        testDate: new Date(createUrineTestDto.testDate),
      };

      // Determinar el estado automático
      const status = this.getAutoStatus(testData, createUrineTestDto.status);

      // Crear la entidad directamente y asignar valores manualmente
      const urineTest = new UrineTest();
      
      // Asignar relación con paciente
      urineTest.patient = patient;
      urineTest.patientId = patient.id;

      // Asignar relación con doctor si se proporciona
      if (createUrineTestDto.doctorId) {
        urineTest.doctorId = createUrineTestDto.doctorId;
      }
      
      // Asignar número de muestra
      urineTest.sampleNumber = createUrineTestDto.sampleNumber;
      
      // Asignar fechas
      urineTest.testDate = new Date(createUrineTestDto.testDate);
      
      // Asignar estado
      urineTest.status = status;
      
      // Asignar usuario creador si se proporciona
      if (createUrineTestDto.createdById) {
        urineTest.createdById = createUrineTestDto.createdById;
      }
      
      // Asignar examen físico
      urineTest.volume = createUrineTestDto.volume || null;
      urineTest.color = createUrineTestDto.color || null;
      urineTest.aspect = createUrineTestDto.aspect || null;
      urineTest.sediment = createUrineTestDto.sediment || null;
      urineTest.density = createUrineTestDto.density || null;
      
      // Asignar examen químico
      urineTest.ph = createUrineTestDto.ph || null;
      urineTest.protein = createUrineTestDto.protein || null;
      urineTest.glucose = createUrineTestDto.glucose || null;
      urineTest.bilirubin = createUrineTestDto.bilirubin || null;
      urineTest.ketones = createUrineTestDto.ketones || null;
      urineTest.occultBlood = createUrineTestDto.occultBlood || null;
      urineTest.nitrites = createUrineTestDto.nitrites || null;
      urineTest.urobilinogen = createUrineTestDto.urobilinogen || null;
      urineTest.leukocytes = createUrineTestDto.leukocytes || null;
      
      // Asignar examen microscópico
      urineTest.epithelialCells = createUrineTestDto.epithelialCells || null;
      urineTest.leukocytesField = createUrineTestDto.leukocytesField || null;
      urineTest.erythrocytesField = createUrineTestDto.erythrocytesField || null;
      urineTest.bacteria = createUrineTestDto.bacteria as any || null;
      urineTest.mucousFilaments = createUrineTestDto.mucousFilaments as any || null;
      urineTest.yeasts = createUrineTestDto.yeasts as any || null;
      urineTest.crystals = createUrineTestDto.crystals || [];
      urineTest.cylinders = createUrineTestDto.cylinders || [];
      
      // Asignar otros campos
      urineTest.others = createUrineTestDto.others || null;
      urineTest.observations = createUrineTestDto.observations || null;

      // Guardar en la base de datos
      const savedTest = await this.urineTestRepository.save(urineTest);

      // Retornar la entidad con sus relaciones
      const result = await this.urineTestRepository.findOne({
        where: { id: savedTest.id },
        relations: ['patient']
      });

      if (!result) {
        throw new BadRequestException('Error al recuperar el examen creado');
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Error al crear el examen de orina: ${error.message}`
      );
    }
  }

  /**
   * Obtener todos los exámenes de orina con paginación y filtros
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PaginationResult<UrineTest>> {
    this.logger.log(`Obteniendo exámenes de orina - Página: ${options?.page}, Límite: ${options?.limit}`);

    try {
      const page = options?.page || 1;
      const limit = options?.limit || 7;
      const skip = (page - 1) * limit;

      const queryBuilder = this.urineTestRepository
        .createQueryBuilder('urineTest')
        .leftJoinAndSelect('urineTest.patient', 'patient')
        .leftJoinAndSelect('urineTest.doctor', 'doctor')
        .select([
          'urineTest',
          'patient.id',
          'patient.name',
          'patient.age',
          'patient.sex',
          'patient.birthDate',
          'patient.dni',
          'patient.phone',
          'patient.email',
          'doctor.id',
          'doctor.firstName',
          'doctor.lastName',
          'doctor.specialty',
          'doctor.licenseNumber'
        ])
        .orderBy('urineTest.testDate', 'DESC');

      // Aplicar búsqueda
      if (options?.search) {
        queryBuilder.andWhere(
          '(LOWER(patient.name) LIKE LOWER(:search) OR ' +
          'LOWER(urineTest.observations) LIKE LOWER(:search) OR ' +
          'LOWER(urineTest.color) LIKE LOWER(:search))',
          { search: `%${options.search}%` }
        );
      }

      // Aplicar filtros
      if (options?.patientId) {
        queryBuilder.andWhere('urineTest.patientId = :patientId', { 
          patientId: options.patientId 
        });
      }

      if (options?.status) {
        queryBuilder.andWhere('urineTest.status = :status', { 
          status: options.status 
        });
      }

      if (options?.dateFrom) {
        queryBuilder.andWhere('urineTest.testDate >= :dateFrom', { 
          dateFrom: new Date(options.dateFrom) 
        });
      }

      if (options?.dateTo) {
        queryBuilder.andWhere('urineTest.testDate <= :dateTo', { 
          dateTo: new Date(options.dateTo) 
        });
      }

      // Obtener total y datos
      const [data, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`Se encontraron ${total} exámenes de orina`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo exámenes de orina: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener un examen de orina por ID
   */
  async findOne(id: string): Promise<UrineTest> {
    const urineTest = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .leftJoinAndSelect('urineTest.patient', 'patient')
      .leftJoinAndSelect('urineTest.doctor', 'doctor')
      .select([
        'urineTest',
        'patient.id',
        'patient.name',
        'patient.age',
        'patient.sex',
        'patient.birthDate',
        'patient.dni',
        'patient.phone',
        'patient.email',
        'doctor.id',
        'doctor.firstName',
        'doctor.lastName',
        'doctor.specialty',
        'doctor.licenseNumber'
      ])
      .where('urineTest.id = :id', { id })
      .getOne();

    if (!urineTest) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado`);
    }

    return urineTest;
  }


  /**
   * Obtener exámenes de orina por paciente
   */
  async findByPatient(patientId: string): Promise<UrineTest[]> {
    return await this.urineTestRepository.find({
      where: { patientId },
      relations: ['patient'],
      order: { testDate: 'DESC' },
    });
  }

  /**
   * Actualizar un examen de orina
   */
  async update(id: string, updateUrineTestDto: UpdateUrineTestDto): Promise<UrineTest> {
    const urineTest = await this.findOne(id);

    try {
      // Actualizar datos del DTO (excluyendo fechas)
      const { testDate, status, ...otherData } = updateUrineTestDto;
      
      // Aplicar los cambios temporalmente para evaluar completitud
      const updatedUrineTest = { ...urineTest, ...otherData };
      
      // Actualizar fechas si están presentes
      if (testDate) {
        updatedUrineTest.testDate = new Date(testDate);
      }

      // Determinar el estado automático basado en la completitud del examen actualizado
      const autoStatus = this.getAutoStatus(updatedUrineTest, status);

      // Aplicar todos los cambios incluyendo el estado calculado
      const updateData = {
        ...otherData,
        status: autoStatus,
        updatedAt: new Date(),
      };

      Object.assign(urineTest, updateData);

      // Actualizar fechas por separado
      if (testDate) {
        urineTest.testDate = new Date(testDate);
      }
      
      return await this.urineTestRepository.save(urineTest);
    } catch (error) {
      throw new BadRequestException(
        `Error al actualizar el examen de orina: ${error.message}`
      );
    }
  }

  /**
   * Eliminar un examen de orina (soft delete)
   */
  async remove(id: string): Promise<void> {
    const urineTest = await this.findOne(id);
    
    try {
      await this.urineTestRepository.softDelete(id);
    } catch (error) {
      throw new BadRequestException(
        `Error al eliminar el examen de orina: ${error.message}`
      );
    }
  }

  /**
   * Obtener estadísticas básicas de exámenes de orina
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    recent: number; // últimos 7 días
  }> {
    const total = await this.urineTestRepository.count();

    // Contar por estado
    const statusQuery = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .select('urineTest.status as status')
      .addSelect('COUNT(*) as count')
      .groupBy('urineTest.status')
      .getRawMany();

    const byStatus = statusQuery.map(item => ({
      status: item.status,
      count: parseInt(item.count),
    }));

    // Contar exámenes recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .where('urineTest.createdAt >= :date', { date: sevenDaysAgo })
      .getCount();

    return {
      total,
      byStatus,
      recent,
    };
  }

  /**
   * Obtener exámenes pendientes de revisión
   */
  async getPendingReview(): Promise<UrineTest[]> {
    return await this.urineTestRepository.find({
      where: [
        { status: 'pending' },
        { status: 'in_progress' }
      ],
      relations: ['patient'],
      order: { testDate: 'ASC' },
    });
  }

  /**
   * Marcar examen como completado
   */
  async markAsCompleted(id: string, reviewedBy?: string): Promise<UrineTest> {
    const urineTest = await this.findOne(id);

    // Validar que el examen esté completo antes de marcarlo como completado
    if (!this.isUrineTestComplete(urineTest)) {
      throw new BadRequestException(
        'No se puede marcar como completado: faltan campos obligatorios en el examen'
      );
    }

    // Marcar como completado
    urineTest.status = 'completed';
    urineTest.updatedAt = new Date();

    // Si se proporciona reviewedBy, podríamos guardarlo en observations o en un campo adicional
    if (reviewedBy) {
      const reviewNote = `Revisado por: ${reviewedBy} el ${new Date().toLocaleString('es-HN')}`;
      urineTest.observations = urineTest.observations 
        ? `${urineTest.observations}\n${reviewNote}`
        : reviewNote;
    }

    return await this.urineTestRepository.save(urineTest);
  }

  /**
   * Obtener reporte médico formateado
   */
  async getMedicalReport(id: string): Promise<{
    urineTest: UrineTest;
    interpretation: string;
    abnormalFindings: string[];
  }> {
    const urineTest = await this.findOne(id);

    const abnormalFindings: string[] = [];
    let interpretation = 'Examen dentro de parámetros normales.';

    // Analizar resultados anormales
    if (urineTest.protein && urineTest.protein !== NegativePositive4Plus.NEGATIVO) {
      abnormalFindings.push(`Proteína: ${urineTest.protein} (elevada)`);
    }

    if (urineTest.glucose && urineTest.glucose !== NegativePositive4Plus.NEGATIVO) {
      abnormalFindings.push(`Glucosa: ${urineTest.glucose} (presente)`);
    }

    if (urineTest.occultBlood && urineTest.occultBlood !== NegativePositive3Plus.NEGATIVO) {
      abnormalFindings.push(`Sangre oculta: ${urineTest.occultBlood}`);
    }

    if (urineTest.nitrites === NegativePositive.POSITIVO) {
      abnormalFindings.push('Nitritos: positivo (posible infección bacteriana)');
    }

    if (urineTest.leukocytes && urineTest.leukocytes !== NegativePositive3Plus.NEGATIVO) {
      abnormalFindings.push(`Leucocitos: ${urineTest.leukocytes} (elevados)`);
    }

    if (abnormalFindings.length > 0) {
      interpretation = 'Se observan hallazgos anormales que requieren evaluación médica.';
    }

    return {
      urineTest,
      interpretation,
      abnormalFindings,
    };
  }

  /**
   * Obtener todos los exámenes (solo activos)
   * Filtro automático por isActive = true
   */
  async findAllActive(page: number = 1, limit: number = 10): Promise<PaginationResult<UrineTest>> {
    this.logger.log(`Obteniendo exámenes activos - Página: ${page}, Límite: ${limit}`);

    const skip = (page - 1) * limit;

    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { isActive: true },
      relations: ['patient'],
      skip,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener todos los exámenes incluyendo inactivos (admin)
   */
  async findAllIncludingInactive(page: number = 1, limit: number = 10): Promise<PaginationResult<UrineTest>> {
    this.logger.log(`Obteniendo todos los exámenes (incluyendo inactivos) - Página: ${page}, Límite: ${limit}`);

    const skip = (page - 1) * limit;

    const [data, total] = await this.urineTestRepository.findAndCount({
      relations: ['patient'],
      skip,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener exámenes inactivos (para auditoría)
   */
  async findInactive(page: number = 1, limit: number = 10): Promise<PaginationResult<UrineTest>> {
    this.logger.log(`Obteniendo exámenes inactivos - Página: ${page}, Límite: ${limit}`);

    const skip = (page - 1) * limit;

    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { isActive: false },
      relations: ['patient'],
      skip,
      take: limit,
      order: { updatedAt: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener exámenes de un paciente (solo activos)
   */
  async findByPatientActive(patientId: string, page: number = 1, limit: number = 10): Promise<PaginationResult<UrineTest>> {
    this.logger.log(`Obteniendo exámenes activos del paciente ${patientId}`);

    const skip = (page - 1) * limit;

    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { patientId, isActive: true },
      relations: ['patient'],
      skip,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Desactivar examen (soft-delete)
   * Marca el examen como inactivo sin eliminarlo de la BD
   */
  async deactivate(id: string): Promise<UrineTest> {
    this.logger.log(`Desactivando examen: ${id}`);

    const urineTest = await this.urineTestRepository.findOne({
      where: { id }
    });

    if (!urineTest) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado`);
    }

    if (!urineTest.isActive) {
      throw new BadRequestException('El examen ya está desactivado');
    }

    urineTest.isActive = false;
    const result = await this.urineTestRepository.save(urineTest);

    this.logger.log(`Examen desactivado exitosamente: ${id}`);
    return result;
  }

  /**
   * Reactivar examen
   * Marca el examen como activo nuevamente
   */
  async reactivate(id: string): Promise<UrineTest> {
    this.logger.log(`Reactivando examen: ${id}`);

    const urineTest = await this.urineTestRepository.findOne({
      where: { id }
    });

    if (!urineTest) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado`);
    }

    if (urineTest.isActive) {
      throw new BadRequestException('El examen ya está activo');
    }

    urineTest.isActive = true;
    const result = await this.urineTestRepository.save(urineTest);

    this.logger.log(`Examen reactivado exitosamente: ${id}`);
    return result;
  }
}
