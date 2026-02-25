import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map } from 'rxjs';
import { TestProfile, CreateTestProfileDto, UpdateTestProfileDto } from '../models/test-profile.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';

export interface TestProfileFilters extends PaginationQuery {
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestProfileService {
  private readonly apiUrl = 'http://localhost:3000/test-profiles';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Listar perfiles con paginación y filtros
  getTestProfiles(filters?: TestProfileFilters): Observable<PaginatedResponse<TestProfile>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    }

    return this.http.get<PaginatedResponse<TestProfile>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      map(response => {
        // Ensure data is ALWAYS a fresh array instance
        const normalized: PaginatedResponse<TestProfile> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 4,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Test profiles loaded:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener un perfil por ID
  getTestProfileById(id: string): Observable<TestProfile> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<TestProfile>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener perfil por código
  getTestProfileByCode(code: string): Observable<TestProfile> {
    const url = `${this.apiUrl}/code/${code}`;
    return this.http.get<TestProfile>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nuevo perfil
  createTestProfile(profile: CreateTestProfileDto): Observable<TestProfile> {
    return this.http.post<TestProfile>(this.apiUrl, profile, this.httpOptions)
      .pipe(
        tap(response => console.log('Test profile created:', response)),
        catchError(this.handleError)
      );
  }

  // Actualizar perfil
  updateTestProfile(id: string, profile: UpdateTestProfileDto): Observable<TestProfile> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<TestProfile>(url, profile, this.httpOptions)
      .pipe(
        tap(response => console.log('Test profile updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar perfil (soft delete)
  deleteTestProfile(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log('Test profile deleted:', id)),
        catchError(this.handleError)
      );
  }

  // Obtener perfiles activos
  getActiveTestProfiles(): Observable<TestProfile[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<PaginatedResponse<TestProfile>>(this.apiUrl, { 
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
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
    } else {
      errorMessage = `Error del servidor: ${error.status}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    
    console.error('Error en TestProfileService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
