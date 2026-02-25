import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientHistoryResponse } from '../models/patient-history.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientHistoryService {
  private apiUrl = 'http://localhost:3000/patients-history';

  constructor(private http: HttpClient) {}

  getPatientExamsSummary(patientId: string): Observable<PatientHistoryResponse> {
    return this.http.get<PatientHistoryResponse>(`${this.apiUrl}/${patientId}/exams-summary`);
  }
}
