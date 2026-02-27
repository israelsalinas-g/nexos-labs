import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { BaseService } from './base.service';
import { TestReferenceRange, CreateTestReferenceRangeDto, UpdateTestReferenceRangeDto } from '../models/test-reference-range.interface';

@Injectable({ providedIn: 'root' })
export class TestReferenceRangeService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/test-reference-ranges`;

  getByTestDefinition(testDefinitionId: string): Observable<TestReferenceRange[]> {
    return this.http.get<TestReferenceRange[]>(`${this.endpoint}/by-test/${testDefinitionId}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getApplicable(testDefinitionId: string, gender: string, ageInMonths: number): Observable<TestReferenceRange | null> {
    const params = this.getParams({ testDefinitionId, gender, ageInMonths });
    return this.http.get<TestReferenceRange | null>(`${this.endpoint}/applicable`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  create(dto: CreateTestReferenceRangeDto): Observable<TestReferenceRange> {
    return this.http.post<TestReferenceRange>(this.endpoint, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  update(id: number, dto: UpdateTestReferenceRangeDto): Observable<TestReferenceRange> {
    return this.http.patch<TestReferenceRange>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
