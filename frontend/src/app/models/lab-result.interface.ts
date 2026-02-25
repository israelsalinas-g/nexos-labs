export interface Parameter {
  name: string;
  unit: string;
  result: string;
  status: string;
  referenceRange: string;
}

export interface LabResult {
  id: number;
  patientId: string | null;
  patientName: string | null;
  patientAge: number | null;
  patientSex: string | null;
  referenceGroup: string | null;
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