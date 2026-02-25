export interface MedicalReport {
  id: number;
  stoolTestId: number;
  date: string;
  findings: string;
  recommendations: string;
  doctorName: string;
  doctorSignature?: string;
}