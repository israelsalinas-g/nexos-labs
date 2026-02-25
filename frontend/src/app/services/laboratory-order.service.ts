import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import {
  LaboratoryOrder,
  CreateLaboratoryOrderDto,
  UpdateLaboratoryOrderDto,
  AddTestsToOrderDto
} from '../models/laboratory-order.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryOrderService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/laboratory-orders`;

  createOrder(dto: CreateLaboratoryOrderDto): Observable<LaboratoryOrder> {
    return this.http.post<LaboratoryOrder>(this.endpoint, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  getOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    priority?: string,
    search?: string
  ): Observable<PaginatedResponse<LaboratoryOrder>> {
    const params = this.getParams({ page, limit, status, priority, search });
    return this.http.get<PaginatedResponse<LaboratoryOrder>>(this.endpoint, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  getOrderById(id: string): Observable<LaboratoryOrder> {
    return this.http.get<LaboratoryOrder>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getOrderByNumber(orderNumber: string): Observable<LaboratoryOrder> {
    return this.http.get<LaboratoryOrder>(`${this.endpoint}/number/${orderNumber}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateOrder(id: string, dto: UpdateLaboratoryOrderDto): Observable<LaboratoryOrder> {
    return this.http.patch<LaboratoryOrder>(`${this.endpoint}/${id}`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateOrderStatus(id: string, status: string): Observable<LaboratoryOrder> {
    const params = this.getParams({ status });
    return this.http.patch<LaboratoryOrder>(`${this.endpoint}/${id}/status`, {}, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  addTestsToOrder(orderId: string, dto: AddTestsToOrderDto): Observable<any> {
    return this.http.post<any>(`${this.endpoint}/${orderId}/add-tests`, dto)
      .pipe(catchError(err => this.handleError(err)));
  }

  getOrdersByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<PaginatedResponse<LaboratoryOrder>> {
    const params = this.getParams({ page, limit, status });
    return this.http.get<PaginatedResponse<LaboratoryOrder>>(`${this.endpoint}/patient/${patientId}`, { params })
      .pipe(
        map(response => ({
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        })),
        catchError(err => this.handleError(err))
      );
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/statistics`)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
