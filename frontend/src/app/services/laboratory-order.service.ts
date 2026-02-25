import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  LaboratoryOrder, 
  CreateLaboratoryOrderDto, 
  UpdateLaboratoryOrderDto, 
  AddTestsToOrderDto 
} from '../models/laboratory-order.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryOrderService {
  private apiUrl = 'http://localhost:3000/laboratory-orders';
  private httpOptions = {
    headers: { 'Content-Type': 'application/json' }
  };

  constructor(private http: HttpClient) { }

  // Crear nueva orden
  createOrder(dto: CreateLaboratoryOrderDto): Observable<LaboratoryOrder> {
    return this.http.post<LaboratoryOrder>(this.apiUrl, dto, this.httpOptions).pipe(
      tap(order => console.log('Orden creada:', order)),
      catchError(error => {
        console.error('Error al crear orden:', error);
        throw error;
      })
    );
  }

  // Listar órdenes con paginación y filtros
  getOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    priority?: string,
    search?: string
  ): Observable<PaginatedResponse<LaboratoryOrder>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResponse<LaboratoryOrder>>(this.apiUrl, { 
      params,
      ...this.httpOptions 
    }).pipe(
      map(response => {
        // Asegurar que data siempre es un array fresco
        const normalized: PaginatedResponse<LaboratoryOrder> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 10,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Órdenes cargadas:', response)),
      catchError(error => {
        console.error('Error al obtener órdenes:', error);
        throw error;
      })
    );
  }

  // Obtener orden por ID
  getOrderById(id: string): Observable<LaboratoryOrder> {
    return this.http.get<LaboratoryOrder>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(order => console.log('Orden obtenida:', order)),
      catchError(error => {
        console.error(`Error al obtener orden ${id}:`, error);
        throw error;
      })
    );
  }

  // Obtener orden por número
  getOrderByNumber(orderNumber: string): Observable<LaboratoryOrder> {
    return this.http.get<LaboratoryOrder>(
      `${this.apiUrl}/number/${orderNumber}`,
      this.httpOptions
    ).pipe(
      tap(order => console.log('Orden obtenida por número:', order)),
      catchError(error => {
        console.error(`Error al obtener orden ${orderNumber}:`, error);
        throw error;
      })
    );
  }

  // Actualizar orden
  updateOrder(id: string, dto: UpdateLaboratoryOrderDto): Observable<LaboratoryOrder> {
    return this.http.patch<LaboratoryOrder>(
      `${this.apiUrl}/${id}`,
      dto,
      this.httpOptions
    ).pipe(
      tap(order => console.log('Orden actualizada:', order)),
      catchError(error => {
        console.error(`Error al actualizar orden ${id}:`, error);
        throw error;
      })
    );
  }

  // Cambiar estado de orden
  updateOrderStatus(id: string, status: string): Observable<LaboratoryOrder> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<LaboratoryOrder>(
      `${this.apiUrl}/${id}/status`,
      {},
      { params, ...this.httpOptions }
    ).pipe(
      tap(order => console.log('Estado de orden actualizado:', order)),
      catchError(error => {
        console.error(`Error al cambiar estado de orden ${id}:`, error);
        throw error;
      })
    );
  }

  // Agregar pruebas a orden
  addTestsToOrder(orderId: string, dto: AddTestsToOrderDto): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${orderId}/add-tests`,
      dto,
      this.httpOptions
    ).pipe(
      tap(result => console.log('Pruebas agregadas:', result)),
      catchError(error => {
        console.error(`Error al agregar pruebas a orden ${orderId}:`, error);
        throw error;
      })
    );
  }

  // Obtener órdenes por paciente
  getOrdersByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<PaginatedResponse<LaboratoryOrder>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResponse<LaboratoryOrder>>(
      `${this.apiUrl}/patient/${patientId}`,
      { params, ...this.httpOptions }
    ).pipe(
      map(response => {
        const normalized: PaginatedResponse<LaboratoryOrder> = {
          data: Array.isArray(response.data) ? [...response.data] : [],
          total: response.total ?? 0,
          page: response.page ?? 1,
          limit: response.limit ?? 10,
          totalPages: response.totalPages ?? 0
        };
        return normalized;
      }),
      tap(response => console.log('Órdenes del paciente cargadas:', response)),
      catchError(error => {
        console.error(`Error al obtener órdenes del paciente ${patientId}:`, error);
        throw error;
      })
    );
  }

  // Obtener estadísticas
  getStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/statistics`,
      this.httpOptions
    ).pipe(
      tap(stats => console.log('Estadísticas cargadas:', stats)),
      catchError(error => {
        console.error('Error al obtener estadísticas:', error);
        throw error;
      })
    );
  }

  // Eliminar orden
  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      this.httpOptions
    ).pipe(
      tap(() => console.log('Orden eliminada:', id)),
      catchError(error => {
        console.error(`Error al eliminar orden ${id}:`, error);
        throw error;
      })
    );
  }
}
