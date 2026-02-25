import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { TestSection, CreateTestSectionDto, UpdateTestSectionDto } from '../models/test-section.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class TestSectionService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-sections`;

  getTestSections(query?: PaginationQuery): Observable<PaginatedResponse<TestSection>> {
    const params = this.getParams(query || {});
    return this.http.get<PaginatedResponse<TestSection>>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getTestSectionById(id: string): Observable<TestSection> {
    return this.http.get<TestSection>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  createTestSection(section: CreateTestSectionDto): Observable<TestSection> {
    return this.http.post<TestSection>(this.endpoint, section)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateTestSection(id: string, section: UpdateTestSectionDto): Observable<TestSection> {
    return this.http.patch<TestSection>(`${this.endpoint}/${id}`, section)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteTestSection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getActiveTestSections(): Observable<TestSection[]> {
    const params = this.getParams({ isActive: true });
    return this.http.get<PaginatedResponse<TestSection>>(this.endpoint, { params })
      .pipe(
        map(response => Array.isArray(response.data) ? response.data : []),
        catchError(err => this.handleError(err))
      );
  }
}
