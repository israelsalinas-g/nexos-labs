import { TestProfile } from './test-profile.interface';
import { TestResponseType } from './test-response-type.interface';

export interface ReferenceRange {
  gender?: 'M' | 'F';
  minAge?: number;
  maxAge?: number;
  minValue: number;
  maxValue: number;
  description?: string;
}

export interface TestDefinition {
  id: string;
  code: string | null;
  name: string;
  category: null | string;
  sectionId?: string;  // ID de la sección relacionada
  section?: { id: string; name: string };  // Objeto sección completo
  description: string | null;
  resultType: string; // TestResultType enum serializado como string (legado)
  responseType?: TestResponseType; // Nuevo tipo de respuesta dinámico
  unit: string | null;
  referenceRange: string | null;
  method: string | null;
  sampleType: string | null;
  processingTime: number | null;
  price: string; // Decimal serializado como string "150.00"
  displayOrder: number;
  isActive: boolean;
  profiles: TestProfile[]; // Array de perfiles asociados (ManyToMany)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestDefinitionDto {
  code: string;
  name: string;
  sectionId: string;
  description?: string;
  method?: string;
  unit?: string;
  referenceRanges?: ReferenceRange[];
  resultType?: string;  // Enum string values: 'numeric', 'text', 'positive_negative', etc. (legado)
  responseTypeId?: number; // ID del nuevo tipo de respuesta dinámico
  sampleType?: string;
  processingTime?: number;
  price?: number;
  displayOrder?: number;
  isActive?: boolean; 
}

export interface UpdateTestDefinitionDto extends Partial<CreateTestDefinitionDto> {
  isActive?: boolean;
}
