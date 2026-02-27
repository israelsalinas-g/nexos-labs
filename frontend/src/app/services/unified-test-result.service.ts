import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { UnifiedTestResult, CreateUnifiedTestResultDto, UpdateUnifiedTestResultDto } from '../models/unified-test-result.interface';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class UnifiedTestResultService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/unified-test-results`;

  upsert(
    dto: CreateUnifiedTestResultDto,
    gender?: 'M' | 'F',
    ageMonths?: number,
  ): Observable<UnifiedTestResult> {
    const params = this.getParams({
      ...(gender ? { gender } : {}),
      ...(ageMonths !== undefined ? { ageMonths } : {}),
    });
    return this.http.post<UnifiedTestResult>(this.endpoint, dto, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getByOrder(orderId: string): Observable<UnifiedTestResult[]> {
    return this.http.get<UnifiedTestResult[]>(`${this.endpoint}/by-order/${orderId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getByOrderTest(orderTestId: number): Observable<UnifiedTestResult | null> {
    return this.http.get<UnifiedTestResult | null>(`${this.endpoint}/by-order-test/${orderTestId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  update(id: number, dto: UpdateUnifiedTestResultDto): Observable<UnifiedTestResult> {
    return this.http.patch<UnifiedTestResult>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }
}
