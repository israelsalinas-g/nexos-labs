import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { ParasiteType, ProtozooType} from '../../common/enums/stool-test.enums';
import { CreateStoolTestDto } from '../../dto/create-stool-test.dto';
import { UpdateStoolTestDto } from '../../dto/update-stool-test.dto';
import { Patient } from '../../entities/patient.entity';
import { StoolTest } from 'src/entities/stool-test.entity';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class StoolTestsService {
  private readonly logger = new Logger(StoolTestsService.name);

  constructor(
    @InjectRepository(StoolTest)
    private stoolTestRepository: Repository<StoolTest>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  private async generateSampleNumber(): Promise<string> {
    // Get current date components
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get count of tests for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const testsToday = await this.stoolTestRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay)
      }
    });

    // Generate sequence number (3 digits, zero-padded)
    const sequence = (testsToday + 1).toString().padStart(3, '0');

    // Format: ST-YYMMDD-XXX (ST for Stool Test, followed by date and sequence)
    const sampleNumber = `ST${year}${month}${day}${sequence}`;

    // Verify uniqueness
    const existingSample = await this.stoolTestRepository.findOne({
      where: { sampleNumber }
    });

    if (existingSample) {
      // En el improbable caso de que exista, recursivamente intentar con el siguiente número
      const nextSequence = (parseInt(sequence) + 1).toString().padStart(3, '0');
      return this.generateSampleNumber();
    }

    return sampleNumber;
  }

  async create(createStoolTestDto: CreateStoolTestDto): Promise<StoolTest> {
    // Generar número de muestra si no se proporciona uno
    if (!createStoolTestDto.sampleNumber) {
      createStoolTestDto.sampleNumber = await this.generateSampleNumber();
    } else {
      // Si se proporciona un número de muestra, verificar que no exista
      const existingSample = await this.stoolTestRepository.findOne({
        where: { sampleNumber: createStoolTestDto.sampleNumber }
      });

      if (existingSample) {
        throw new BadRequestException(`Ya existe un examen con el número de muestra: ${createStoolTestDto.sampleNumber}`);
      }
    }

    // Asegurarse de que parasites y protozoos tengan el formato correcto
    const defaultParasites = [];
    const defaultProtozoos = [];

    const stoolTest = this.stoolTestRepository.create({
      patientId: createStoolTestDto.patientId,
      doctorId: createStoolTestDto.doctorId,
      sampleNumber: createStoolTestDto.sampleNumber,
      color: createStoolTestDto.color,
      consistency: createStoolTestDto.consistency,
      shape: createStoolTestDto.shape,
      mucus: createStoolTestDto.mucus,
      leukocytes: createStoolTestDto.leukocytes,
      erythrocytes: createStoolTestDto.erythrocytes,
      parasites: createStoolTestDto.parasites || defaultParasites,
      protozoos: createStoolTestDto.protozoos || defaultProtozoos,
      observations: createStoolTestDto.observations,
      testDate: createStoolTestDto.testDate ? new Date(createStoolTestDto.testDate) : new Date(),
      status: createStoolTestDto.status || 'pending',
      createdById: createStoolTestDto.createdById,
      isActive: createStoolTestDto.isActive !== undefined ? createStoolTestDto.isActive : true,
    });

    return await this.stoolTestRepository.save(stoolTest);
  }

  /**
   * Obtener todos los exámenes de heces con paginación y filtros
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PaginationResult<StoolTest>> {
    this.logger.log(`Obteniendo exámenes de heces - Página: ${options?.page}, Límite: ${options?.limit}`);

    try {
      const page = options?.page || 1;
      const limit = options?.limit || 7;
      const skip = (page - 1) * limit;

      const queryBuilder = this.stoolTestRepository
        .createQueryBuilder('stoolTest')
        .leftJoinAndSelect('stoolTest.patient', 'patient')
        .leftJoinAndSelect('stoolTest.doctor', 'doctor')
        .select([
          'stoolTest',
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
        .orderBy('stoolTest.testDate', 'DESC');

      // Aplicar filtros
      if (options?.search) {
        queryBuilder.andWhere(
          '(LOWER(patient.name) LIKE LOWER(:search) OR stoolTest.sampleNumber LIKE :search)',
          { search: `%${options.search}%` }
        );
      }

      if (options?.patientId) {
        queryBuilder.andWhere('stoolTest.patientId = :patientId', { 
          patientId: options.patientId 
        });
      }

      if (options?.status) {
        queryBuilder.andWhere('stoolTest.status = :status', { 
          status: options.status 
        });
      }

      if (options?.dateFrom) {
        queryBuilder.andWhere('stoolTest.testDate >= :dateFrom', { 
          dateFrom: new Date(options.dateFrom) 
        });
      }

      if (options?.dateTo) {
        queryBuilder.andWhere('stoolTest.testDate <= :dateTo', { 
          dateTo: new Date(options.dateTo) 
        });
      }

      // Obtener total y datos
      const [data, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo exámenes de heces: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<StoolTest | null> {
    return await this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .leftJoinAndSelect('stoolTest.patient', 'patient')
      .leftJoinAndSelect('stoolTest.doctor', 'doctor')
      .select([
        'stoolTest',
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
      .where('stoolTest.id = :id', { id })
      .getOne();
  }

  async findByPatient(patientId: string): Promise<StoolTest[]> {
    return await this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .leftJoinAndSelect('stoolTest.patient', 'patient')
      .select([
        'stoolTest',
        'patient.id',
        'patient.patientName',
        'patient.patientAge',
        'patient.patientSex'
      ])
      .where('stoolTest.patientId = :patientId', { patientId })
      .orderBy('stoolTest.testDate', 'DESC')
      .getMany();
  }

  async findByStatus(status: string): Promise<StoolTest[]> {
    return await this.stoolTestRepository.find({
      where: { status },
      order: { testDate: 'DESC' }
    });
  }

  async findBySampleNumber(sampleNumber: string): Promise<StoolTest | null> {
    return await this.stoolTestRepository.findOne({
      where: { sampleNumber }
    });
  }

  async update(id: number, updateStoolTestDto: UpdateStoolTestDto): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);
    if (!stoolTest) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }

    // Si se está cambiando el número de muestra, verificar que no exista
    if (updateStoolTestDto.sampleNumber && updateStoolTestDto.sampleNumber !== stoolTest.sampleNumber) {
      const existingSample = await this.stoolTestRepository.findOne({
        where: { sampleNumber: updateStoolTestDto.sampleNumber }
      });

      if (existingSample) {
        throw new BadRequestException(`Ya existe un examen con el número de muestra: ${updateStoolTestDto.sampleNumber}`);
      }
    }

    Object.assign(stoolTest, updateStoolTestDto);
    return await this.stoolTestRepository.save(stoolTest);
  }

  async remove(id: number): Promise<void> {
    const result = await this.stoolTestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }
  }

  async completeTest(id: number): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);
    if (!stoolTest) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }

    stoolTest.status = 'completed';
    return await this.stoolTestRepository.save(stoolTest);
  }



  async getStatistics() {
    const [
      totalTests,
      pendingTests,
      completedTests,
      reviewedTests,
      testsThisMonth,
      testsToday
    ] = await Promise.all([
      this.stoolTestRepository.count(),
      this.stoolTestRepository.count({ where: { status: 'pending' } }),
      this.stoolTestRepository.count({ where: { status: 'completed' } }),
      this.stoolTestRepository.count({ where: { status: 'reviewed' } }),
      this.stoolTestRepository
        .createQueryBuilder('stool')
        .where('EXTRACT(MONTH FROM stool.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE)')
        .andWhere('EXTRACT(YEAR FROM stool.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)')
        .getCount(),
      this.stoolTestRepository
        .createQueryBuilder('stool')
        .where('DATE(stool.createdAt) = CURRENT_DATE')
        .getCount()
    ]);

    // Estadísticas por resultados más comunes
    const [colorStats, consistencyStats, abnormalFindings] = await Promise.all([
      this.stoolTestRepository
        .createQueryBuilder('stool')
        .select('stool.color', 'color')
        .addSelect('COUNT(*)', 'count')
        .groupBy('stool.color')
        .orderBy('count', 'DESC')
        .getRawMany(),
      
      this.stoolTestRepository
        .createQueryBuilder('stool')
        .select('stool.consistency', 'consistency')
        .addSelect('COUNT(*)', 'count')
        .groupBy('stool.consistency')
        .orderBy('count', 'DESC')
        .getRawMany(),
      
      this.stoolTestRepository
        .createQueryBuilder('stool')
        .where('stool.leukocytes != :normal', { normal: 'no se observa' })
        .orWhere('stool.erythrocytes != :normal', { normal: 'no se observa' })
        .orWhere('stool.parasites NOT LIKE :normalParasites', { normalParasites: '%NO SE OBSERVA%' })
        .getCount()
    ]);

    return {
      general: {
        totalTests,
        pendingTests,
        completedTests,
        reviewedTests,
        testsThisMonth,
        testsToday
      },
      distribution: {
        colorStats,
        consistencyStats
      },
      clinical: {
        abnormalFindings,
        abnormalPercentage: totalTests > 0 ? ((abnormalFindings / totalTests) * 100).toFixed(2) : 0
      }
    };
  }

  async generateMedicalReport(id: number) {
    const stoolTest = await this.findOne(id);
    if (!stoolTest) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }

    const patient = await this.patientRepository.findOne({
      where: { id: stoolTest.patientId }
    });

    return {
      patientInfo: {
        name: patient?.name || 'No especificado',
        sex: patient?.sex || 'No especificado',
        sampleNumber: stoolTest.sampleNumber,
        testDate: stoolTest.testDate
      },
      physicalExam: {
        color: stoolTest.color,
        consistency: stoolTest.consistency,
        shape: stoolTest.shape,
        mucus: stoolTest.mucus
      },
      microscopicExam: {
        leukocytes: stoolTest.leukocytes,
        erythrocytes: stoolTest.erythrocytes,
        parasites: stoolTest.parasites
      },
      observations: stoolTest.observations,
      status: stoolTest.status,
      createdAt: stoolTest.createdAt,
      updatedAt: stoolTest.updatedAt
    };
  }

  async searchByPatientName(patientName: string): Promise<StoolTest[]> {
    // Primero buscar pacientes que coincidan con el nombre
    const patients = await this.patientRepository.find({
      where: { name: Like(`%${patientName}%`) }
    });

    // Si encontramos pacientes, buscar sus exámenes
    if (patients.length > 0) {
      const patientIds = patients.map(p => p.id);
      return await this.stoolTestRepository.find({
        where: {
          patientId: In(patientIds)
        },
        order: { testDate: 'DESC' }
      });
    }

    return [];
  }



  async getTestsByDateRange(startDate: Date, endDate: Date): Promise<StoolTest[]> {
    return await this.stoolTestRepository
      .createQueryBuilder('stool')
      .where('stool.testDate >= :startDate', { startDate })
      .andWhere('stool.testDate <= :endDate', { endDate })
      .orderBy('stool.testDate', 'DESC')
      .getMany();
  }

  // ============================================================
  // SOFT-DELETE OPERATIONS
  // ============================================================

  async findAllActive(page: number = 1, limit: number = 10): Promise<PaginationResult<StoolTest>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.stoolTestRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { testDate: 'DESC' },
    });

    this.logger.log(`Retrieved ${data.length} active stool tests (Page ${page})`);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllIncludingInactive(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<StoolTest>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.stoolTestRepository.findAndCount({
      skip,
      take: limit,
      order: { testDate: 'DESC' },
    });

    this.logger.log(`Retrieved ${data.length} stool tests including inactive (Admin view, Page ${page})`);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findInactive(page: number = 1, limit: number = 10): Promise<PaginationResult<StoolTest>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.stoolTestRepository.findAndCount({
      where: { isActive: false },
      skip,
      take: limit,
      order: { testDate: 'DESC' },
    });

    this.logger.log(`Retrieved ${data.length} inactive stool tests (Audit view, Page ${page})`);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPatientActive(
    patientId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<StoolTest>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.stoolTestRepository.findAndCount({
      where: { patientId, isActive: true },
      skip,
      take: limit,
      order: { testDate: 'DESC' },
    });

    this.logger.log(`Retrieved ${data.length} active stool tests for patient ${patientId}`);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivate(id: number): Promise<StoolTest> {
    const stoolTest = await this.findOne(id);
    if (!stoolTest) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }

    if (!stoolTest.isActive) {
      throw new BadRequestException(
        `El examen coprológico con ID ${id} ya se encuentra inactivo`,
      );
    }

    stoolTest.isActive = false;
    const result = await this.stoolTestRepository.save(stoolTest);
    this.logger.log(`Stool test with ID ${id} deactivated (soft-delete)`);
    return result;
  }

  async reactivate(id: number): Promise<StoolTest> {
    const stoolTest = await this.stoolTestRepository.findOne({
      where: { id },
    });

    if (!stoolTest) {
      throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
    }

    if (stoolTest.isActive) {
      throw new BadRequestException(
        `El examen coprológico con ID ${id} ya se encuentra activo`,
      );
    }

    stoolTest.isActive = true;
    const result = await this.stoolTestRepository.save(stoolTest);
    this.logger.log(`Stool test with ID ${id} reactivated`);
    return result;
  }
}
