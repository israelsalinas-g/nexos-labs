import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:3000/patients';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los pacientes con paginación
  getPatients(page: number = 1, limit: number = 7, search?: string): Observable<PaginatedResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedResponse<Patient>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      tap(response => console.log('Patients loaded from backend:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener un paciente por ID
  getPatientById(id: string): Observable<Patient> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Patient>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener paciente por DNI
  getPatientByDni(dni: string): Observable<Patient> {
    const url = `${this.apiUrl}/dni/${dni}`;
    return this.http.get<Patient>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Buscar pacientes por nombre
  searchPatientsByName(name: string): Observable<Patient[]> {
    const url = `${this.apiUrl}/search?name=${encodeURIComponent(name)}`;
    return this.http.get<Patient[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nuevo paciente
  createPatient(patient: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar paciente existente
  updatePatient(id: string, patient: UpdatePatientRequest): Observable<Patient> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<Patient>(url, patient, this.httpOptions)
      .pipe(
        tap(response => console.log('Patient updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar paciente (soft delete)
  deletePatient(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Activar/Desactivar paciente
  togglePatientStatus(id: string, isActive: boolean): Observable<Patient> {
    if (isActive) {
      // Activar paciente
      const url = `${this.apiUrl}/${id}/activate`;
      return this.http.patch<Patient>(url, {}, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    } else {
      // Desactivar paciente
      const url = `${this.apiUrl}/${id}/deactivate`;
      return this.http.patch<Patient>(url, {}, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  // Obtener pacientes activos solamente
  getActivePatients(): Observable<Patient[]> {
    const url = `${this.apiUrl}/active`;
    return this.http.get<Patient[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Validar si DNI ya existe
  validateDni(dni: string, excludeId?: string): Observable<boolean> {
    let url = `${this.apiUrl}/validate-dni/${dni}`;
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Validar si email ya existe  
  validateEmail(email: string, excludeId?: string): Observable<boolean> {
    let url = `${this.apiUrl}/validate-email/${encodeURIComponent(email)}`;
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Error en PatientService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}