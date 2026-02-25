import { ParasiteType, ProtozooType } from '../enums/stool-test.enums';
import { TestStatus } from '../enums/test-status.enums';
import { StoolTest } from './stool-test.interface';

export interface ParasiteResult {
  type: ParasiteType;
  quantity: string;
}

export interface ProtozooResult {
  type: ProtozooType;
  quantity: string;
}

// Interfaces para paginación y filtros
export interface StoolTestFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: TestStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedStoolTestResponse {
  data: StoolTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}