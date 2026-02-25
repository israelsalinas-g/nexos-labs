import { Patient } from "./patient.interface";

export interface Parameter {
  name: string;
  unit: string;
  result: string;
  status: string;
  referenceRange: string;
}

export interface DymindDh36Result {
  id: number;
  patientId: string | null;
  patient: Patient | null;
  patientIdDymind: string | null;
  patientNameDymind: string | null;
  patientAgeDymind: number | null;
  patientSexDymind: string | null;
  referenceGroupDymind: string | null;
  sampleNumber: string;
  analysisMode: string | null;
  testDate: string;
  parameters: Parameter[];
  instrumentId: string;
  rawData: string;
  processingStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Mantener compatibilidad con nombre anterior
export type LabResult = DymindDh36Result;