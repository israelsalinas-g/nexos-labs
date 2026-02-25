import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from '../models/doctor.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly apiUrl = 'http://localhost:3000/doctors';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los médicos con paginación
  getDoctors(page: number = 1, limit: number = 7, search?: string): Observable<PaginatedResponse<Doctor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedResponse<Doctor>>(this.apiUrl, { 
      params, 
      ...this.httpOptions 
    }).pipe(
      tap(response => console.log('Doctors loaded from backend:', response)),
      catchError(this.handleError)
    );
  }

  // Obtener un médico por ID
  getDoctorById(id: string): Observable<Doctor> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Doctor>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Buscar médicos por nombre
  searchDoctorsByName(name: string): Observable<Doctor[]> {
    const url = `${this.apiUrl}/search?name=${encodeURIComponent(name)}`;
    return this.http.get<Doctor[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear nuevo médico
  createDoctor(doctor: CreateDoctorRequest): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor, this.httpOptions)
      .pipe(
        tap(response => console.log('Doctor created:', response)),
        catchError(this.handleError)
      );
  }

  // Actualizar médico existente
  updateDoctor(id: string, doctor: UpdateDoctorRequest): Observable<Doctor> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<Doctor>(url, doctor, this.httpOptions)
      .pipe(
        tap(response => console.log('Doctor updated:', response)),
        catchError(this.handleError)
      );
  }

  // Eliminar médico (soft delete)
  deleteDoctor(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Activar/Desactivar médico
  toggleDoctorStatus(id: string, isActive: boolean): Observable<Doctor> {
    const url = `${this.apiUrl}/${id}/toggle-active`;
    return this.http.patch<Doctor>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener médicos activos solamente
  getActiveDoctors(): Observable<Doctor[]> {
    const url = `${this.apiUrl}/active`;
    return this.http.get<Doctor[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener médicos del staff
  getStaffDoctors(): Observable<Doctor[]> {
    const url = `${this.apiUrl}/staff`;
    return this.http.get<Doctor[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Validar si el número de licencia ya existe
  validateLicenseNumber(licenseNumber: string, excludeId?: string): Observable<boolean> {
    let url = `${this.apiUrl}/validate-license/${licenseNumber}`;
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
    
    console.error('Error en DoctorService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
