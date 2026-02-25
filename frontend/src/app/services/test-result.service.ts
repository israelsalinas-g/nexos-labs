import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { TestResult, CreateTestResultDto, UpdateTestResultDto } from '../models/test-result.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TestResultService {
  private apiUrl = 'http://localhost:3000/test-results';
  private httpOptions = {
    headers: { 'Content-Type': 'application/json' }
  };

  constructor(private http: HttpClient) { }

  // Crear resultado
  createResult(dto: CreateTestResultDto): Observable<TestResult> {
    return this.http.post<TestResult>(this.apiUrl, dto, this.httpOptions).pipe(
      tap(result => console.log('Resultado creado:', result)),
      catchError(error => {
        console.error('Error al crear resultado:', error);
        throw error;
      })
    );
  }

  // Listar resultados con paginación y filtros
  getResults(
    page: number = 1,
    limit: number = 10,
    isAbnormal?: boolean,
    isCritical?: boolean
  ): Observable<PaginatedResponse<TestResult>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (isAbnormal !== undefined) params = params.set('isAbnormal', isAbnormal.toString());
    if (isCritical !== undefined) params = params.set('isCritical', isCritical.toString());

    return this.http.get<PaginatedResponse<TestResult>>(this.apiUrl, { 
      params,
      ...this.httpOptions 
    }).pipe(
      map(response => {
        // Asegurar que data siempre es un array fresco
        const normalized: PaginatedResponse<TestResult> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 10,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Resultados cargados:', response)),
      catchError(error => {
        console.error('Error al obtener resultados:', error);
        throw error;
      })
    );
  }

  // Obtener resultado por ID
  getResultById(id: number): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(result => console.log('Resultado obtenido:', result)),
      catchError(error => {
        console.error(`Error al obtener resultado ${id}:`, error);
        throw error;
      })
    );
  }

  // Actualizar resultado
  updateResult(id: number, dto: UpdateTestResultDto): Observable<TestResult> {
    return this.http.patch<TestResult>(
      `${this.apiUrl}/${id}`,
      dto,
      this.httpOptions
    ).pipe(
      tap(result => console.log('Resultado actualizado:', result)),
      catchError(error => {
        console.error(`Error al actualizar resultado ${id}:`, error);
        throw error;
      })
    );
  }

  // Obtener resultados por paciente
  getResultsByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 10,
    isCritical?: boolean
  ): Observable<PaginatedResponse<TestResult>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (isCritical !== undefined) params = params.set('isCritical', isCritical.toString());

    return this.http.get<PaginatedResponse<TestResult>>(
      `${this.apiUrl}/patient/${patientId}`,
      { params, ...this.httpOptions }
    ).pipe(
      map(response => {
        const normalized: PaginatedResponse<TestResult> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 10,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Resultados del paciente cargados:', response)),
      catchError(error => {
        console.error(`Error al obtener resultados del paciente ${patientId}:`, error);
        throw error;
      })
    );
  }

  // Eliminar resultado
  deleteResult(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      this.httpOptions
    ).pipe(
      tap(() => console.log('Resultado eliminado:', id)),
      catchError(error => {
        console.error(`Error al eliminar resultado ${id}:`, error);
        throw error;
      })
    );
  }
}
