import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { UrineTest } from '../../entities/urine-test.entity';
import { ExamSummaryDto, PatientWithExamsHistoryDto, PatientBasicInfoDto } from '../../dto/patient-assignment.dto';
import { StoolTest } from '../../entities/stool-test.entity';

@Injectable()
export class PatientHistoryService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(DymindDh36Result)
    private dymindDh36ResultRepository: Repository<DymindDh36Result>,
    @InjectRepository(IChromaResult)
    private iChromaResultRepository: Repository<IChromaResult>,
    @InjectRepository(UrineTest)
    private urineTestRepository: Repository<UrineTest>,
    @InjectRepository(StoolTest)
    private stoolTestRepository: Repository<StoolTest>,
  ) {}

  /**
   * Obtener información del paciente con historial de exámenes
   * Retorna los datos del paciente + array de exámenes ordenados por fecha
   */
  async getPatientWithExamsHistory(patientId: string): Promise<PatientWithExamsHistoryDto> {
    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({ 
      where: { id: patientId } 
    });
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${patientId} no encontrado`);
    }

    // Obtener exámenes de las cuatro tablas en paralelo
    const [dhResults, iChromaResults, urineResults, stoolResults] = await Promise.all([
      this.getDymindDh36Summary(patientId),
      this.getIChromaSummary(patientId),
      this.getUrineSummary(patientId),
      this.getStoolSummary(patientId)
    ]);

    // Combinar y ordenar por fecha descendente (más recientes primero)
    const combinedExams = [
      ...dhResults,
      ...iChromaResults,
      ...urineResults,
      ...stoolResults
    ].sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    // Construir respuesta con información del paciente + exámenes
    const patientInfo: PatientBasicInfoDto = {
      id: patient.id,
      name: patient.name,
      sex: patient.sex,
      phone: patient.phone,
      birthDate: patient.birthDate
    };

    return {
      patient: patientInfo,
      exams: combinedExams
    };
  }

  /**
   * Obtener solo el array de exámenes (para compatibilidad interna)
   * @deprecated Usar getPatientWithExamsHistory() en su lugar
   */
  async getPatientExamsSummary(patientId: string): Promise<ExamSummaryDto[]> {
    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({ 
      where: { id: patientId } 
    });
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${patientId} no encontrado`);
    }

    // Obtener exámenes de las cuatro tablas en paralelo
    const [dhResults, iChromaResults, urineResults, stoolResults] = await Promise.all([
      this.getDymindDh36Summary(patientId),
      this.getIChromaSummary(patientId),
      this.getUrineSummary(patientId),
      this.getStoolSummary(patientId)
    ]);

    // Combinar y ordenar por fecha descendente (más recientes primero)
    const combinedResults = [
      ...dhResults,
      ...iChromaResults,
      ...urineResults,
      ...stoolResults
    ].sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    return combinedResults;
  }

  // ===== MÉTODOS PRIVADOS =====

  private async getDymindDh36Summary(patientId: string): Promise<ExamSummaryDto[]> {
    const results = await this.dymindDh36ResultRepository.find({
      where: { patientId },
      order: { testDate: 'DESC' }
    });

    return results.map(result => ({
      id: result.id.toString(),
      patientId: result.patientId,
      testDate: result.testDate,
      testType: 'DH36' as const,
      testName: 'Hemograma Completo',
      sampleNumber: result.sampleNumber,
      status: result.processingStatus || 'processed',
      sourceTable: 'dymind_dh36_results' as const
    }));
  }

  private async getIChromaSummary(patientId: string): Promise<ExamSummaryDto[]> {
    const results = await this.iChromaResultRepository.find({
      where: { patientId },
      order: { testDate: 'DESC' }
    });

    return results.map(result => ({
      id: result.id.toString(),
      patientId: result.patientId,
      testDate: result.testDate,
      testType: 'ICHROMA' as const,
      testName: result.testName || 'Prueba Especial iChroma',
      sampleNumber: result.sampleBarcode,
      status: result.processingStatus || 'processed',
      sourceTable: 'ichroma_results' as const
    }));
  }

  private async getUrineSummary(patientId: string): Promise<ExamSummaryDto[]> {
    const results = await this.urineTestRepository.find({
      where: { patientId },
      order: { testDate: 'DESC' }
    });

    return results.map(result => ({
      id: result.id,
      patientId: result.patientId,
      testDate: result.testDate,
      testType: 'URINE' as const,
      testName: 'Examen General de Orina',
      sampleNumber: result.sampleNumber,
      status: result.status,
      sourceTable: 'urine_tests' as const
    }));
  }

  private async getStoolSummary(patientId: string): Promise<ExamSummaryDto[]> {
    const results = await this.stoolTestRepository.find({
      where: { patientId },
      order: { testDate: 'DESC' }
    });

    return results.map(result => ({
      id: result.id.toString(),
      patientId: result.patientId,
      testDate: result.testDate,
      testType: 'HECES' as const,
      testName: 'Examen General de Heces (Coprológico)',
      sampleNumber: result.sampleNumber,
      status: result.status,
      sourceTable: 'stool_tests' as const
    }));
  }
}
