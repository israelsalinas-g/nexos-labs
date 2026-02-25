import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { TestDefinition, CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../models/test-definition.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

export interface TestDefinitionFilters extends PaginationQuery {
  sectionId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestDefinitionService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-definitions`;

  getTestDefinitions(filters?: TestDefinitionFilters): Observable<PaginatedResponse<TestDefinition>> {
    const params = this.getParams(filters || {});
    return this.http.get<PaginatedResponse<TestDefinition>>(this.endpoint, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  getTestDefinitionById(id: string): Observable<TestDefinition> {
    return this.http.get<TestDefinition>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getTestDefinitionByCode(code: string): Observable<TestDefinition> {
    return this.http.get<TestDefinition>(`${this.endpoint}/code/${code}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  createTestDefinition(definition: CreateTestDefinitionDto): Observable<TestDefinition> {
    return this.http.post<TestDefinition>(this.endpoint, definition)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateTestDefinition(id: string, definition: UpdateTestDefinitionDto): Observable<TestDefinition> {
    return this.http.patch<TestDefinition>(`${this.endpoint}/${id}`, definition)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteTestDefinition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getActiveTestDefinitions(): Observable<TestDefinition[]> {
    const params = this.getParams({ isActive: true });
    return this.http.get<PaginatedResponse<TestDefinition>>(this.endpoint, { params })
      .pipe(
        map(response => Array.isArray(response.data) ? response.data : []),
        catchError(err => this.handleError(err))
      );
  }

  getTestDefinitionsBySection(sectionId: string): Observable<TestDefinition[]> {
    const params = this.getParams({ sectionId });
    return this.http.get<PaginatedResponse<TestDefinition>>(this.endpoint, { params })
      .pipe(
        map(response => Array.isArray(response.data) ? response.data : []),
        catchError(err => this.handleError(err))
      );
  }
}
