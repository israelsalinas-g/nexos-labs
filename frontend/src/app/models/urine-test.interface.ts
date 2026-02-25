import { EscasaModeradaAbundanteAusenteQuantity } from "../enums/escasa-moderada-abundante-ausente.enums";
import { NegativePositive3Plus } from "../enums/negetive-positive-3-plus.enums";
import { NegativePositive4Plus } from "../enums/negetive-positive-4-plus.enums";
import { NegativePositive } from "../enums/negetive-positive.enums";
import { UrineAspect, UrineColor, UrineDensity, UrinePH, Urobilinogen } from "../enums/urine-test.enums";
import { Doctor } from "./doctor.interface";
import { Patient } from "./patient.interface";
import { CrystalResult, CylinderResult } from "./urine-test.interfaces";
import { User } from "./user.interface";


// Interface principal del examen de orina
export interface UrineTest {
  id: string;
  testDate: string; // ISO string
  sampleNumber: string;
  
  patient?: Patient;
  patientId: string;

  doctor?: Doctor;
  doctorId?: string;
  
  // Examen Físico
  volume?: string;
  color?: UrineColor;
  aspect?: UrineAspect;
  sediment?: EscasaModeradaAbundanteAusenteQuantity;
  
  // Examen Químico
  density?: UrineDensity;
  ph?: UrinePH;
  protein?: NegativePositive4Plus;
  glucose?: NegativePositive4Plus;

  bilirubin?: NegativePositive3Plus;
  ketones?: NegativePositive3Plus;
  occultBlood?: NegativePositive3Plus;
  leukocytes?: NegativePositive3Plus;

  nitrites?: NegativePositive;
  urobilinogen?: Urobilinogen;
  
  // Examen Microscópico
  epithelialCells?: EscasaModeradaAbundanteAusenteQuantity;
  bacteria?: EscasaModeradaAbundanteAusenteQuantity;
  mucousFilaments?: EscasaModeradaAbundanteAusenteQuantity;
  yeasts?: EscasaModeradaAbundanteAusenteQuantity;
  leukocytesField?: string;
  erythrocytesField?: string;
  crystals?: CrystalResult[];
  cylinders?: CylinderResult[];
  others?: string;
  
  // Metadatos
  observations?: string;
  status?: string;
  
  // Relaciones con Usuarios
  createdBy?: User | null;
  createdById?: string | null;
  reviewedBy?: User | null;
  reviewedById?: string | null;
    
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// DTO para crear examen de orina
export interface CreateUrineTestDto {
  testDate: string;
  sampleNumber: string;
  
  patientId: string;
  doctorId?: string;
  
  // Examen Físico
  volume?: string;
  color?: UrineColor;
  aspect?: UrineAspect;
  sediment?: EscasaModeradaAbundanteAusenteQuantity;
  
  // Examen Químico
  density?: UrineDensity;
  ph?: UrinePH;
  protein?: NegativePositive4Plus;
  glucose?: NegativePositive4Plus;
  bilirubin?: NegativePositive3Plus;
  ketones?: NegativePositive3Plus;
  occultBlood?: NegativePositive3Plus;
  nitrites?: NegativePositive;
  leukocytes?: NegativePositive3Plus;
  urobilinogen?: Urobilinogen;
  
  // Examen Microscópico
  epithelialCells?: EscasaModeradaAbundanteAusenteQuantity;
  leukocytesField?: string;
  erythrocytesField?: string;
  bacteria?: EscasaModeradaAbundanteAusenteQuantity;
  mucousFilaments?: EscasaModeradaAbundanteAusenteQuantity;
  yeasts?: EscasaModeradaAbundanteAusenteQuantity;
  crystals?: CrystalResult[];
  cylinders?: CylinderResult[];
  others?: string;
  
  // Metadatos (todos opcionales)
  observations?: string;
  createdById?: string; // ✅ UUID string del usuario que crea el examen
  status?: string;
}

// DTO para actualizar examen de orina
export interface UpdateUrineTestDto extends Partial<CreateUrineTestDto> {
  reviewedById?: string; // ✅ UUID string del usuario que revisa el examen
}

// Interface para reporte médico
export interface MedicalReport {
  urineTest: UrineTest;
  interpretation: string;
  abnormalFindings: string[];
  recommendations?: string[];
  generatedAt: string;
  generatedBy?: string;
}

// Interface para filtros de búsqueda
export interface UrineTestFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAbnormalResults?: boolean;
  isActive?: boolean;
}

// Interface para información de paginación
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Interface para resultados de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Interface para opciones de exportación
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includePatientData: boolean;
  includeNormalResults: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}
