import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LabResult } from '../models/lab-result.interface';

@Injectable({
  providedIn: 'root'
})
export class LabResultService {
  private readonly apiUrl = 'http://localhost:3000/lab-results';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getLabResults(): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(this.apiUrl, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getLabResultById(id: number): Observable<LabResult> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<LabResult>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getLabResultsByPatientId(patientId: string): Observable<LabResult[]> {
    const url = `${this.apiUrl}/patient/${patientId}`;
    return this.http.get<LabResult[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getLabResultBySampleNumber(sampleNumber: string): Observable<LabResult> {
    const url = `${this.apiUrl}/sample/${sampleNumber}`;
    return this.http.get<LabResult[]>(url, this.httpOptions)
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

  updateLabResult(id: number, labResult: Partial<LabResult>): Observable<LabResult> {
    const url = `${this.apiUrl}/${id}`;
    
    // Limpiar datos antes de enviar
    const cleanedData = this.cleanLabResultData(labResult);
    
    console.log('=== DEBUG: Servicio actualizando ===');
    console.log('URL:', url);
    console.log('Datos originales:', labResult);
    console.log('Datos limpiados:', cleanedData);
    console.log('Parámetros limpiados:', cleanedData.parameters);
    
    return this.http.put<LabResult>(url, cleanedData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteLabResult(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private cleanLabResultData(labResult: Partial<LabResult>): any {
    const cleaned: any = { ...labResult };

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
}