export interface ExamCategory {
  id: string;
  name: string;
  description?: string;
  code?: string;
  color?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExamCategoryDto {
  name: string;
  description?: string;
  code?: string;
  color?: string;
  displayOrder?: number;
}

export interface UpdateExamCategoryDto extends Partial<CreateExamCategoryDto> {
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
