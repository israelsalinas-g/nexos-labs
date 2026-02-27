import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from '../models/promotion.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

export interface PromotionFilters {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PromotionService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/promotions`;

  getAll(filters: PromotionFilters = {}): Observable<PaginatedResponse<Promotion>> {
    const params = this.getParams(filters);
    return this.http.get<PaginatedResponse<Promotion>>(this.endpoint, { params })
      .pipe(
        map(r => ({ ...r, data: Array.isArray(r.data) ? r.data : [] })),
        catchError(err => this.handleError(err)),
      );
  }

  getAllActive(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.endpoint}/active`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  create(dto: CreatePromotionDto): Observable<Promotion> {
    return this.http.post<Promotion>(this.endpoint, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  update(id: number, dto: UpdatePromotionDto): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  toggleActive(id: number): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.endpoint}/${id}/toggle-active`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
