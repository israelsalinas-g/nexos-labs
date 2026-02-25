import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map } from 'rxjs';
import { TestSection, CreateTestSectionDto, UpdateTestSectionDto } from '../models/test-section.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TestSectionService {
  private readonly apiUrl = 'http://localhost:3000/test-sections';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Listar secciones con paginación
  getTestSections(query?: PaginationQuery): Observable<PaginatedResponse<TestSection>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    }

    return this.http.get<PaginatedResponse<TestSection>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      tap(response => console.log('Test sections loaded:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener una sección por ID
  getTestSectionById(id: string): Observable<TestSection> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<TestSection>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nueva sección
  createTestSection(section: CreateTestSectionDto): Observable<TestSection> {
    return this.http.post<TestSection>(this.apiUrl, section, this.httpOptions)
      .pipe(
        tap(response => console.log('Test section created:', response)),
        catchError(this.handleError)
      );
  }

  // Actualizar sección
  updateTestSection(id: string, section: UpdateTestSectionDto): Observable<TestSection> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<TestSection>(url, section, this.httpOptions)
      .pipe(
        tap(response => console.log('Test section updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar sección (soft delete)
  deleteTestSection(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log('Test section deleted:', id)),
        catchError(this.handleError)
      );
  }

  // Obtener secciones activas
  getActiveTestSections(): Observable<TestSection[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<PaginatedResponse<TestSection>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data : []),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Error en TestSectionService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
