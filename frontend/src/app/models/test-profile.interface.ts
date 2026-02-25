import { TestDefinition } from './test-definition.interface';

export interface TestProfile {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  tests: TestDefinition[]; // Array de tests asociados al perfil (ManyToMany)
  category: null | string;
  price: string; // Decimal serializado como string "450.00"
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestProfileDto {
  code: string;
  name: string;
  description?: string;
  testDefinitions: string[]; // Array de IDs de TestDefinition
  price?: number;
  displayOrder?: number;
}

export interface UpdateTestProfileDto extends Partial<CreateTestProfileDto> {
  id?: string; // Necesario para identificar el perfil a actualizar
  isActive?: boolean;
}
