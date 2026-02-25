import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map } from 'rxjs';
import { TestDefinition, CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../models/test-definition.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';

export interface TestDefinitionFilters extends PaginationQuery {
  sectionId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestDefinitionService {
  private readonly apiUrl = 'http://localhost:3000/test-definitions';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Listar definiciones con paginación y filtros
  getTestDefinitions(filters?: TestDefinitionFilters): Observable<PaginatedResponse<TestDefinition>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.sectionId) params = params.set('sectionId', filters.sectionId);
      if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    }

    return this.http.get<PaginatedResponse<TestDefinition>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      map(response => {
        // Ensure data is ALWAYS a fresh array instance
        const normalized: PaginatedResponse<TestDefinition> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 4,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Test definitions loaded:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener una definición por ID
  getTestDefinitionById(id: string): Observable<TestDefinition> {
    if (!id || id.trim() === '') {
      const error = new Error('ID de definición de prueba inválido o vacío');
      console.error('Error en getTestDefinitionById:', error);
      return throwError(() => error);
    }

    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching test definition from:', url);
    
    return this.http.get<TestDefinition>(url, this.httpOptions)
      .pipe(
        tap(result => console.log('Test definition loaded successfully:', result)),
        catchError(error => {
          console.error(`Error fetching test definition with ID ${id}:`, error);
          console.error('Error status:', error.status);
          console.error('Error response:', error.error);
          return this.handleError(error);
        })
      );
  }

  // Obtener definiciones por código
  getTestDefinitionByCode(code: string): Observable<TestDefinition> {
    const url = `${this.apiUrl}/code/${code}`;
    return this.http.get<TestDefinition>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nueva definición
  createTestDefinition(definition: CreateTestDefinitionDto): Observable<TestDefinition> {
    return this.http.post<TestDefinition>(this.apiUrl, definition, this.httpOptions)
      .pipe(
        tap(response => console.log('Test definition created:', response)),
        catchError(this.handleError)
      );
  }

  // Actualizar definición
  updateTestDefinition(id: string, definition: UpdateTestDefinitionDto): Observable<TestDefinition> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<TestDefinition>(url, definition, this.httpOptions)
      .pipe(
        tap(response => console.log('Test definition updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar definición (soft delete)
  deleteTestDefinition(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log('Test definition deleted:', id)),
        catchError(this.handleError)
      );
  }

  // Obtener definiciones activas
  getActiveTestDefinitions(): Observable<TestDefinition[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<PaginatedResponse<TestDefinition>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data : []),
      catchError(this.handleError)
    );
  }

  // Obtener definiciones por sección
  getTestDefinitionsBySection(sectionId: string): Observable<TestDefinition[]> {
    const params = new HttpParams().set('sectionId', sectionId);
    return this.http.get<PaginatedResponse<TestDefinition>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data : []),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorDetails = '';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
      errorDetails = error.error.message;
    } else if (error.status === 0) {
      // Error de conectividad
      errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      errorDetails = 'Error de conectividad';
    } else {
      // Error del servidor
      errorMessage = `Error del servidor: ${error.status}`;
      
      if (error.status === 400) {
        errorMessage = `Error 400 (Bad Request): ${error.error?.message || 'Solicitud inválida'}`;
        errorDetails = error.error?.message || error.error?.detail || 'Solicitud rechazada por el servidor';
      } else if (error.status === 404) {
        errorMessage = `Error 404 (No Encontrado): El recurso solicitado no existe`;
        errorDetails = 'El ID solicitado no fue encontrado en la base de datos';
      } else if (error.status === 500) {
        errorMessage = `Error 500 (Error Interno del Servidor)`;
        errorDetails = error.error?.message || 'Error en el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
        errorDetails = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
        errorDetails = error.message;
      }
    }
    
    console.error('Error en TestDefinitionService:', {
      mensaje: errorMessage,
      detalles: errorDetails,
      status: error.status,
      url: error.url,
      tiempoCompleto: error
    });
    
    return throwError(() => new Error(errorMessage));
  }
}
