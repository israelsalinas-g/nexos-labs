import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import {
  StoolTest,
  CreateStoolTestDto,
  UpdateStoolTestDto
} from '../models/stool-test.interface';
import { StoolTestFilters } from '../models/stool-test.interfaces';
import { PaginatedResponse } from '../models/patient.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class StoolTestService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/stool-tests`;

  getStoolTests(filters: StoolTestFilters = {}): Observable<PaginatedResponse<StoolTest>> {
    const params = this.getParams({
      page: filters.page || 1,
      limit: filters.limit || 4,
      patientId: filters.patientId,
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    });

    return this.http.get<PaginatedResponse<StoolTest>>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getStoolTestById(id: number): Observable<StoolTest> {
    return this.http.get<StoolTest>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  createStoolTest(data: CreateStoolTestDto): Observable<StoolTest> {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as CreateStoolTestDto;

    return this.http.post<StoolTest>(this.endpoint, cleanedData)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateStoolTest(id: number, data: UpdateStoolTestDto): Observable<StoolTest> {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as UpdateStoolTestDto;

    return this.http.patch<StoolTest>(`${this.endpoint}/${id}`, cleanedData)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteStoolTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  deactivateStoolTest(id: number): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.endpoint}/${id}/deactivate`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  activateStoolTest(id: number): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.endpoint}/${id}/reactivate`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  getNextSampleNumber(): Observable<{ sampleNumber: string }> {
    return this.http.get<{ sampleNumber: string }>(`${this.endpoint}/next-sample-number`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
