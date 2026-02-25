import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from '../models/doctor.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/doctors`;

  getDoctors(page: number = 1, limit: number = 7, search?: string): Observable<PaginatedResponse<Doctor>> {
    const params = this.getParams({ page, limit, search });
    return this.http.get<PaginatedResponse<Doctor>>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  searchDoctorsByName(name: string): Observable<Doctor[]> {
    const params = this.getParams({ name });
    return this.http.get<Doctor[]>(`${this.endpoint}/search`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  createDoctor(doctor: CreateDoctorRequest): Observable<Doctor> {
    return this.http.post<Doctor>(this.endpoint, doctor)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateDoctor(id: string, doctor: UpdateDoctorRequest): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.endpoint}/${id}`, doctor)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  toggleDoctorStatus(id: string, isActive: boolean): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.endpoint}/${id}/toggle-active`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  getActiveDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.endpoint}/active`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getStaffDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.endpoint}/staff`)
      .pipe(catchError(err => this.handleError(err)));
  }

  validateLicenseNumber(licenseNumber: string, excludeId?: string): Observable<boolean> {
    const params = this.getParams({ excludeId });
    return this.http.get<boolean>(`${this.endpoint}/validate-license/${licenseNumber}`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  validateEmail(email: string, excludeId?: string): Observable<boolean> {
    const params = this.getParams({ excludeId });
    return this.http.get<boolean>(`${this.endpoint}/validate-email/${encodeURIComponent(email)}`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }
}
