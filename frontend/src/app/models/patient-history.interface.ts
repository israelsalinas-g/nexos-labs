export interface PatientHistoryExam {
  id: string;
  patientId: string;
  testDate: string;
  testType: string;
  testName: string;
  sampleNumber: string;
  status: string;
  sourceTable: string;
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
