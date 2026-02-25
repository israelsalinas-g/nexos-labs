import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  StoolTest,
  CreateStoolTestDto,
  UpdateStoolTestDto
} from '../models/stool-test.interface';
import { StoolTestFilters } from '../models/stool-test.interfaces';
import { PaginatedResponse } from '../models/patient.interface';

@Injectable({
  providedIn: 'root'
})
export class StoolTestService {
  private readonly baseUrl = '/api/stool-tests';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de exámenes con filtros opcionales
   */
  getStoolTests(filters: StoolTestFilters = {}): Observable<PaginatedResponse<StoolTest>> {
    let params = new HttpParams()
      .set('page', filters.page?.toString() || '1')
      .set('limit', filters.limit?.toString() || '10');

    if (filters.patientId) {
      params = params.set('patientId', filters.patientId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<PaginatedResponse<StoolTest>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un examen por su ID
   */
  getStoolTestById(id: number): Observable<StoolTest> {
    return this.http.get<StoolTest>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crea un nuevo examen
   */
  createStoolTest(data: CreateStoolTestDto): Observable<StoolTest> {
    return this.http.post<StoolTest>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza un examen existente
   */
  updateStoolTest(id: number, data: UpdateStoolTestDto): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina un examen
   */
  deleteStoolTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}