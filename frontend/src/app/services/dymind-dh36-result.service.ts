import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DymindDh36Result } from '../models/dymind-dh36-result.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class DymindDh36ResultService {
  private readonly apiUrl = 'http://localhost:3000/dymind-dh36-results';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getDymindDh36Results(limit: number = 4, offset: number = 0, patientName?: string): Observable<PaginatedResponse<DymindDh36Result>> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    // Agregar filtro por nombre de paciente si se proporciona
    if (patientName && patientName.trim()) {
      params = params.set('patientName', patientName.trim());
    }
    
    return this.http.get<PaginatedResponse<DymindDh36Result>>(this.apiUrl, { 
      ...this.httpOptions,
      params 
    }).pipe(
        catchError(this.handleError)
      );
  }

  getDymindDh36ResultById(id: number): Observable<DymindDh36Result> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<DymindDh36Result>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getDymindDh36ResultsByPatientId(patientId: string): Observable<DymindDh36Result[]> {
    const url = `${this.apiUrl}/patient/${patientId}`;
    return this.http.get<DymindDh36Result[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getDymindDh36ResultBySampleNumber(sampleNumber: string): Observable<DymindDh36Result> {
    const url = `${this.apiUrl}/sample/${sampleNumber}`;
    return this.http.get<DymindDh36Result[]>(url, this.httpOptions)
      .pipe(
        map(results => {
          // El backend devuelve un array, pero necesitamos el primer elemento
          if (results && results.length > 0) {
            return results[0];
          }
          throw new Error('No se encontró el resultado de laboratorio');
        }),
        catchError(this.handleError)
      );
  }

  updateDymindDh36Result(id: number, result: Partial<DymindDh36Result>): Observable<DymindDh36Result> {
    const url = `${this.apiUrl}/${id}`;
    
    // Limpiar datos antes de enviar
    const cleanedData = this.cleanDymindDh36ResultData(result);
    
    console.log('=== DEBUG: Servicio actualizando DymindDh36 ===');
    console.log('URL:', url);
    console.log('Datos originales:', result);
    console.log('Datos limpiados:', cleanedData);
    console.log('Parámetros limpiados:', cleanedData.parameters);
    
    return this.http.put<DymindDh36Result>(url, cleanedData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteDymindDh36Result(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  assignPatientToDymindDh36Result(resultId: number, patientId: string): Observable<DymindDh36Result> {
    const url = `${this.apiUrl}/${resultId}/assign-patient`;
    const body = { patientId };
    
    return this.http.patch<DymindDh36Result>(url, body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private cleanDymindDh36ResultData(result: Partial<DymindDh36Result>): any {
    const cleaned: any = { ...result };

    // Remover campos que no deben ser actualizados
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.instrumentId; // Probablemente no debe ser editado
    delete cleaned.rawData; // Probablemente no debe ser editado
    delete cleaned.processingStatus; // Probablemente no debe ser editado

    // Limpiar campos vacíos
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    // Asegurar que los parámetros tengan la estructura correcta
    // Solo enviamos los campos editables: name y result
    // El backend calculará automáticamente el status basado en result y referenceRange
    if (cleaned.parameters && Array.isArray(cleaned.parameters)) {
      cleaned.parameters = cleaned.parameters.map((param: any) => ({
        name: param.name || '',
        result: param.result || ''
        // El backend recalculará automáticamente: status, unit, referenceRange
      }));
    }

    return cleaned;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error occurred:', error);
    
    let errorMessage = 'Something went wrong; please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client-side error:', error.error.message);
      errorMessage = error.error.message;
    } else {
      // Server-side error
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      
      if (error.error && error.error.message) {
        if (Array.isArray(error.error.message)) {
          // Si el mensaje es un array (errores de validación)
          errorMessage = `Errores de validación: ${error.error.message.join(', ')}`;
        } else {
          errorMessage = error.error.message;
        }
      } else if (error.status === 400) {
        errorMessage = 'Datos inválidos. Verifica los campos y vuelve a intentar.';
      } else if (error.status === 404) {
        errorMessage = 'Resultado de laboratorio no encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Contacta al administrador.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Métodos de compatibilidad con nombres anteriores
  getLabResults = () => this.getDymindDh36Results();
  getLabResultById = (id: number) => this.getDymindDh36ResultById(id);
  getLabResultsByPatientId = (patientId: string) => this.getDymindDh36ResultsByPatientId(patientId);
  getLabResultBySampleNumber = (sampleNumber: string) => this.getDymindDh36ResultBySampleNumber(sampleNumber);
  updateLabResult = (id: number, result: Partial<DymindDh36Result>) => this.updateDymindDh36Result(id, result);
  deleteLabResult = (id: number) => this.deleteDymindDh36Result(id);
}