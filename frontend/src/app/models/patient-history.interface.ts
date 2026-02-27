export type ExamTestType = 'DH36' | 'ICHROMA' | 'URINE' | 'HECES' | 'LAB';
export type ExamSourceTable =
  | 'dymind_dh36_results'
  | 'ichroma_results'
  | 'urine_tests'
  | 'stool_tests'
  | 'unified_test_results';

export interface PatientHistoryExam {
  id: string;
  patientId: string;
  testDate: string;
  testType: ExamTestType;
  testName: string;
  sampleNumber: string | null;
  status: string;
  sourceTable: ExamSourceTable;
  // Solo presentes en registros LAB (unified_test_results)
  numericValue?: number;
  isAbnormal?: boolean;
  testDefinitionId?: number;
}

export interface PatientHistoryPatient {
  id: string;
  name: string;
  sex: string;
  phone: string;
  birthDate: string;
}

export interface PatientHistoryResponse {
  patient: PatientHistoryPatient;
  exams: PatientHistoryExam[];
}

export interface TestTrendPoint {
  date: string;
  value: number;
  isAbnormal: boolean | null;
  sampleNumber: string | null;
}

export interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  testType?: string;
}
