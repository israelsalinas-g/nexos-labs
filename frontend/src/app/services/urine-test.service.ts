import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  UrineTest, 
  CreateUrineTestDto, 
  UpdateUrineTestDto,
  MedicalReport,
  UrineTestFilters
} from '../models/urine-test.interface';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { EscasaModeradaAbundanteAusenteQuantity } from '../enums/escasa-moderada-abundante-ausente.enums';

@Injectable({
  providedIn: 'root'
})
export class UrineTestService {
  private readonly apiUrl = 'http://localhost:3000/urine-tests';
  
  private httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  constructor(private http: HttpClient) {}

  // Crear examen de orina
  createUrineTest(urineTest: CreateUrineTestDto): Observable<UrineTest> {
    // 🔍 LOG: Verificar el objeto que se envía
    console.log('📤 FRONTEND - Objeto COMPLETO enviado:', urineTest);
    console.log('📤 FRONTEND - ¿Tiene createdById?', 'createdById' in urineTest, 'Valor:', urineTest.createdById);
    console.log('📤 FRONTEND - ¿Tiene doctorId?', 'doctorId' in urineTest, 'Valor:', urineTest.doctorId);

    // Filtrar propiedades undefined para evitar problemas de validación en el backend
    const cleanedData = Object.fromEntries(
      Object.entries(urineTest).filter(([_, value]) => value !== undefined)
    ) as CreateUrineTestDto;
    
    console.log('📤 FRONTEND - Objeto limpio COMPLETO:', cleanedData);
    console.log('📤 FRONTEND - Limpio ¿Tiene createdById?', 'createdById' in cleanedData, 'Valor:', cleanedData.createdById);
    console.log('📤 FRONTEND - Limpio ¿Tiene doctorId?', 'doctorId' in cleanedData, 'Valor:', cleanedData.doctorId);

    return this.http.post<UrineTest>(this.apiUrl, cleanedData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener todos los exámenes con filtros y paginación
  getUrineTests(filters?: UrineTestFilters): Observable<PaginatedResponse<UrineTest>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = this.apiUrl;
    console.log('Fetching urine tests from:', url, 'with params:', params.toString());
    
    return this.http.get<PaginatedResponse<UrineTest>>(url, { 
      ...this.httpOptions, 
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener examen por ID
  getUrineTestById(id: string): Observable<UrineTest> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching urine test by ID from:', url);
    return this.http.get<UrineTest>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener exámenes por paciente
  getUrineTestsByPatientId(patientId: string): Observable<UrineTest[]> {
    const url = `${this.apiUrl}/patient/${patientId}`;
    console.log('Fetching urine tests by patient ID from:', url);
    return this.http.get<UrineTest[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar examen
  updateUrineTest(id: string, updates: UpdateUrineTestDto): Observable<UrineTest> {
    const url = `${this.apiUrl}/${id}`;
    
    // 🔍 LOG: Verificar el objeto antes de enviar
    console.log('📤 FRONTEND UPDATE - Objeto COMPLETO:', updates);
    console.log('📤 FRONTEND UPDATE - ¿Tiene doctorId?', 'doctorId' in updates, 'Valor:', updates.doctorId);
    console.log('📤 FRONTEND UPDATE - ¿Tiene reviewedById?', 'reviewedById' in updates, 'Valor:', updates.reviewedById);

    // Filtrar propiedades undefined para evitar problemas de validación en el backend
    const cleanedData = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    ) as UpdateUrineTestDto;
    
    console.log('📤 FRONTEND UPDATE - Objeto limpio COMPLETO:', cleanedData);
    console.log('📤 FRONTEND UPDATE - Limpio ¿Tiene doctorId?', 'doctorId' in cleanedData, 'Valor:', cleanedData.doctorId);

    return this.http.patch<UrineTest>(url, cleanedData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Marcar como completado
  markAsCompleted(id: string, reviewedBy?: string): Observable<UrineTest> {
    let params = new HttpParams();
    if (reviewedBy) {
      params = params.set('reviewedBy', reviewedBy);
    }

    const url = `${this.apiUrl}/${id}/complete`;
    console.log('Marking urine test as completed:', url);
    return this.http.patch<UrineTest>(url, {}, { 
      ...this.httpOptions, 
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Desactivar examen
  deactivateUrineTest(id: string): Observable<UrineTest> {
    const url = `${this.apiUrl}/${id}/deactivate`;
    return this.http.patch<UrineTest>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Activar examen
  activateUrineTest(id: string): Observable<UrineTest> {
    const url = `${this.apiUrl}/${id}/reactivate`;
    return this.http.patch<UrineTest>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

   // Obtener exámenes pendientes de revisión
  getPendingReview(): Observable<UrineTest[]> {
    const url = `${this.apiUrl}/pending-review`;
    console.log('Fetching pending review urine tests from:', url);
    return this.http.get<UrineTest[]>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener reporte médico
  getMedicalReport(id: string): Observable<MedicalReport> {
    const url = `${this.apiUrl}/${id}/medical-report`;
    console.log('Fetching medical report from:', url);
    return this.http.get<MedicalReport>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Buscar exámenes con texto libre
  searchUrineTests(query: string, filters?: Partial<UrineTestFilters>): Observable<UrineTest[]> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiUrl}/search`;
    console.log('Searching urine tests:', url, query);
    return this.http.get<UrineTest[]>(url, { 
      ...this.httpOptions, 
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener exámenes con resultados anormales
  getAbnormalResults(filters?: Partial<UrineTestFilters>): Observable<UrineTest[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiUrl}/abnormal`;
    console.log('Fetching abnormal urine tests from:', url);
    return this.http.get<UrineTest[]>(url, { 
      ...this.httpOptions, 
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Duplicar examen (crear uno nuevo basado en otro)
  duplicateUrineTest(id: string, newPatientId?: string, newTestDate?: string): Observable<UrineTest> {
    const body: any = {};
    if (newPatientId) body.patientId = newPatientId;
    if (newTestDate) body.testDate = newTestDate;

    const url = `${this.apiUrl}/${id}/duplicate`;
    console.log('Duplicating urine test:', url, body);
    return this.http.post<UrineTest>(url, body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Validar datos del examen antes de enviar
  validateUrineTestData(data: CreateUrineTestDto | UpdateUrineTestDto): string[] {
    const errors: string[] = [];

    // Validaciones básicas
    if ('patientId' in data && !data.patientId) {
      errors.push('El ID del paciente es requerido');
    }

    if ('testDate' in data && data.testDate) {
      const testDate = new Date(data.testDate);
      const today = new Date();
      if (testDate > today) {
        errors.push('La fecha del examen no puede ser futura');
      }
    }

    // Validar formato de volumen
    if (data.volume && !/^\d+(\.\d+)?\s*(ml|mL|ML)$/.test(data.volume)) {
      errors.push('El formato del volumen debe ser: "60 ml" o "50.5 mL"');
    }

    // Validar campos microscópicos - erythrocytes ya no existe

    return errors;
  }

  // Verificar si un examen tiene resultados anormales
  hasAbnormalResults(urineTest: UrineTest): boolean {
    const abnormalResults = [
      'Positivo +', 'Positivo ++', 'Positivo +++', 'Positivo ++++'
    ];

    return !!(
      (urineTest.protein && abnormalResults.includes(urineTest.protein)) ||
      (urineTest.glucose && abnormalResults.includes(urineTest.glucose)) ||
      (urineTest.bilirubin && abnormalResults.includes(urineTest.bilirubin)) ||
      (urineTest.ketones && abnormalResults.includes(urineTest.ketones)) ||
      (urineTest.occultBlood && abnormalResults.includes(urineTest.occultBlood)) ||
      (urineTest.leukocytes && abnormalResults.includes(urineTest.leukocytes)) ||
      (urineTest.nitrites && urineTest.nitrites === 'Positivo') ||
      (urineTest.bacteria && urineTest.bacteria === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE) ||
      (urineTest.crystals && urineTest.crystals.length > 0) ||
      (urineTest.cylinders && urineTest.cylinders.length > 0)
    );
  }

  // Manejo de errores
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido al procesar la solicitud';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      console.error('Error response:', error);
      
      if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose en http://localhost:3000';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos en la solicitud';
      } else if (error.status === 404) {
        errorMessage = `Recurso no encontrado: ${error.error?.message || 'Examen de orina no encontrado'}`;
      } else if (error.status === 409) {
        errorMessage = 'Ya existe un examen para este paciente en la fecha especificada';
      } else if (error.status === 422) {
        errorMessage = 'Los datos proporcionados no son válidos';
      } else if (error.status === 500) {
        errorMessage = `Error interno del servidor: ${error.error?.message || 'Contacta al administrador.'}`;
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }
    
    console.error('Error en UrineTestService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
