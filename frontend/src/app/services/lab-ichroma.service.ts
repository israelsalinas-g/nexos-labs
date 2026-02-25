import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IChromaResult, UpdateIChromaResultDto } from '../models/ichroma-result.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';

@Injectable({
  providedIn: 'root'
})
export class LabIchromaService {
  private readonly apiUrl = 'http://localhost:3000/ichroma-results';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  //limit: number = 100, offset: number = 0
  getIChromaResults(limit: number = 4, offset: number = 0, patientName?: string): Observable<PaginatedResponse<IChromaResult>> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    // Agregar filtro por nombre de paciente si se proporciona
    if (patientName && patientName.trim()) {
      params = params.set('patientName', patientName.trim());
    }
    
    return this.http.get<PaginatedResponse<IChromaResult>>(this.apiUrl, { 
      ...this.httpOptions, 
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getIChromaResultById(id: number): Observable<IChromaResult> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IChromaResult>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getIChromaResultsByPatientId(patientId: string): Observable<IChromaResult[]> {
    const url = `${this.apiUrl}/patient/${patientId}`;
    return this.http.get<IChromaResult[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getIChromaResultsByTestType(testType: string): Observable<IChromaResult[]> {
    const url = `${this.apiUrl}/test-type/${testType}`;
    return this.http.get<IChromaResult[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }



  updateIChromaResult(id: number, ichromaResult: UpdateIChromaResultDto): Observable<IChromaResult> {
    const url = `${this.apiUrl}/${id}`;
    
    // Limpiar datos antes de enviar
    const cleanedData = this.cleanIChromaResultData(ichromaResult);
    
    console.log('=== DEBUG: Servicio actualizando iChroma ===');
    console.log('URL:', url);
    console.log('Datos originales:', ichromaResult);
    console.log('Datos limpiados:', cleanedData);
    
    return this.http.put<IChromaResult>(url, cleanedData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteIChromaResult(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  assignPatientToIChromaResult(resultId: number, patientId: string): Observable<IChromaResult> {
    const url = `${this.apiUrl}/${resultId}/assign-patient`;
    return this.http.patch<IChromaResult>(url, { patientId }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private cleanIChromaResultData(ichromaResult: UpdateIChromaResultDto): any {
    const cleaned: any = { ...ichromaResult };

    // Remover campos que no deben ser actualizados
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.messageType;
    delete cleaned.deviceId;
    delete cleaned.cartridgeSerial;
    delete cleaned.cartridgeLot;
    delete cleaned.humidity;
    delete cleaned.sampleBarcode;
    delete cleaned.rawMessage;
    delete cleaned.rawData;
    delete cleaned.instrumentId;

    // Limpiar campos vacíos
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

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
        errorMessage = 'Resultado iChroma no encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Contacta al administrador.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

}
