import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { UrineTest } from '../../entities/urine-test.entity';
import { StoolTest } from '../../entities/stool-test.entity';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';
import {
  ExamSummaryDto,
  PatientWithExamsHistoryDto,
  PatientBasicInfoDto,
  TestTrendPointDto,
} from '../../dto/patient-assignment.dto';

export interface HistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  testType?: string;
}

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
    @InjectRepository(UnifiedTestResult)
    private unifiedResultRepository: Repository<UnifiedTestResult>,
  ) {}

  /**
   * Historial unificado del paciente: combina las 5 fuentes de datos.
   */
  async getPatientWithExamsHistory(
    patientId: string,
    filters?: HistoryFilters,
  ): Promise<PatientWithExamsHistoryDto> {
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException(`Paciente con ID ${patientId} no encontrado`);

    const [dhResults, iChromaResults, urineResults, stoolResults, unifiedResults] = await Promise.all([
      this.getDymindDh36Summary(patientId, filters?.dateFrom, filters?.dateTo),
      this.getIChromaSummary(patientId, filters?.dateFrom, filters?.dateTo),
      this.getUrineSummary(patientId, filters?.dateFrom, filters?.dateTo),
      this.getStoolSummary(patientId, filters?.dateFrom, filters?.dateTo),
      this.getUnifiedSummary(patientId, filters?.dateFrom, filters?.dateTo),
    ]);

    let combinedExams = [
      ...dhResults,
      ...iChromaResults,
      ...urineResults,
      ...stoolResults,
      ...unifiedResults,
    ].sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    if (filters?.testType) {
      combinedExams = combinedExams.filter(e => e.testType === filters.testType);
    }

    const patientInfo: PatientBasicInfoDto = {
      id: patient.id,
      name: patient.name,
      sex: patient.sex,
      phone: patient.phone,
      birthDate: patient.birthDate,
    };

    return { patient: patientInfo, exams: combinedExams };
  }

  /**
   * Serie temporal de valores numéricos de un test (para gráfica de tendencia).
   * Solo aplica a resultados del sistema LAB (unified_test_results).
   */
  async getTestTrend(patientId: string, testDefinitionId: number): Promise<TestTrendPointDto[]> {
    const rows = await this.unifiedResultRepository
      .createQueryBuilder('r')
      .select([
        'r.numeric_value as "value"',
        'r.is_abnormal as "isAbnormal"',
        'r.entered_at as "date"',
        'ot.sample_number as "sampleNumber"',
      ])
      .innerJoin('order_tests', 'ot', 'ot.id = r.order_test_id')
      .innerJoin('laboratory_orders', 'lo', 'lo.id = ot.order_id')
      .where('lo.patient_id = :patientId', { patientId })
      .andWhere('r.test_definition_id = :testDefinitionId', { testDefinitionId })
      .andWhere('r.numeric_value IS NOT NULL')
      .orderBy('r.entered_at', 'ASC')
      .getRawMany();

    return rows.map(r => ({
      date: new Date(r.date),
      value: parseFloat(r.value),
      isAbnormal: r.isAbnormal,
      sampleNumber: r.sampleNumber ?? null,
    }));
  }

  /** @deprecated Usar getPatientWithExamsHistory() en su lugar */
  async getPatientExamsSummary(patientId: string): Promise<ExamSummaryDto[]> {
    const result = await this.getPatientWithExamsHistory(patientId);
    return result.exams;
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Resultados del sistema LAB (unified_test_results) para este paciente.
   * Recorre: unified_test_results → order_tests → laboratory_orders
   */
  private async getUnifiedSummary(
    patientId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<ExamSummaryDto[]> {
    const qb = this.unifiedResultRepository
      .createQueryBuilder('r')
      .innerJoin('order_tests', 'ot', 'ot.id = r.order_test_id')
      .innerJoin('laboratory_orders', 'lo', 'lo.id = ot.order_id')
      .leftJoin('test_definitions', 'td', 'td.id = r.test_definition_id')
      .select([
        'r.id as "id"',
        'r.numeric_value as "numericValue"',
        'r.is_abnormal as "isAbnormal"',
        'r.entered_at as "enteredAt"',
        'ot.sample_number as "sampleNumber"',
        'td.name as "testName"',
        'td.id as "testDefinitionId"',
      ])
      .where('lo.patient_id = :patientId', { patientId });

    if (dateFrom) qb.andWhere('r.entered_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('r.entered_at <= :dateTo', { dateTo });

    const rows = await qb.orderBy('r.entered_at', 'DESC').getRawMany();

    return rows.map(r => ({
      id: r.id.toString(),
      patientId,
      testDate: new Date(r.enteredAt),
      testType: 'LAB' as const,
      testName: r.testName ?? 'Prueba de Laboratorio',
      sampleNumber: r.sampleNumber ?? null,
      status: 'completed',
      sourceTable: 'unified_test_results' as const,
      numericValue: r.numericValue != null ? parseFloat(r.numericValue) : undefined,
      isAbnormal: r.isAbnormal ?? undefined,
      testDefinitionId: r.testDefinitionId != null ? parseInt(r.testDefinitionId) : undefined,
    }));
  }

  private async getDymindDh36Summary(patientId: string, dateFrom?: Date, dateTo?: Date): Promise<ExamSummaryDto[]> {
    const q = this.dymindDh36ResultRepository.createQueryBuilder('r').where('r.patientId = :patientId', { patientId });
    if (dateFrom) q.andWhere('r.testDate >= :dateFrom', { dateFrom });
    if (dateTo) q.andWhere('r.testDate <= :dateTo', { dateTo });
    const results = await q.orderBy('r.testDate', 'DESC').getMany();
    return results.map(r => ({
      id: r.id.toString(), patientId: r.patientId, testDate: r.testDate,
      testType: 'DH36' as const, testName: 'Hemograma Completo',
      sampleNumber: r.sampleNumber, status: r.processingStatus || 'processed',
      sourceTable: 'dymind_dh36_results' as const,
    }));
  }

  private async getIChromaSummary(patientId: string, dateFrom?: Date, dateTo?: Date): Promise<ExamSummaryDto[]> {
    const q = this.iChromaResultRepository.createQueryBuilder('r').where('r.patientId = :patientId', { patientId });
    if (dateFrom) q.andWhere('r.testDate >= :dateFrom', { dateFrom });
    if (dateTo) q.andWhere('r.testDate <= :dateTo', { dateTo });
    const results = await q.orderBy('r.testDate', 'DESC').getMany();
    return results.map(r => ({
      id: r.id.toString(), patientId: r.patientId, testDate: r.testDate,
      testType: 'ICHROMA' as const, testName: r.testName || 'Prueba Especial iChroma',
      sampleNumber: r.sampleBarcode, status: r.processingStatus || 'processed',
      sourceTable: 'ichroma_results' as const,
    }));
  }

  private async getUrineSummary(patientId: string, dateFrom?: Date, dateTo?: Date): Promise<ExamSummaryDto[]> {
    const q = this.urineTestRepository.createQueryBuilder('r').where('r.patientId = :patientId', { patientId });
    if (dateFrom) q.andWhere('r.testDate >= :dateFrom', { dateFrom });
    if (dateTo) q.andWhere('r.testDate <= :dateTo', { dateTo });
    const results = await q.orderBy('r.testDate', 'DESC').getMany();
    return results.map(r => ({
      id: r.id, patientId: r.patientId, testDate: r.testDate,
      testType: 'URINE' as const, testName: 'Examen General de Orina',
      sampleNumber: r.sampleNumber, status: r.status,
      sourceTable: 'urine_tests' as const,
    }));
  }

  private async getStoolSummary(patientId: string, dateFrom?: Date, dateTo?: Date): Promise<ExamSummaryDto[]> {
    const q = this.stoolTestRepository.createQueryBuilder('r').where('r.patientId = :patientId', { patientId });
    if (dateFrom) q.andWhere('r.testDate >= :dateFrom', { dateFrom });
    if (dateTo) q.andWhere('r.testDate <= :dateTo', { dateTo });
    const results = await q.orderBy('r.testDate', 'DESC').getMany();
    return results.map(r => ({
      id: r.id.toString(), patientId: r.patientId, testDate: r.testDate,
      testType: 'HECES' as const, testName: 'Examen General de Heces (Coprológico)',
      sampleNumber: r.sampleNumber, status: r.status,
      sourceTable: 'stool_tests' as const,
    }));
  }
}
