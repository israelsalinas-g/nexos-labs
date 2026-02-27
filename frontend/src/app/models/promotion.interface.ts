import { TestDefinition } from './test-definition.interface';
import { TestProfile } from './test-profile.interface';

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  price: string; // decimal serializado como string por TypeORM
  validFrom: string; // YYYY-MM-DD
  validTo: string;   // YYYY-MM-DD
  isActive: boolean;
  tests: TestDefinition[];
  profiles: TestProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  price: number;
  validFrom: string;
  validTo: string;
  isActive?: boolean;
  testIds?: string[];
  profileIds?: string[];
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}
