import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import {
  UrineTest,
  CreateUrineTestDto,
  UpdateUrineTestDto,
  MedicalReport,
  UrineTestFilters
} from '../models/urine-test.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class UrineTestService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/urine-tests`;

  createUrineTest(urineTest: CreateUrineTestDto): Observable<UrineTest> {
    const cleanedData = Object.fromEntries(
      Object.entries(urineTest).filter(([_, value]) => value !== undefined)
    ) as CreateUrineTestDto;

    return this.http.post<UrineTest>(this.endpoint, cleanedData)
      .pipe(catchError(err => this.handleError(err)));
  }

  getUrineTests(filters?: UrineTestFilters): Observable<PaginatedResponse<UrineTest>> {
    const params = this.getParams(filters || {});
    return this.http.get<PaginatedResponse<UrineTest>>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getUrineTestById(id: string): Observable<UrineTest> {
    return this.http.get<UrineTest>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getUrineTestsByPatientId(patientId: string): Observable<UrineTest[]> {
    return this.http.get<UrineTest[]>(`${this.endpoint}/patient/${patientId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateUrineTest(id: string, updates: UpdateUrineTestDto): Observable<UrineTest> {
    const cleanedData = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    ) as UpdateUrineTestDto;

    return this.http.patch<UrineTest>(`${this.endpoint}/${id}`, cleanedData)
      .pipe(catchError(err => this.handleError(err)));
  }

  markAsCompleted(id: string, reviewedBy?: string): Observable<UrineTest> {
    const params = this.getParams({ reviewedBy });
    return this.http.patch<UrineTest>(`${this.endpoint}/${id}/complete`, {}, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  deactivateUrineTest(id: string): Observable<UrineTest> {
    return this.http.patch<UrineTest>(`${this.endpoint}/${id}/deactivate`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  activateUrineTest(id: string): Observable<UrineTest> {
    return this.http.patch<UrineTest>(`${this.endpoint}/${id}/reactivate`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  getPendingReview(): Observable<UrineTest[]> {
    return this.http.get<UrineTest[]>(`${this.endpoint}/pending-review`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getMedicalReport(id: string): Observable<MedicalReport> {
    return this.http.get<MedicalReport>(`${this.endpoint}/${id}/medical-report`)
      .pipe(catchError(err => this.handleError(err)));
  }

  searchUrineTests(query: string, filters?: Partial<UrineTestFilters>): Observable<UrineTest[]> {
    const params = this.getParams({ q: query, ...filters });
    return this.http.get<UrineTest[]>(`${this.endpoint}/search`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getAbnormalResults(filters?: Partial<UrineTestFilters>): Observable<UrineTest[]> {
    const params = this.getParams(filters || {});
    return this.http.get<UrineTest[]>(`${this.endpoint}/abnormal`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  duplicateUrineTest(id: string, newPatientId?: string, newTestDate?: string): Observable<UrineTest> {
    const body: any = {};
    if (newPatientId) body.patientId = newPatientId;
    if (newTestDate) body.testDate = newTestDate;

    return this.http.post<UrineTest>(`${this.endpoint}/${id}/duplicate`, body)
      .pipe(catchError(err => this.handleError(err)));
  }
}
