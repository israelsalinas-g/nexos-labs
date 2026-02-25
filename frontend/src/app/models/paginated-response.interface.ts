import { StoolTest } from "./stool-test.interface";

export interface PaginatedStoolTestResponse {
  items: StoolTest[];
  total: number;
  page: number;
  limit: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pagination query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Error response interface
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}
