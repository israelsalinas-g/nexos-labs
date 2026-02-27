import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientHistoryResponse, TestTrendPoint, HistoryFilters } from '../models/patient-history.interface';

@Injectable({ providedIn: 'root' })
export class PatientHistoryService {
  private apiUrl = 'http://localhost:3000/patients-history';

  constructor(private http: HttpClient) {}

  getPatientExamsSummary(
    patientId: string,
    filters?: HistoryFilters,
  ): Observable<PatientHistoryResponse> {
    let params = new HttpParams();
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.testType) params = params.set('testType', filters.testType);

    return this.http.get<PatientHistoryResponse>(
      `${this.apiUrl}/${patientId}/exams-summary`,
      { params },
    );
  }

  getTestTrend(patientId: string, testDefinitionId: number): Observable<TestTrendPoint[]> {
    return this.http.get<TestTrendPoint[]>(
      `${this.apiUrl}/${patientId}/test-trend/${testDefinitionId}`,
    );
  }
}
