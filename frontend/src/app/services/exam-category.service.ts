import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map } from 'rxjs';
import { ExamCategory, CreateExamCategoryDto, UpdateExamCategoryDto } from '../models/exam-category.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ExamCategoryService {
  private readonly apiUrl = 'http://localhost:3000/exam-categories';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Listar categorías con paginación
  getExamCategories(query?: PaginationQuery): Observable<PaginatedResponse<ExamCategory>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    }

    return this.http.get<PaginatedResponse<ExamCategory>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      tap(response => console.log('Exam categories loaded:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener una categoría por ID
  getExamCategoryById(id: string): Observable<ExamCategory> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ExamCategory>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nueva categoría
  createExamCategory(category: CreateExamCategoryDto): Observable<ExamCategory> {
    return this.http.post<ExamCategory>(this.apiUrl, category, this.httpOptions)
      .pipe(
        tap(response => console.log('Exam category created:', response)),
        catchError(this.handleError)
      );
  }

  // Actualizar categoría
  updateExamCategory(id: string, category: UpdateExamCategoryDto): Observable<ExamCategory> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<ExamCategory>(url, category, this.httpOptions)
      .pipe(
        tap(response => console.log('Exam category updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar categoría (soft delete)
  deleteExamCategory(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log('Exam category deleted:', id)),
        catchError(this.handleError)
      );
  }

  // Obtener categorías activas
  getActiveExamCategories(): Observable<ExamCategory[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<PaginatedResponse<ExamCategory>>(this.apiUrl, { 
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
    
    console.error('Error en ExamCategoryService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
