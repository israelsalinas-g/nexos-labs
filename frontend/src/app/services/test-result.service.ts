import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { TestResult, CreateTestResultDto, UpdateTestResultDto } from '../models/test-result.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class TestResultService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-results`;

  createResult(dto: CreateTestResultDto): Observable<TestResult> {
    return this.http.post<TestResult>(this.endpoint, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  getResults(
    page: number = 1,
    limit: number = 10,
    isAbnormal?: boolean,
    isCritical?: boolean
  ): Observable<PaginatedResponse<TestResult>> {
    const params = this.getParams({ page, limit, isAbnormal, isCritical });
    return this.http.get<PaginatedResponse<TestResult>>(this.endpoint, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  getResultById(id: number): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateResult(id: number, dto: UpdateTestResultDto): Observable<TestResult> {
    return this.http.patch<TestResult>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  getResultsByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 10,
    isCritical?: boolean
  ): Observable<PaginatedResponse<TestResult>> {
    const params = this.getParams({ page, limit, isCritical });
    return this.http.get<PaginatedResponse<TestResult>>(`${this.endpoint}/patient/${patientId}`, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  deleteResult(id: number): Observable<any> {
    return this.http.delete<any>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
