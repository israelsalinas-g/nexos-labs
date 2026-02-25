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
  private readonly baseUrl = 'http://localhost:3000/stool-tests';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de exámenes con filtros opcionales
   */
  getStoolTests(filters: StoolTestFilters = {}): Observable<PaginatedResponse<StoolTest>> {
    let params = new HttpParams()
      .set('page', filters.page?.toString() || '1')
      .set('limit', filters.limit?.toString() || '4');

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
    // 🔍 LOG: Verificar el objeto que se envía
    console.log('📤 FRONTEND - Objeto COMPLETO enviado:', data);
    console.log('📤 FRONTEND - ¿Tiene createdById?', 'createdById' in data, 'Valor:', data.createdById);
    console.log('📤 FRONTEND - ¿Tiene doctorId?', 'doctorId' in data, 'Valor:', data.doctorId);

    // Filtrar propiedades undefined para evitar problemas de validación en el backend
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as CreateStoolTestDto;
    
    console.log('📤 FRONTEND - Objeto limpio COMPLETO:', cleanedData);
    console.log('📤 FRONTEND - Limpio ¿Tiene createdById?', 'createdById' in cleanedData, 'Valor:', cleanedData.createdById);
    console.log('📤 FRONTEND - Limpio ¿Tiene doctorId?', 'doctorId' in cleanedData, 'Valor:', cleanedData.doctorId);

    return this.http.post<StoolTest>(this.baseUrl, cleanedData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza un examen existente
   */
  updateStoolTest(id: number, data: UpdateStoolTestDto): Observable<StoolTest> {
    // 🔍 LOG: Verificar el objeto antes de enviar
    console.log('📤 FRONTEND UPDATE - Objeto COMPLETO:', data);
    console.log('📤 FRONTEND UPDATE - ¿Tiene doctorId?', 'doctorId' in data, 'Valor:', data.doctorId);
    console.log('📤 FRONTEND UPDATE - ¿Tiene reviewedById?', 'reviewedById' in data, 'Valor:', data.reviewedById);

    // Filtrar propiedades undefined para evitar problemas de validación en el backend
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as UpdateStoolTestDto;
    
    console.log('📤 FRONTEND UPDATE - Objeto limpio COMPLETO:', cleanedData);
    console.log('📤 FRONTEND UPDATE - Limpio ¿Tiene doctorId?', 'doctorId' in cleanedData, 'Valor:', cleanedData.doctorId);
    
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}`, cleanedData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina un examen
   */
  deleteStoolTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Desactiva un examen
   */
  deactivateStoolTest(id: number): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Activa un examen
   */
  activateStoolTest(id: number): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}/reactivate`, {})
      .pipe(catchError(this.handleError));
  }

  getNextSampleNumber(): Observable<{ sampleNumber: string }> {
    return this.http.get<{ sampleNumber: string }>(`${this.baseUrl}/next-sample-number`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
