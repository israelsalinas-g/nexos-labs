import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/patients`;

  // Obtener todos los pacientes con paginación
  getPatients(page: number = 1, limit: number = 7, search?: string): Observable<PaginatedResponse<Patient>> {
    const params = this.getParams({ page, limit, search });

    return this.http.get<PaginatedResponse<Patient>>(this.endpoint, { params })
      .pipe(
        tap(response => console.log('Patients loaded:', response)),
        catchError(err => this.handleError(err))
      );
  }

  // Obtener un paciente por ID
  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Obtener paciente por DNI
  getPatientByDni(dni: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.endpoint}/dni/${dni}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Buscar pacientes por nombre
  searchPatientsByName(name: string): Observable<Patient[]> {
    const params = this.getParams({ name });
    return this.http.get<Patient[]>(`${this.endpoint}/search`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  // Crear nuevo paciente
  createPatient(patient: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.endpoint, patient)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Actualizar paciente existente
  updatePatient(id: string, patient: UpdatePatientRequest): Observable<Patient> {
    return this.http.patch<Patient>(`${this.endpoint}/${id}`, patient)
      .pipe(
        tap(response => console.log('Patient updated:', response)),
        catchError(err => this.handleError(err))
      );
  }

  // Eliminar paciente (soft delete)
  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  // Activar/Desactivar paciente
  togglePatientStatus(id: string, isActive: boolean): Observable<Patient> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.http.patch<Patient>(`${this.endpoint}/${id}/${action}`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  // Validar si DNI ya existe
  validateDni(dni: string, excludeId?: string): Observable<boolean> {
    const params = this.getParams({ excludeId });
    return this.http.get<boolean>(`${this.endpoint}/validate-dni/${dni}`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  // Validar si email ya existe  
  validateEmail(email: string, excludeId?: string): Observable<boolean> {
    const params = this.getParams({ excludeId });
    return this.http.get<boolean>(`${this.endpoint}/validate-email/${encodeURIComponent(email)}`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }
}

import { catchError } from 'rxjs';