import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { BaseService } from './base.service';
import { TestResponseType, CreateTestResponseTypeDto, UpdateTestResponseTypeDto } from '../models/test-response-type.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({ providedIn: 'root' })
export class TestResponseTypeService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-response-types`;

  getAll(params: { page?: number; limit?: number; search?: string; includeInactive?: boolean } = {}): Observable<PaginatedResponse<TestResponseType>> {
    const httpParams = this.getParams(params as any);
    return this.http.get<PaginatedResponse<TestResponseType>>(this.endpoint, { params: httpParams })
      .pipe(catchError(err => this.handleError(err)));
  }

  getAllActive(): Observable<TestResponseType[]> {
    return this.http.get<TestResponseType[]>(`${this.endpoint}/active`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getById(id: number): Observable<TestResponseType> {
    return this.http.get<TestResponseType>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getBySlug(slug: string): Observable<TestResponseType> {
    return this.http.get<TestResponseType>(`${this.endpoint}/slug/${slug}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  create(dto: CreateTestResponseTypeDto): Observable<TestResponseType> {
    return this.http.post<TestResponseType>(this.endpoint, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  update(id: number, dto: UpdateTestResponseTypeDto): Observable<TestResponseType> {
    return this.http.patch<TestResponseType>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  toggleActive(id: number): Observable<TestResponseType> {
    return this.http.patch<TestResponseType>(`${this.endpoint}/${id}/toggle-active`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
