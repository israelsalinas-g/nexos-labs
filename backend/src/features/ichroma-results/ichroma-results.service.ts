import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { CreateIChromaResultDto } from '../../dto/create-ichroma-result.dto';
import { AssignPatientDto, UnassignedResultDto } from '../../dto/patient-assignment.dto';
import { Patient } from '../../entities/patient.entity';
import { PaginationResult } from '../../common/interfaces';

@Injectable()
export class IChromaResultsService {
  private readonly logger = new Logger(IChromaResultsService.name);

  constructor(
    @InjectRepository(IChromaResult)
    private ichromaResultRepository: Repository<IChromaResult>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  // Métodos GET para el frontend
  async findAll(limit: number = 4, offset: number = 0, patientName?: string): Promise<PaginationResult<IChromaResult>> {
    const query = this.ichromaResultRepository.createQueryBuilder('ichroma')
      .leftJoinAndSelect('ichroma.patient', 'patient');

    // Aplicar filtro por nombre de paciente si se proporciona
    if (patientName && patientName.trim().length > 0) {
      query.where('ichroma.patientNameIchroma2 ILIKE :patientName', { 
        patientName: `%${patientName.trim()}%` 
      });
    }

    const [data, total] = await query
      .orderBy('ichroma.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<IChromaResult | null> {
    return await this.ichromaResultRepository
      .createQueryBuilder('ichroma')
      .leftJoinAndSelect('ichroma.patient', 'patient')
      .where('ichroma.id = :id', { id })
      .getOne();
  }

  async findByPatientId(patientId: string): Promise<IChromaResult[]> {
    return await this.ichromaResultRepository
      .createQueryBuilder('ichroma')
      .leftJoinAndSelect('ichroma.patient', 'patient')
      .where('ichroma.patientId = :patientId', { patientId })
      .orderBy('ichroma.createdAt', 'DESC')
      .getMany();
  }

  async findByTestType(testType: string): Promise<IChromaResult[]> {
    return await this.ichromaResultRepository.find({
      where: { testType },
      order: { createdAt: 'DESC' },
    });
  }

  // Método principal para procesar datos del iChroma II
  async processIChromaData(rawData: any): Promise<IChromaResult> {
    console.log('\n🔄 PROCESANDO DATOS DEL ICHROMA II');
    console.log('📥 Datos recibidos:', JSON.stringify(rawData, null, 2));
    
    try {
      // Extraer datos del paciente del rawMessage HL7
      const patientData = this.extractPatientDataFromHL7(rawData.rawMessage || '');
      
      // Extraer nombre del test del rawMessage HL7
      const testName = this.extractTestNameFromHL7(rawData.rawMessage || '');
      
      // Preparar el objeto para guardar
      const ichromaResult = new IChromaResult();
      
      // Datos básicos del dispositivo
      ichromaResult.messageType = rawData.messageType || 'MSH';
      ichromaResult.deviceId = rawData.deviceId || '^~\\&';
      ichromaResult.instrumentId = 'ICHROMA_II';
      
      // Datos del paciente (priorizar datos extraídos del HL7)
      ichromaResult.patientIdIchroma2 = rawData.patientIdIchroma2 || rawData.patientId || '';
      ichromaResult.patientNameIchroma2 = patientData.patientName || rawData.patientNameIchroma2 || rawData.patientName || '';
      ichromaResult.patientAgeIchroma2 = patientData.patientAge || rawData.patientAgeIchroma2 || null;
      ichromaResult.patientSexIchroma2 = patientData.patientSex || rawData.patientSexIchroma2 || '';
      ichromaResult.patientId = rawData.patientId || null; // This is the FK to Patient table
      
      // Datos del test
      ichromaResult.testType = rawData.testType || '';
      ichromaResult.testName = testName || '';
      
      // Resultado y valores de referencia
      ichromaResult.result = this.formatResult(rawData.result);
      ichromaResult.unit = rawData.unit || '';
      ichromaResult.referenceMin = rawData.referenceMin;
      ichromaResult.referenceMax = rawData.referenceMax;
      
      // Información del cartucho
      ichromaResult.cartridgeSerial = rawData.cartridgeSerial || '';
      ichromaResult.cartridgeLot = this.cleanCartridgeLot(rawData.cartridgeLot || '');
      ichromaResult.humidity = rawData.humidity;
      ichromaResult.sampleBarcode = rawData.sampleBarcode || '';
      
      // Fechas y datos adicionales
      ichromaResult.testDate = new Date(rawData.testDate);
      ichromaResult.rawMessage = rawData.rawMessage || '';
      ichromaResult.rawData = rawData;
      ichromaResult.processingStatus = 'processed';
      
      // Guardar en la base de datos
      const savedResult = await this.ichromaResultRepository.save(ichromaResult);
      
      this.logger.log(`✅ Resultado iChroma guardado exitosamente - ID: ${savedResult.id}, Test: ${savedResult.testName}, Resultado: ${savedResult.result} ${savedResult.unit}`);
      
      return savedResult;
      
    } catch (error) {
      this.logger.error('❌ Error procesando datos iChroma:', error);
      throw new Error(`Error procesando datos iChroma: ${error.message}`);
    }
  }

  // Método para actualizar un resultado iChroma
  async update(id: string, updateData: any): Promise<IChromaResult | null> {
    this.logger.log(`Actualizando resultado iChroma ID: ${id}`);
    
    try {
      const existingResult = await this.ichromaResultRepository.findOne({ where: { id } });
      if (!existingResult) {
        this.logger.warn(`Resultado iChroma con ID ${id} no encontrado`);
        return null;
      }

      // Preparar datos para actualización
      const dataToUpdate: Partial<IChromaResult> = {};
      
      // Copiar campos que pueden ser actualizados
      if (updateData.patientId !== undefined) dataToUpdate.patientId = updateData.patientId;
      if (updateData.patientNameIchroma2 !== undefined) dataToUpdate.patientNameIchroma2 = updateData.patientNameIchroma2;
      if (updateData.patientAgeIchroma2 !== undefined) dataToUpdate.patientAgeIchroma2 = updateData.patientAgeIchroma2;
      if (updateData.patientSexIchroma2 !== undefined) dataToUpdate.patientSexIchroma2 = updateData.patientSexIchroma2;
      if (updateData.testType !== undefined) dataToUpdate.testType = updateData.testType;
      if (updateData.testName !== undefined) dataToUpdate.testName = updateData.testName;
      if (updateData.result !== undefined) dataToUpdate.result = updateData.result;
      if (updateData.unit !== undefined) dataToUpdate.unit = updateData.unit;
      if (updateData.referenceMin !== undefined) dataToUpdate.referenceMin = updateData.referenceMin;
      if (updateData.referenceMax !== undefined) dataToUpdate.referenceMax = updateData.referenceMax;
      if (updateData.processingStatus !== undefined) dataToUpdate.processingStatus = updateData.processingStatus;
      if (updateData.technicalNotes !== undefined) dataToUpdate.technicalNotes = updateData.technicalNotes;
      
      // Manejar conversión de fecha si se proporciona
      if (updateData.testDate !== undefined) {
        if (typeof updateData.testDate === 'string') {
          dataToUpdate.testDate = new Date(updateData.testDate);
        } else if (updateData.testDate instanceof Date) {
          dataToUpdate.testDate = updateData.testDate;
        }
      }

      const updateResult = await this.ichromaResultRepository.update(id, dataToUpdate);
      
      if (updateResult.affected === 0) {
        this.logger.warn(`No se pudo actualizar el resultado iChroma ID: ${id}`);
        return null;
      }

      const updatedResult = await this.ichromaResultRepository.findOne({ where: { id } });
      this.logger.log(`Resultado iChroma ID: ${id} actualizado exitosamente`);
      
      return updatedResult;
    } catch (error) {
      this.logger.error(`Error actualizando resultado iChroma ID: ${id}`, error);
      throw new Error(`Error actualizando resultado iChroma: ${error.message}`);
    }
  }

  // Extraer datos del paciente del mensaje HL7
  private extractPatientDataFromHL7(rawMessage: string): { patientName: string; patientAge: number | null; patientSex: string } {
    try {
      // Buscar segmento PID en el mensaje HL7
      const pidMatch = rawMessage.match(/PID\|\|([^|]*)\|\|\|\|\|([^|]*)\|([^|]*)/);
      
      if (pidMatch) {
        const patientName = pidMatch[1] || '';
        const age = parseInt(pidMatch[2]);
        const patientAge = isNaN(age) ? null : age;
        const patientSex = pidMatch[3] || '';
        
        console.log('👤 Datos del paciente extraídos del HL7:', { patientName, patientAge, patientSex });
        
        return {
          patientName: patientName.trim(),
          patientAge: patientAge,
          patientSex: patientSex.trim()
        };
      }
    } catch (error) {
      console.error('Error extrayendo datos del paciente del HL7:', error);
    }
    
    return {
      patientName: '',
      patientAge: null,
      patientSex: ''
    };
  }

  // Extraer nombre del test del mensaje HL7
  private extractTestNameFromHL7(rawMessage: string): string {
    try {
      // Buscar segmento OBX que contiene el nombre del test
      const obxMatch = rawMessage.match(/OBX\|[^|]*\|TX\|([^|]*)\|\|/);
      
      if (obxMatch) {
        const testName = obxMatch[1] || '';
        console.log('🧪 Nombre del test extraído del HL7:', testName);
        return testName.trim();
      }
    } catch (error) {
      console.error('Error extrayendo nombre del test del HL7:', error);
    }
    
    return '';
  }

  // Formatear el resultado
  private formatResult(result: any): string {
    if (result === null || result === undefined) {
      return '';
    }
    
    // Si es un número muy grande, podría ser una fecha/hora, convertirla
    if (typeof result === 'number' && result > 10000000000) {
      // Parece ser un timestamp, no lo usamos como resultado
      return '';
    }
    
    return result.toString();
  }

  // Limpiar el lote del cartucho
  private cleanCartridgeLot(cartridgeLot: string): string {
    if (!cartridgeLot) return '';
    
    // Remover caracteres de control como \r
    return cartridgeLot.replace(/\r.*/, '').trim();
  }

  // Buscar por rango de fechas
  async findByDateRange(startDate: Date, endDate: Date): Promise<IChromaResult[]> {
    return await this.ichromaResultRepository.find({
      where: {
        testDate: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: { testDate: 'DESC' },
    });
  }

  // Estadísticas básicas
  async getStats(): Promise<{
    total: number;
    byTestType: Array<{ testType: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    const total = await this.ichromaResultRepository.count();
    
    const byTestType = await this.ichromaResultRepository
      .createQueryBuilder('result')
      .select('result.testType', 'testType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('result.testType')
      .getRawMany();
    
    const byStatus = await this.ichromaResultRepository
      .createQueryBuilder('result')
      .select('result.processingStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('result.processingStatus')
      .getRawMany();
    
    return {
      total,
      byTestType: byTestType.map(item => ({
        testType: item.testType || 'Sin tipo',
        count: parseInt(item.count)
      })),
      byStatus: byStatus.map(item => ({
        status: item.status || 'Sin estado',
        count: parseInt(item.count)
      }))
    };
  }

  // ===== MÉTODOS DE ASIGNACIÓN DE PACIENTES =====

  /**
   * Obtener resultados de iChroma sin paciente asignado
   */
  async getUnassignedResults(limit: number = 4, offset: number = 0): Promise<UnassignedResultDto[]> {
    const results = await this.ichromaResultRepository.find({
      where: { 
        assignmentStatus: 'unassigned'
      },
      take: limit,
      skip: offset,
      order: { testDate: 'DESC' },
    });

    return results.map(result => ({
      id: result.id.toString(),
      patientName: result.patientNameIchroma2 || 'N/A',
      testDate: result.testDate,
      testName: result.testName || 'iChroma Test',
      sampleNumber: result.sampleBarcode || null,
      testType: 'ICHROMA' as const,
      result: result.result ? `${result.result} ${result.unit || ''}`.trim() : null,
      patientAge: result.patientAgeIchroma2,
      patientSex: this.normalizeGender(result.patientSexIchroma2)
    }));
  }

  /**
   * Asignar un paciente a un resultado de iChroma
   */
  async assignPatient(id: string, assignPatientDto: AssignPatientDto): Promise<IChromaResult> {
    // Verificar que el resultado existe
    const ichromaResult = await this.ichromaResultRepository.findOne({ where: { id } });
    if (!ichromaResult) {
      throw new NotFoundException(`Resultado de iChroma con ID ${id} no encontrado`);
    }

    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({ 
      where: { id: assignPatientDto.patientId } 
    });
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${assignPatientDto.patientId} no encontrado`);
    }

    // Actualizar el resultado con la asignación
    ichromaResult.patientId = assignPatientDto.patientId;
    ichromaResult.assignmentStatus = 'assigned';
    ichromaResult.assignedAt = new Date();
    ichromaResult.assignmentNotes = assignPatientDto.notes || null;
    // TODO: Agregar usuario actual cuando se implemente autenticación
    // ichromaResult.assignedBy = currentUser.username;

    return await this.ichromaResultRepository.save(ichromaResult);
  }

  /**
   * Obtener resultados por estado de asignación
   */
  async getResultsByAssignmentStatus(
    status: string, 
    limit: number = 4, 
    offset: number = 0
  ): Promise<IChromaResult[]> {
    return await this.ichromaResultRepository.find({
      where: { assignmentStatus: status },
      take: limit,
      skip: offset,
      order: { testDate: 'DESC' },
    });
  }

  /**
   * Buscar resultados por nombre de paciente
   */
  async searchByPatientName(name: string): Promise<IChromaResult[]> {
    return await this.ichromaResultRepository.find({
      where: { 
        patientNameIchroma2: Like(`%${name}%`) 
      },
      order: { testDate: 'DESC' },
    });
  }

  /**
   * Buscar resultado por número de muestra
   */
  async findBySampleId(sampleId: string): Promise<IChromaResult | null> {
    return await this.ichromaResultRepository.findOne({
      where: { 
        sampleBarcode: sampleId 
      }
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Normalizar valores de género
   */
  private normalizeGender(gender: string): string | null {
    if (!gender) return null;
    
    const lowerGender = gender.toLowerCase();
    if (lowerGender.includes('fem') || lowerGender === 'f') return 'femenino';
    if (lowerGender.includes('mas') || lowerGender === 'm') return 'masculino';

    return gender;
  }
}