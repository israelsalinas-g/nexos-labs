import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { CreateDymindDh36ResultDto, TestParameter } from '../../dto/create-dymind-dh36-result.dto';
import { AssignPatientDto, UnassignedResultDto } from '../../dto/patient-assignment.dto';
import { Patient } from '../../entities/patient.entity';
import { PaginationResult } from '../../common/interfaces';

// interface SampleData {
//   sampleNumber: string;
//   testDate: string;
//   parameters: TestParameter[];
//   rawData: string;
// }

@Injectable()
export class DymindDh36ResultsService {
  private readonly logger = new Logger(DymindDh36ResultsService.name);

  constructor(
    @InjectRepository(DymindDh36Result)
    private dymindDh36ResultRepository: Repository<DymindDh36Result>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  // Métodos GET para el frontend
  async findAll(page: number = 1, limit: number = 4, patientName?: string): Promise<PaginationResult<DymindDh36Result>> {
    const offset = (page - 1) * limit;

    const query = this.dymindDh36ResultRepository.createQueryBuilder('dh36')
      .leftJoinAndSelect('dh36.patient', 'patient');

    // Aplicar filtro por nombre de paciente si se proporciona
    if (patientName && patientName.trim().length > 0) {
      query.where('dh36.patientNameDymind ILIKE :patientName', { 
        patientName: `%${patientName.trim()}%` 
      });
    }

    const [data, total] = await query
      .orderBy('dh36.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<DymindDh36Result | null> {
    return await this.dymindDh36ResultRepository
      .createQueryBuilder('dh36')
      .leftJoinAndSelect('dh36.patient', 'patient')
      .where('dh36.id = :id', { id })
      .getOne();
  }

  async findBySampleNumber(sampleNumber: string): Promise<DymindDh36Result[]> {
    return await this.dymindDh36ResultRepository
      .createQueryBuilder('dh36')
      .leftJoinAndSelect('dh36.patient', 'patient')
      .where('dh36.sampleNumber = :sampleNumber', { sampleNumber })
      .orderBy('dh36.createdAt', 'DESC')
      .getMany();
  }

  async findByPatientId(patientId: string): Promise<DymindDh36Result[]> {
    return await this.dymindDh36ResultRepository
      .createQueryBuilder('dh36')
      .leftJoinAndSelect('dh36.patient', 'patient')
      .where('dh36.patientId = :patientId', { patientId })
      .orderBy('dh36.createdAt', 'DESC')
      .getMany();
  }

  // Método principal para procesar datos del DH36
  async processHL7Data(rawData: string): Promise<DymindDh36Result[]> {
    console.log('\n🔄 PROCESANDO DATOS DEL DH36');
    console.log('📥 Datos recibidos:', rawData);
    
    const results: DymindDh36Result[] = [];
    
    try {
      // Limpieza inicial de los datos
      const cleanData = rawData
        .trim()
        .replace(/\r/g, '')
        .replace(/\|F+$/, '')  // Remover F's al final
        .replace(/\|F+\|/g, '|')  // Remover F's entre pipes
        .replace(/\|OBX\|/g, '\nOBX|')  // Asegurar que OBX esté en nueva línea
        .replace(/\|OBR\|/g, '\nOBR|')  // Asegurar que OBR esté en nueva línea
        .replace(/\n+/g, '\n')        // Normalizar saltos de línea
        .trim();

      console.log('🧹 Datos limpiados:');
      console.log(cleanData);
      
      // Separar por líneas y luego por muestras
      const lines = cleanData.split('\n').filter(line => line.trim());
      
      // Variables para almacenar temporalmente los datos del paciente
      let tempPatientData = {
        patientNameDymind: '',
        patientIdDymind: '',
        patientAgeDymind: 0,
        patientSexDymind: '',
        referenceGroupDymind: ''
      };

      let currentSample: {
        sampleNumber: string;
        testDate: string;
        parameters: TestParameter[];
        rawData: string;
        patientIdDymind?: string;
        patientNameDymind?: string;
        patientAgeDymind?: number;
        patientSexDymind?: string;
        referenceGroupDymind?: string;
      } | null = null;
      
      for (const line of lines) {
        console.log('\n📝 Procesando línea:', line);
        
        if (line.startsWith('PID|') || line.includes('PID|')) {
          console.log('🔍 Procesando PID:', line);
          // Extraer solo la parte del PID de la línea
          const pidMatch = line.match(/PID\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/);
          if (pidMatch) {
            const fullName = pidMatch[5]; // Campo 5 del PID
            const patientSex = pidMatch[8]; // Campo 8 del PID
            
            if (fullName && fullName.includes('^')) {
              const [lastName, firstName] = fullName.split('^').map(part => part.trim());
              tempPatientData.patientNameDymind = `${firstName} ${lastName}`.trim();
              tempPatientData.patientIdDymind = tempPatientData.patientNameDymind.replace(/\s+/g, '').toLowerCase();
            }
            
            if (patientSex) {
              tempPatientData.patientSexDymind = patientSex.trim();
            }
            
            console.log('👤 Datos del paciente extraídos del PID:');
            console.log(`- Nombre completo: ${tempPatientData.patientNameDymind}`);
            console.log(`- Sexo: ${tempPatientData.patientSexDymind}`);
            console.log(`- ID generado: ${tempPatientData.patientIdDymind}`);
          }
        } else if (line.startsWith('OBR|')) {
          // Si ya tenemos una muestra, guardarla antes de empezar una nueva
          if (currentSample && currentSample.parameters.length > 0) {
            try {
              console.log('💾 Guardando muestra anterior...');
              const savedResult = await this.saveSample(currentSample);
              if (savedResult && savedResult.id) {
                console.log('✅ Muestra guardada correctamente con ID:', savedResult.id);
                results.push(savedResult);
              } else {
                console.error('❌ Error: La muestra no se guardó correctamente');
                throw new Error('Failed to save sample');
              }
            } catch (error) {
              console.error('❌ Error guardando muestra:', error.message);
              throw error;
            }
          }
          
          // Iniciar nueva muestra
          const obrMatch = line.match(/OBR\|[^|]*\|[^|]*\|([^|]*)\|[^|]*\|[^|]*\|([^|]*)/);
          if (obrMatch) {
            const sampleNumber = obrMatch[1].trim() || `AUTO_${Date.now()}`;
            const testDate = obrMatch[2] ? this.parseHL7Date(obrMatch[2]) : new Date().toISOString();
            
            console.log('📊 Datos OBR extraídos:');
            console.log('- Número de muestra:', sampleNumber);
            console.log('- Fecha:', testDate);
            
            currentSample = {
              sampleNumber: sampleNumber,
              testDate: testDate,
              parameters: [],
              rawData: line,  // Solo guardamos la línea OBR como rawData
              patientIdDymind: tempPatientData.patientIdDymind,
              patientNameDymind: tempPatientData.patientNameDymind,
              patientAgeDymind: tempPatientData.patientAgeDymind,
              patientSexDymind: tempPatientData.patientSexDymind,
              referenceGroupDymind: tempPatientData.referenceGroupDymind
            };
            console.log('🆕 Nueva muestra iniciada:', currentSample.sampleNumber);
          }
        }
        
        else if (line.startsWith('OBX|') && currentSample) {
          // Procesar todos los segmentos OBX que tengan valores
          const obxMatch = line.match(/OBX\|[^|]*\|([^|]*)\|([^|^]*)\^([^|^]*)\^?([^|]*)\|[^|]*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/);
          
          if (obxMatch) {
            const valueType = obxMatch[1];  // NM, IS, etc.
            const codeAndName = `${obxMatch[2]}^${obxMatch[3]}^${obxMatch[4]}`.trim();
            let result = obxMatch[5] || '';
            const unit = obxMatch[6] || '';
            const referenceRange = obxMatch[7] || '';
            const flags = obxMatch[8] || '';
            
            // Procesar campos especiales
            if (codeAndName.includes('Ref Group')) {
              tempPatientData.referenceGroupDymind = result;
              if (currentSample) {
                currentSample.referenceGroupDymind = result;
              }
              console.log('👥 Grupo de referencia:', result);
              continue;
            }
            
            if (codeAndName.includes('Age')) {
              tempPatientData.patientAgeDymind = parseInt(result);
              if (currentSample) {
                currentSample.patientAgeDymind = parseInt(result);
              }
              console.log('👤 Edad del paciente:', result, unit);
              continue;
            }
            
            // Si es un resultado numérico, procesar correctamente
            if (valueType === 'NM' && result) {
              result = result.replace(',', '.');
            }
            
            if (result && result.trim()) {
              console.log('📊 Datos OBX extraídos:');
              console.log(`- Tipo: ${valueType}`);
              console.log(`- Código/Nombre: ${codeAndName}`);
              console.log(`- Resultado: ${result}`);
              console.log(`- Unidad: ${unit}`);
              console.log(`- Rango: ${referenceRange}`);
              console.log(`- Estado: ${flags}`);
              
              // Solo guardar si es un resultado válido
              if (codeAndName.includes('^') && !codeAndName.includes('Take Mode') && 
                  !codeAndName.includes('Blood Mode') && !codeAndName.includes('Test Mode') &&
                  !codeAndName.includes('Remark') && !codeAndName.includes('Ref Group')) {
                currentSample.parameters.push({
                  name: codeAndName,
                  result: result,
                  unit: unit,
                  referenceRange: referenceRange,
                  status: flags
                });
              }
            }
          }
        }
      }
      
      // Guardar la última muestra después de procesar todas las líneas
      if (currentSample && currentSample.parameters.length > 0) {
        try {
          console.log('💾 Guardando última muestra...');
          const savedResult = await this.saveSample(currentSample);
          if (savedResult && savedResult.id) {
            console.log('✅ Última muestra guardada correctamente con ID:', savedResult.id);
            results.push(savedResult);
          } else {
            console.error('❌ Error: La última muestra no se guardó correctamente');
            throw new Error('Failed to save last sample');
          }
        } catch (error) {
          console.error('❌ Error guardando última muestra:', error.message);
          throw error;
        }
      }

      // Guardar la última muestra después de procesar todas las líneas
      if (currentSample && currentSample.parameters.length > 0) {
        try {
          console.log('💾 Guardando última muestra del proceso...');
          const savedResult = await this.saveSample(currentSample);
          if (savedResult && savedResult.id) {
            console.log('✅ Última muestra guardada correctamente con ID:', savedResult.id);
            results.push(savedResult);
          } else {
            console.error('❌ Error: La última muestra no se guardó correctamente');
            throw new Error('Failed to save last sample');
          }
        } catch (error) {
          console.error('❌ Error guardando última muestra:', error.message);
          throw error;
        }
      }
      
      const totalParams = results.reduce((total, sample) => total + (sample.parameters?.length || 0), 0);
      console.log('\n📊 RESUMEN DEL PROCESAMIENTO:');
      console.log(`✅ Muestras procesadas: ${results.length}`);
      console.log(`✅ Parámetros totales: ${totalParams}`);
      console.log(`✅ Promedio de parámetros por muestra: ${totalParams / results.length || 0}`);
      return results;
      
    } catch (error) {
      console.error('❌ Error procesando datos:', error.message);
      throw error;
    }
  }

  // Guardar una muestra completa con todos sus parámetros
  private async saveSample(sampleData: {
    sampleNumber: string;
    testDate: string;
    parameters: TestParameter[];
    rawData: string;
    patientIdDymind?: string;
    patientNameDymind?: string;
    patientAgeDymind?: number;
    patientSexDymind?: string;
    referenceGroupDymind?: string;
  }): Promise<DymindDh36Result> {
    const createDto = new CreateDymindDh36ResultDto();
    createDto.sampleNumber = sampleData.sampleNumber;
    createDto.testDate = sampleData.testDate;
    createDto.analysisMode = 'Automated Count';
    createDto.instrumentId = 'DYMIND_DH36';
    createDto.rawData = sampleData.rawData;
    createDto.parameters = sampleData.parameters;
    createDto.patientIdDymind = sampleData.patientIdDymind;
    createDto.patientNameDymind = sampleData.patientNameDymind;
    createDto.patientAgeDymind = sampleData.patientAgeDymind;
    createDto.patientSexDymind = sampleData.patientSexDymind;
    createDto.referenceGroupDymind = sampleData.referenceGroupDymind;
    
    console.log(`💾 Guardando muestra ${sampleData.sampleNumber} con ${sampleData.parameters.length} parámetros`);
    
    return await this.saveResult(createDto);
  }

  // Guardar resultado en la base de datos
  private async saveResult(createDto: CreateDymindDh36ResultDto): Promise<DymindDh36Result> {
    try {
      if (!createDto.sampleNumber) {
        throw new Error('El número de muestra es requerido');
      }

      if (!createDto.parameters || createDto.parameters.length === 0) {
        throw new Error('Se requiere al menos un parámetro para guardar');
      }

      console.log('\n💾 GUARDANDO EN BASE DE DATOS');
      console.log('📝 Datos a guardar:');
      console.log(`- Muestra: ${createDto.sampleNumber}`);
      console.log(`- Fecha: ${createDto.testDate}`);
      console.log(`- Modo: ${createDto.analysisMode}`);
      console.log(`- Equipo: ${createDto.instrumentId}`);
      console.log('- Datos del paciente:');
      console.log(`  * Nombre: ${createDto.patientNameDymind || 'No disponible'}`);
      console.log(`  * ID: ${createDto.patientIdDymind || 'No disponible'}`);
      console.log(`  * Edad: ${createDto.patientAgeDymind || 'No disponible'}`);
      console.log(`  * Sexo: ${createDto.patientSexDymind || 'No disponible'}`);
      console.log(`  * Grupo: ${createDto.referenceGroupDymind || 'No disponible'}`); 
      console.log('- Parámetros:');
      createDto.parameters.forEach((param, index) => {
        console.log(`  ${index + 1}. ${param.name}: ${param.result} ${param.unit || ''}`);
      });
      
      // Verificar si ya existe
      const existing = await this.dymindDh36ResultRepository.findOne({
        where: { sampleNumber: createDto.sampleNumber }
      });
      
      let result: DymindDh36Result;
      
      if (existing) {
        console.log('📝 Actualizando muestra existente:', createDto.sampleNumber);
        Object.assign(existing, {
          ...createDto,
          testDate: createDto.testDate ? new Date(createDto.testDate) : new Date(),
          processingStatus: 'processed',
          updatedAt: new Date()
        });
        result = await this.dymindDh36ResultRepository.save(existing);
      } else {
        console.log('🆕 Creando nueva muestra:', createDto.sampleNumber);
        const labResult = this.dymindDh36ResultRepository.create({
          sampleNumber: createDto.sampleNumber,
          testDate: createDto.testDate ? new Date(createDto.testDate) : new Date(),
          analysisMode: createDto.analysisMode,
          instrumentId: createDto.instrumentId,
          rawData: createDto.rawData,
          processingStatus: 'processed',
          parameters: createDto.parameters,
          patientIdDymind: createDto.patientIdDymind,
          patientNameDymind: createDto.patientNameDymind,
          patientAgeDymind: createDto.patientAgeDymind,
          patientSexDymind: createDto.patientSexDymind,
          referenceGroupDymind: createDto.referenceGroupDymind,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        result = await this.dymindDh36ResultRepository.save(labResult);
      }
      
      if (!result || !result.id) {
        throw new Error('Failed to save to database');
      }
      
      console.log('✅ Guardado exitoso:');
      console.log(`- ID: ${result.id}`);
      console.log(`- Muestra: ${result.sampleNumber}`);
      console.log(`- Parámetros: ${result.parameters?.length || 0}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error guardando en BD:', error.message);
      throw error;
    }
  }

  // Convertir fecha HL7 a ISO
  private parseHL7Date(dateStr: string): string {
    if (!dateStr || dateStr.length < 8) {
      return new Date().toISOString();
    }
    
    try {
      // Formato: YYYYMMDDHHMMSS
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10) || '00';
      const minute = dateStr.substring(10, 12) || '00';
      const second = dateStr.substring(12, 14) || '00';
      
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).toISOString();
    } catch (error) {
      console.error('Error parseando fecha:', error);
      return new Date().toISOString();
    }
  }

  // Método para actualizar un resultado de laboratorio
  async update(id: string, updateData: any): Promise<DymindDh36Result | null> {
    this.logger.log(`Actualizando resultado de laboratorio ID: ${id}`);
    
    try {
      // Verificar si existe el registro
      const existingResult = await this.dymindDh36ResultRepository.findOne({ where: { id } });
      if (!existingResult) {
        this.logger.warn(`Resultado de laboratorio con ID ${id} no encontrado`);
        return null;
      }

      // Preparar datos para actualización, manejando conversiones de tipos
      const dataToUpdate: Partial<DymindDh36Result> = {};
      
      // Copiar campos simples
      if (updateData.patientId !== undefined) dataToUpdate.patientId = updateData.patientId;
      if (updateData.patientName !== undefined) dataToUpdate.patientNameDymind = updateData.patientName;
      if (updateData.patientAge !== undefined) dataToUpdate.patientAgeDymind = updateData.patientAge;
      if (updateData.patientSex !== undefined) dataToUpdate.patientSexDymind = updateData.patientSex;
      if (updateData.referenceGroup !== undefined) dataToUpdate.referenceGroupDymind = updateData.referenceGroup;
      if (updateData.sampleNumber !== undefined) dataToUpdate.sampleNumber = updateData.sampleNumber;
      if (updateData.analysisMode !== undefined) dataToUpdate.analysisMode = updateData.analysisMode;
      if (updateData.parameters !== undefined) dataToUpdate.parameters = updateData.parameters;
      if (updateData.instrumentId !== undefined) dataToUpdate.instrumentId = updateData.instrumentId;
      if (updateData.rawData !== undefined) dataToUpdate.rawData = updateData.rawData;
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

      // Actualizar solo los campos proporcionados
      const updateResult = await this.dymindDh36ResultRepository.update(id, dataToUpdate);
      
      if (updateResult.affected === 0) {
        this.logger.warn(`No se pudo actualizar el resultado de laboratorio ID: ${id}`);
        return null;
      }

      // Obtener el registro actualizado
      const updatedResult = await this.dymindDh36ResultRepository.findOne({ where: { id } });
      this.logger.log(`Resultado de laboratorio ID: ${id} actualizado exitosamente`);
      
      return updatedResult;
    } catch (error) {
      this.logger.error(`Error actualizando resultado de laboratorio ID: ${id}`, error);
      throw new Error(`Error actualizando resultado: ${error.message}`);
    }
  }

  // Convertir flags HL7 a estado
  private parseStatus(flags: string): string {
    if (!flags) return 'Normal';
    
    // Procesar flags que pueden venir separados por ~
    const flagParts = flags.split('~');
    
    // Si tiene H y A es un valor alto anormal
    if (flagParts.includes('H') && flagParts.includes('A')) return 'High';
    // Si tiene L y A es un valor bajo anormal
    if (flagParts.includes('L') && flagParts.includes('A')) return 'Low';
    // Si tiene solo H es alto
    if (flagParts.includes('H')) return 'High';
    // Si tiene solo L es bajo
    if (flagParts.includes('L')) return 'Low';
    // Si tiene N o no tiene flags especiales es normal
    if (flagParts.includes('N') || flagParts.includes('')) return 'Normal';
    
    return 'Normal';
  }

  // ===== MÉTODOS DE ASIGNACIÓN DE PACIENTES =====

  /**
   * Obtener resultados de laboratorio sin paciente asignado
   */
  async getUnassignedResults(limit: number = 50, offset: number = 0): Promise<UnassignedResultDto[]> {
    const results = await this.dymindDh36ResultRepository.find({
      where: { 
        assignmentStatus: 'unassigned'
      },
      take: limit,
      skip: offset,
      order: { testDate: 'DESC' },
    });

    return results.map(result => ({
      id: result.id.toString(),
      patientName: result.patientNameDymind || 'N/A',
      testDate: result.testDate,
      testName: this.getMainTestName(result.parameters),
      sampleNumber: result.sampleNumber,
      testType: 'DH36' as const,
      result: this.getMainTestResult(result.parameters),
      patientAge: result.patientAgeDymind,
      patientSex: result.patientSexDymind
    }));
  }

  /**
   * Asignar un paciente a un resultado de laboratorio
   */
  async assignPatient(id: string, assignPatientDto: AssignPatientDto): Promise<DymindDh36Result> {
    // Verificar que el resultado existe
    const labResult = await this.dymindDh36ResultRepository.findOne({ where: { id } });
    if (!labResult) {
      throw new NotFoundException(`Resultado de laboratorio con ID ${id} no encontrado`);
    }

    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({ 
      where: { id: assignPatientDto.patientId } 
    });
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${assignPatientDto.patientId} no encontrado`);
    }

    // Actualizar el resultado con la asignación
    labResult.patientId = assignPatientDto.patientId;
    labResult.assignmentStatus = 'assigned';
    labResult.assignedAt = new Date();
    labResult.assignmentNotes = assignPatientDto.notes || null;
    // TODO: Agregar usuario actual cuando se implemente autenticación
    // labResult.assignedBy = currentUser.username;

    return await this.dymindDh36ResultRepository.save(labResult);
  }

  /**
   * Obtener resultados por estado de asignación
   */
  async getResultsByAssignmentStatus(
    status: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<DymindDh36Result[]> {
    return await this.dymindDh36ResultRepository.find({
      where: { assignmentStatus: status },
      take: limit,
      skip: offset,
      order: { testDate: 'DESC' },
    });
  }

  /**
   * Buscar resultados por nombre de paciente
   */
  async searchByPatientName(name: string): Promise<DymindDh36Result[]> {
    return await this.dymindDh36ResultRepository.find({
      where: { 
        patientNameDymind: Like(`%${name}%`) 
      },
      order: { testDate: 'DESC' },
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtener el nombre del test principal de los parámetros
   */
  private getMainTestName(parameters: TestParameter[]): string {
    if (!parameters || parameters.length === 0) return 'Hemograma Completo';
    
    // Si hay parámetros, mostrar el tipo de análisis
    const hasWBC = parameters.some(p => p.name?.toLowerCase().includes('wbc'));
    const hasRBC = parameters.some(p => p.name?.toLowerCase().includes('rbc'));
    
    if (hasWBC && hasRBC) return 'Hemograma Completo';
    if (hasWBC) return 'Conteo de Glóbulos Blancos';
    if (hasRBC) return 'Conteo de Glóbulos Rojos';
    
    return 'Análisis DH36';
  }

  /**
   * Obtener un resumen del resultado principal
   */
  private getMainTestResult(parameters: TestParameter[]): string | null {
    if (!parameters || parameters.length === 0) return null;
    
    // Buscar el parámetro más relevante para mostrar
    const wbc = parameters.find(p => p.name?.toLowerCase().includes('wbc'));
    if (wbc) return `WBC: ${wbc.result} ${wbc.unit}`;
    
    const rbc = parameters.find(p => p.name?.toLowerCase().includes('rbc'));
    if (rbc) return `RBC: ${rbc.result} ${rbc.unit}`;
    
    // Si no encuentra parámetros específicos, mostrar el primero
    const first = parameters[0];
    return `${first.name}: ${first.result} ${first.unit}`;
  }
}
