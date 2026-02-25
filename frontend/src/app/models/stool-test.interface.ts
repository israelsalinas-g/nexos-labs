import { EscasaModeradaAbundanteAusenteQuantity } from "../enums/escasa-moderada-abundante-ausente.enums";
import { StoolColor, StoolConsistency, StoolShape } from "../enums/stool-test.enums";
import { Patient, PatientInfo } from "./patient.interface";
import { User } from "./user.interface";
import { TestStatus } from "../enums/test-status.enums";
import { ParasiteResult, ProtozooResult } from "./stool-test.interfaces";
import { Doctor } from "./doctor.interface";


export interface StoolTest {
  id: number;
  testDate: string;
  sampleNumber: string;

  patientId: string;
  patient: Patient;

  doctorId?: string;
  doctor?: Doctor;

  // Examen Físico
  color: StoolColor;
  consistency: StoolConsistency;
  shape: StoolShape;
  mucus: EscasaModeradaAbundanteAusenteQuantity;
  
  // Examen Microscópico
  leukocytes: EscasaModeradaAbundanteAusenteQuantity;
  erythrocytes: EscasaModeradaAbundanteAusenteQuantity;
  parasites: ParasiteResult[];
  protozoos: ProtozooResult[];
  
  // Sistema
  observations?: string;
  status: TestStatus;
  
  // Relaciones con Usuarios
  createdBy?: User | null;
  createdById?: string | null;
  reviewedBy?: User | null;
  reviewedById?: string | null;
  
  isActive: boolean;
  
  // Auditoría
  createdAt: string;
  updatedAt: string;
}

// DTO para crear un nuevo examen coprológico
export interface CreateStoolTestDto {
  testDate?: string;
  sampleNumber?: string;
  
  patientId: string;
  doctorId?: string;

  status?: TestStatus;
  color?: StoolColor | string;
  consistency?: StoolConsistency | string;
  shape?: StoolShape | string;
  mucus?: EscasaModeradaAbundanteAusenteQuantity | string;
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  parasites?: ParasiteResult[];
  protozoos?: ProtozooResult[];
  observations?: string;
  createdById?: string; // ID UUID del usuario que crea el examen (obtenido desde la autenticación)
}

// DTO para actualizar un examen coprológico existente
export interface UpdateStoolTestDto {
  
  sampleNumber?: string;
  testDate?: string;

  doctorId?: string;

  status?: TestStatus;
  color?: StoolColor | string;
  consistency?: StoolConsistency | string;
  shape?: StoolShape | string;
  mucus?: EscasaModeradaAbundanteAusenteQuantity | string;
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  parasites?: ParasiteResult[];
  protozoos?: ProtozooResult[];
  observations?: string;
  reviewedById?: string; // ID UUID del usuario que revisa el examen (obtenido desde la autenticación)
}

// Interfaces para estadísticas

export interface StoolTestStatistics {
  general: {
    totalTests: number;
    pendingTests: number;
    completedTests: number;
    reviewedTests: number;
    testsThisMonth: number;
    testsToday: number;
  };
  distribution: {
    colorStats: Array<{ color: string; count: string }>;
    consistencyStats: Array<{ consistency: string; count: string }>;
  };
  clinical: {
    abnormalFindings: number;
    abnormalPercentage: string;
  };
}

// Interface para reportes médicos
export interface MedicalReport {
  id: number;
  patientName: string;
  patientAge: number;
  patientSex: string;
  sampleNumber: string;
  testDate: string;
  physicalExam: {
    color: string;
    consistency: string;
    shape: string;
    mucus: string;
  };
  microscopicExam: {
    leukocytes: string;
    erythrocytes: string;
    yeast: string;
    parasites: string;
  };
  observations: string;
  createdBy: User | null;
  reviewedBy: User | null;
  reportGeneratedAt: string;
}


export type PaginatedStoolTests = {
  data: StoolTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
