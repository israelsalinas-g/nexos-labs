import { Patient } from "./patient.interface";

export interface IChromaResult {
  id: number;
  messageType: string; // "MSH"
  deviceId: string; // "^~\\&"
  patientId: string;
  patient: Patient;
  patientIdIchroma2: string;
  patientNameIchroma2: string;
  patientAgeIchroma2: number | null;
  patientSexIchroma2: string;
  testType: string; // "SL033", "SL001", etc.
  testName: string; // "Beta HCG", "PSA", etc.
  result: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  cartridgeSerial: string;
  cartridgeLot: string;
  humidity: number | null;
  sampleBarcode: string;
  testDate: string; // ISO date string
  rawMessage: string;
  rawData: any; // JSON object
  instrumentId: string; // "ICHROMA_II"
  processingStatus: string;
  technicalNotes: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface IChromaStats {
  total: number;
  byTestType: Array<{
    testType: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface UpdateIChromaResultDto {
  patientId?: string;
  patient?: Patient;
  patientIdIchroma2?: string;
  patientNameIchroma2?: string;
  patientAgeIchroma2?: number | null;
  patientSexIchroma2?: string;
  testType?: string;
  testName?: string;
  result?: string;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  processingStatus?: string;
  technicalNotes?: string;
  testDate?: string;
}