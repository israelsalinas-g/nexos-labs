import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { TestProfile, CreateTestProfileDto, UpdateTestProfileDto } from '../models/test-profile.interface';
import { PaginatedResponse, PaginationQuery } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

export interface TestProfileFilters extends PaginationQuery {
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestProfileService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-profiles`;

  getTestProfiles(filters?: TestProfileFilters): Observable<PaginatedResponse<TestProfile>> {
    const params = this.getParams(filters || {});
    return this.http.get<PaginatedResponse<TestProfile>>(this.endpoint, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  getTestProfileById(id: string): Observable<TestProfile> {
    return this.http.get<TestProfile>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getTestProfileByCode(code: string): Observable<TestProfile> {
    return this.http.get<TestProfile>(`${this.endpoint}/code/${code}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  createTestProfile(profile: CreateTestProfileDto): Observable<TestProfile> {
    return this.http.post<TestProfile>(this.endpoint, profile)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateTestProfile(id: string, profile: UpdateTestProfileDto): Observable<TestProfile> {
    return this.http.patch<TestProfile>(`${this.endpoint}/${id}`, profile)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteTestProfile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getActiveTestProfiles(): Observable<TestProfile[]> {
    const params = this.getParams({ isActive: true });
    return this.http.get<PaginatedResponse<TestProfile>>(this.endpoint, { params })
      .pipe(
        map(response => Array.isArray(response.data) ? response.data : []),
        catchError(err => this.handleError(err))
      );
  }
}
