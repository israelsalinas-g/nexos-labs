# Frontend Integration Guide - Exámenes de Orina API

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Configuración Base](#configuración-base)
- [Interfaces TypeScript](#interfaces-typescript)
- [Enums Médicos](#enums-médicos)
- [Servicios Angular](#servicios-angular)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Formularios Angular](#formularios-angular)
- [Validaciones](#validaciones)

---

## 📌 Información General

**Base URL**: `http://localhost:3000`  
**Swagger Documentation**: `http://localhost:3000/api`  
**Prefijo API**: `/urine-tests`

### Características del Sistema
- ✅ CRUD completo para exámenes de orina
- ✅ Enumeraciones médicas según estándares de laboratorio
- ✅ **Registros parciales**: Permite guardar exámenes incompletos
- ✅ **Validación automática de completitud**: Estado se actualiza automáticamente
- ✅ Filtros avanzados por paciente, fecha, estado
- ✅ Estadísticas y reportes médicos
- ✅ Validaciones médicas automáticas
- ✅ Documentación Swagger completa

### Lógica de Estado Automática
El sistema maneja automáticamente el estado de los exámenes:

- **`pending`**: Examen incompleto (faltan campos médicos)
- **`completed`**: Examen completo (todos los campos médicos llenos)
- **Error**: Si se intenta marcar como `completed` manualmente pero faltan campos obligatorios

**Campos obligatorios para completitud:**
- Examen Físico: volumen, color, aspecto, sedimento, densidad
- Examen Químico: pH, proteína, glucosa, bilirrubinas, cetonas, sangre oculta, nitritos, urobilinógeno, leucocitos
- Examen Microscópico: células epiteliales, leucocitos por campo, eritrocitos por campo, bacterias, filamentos mucosos, cristales, levaduras, cilindros

---

## ⚙️ Configuración Base

### 1. Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  endpoints: {
    urineTests: '/urine-tests',
    patients: '/patients'
  }
};
```

### 2. HTTP Interceptor (Opcional)

```typescript
// src/app/interceptors/api.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const apiReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return next.handle(apiReq);
  }
}
```

---

## 🔧 Interfaces TypeScript

### Interface Principal - Examen de Orina

```typescript
// src/app/interfaces/urine-test.interface.ts

export interface UrineTest {
  id: string;
  patient?: Patient;
  patientId: string;
  testDate: string; // ISO string
  emissionDate: string; // ISO string
  
  // Examen Físico
  volume?: string;
  color?: UrineColor;
  aspect?: UrineAspect;
  sediment?: UrineSediment;
  
  // Examen Químico
  density?: UrineDensity;
  ph?: UrinePH;
  protein?: UrineTestResult;
  glucose?: UrineTestResult;
  bilirubin?: UrineTestResult;
  ketones?: UrineTestResult;
  occultBlood?: UrineTestResult;
  nitrites?: PositiveNegative;
  urobilinogen?: Urobilinogen;
  leukocytes?: UrineTestResult;
  
  // Examen Microscópico
  epithelialCells?: MicroscopicQuantity;
  leukocytesField?: string;
  erythrocytesField?: string;
  bacteria?: MicroscopicQuantity;
  mucousFilaments?: MicroscopicQuantity;
  crystals?: NotObserved;
  yeasts?: MicroscopicQuantity;
  cylinders?: NotObserved;
  others?: string;
  
  // Metadatos
  observations?: string;
  status: string;
  performedBy?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### DTOs para Crear/Actualizar

```typescript
// src/app/interfaces/urine-test-dto.interface.ts

export interface CreateUrineTestDto {
  // Campos obligatorios
  patientId: string;
  testDate: string;
  
  // Campos opcionales
  emissionDate?: string;
  
  // Examen Físico (todos opcionales - pero necesarios para completitud)
  volume?: string;
  color?: UrineColor;
  aspect?: UrineAspect;
  sediment?: UrineSediment;
  density?: UrineDensity;
  
  // Examen Químico (todos opcionales - pero necesarios para completitud)
  ph?: UrinePH;
  protein?: UrineTestResult;
  glucose?: UrineTestResult;
  bilirubin?: UrineTestResult;
  ketones?: UrineTestResult;
  occultBlood?: UrineTestResult;
  nitrites?: PositiveNegative;
  urobilinogen?: Urobilinogen;
  leukocytes?: UrineTestResult;
  
  // Examen Microscópico (todos opcionales - pero necesarios para completitud)
  epithelialCells?: MicroscopicQuantity;
  leukocytesField?: string;
  erythrocytesField?: string;
  bacteria?: MicroscopicQuantity;
  mucousFilaments?: MicroscopicQuantity;
  crystals?: NotObserved;
  yeasts?: MicroscopicQuantity;
  cylinders?: NotObserved;
  
  // Campos adicionales opcionales
  others?: string;
  
  // Metadatos (todos opcionales)
  observations?: string;
  status?: string;
  performedBy?: string;
  reviewedBy?: string;
}

export interface UpdateUrineTestDto extends Partial<CreateUrineTestDto> {}
```

### Interface de Respuesta Paginada

```typescript
// src/app/interfaces/paginated-response.interface.ts

export interface PaginatedUrineTestResponse {
  data: UrineTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Interface de Estadísticas

```typescript
// src/app/interfaces/urine-test-stats.interface.ts

export interface UrineTestStatistics {
  total: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  byPerformedBy: Array<{
    performedBy: string;
    count: number;
  }>;
  recent: number; // últimos 7 días
}
```

### Interface de Reporte Médico

```typescript
// src/app/interfaces/medical-report.interface.ts

export interface MedicalReport {
  urineTest: UrineTest;
  interpretation: string;
  abnormalFindings: string[];
}
```

---

## 🔬 Enums Médicos

```typescript
// src/app/enums/urine-test.enums.ts

// Examen Físico
export enum UrineColor {
  AMARILLO = 'Amarillo',
  AMBAR = 'Ambar',
  CAFE = 'Café',
  ROJIZO = 'Rojizo',
  ROJO = 'Rojo',
  NARANJA = 'Naranja'
}

export enum UrineAspect {
  TRANSPARENTE = 'Transparente',
  LIGERAMENTE_TURBIO = 'Ligeramente Turbio',
  TURBIO = 'Turbio'
}

export enum UrineSediment {
  ESCASO = 'Escaso',
  MODERADO = 'Moderado',
  ABUNDANTE = 'Abundante'
}

// Examen Químico
export enum UrineDensity {
  D1000 = '1.000',
  D1005 = '1.005',
  D1010 = '1.010',
  D1015 = '1.015',
  D1020 = '1.020',
  D1025 = '1.025',
  D1030 = '1.030'
}

export enum UrinePH {
  PH50 = '5.0',
  PH60 = '6.0',
  PH65 = '6.5',
  PH70 = '7.0',
  PH80 = '8.0',
  PH90 = '9.0'
}

export enum UrineTestResult {
  NEGATIVO = 'Negativo',
  POSITIVO_1 = 'Positivo +',
  POSITIVO_2 = 'Positivo ++',
  POSITIVO_3 = 'Positivo +++',
  POSITIVO_4 = 'Positivo ++++'
}

export enum PositiveNegative {
  POSITIVO = 'Positivo',
  NEGATIVO = 'Negativo'
}

export enum Urobilinogen {
  U01 = '0.1 mg/dl',
  U16 = '16 mg/dl',
  U33 = '33 mg/dl',
  U66 = '66 mg/dl',
  U131 = '131 mg/dl'
}

// Examen Microscópico
export enum MicroscopicQuantity {
  ESCASA = 'Escasa',
  MODERADA = 'Moderada',
  ABUNDANTE = 'Abundante'
}

export enum NotObserved {
  NO_SE_OBSERVA = 'No se observa'
}
```

### Helpers para Enums

```typescript
// src/app/utils/enum-helpers.ts

export class EnumHelpers {
  static getEnumValues<T>(enumObject: T): Array<keyof T> {
    return Object.keys(enumObject) as Array<keyof T>;
  }
  
  static getEnumEntries<T>(enumObject: T): Array<{key: string, value: string}> {
    return Object.entries(enumObject).map(([key, value]) => ({key, value}));
  }
  
  // Para usar en selects de Angular
  static getSelectOptions<T>(enumObject: T): Array<{value: string, label: string}> {
    return Object.entries(enumObject).map(([key, value]) => ({
      value: value as string,
      label: value as string
    }));
  }
}

// Uso en componente:
// colorOptions = EnumHelpers.getSelectOptions(UrineColor);
```

---

## 📡 Servicios Angular

### Servicio Principal de Exámenes de Orina

```typescript
// src/app/services/urine-test.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  UrineTest, 
  CreateUrineTestDto, 
  UpdateUrineTestDto,
  PaginatedUrineTestResponse,
  UrineTestStatistics,
  MedicalReport
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UrineTestService {
  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.urineTests}`;

  constructor(private http: HttpClient) {}

  // Crear examen
  create(urineTest: CreateUrineTestDto): Observable<UrineTest> {
    return this.http.post<UrineTest>(this.baseUrl, urineTest);
  }

  // Obtener todos con filtros
  getAll(filters?: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<PaginatedUrineTestResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<PaginatedUrineTestResponse>(this.baseUrl, { params });
  }

  // Obtener por ID
  getById(id: string): Observable<UrineTest> {
    return this.http.get<UrineTest>(`${this.baseUrl}/${id}`);
  }

  // Obtener por paciente
  getByPatient(patientId: string): Observable<UrineTest[]> {
    return this.http.get<UrineTest[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  // Actualizar
  update(id: string, updates: UpdateUrineTestDto): Observable<UrineTest> {
    return this.http.patch<UrineTest>(`${this.baseUrl}/${id}`, updates);
  }

  // Marcar como completado
  markAsCompleted(id: string, reviewedBy?: string): Observable<UrineTest> {
    const params = reviewedBy ? new HttpParams().set('reviewedBy', reviewedBy) : undefined;
    return this.http.patch<UrineTest>(`${this.baseUrl}/${id}/complete`, {}, { params });
  }

  // Eliminar
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Estadísticas
  getStatistics(): Observable<UrineTestStatistics> {
    return this.http.get<UrineTestStatistics>(`${this.baseUrl}/statistics`);
  }

  // Pendientes de revisión
  getPendingReview(): Observable<UrineTest[]> {
    return this.http.get<UrineTest[]>(`${this.baseUrl}/pending-review`);
  }

  // Reporte médico
  getMedicalReport(id: string): Observable<MedicalReport> {
    return this.http.get<MedicalReport>(`${this.baseUrl}/${id}/medical-report`);
  }
}
```

---

## 🌐 Endpoints Disponibles

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/urine-tests` | Crear examen | Body: `CreateUrineTestDto` |
| `GET` | `/urine-tests` | Listar exámenes | Query: `page`, `limit`, `patientId`, `status`, `dateFrom`, `dateTo` |
| `GET` | `/urine-tests/statistics` | Estadísticas | - |
| `GET` | `/urine-tests/pending-review` | Pendientes de revisión | - |
| `GET` | `/urine-tests/patient/:patientId` | Exámenes por paciente | Path: `patientId` (UUID) |
| `GET` | `/urine-tests/:id` | Examen por ID | Path: `id` (UUID) |
| `GET` | `/urine-tests/:id/medical-report` | Reporte médico | Path: `id` (UUID) |
| `PATCH` | `/urine-tests/:id` | Actualizar examen | Path: `id`, Body: `UpdateUrineTestDto` |
| `PATCH` | `/urine-tests/:id/complete` | Marcar completado | Path: `id`, Query: `reviewedBy` |
| `DELETE` | `/urine-tests/:id` | Eliminar examen | Path: `id` (UUID) |

---

## 💻 Ejemplos de Uso

### 1. Manejo de Estados Automático

```typescript
// Ejemplo de manejo de estado automático
const partialUrine: CreateUrineTestDto = {
  patientId: 'uuid-here',
  testDate: '2025-09-27',
  volume: '60 ml',
  color: UrineColor.AMARILLO
  // Faltan muchos campos - estado será 'pending'
};

// El sistema automáticamente asignará status: 'pending'
service.create(partialUrine).subscribe(result => {
  console.log(result.status); // 'pending'
});

// Si intentamos forzar como completado sin campos necesarios:
const forceCompleted = { ...partialUrine, status: 'completed' };
service.create(forceCompleted).subscribe({
  error: (err) => {
    // Error: No se puede marcar como completado: faltan campos obligatorios
  }
});

// Examen completo se marca automáticamente como completado:
const completeUrine: CreateUrineTestDto = {
  patientId: 'uuid-here',
  testDate: '2025-09-27',
  // ... todos los campos físicos, químicos y microscópicos completos
};

service.create(completeUrine).subscribe(result => {
  console.log(result.status); // 'completed' (automático)
});
```

### 2. Crear Examen de Orina

```typescript
// src/app/components/create-urine-test/create-urine-test.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UrineTestService } from '../../services/urine-test.service';
import { CreateUrineTestDto, UrineColor, UrineTestResult } from '../../interfaces';

@Component({
  selector: 'app-create-urine-test',
  templateUrl: './create-urine-test.component.html'
})
export class CreateUrineTestComponent {
  form: FormGroup;
  loading = false;
  
  // Opciones para selects
  colorOptions = Object.entries(UrineColor).map(([key, value]) => ({value, label: value}));
  resultOptions = Object.entries(UrineTestResult).map(([key, value]) => ({value, label: value}));

  constructor(
    private fb: FormBuilder,
    private urineTestService: UrineTestService
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patientId: ['', [Validators.required]],
      testDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      
      // Examen Físico
      volume: [''],
      color: [''],
      aspect: [''],
      sediment: [''],
      
      // Examen Químico
      density: [''],
      ph: [''],
      protein: [''],
      glucose: [''],
      bilirubin: [''],
      ketones: [''],
      occultBlood: [''],
      nitrites: [''],
      urobilinogen: [''],
      leukocytes: [''],
      
      // Examen Microscópico
      epithelialCells: [''],
      leukocytesField: [''],
      erythrocytesField: [''],
      bacteria: [''],
      mucousFilaments: [''],
      crystals: [''],
      yeasts: [''],
      cylinders: [''],
      others: [''],
      
      // Metadatos
      observations: [''],
      performedBy: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formData: CreateUrineTestDto = this.form.value;
      
      this.urineTestService.create(formData).subscribe({
        next: (result) => {
          console.log('Examen creado:', result);
          this.loading = false;
          // Redirigir o mostrar mensaje de éxito
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        }
      });
    }
  }
}
```

### 2. Listar Exámenes con Filtros

```typescript
// src/app/components/urine-test-list/urine-test-list.component.ts

import { Component, OnInit } from '@angular/core';
import { UrineTestService } from '../../services/urine-test.service';
import { UrineTest, PaginatedUrineTestResponse } from '../../interfaces';

@Component({
  selector: 'app-urine-test-list',
  templateUrl: './urine-test-list.component.html'
})
export class UrineTestListComponent implements OnInit {
  urineTests: UrineTest[] = [];
  loading = false;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filtros
  filters = {
    patientId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(private urineTestService: UrineTestService) {}

  ngOnInit(): void {
    this.loadUrineTests();
  }

  loadUrineTests(): void {
    this.loading = true;
    
    const queryFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    };

    this.urineTestService.getAll(queryFilters).subscribe({
      next: (response: PaginatedUrineTestResponse) => {
        this.urineTests = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading urine tests:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUrineTests();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset a primera página
    this.loadUrineTests();
  }

  deleteUrineTest(id: string): void {
    if (confirm('¿Está seguro de eliminar este examen?')) {
      this.urineTestService.delete(id).subscribe({
        next: () => {
          this.loadUrineTests(); // Recargar lista
        },
        error: (error) => {
          console.error('Error deleting urine test:', error);
        }
      });
    }
  }
}
```

### 3. Ver Estadísticas

```typescript
// src/app/components/urine-test-stats/urine-test-stats.component.ts

import { Component, OnInit } from '@angular/core';
import { UrineTestService } from '../../services/urine-test.service';
import { UrineTestStatistics } from '../../interfaces';

@Component({
  selector: 'app-urine-test-stats',
  templateUrl: './urine-test-stats.component.html'
})
export class UrineTestStatsComponent implements OnInit {
  statistics: UrineTestStatistics | null = null;
  loading = false;

  constructor(private urineTestService: UrineTestService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    
    this.urineTestService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      }
    });
  }
}
```

---

## 📝 Formularios Angular

### Template de Formulario Reactivo

```html
<!-- src/app/components/create-urine-test/create-urine-test.component.html -->

<form [formGroup]="form" (ngSubmit)="onSubmit()" class="urine-test-form">
  <!-- Información Básica -->
  <section class="form-section">
    <h3>Información del Examen</h3>
    
    <div class="form-group">
      <label for="patientId">Paciente *</label>
      <select id="patientId" formControlName="patientId" class="form-control" required>
        <option value="">Seleccione un paciente...</option>
        <!-- Opciones de pacientes -->
      </select>
    </div>
    
    <div class="form-group">
      <label for="testDate">Fecha del Examen *</label>
      <input id="testDate" type="date" formControlName="testDate" class="form-control" required>
    </div>
  </section>

  <!-- Examen Físico -->
  <section class="form-section">
    <h3>Examen Físico</h3>
    
    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="volume">Volumen</label>
        <input id="volume" type="text" formControlName="volume" class="form-control" placeholder="ej: 60 ml">
      </div>
      
      <div class="form-group col-md-6">
        <label for="color">Color</label>
        <select id="color" formControlName="color" class="form-control">
          <option value="">Seleccione...</option>
          <option *ngFor="let option of colorOptions" [value]="option.value">
            {{option.label}}
          </option>
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="aspect">Aspecto</label>
        <select id="aspect" formControlName="aspect" class="form-control">
          <option value="">Seleccione...</option>
          <option value="Transparente">Transparente</option>
          <option value="Ligeramente Turbio">Ligeramente Turbio</option>
          <option value="Turbio">Turbio</option>
        </select>
      </div>
      
      <div class="form-group col-md-6">
        <label for="sediment">Sedimento</label>
        <select id="sediment" formControlName="sediment" class="form-control">
          <option value="">Seleccione...</option>
          <option value="Escaso">Escaso</option>
          <option value="Moderado">Moderado</option>
          <option value="Abundante">Abundante</option>
        </select>
      </div>
    </div>
  </section>

  <!-- Examen Químico -->
  <section class="form-section">
    <h3>Examen Químico</h3>
    
    <div class="form-row">
      <div class="form-group col-md-4">
        <label for="density">Densidad</label>
        <select id="density" formControlName="density" class="form-control">
          <option value="">Seleccione...</option>
          <option value="1.000">1.000</option>
          <option value="1.005">1.005</option>
          <option value="1.010">1.010</option>
          <option value="1.015">1.015</option>
          <option value="1.020">1.020</option>
          <option value="1.025">1.025</option>
          <option value="1.030">1.030</option>
        </select>
      </div>
      
      <div class="form-group col-md-4">
        <label for="ph">pH</label>
        <select id="ph" formControlName="ph" class="form-control">
          <option value="">Seleccione...</option>
          <option value="5.0">5.0</option>
          <option value="6.0">6.0</option>
          <option value="6.5">6.5</option>
          <option value="7.0">7.0</option>
          <option value="8.0">8.0</option>
          <option value="9.0">9.0</option>
        </select>
      </div>
      
      <div class="form-group col-md-4">
        <label for="protein">Proteína</label>
        <select id="protein" formControlName="protein" class="form-control">
          <option value="">Seleccione...</option>
          <option *ngFor="let option of resultOptions" [value]="option.value">
            {{option.label}}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Más campos químicos... -->
  </section>

  <!-- Examen Microscópico -->
  <section class="form-section">
    <h3>Examen Microscópico</h3>
    
    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="leukocytesField">Leucocitos por campo</label>
        <input id="leukocytesField" type="text" formControlName="leukocytesField" 
               class="form-control" placeholder="ej: 0-2 x campo">
      </div>
      
      <div class="form-group col-md-6">
        <label for="erythrocytesField">Eritrocitos por campo</label>
        <input id="erythrocytesField" type="text" formControlName="erythrocytesField" 
               class="form-control" placeholder="ej: 0-2 x campo">
      </div>
    </div>
    
    <!-- Más campos microscópicos... -->
  </section>

  <!-- Observaciones -->
  <section class="form-section">
    <h3>Observaciones</h3>
    
    <div class="form-group">
      <label for="observations">Observaciones Generales</label>
      <textarea id="observations" formControlName="observations" 
                class="form-control" rows="4" placeholder="Observaciones del técnico..."></textarea>
    </div>
    
    <div class="form-group">
      <label for="performedBy">Realizado por</label>
      <input id="performedBy" type="text" formControlName="performedBy" 
             class="form-control" placeholder="Nombre del técnico">
    </div>
  </section>

  <!-- Botones -->
  <div class="form-actions">
    <button type="button" class="btn btn-secondary" routerLink="/urine-tests">
      Cancelar
    </button>
    <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
      {{loading ? 'Guardando...' : 'Guardar Examen'}}
    </button>
  </div>
</form>
```

---

## ✅ Validaciones

### Validadores Personalizados

```typescript
// src/app/validators/urine-test.validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UrineTestValidators {
  
  static volumeFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const volumePattern = /^\d+(\.\d+)?\s*(ml|mL|ML)$/;
      const valid = volumePattern.test(control.value);
      
      return valid ? null : { invalidVolumeFormat: { value: control.value } };
    };
  }
  
  static fieldCount(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fieldPattern = /^\d+(-\d+)?\s*x?\s*(campo|field|campos)/i;
      const valid = fieldPattern.test(control.value);
      
      return valid ? null : { invalidFieldCount: { value: control.value } };
    };
  }
  
  static dateNotFuture(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin del día actual
      
      return selectedDate > today ? { futureDate: { value: control.value } } : null;
    };
  }
}
```

### Mensajes de Error

```typescript
// src/app/utils/error-messages.ts

export const URINE_TEST_ERROR_MESSAGES = {
  patientId: {
    required: 'Debe seleccionar un paciente'
  },
  testDate: {
    required: 'La fecha del examen es obligatoria',
    futureDate: 'La fecha no puede ser futura'
  },
  volume: {
    invalidVolumeFormat: 'Formato inválido. Use: "60 ml" o "50.5 mL"'
  },
  leukocytesField: {
    invalidFieldCount: 'Formato inválido. Use: "0-2 x campo" o "5 por campo"'
  },
  erythrocytesField: {
    invalidFieldCount: 'Formato inválido. Use: "0-2 x campo" o "3 por campo"'
  }
};
```

---

## 🎨 Ejemplos de UI Components

### Card de Examen de Orina

```html
<!-- src/app/components/urine-test-card/urine-test-card.component.html -->

<div class="urine-test-card">
  <div class="card-header">
    <div class="test-info">
      <h5>Examen General de Orina</h5>
      <p class="text-muted">{{urineTest.patient?.name}} - {{urineTest.testDate | date:'dd/MM/yyyy'}}</p>
    </div>
    <span class="badge" [ngClass]="getStatusClass(urineTest.status)">
      {{getStatusLabel(urineTest.status)}}
    </span>
  </div>
  
  <div class="card-body">
    <!-- Examen Físico -->
    <div class="test-section" *ngIf="hasPhysicalResults()">
      <h6>Examen Físico</h6>
      <div class="result-grid">
        <div class="result-item" *ngIf="urineTest.color">
          <label>Color:</label>
          <span [ngClass]="getColorClass(urineTest.color)">{{urineTest.color}}</span>
        </div>
        <div class="result-item" *ngIf="urineTest.aspect">
          <label>Aspecto:</label>
          <span>{{urineTest.aspect}}</span>
        </div>
        <div class="result-item" *ngIf="urineTest.volume">
          <label>Volumen:</label>
          <span>{{urineTest.volume}}</span>
        </div>
      </div>
    </div>
    
    <!-- Examen Químico -->
    <div class="test-section" *ngIf="hasChemicalResults()">
      <h6>Examen Químico</h6>
      <div class="result-grid">
        <div class="result-item" *ngIf="urineTest.protein">
          <label>Proteína:</label>
          <span [ngClass]="getResultClass(urineTest.protein)">{{urineTest.protein}}</span>
        </div>
        <div class="result-item" *ngIf="urineTest.glucose">
          <label>Glucosa:</label>
          <span [ngClass]="getResultClass(urineTest.glucose)">{{urineTest.glucose}}</span>
        </div>
        <div class="result-item" *ngIf="urineTest.ph">
          <label>pH:</label>
          <span>{{urineTest.ph}}</span>
        </div>
      </div>
    </div>
    
    <!-- Observaciones -->
    <div class="test-section" *ngIf="urineTest.observations">
      <h6>Observaciones</h6>
      <p>{{urineTest.observations}}</p>
    </div>
  </div>
  
  <div class="card-actions">
    <button class="btn btn-sm btn-outline-primary" (click)="viewDetails()">
      Ver Detalles
    </button>
    <button class="btn btn-sm btn-outline-info" (click)="generateReport()">
      Reporte Médico
    </button>
    <button class="btn btn-sm btn-outline-warning" (click)="edit()" 
            *ngIf="canEdit()">
      Editar
    </button>
  </div>
</div>
```

---

## 🚀 Tips de Implementación

### 1. Manejo de Estados

```typescript
// src/app/store/urine-test.state.ts (NgRx example)

export interface UrineTestState {
  urineTests: UrineTest[];
  selectedUrineTest: UrineTest | null;
  loading: boolean;
  error: string | null;
  filters: UrineTestFilters;
  pagination: PaginationInfo;
}
```

### 2. Interceptor para Manejo de Errores

```typescript
// src/app/interceptors/error.interceptor.ts

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = 'Datos inválidos';
              break;
            case 404:
              errorMessage = 'Examen no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
          }
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

### 3. Pipe para Formatear Resultados

```typescript
// src/app/pipes/urine-result-format.pipe.ts

@Pipe({ name: 'urineResultFormat' })
export class UrineResultFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '-';
    
    // Formatear resultados especiales
    const formatMap: Record<string, string> = {
      'Negativo': '(−) Negativo',
      'Positivo +': '(+) Positivo',
      'Positivo ++': '(++) Positivo',
      'Positivo +++': '(+++) Positivo',
      'No se observa': 'No observado'
    };
    
    return formatMap[value] || value;
  }
}
```

---

## 📱 Responsive Design

### CSS Classes Sugeridas

```scss
// src/app/components/urine-test/urine-test.component.scss

.urine-test-form {
  max-width: 800px;
  margin: 0 auto;
  
  .form-section {
    background: #f8f9fa;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 8px;
    
    h3 {
      color: #495057;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
  }
  
  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    
    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
      
      label {
        font-weight: 600;
        color: #6c757d;
      }
    }
  }
  
  // Status colors
  .status-completed { background-color: #28a745; }
  .status-pending { background-color: #ffc107; }
  .status-in-progress { background-color: #17a2b8; }
  
  // Result colors
  .result-negative { color: #28a745; }
  .result-positive { color: #dc3545; }
  .result-abnormal { color: #fd7e14; }
}

// Responsive
@media (max-width: 768px) {
  .urine-test-form {
    .form-row {
      flex-direction: column;
    }
    
    .result-grid {
      grid-template-columns: 1fr;
    }
  }
}
```

---

## 🔍 Testing

### Unit Test Example

```typescript
// src/app/services/urine-test.service.spec.ts

describe('UrineTestService', () => {
  let service: UrineTestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UrineTestService]
    });
    service = TestBed.inject(UrineTestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create urine test', () => {
    const mockUrineTest: CreateUrineTestDto = {
      patientId: 'test-id',
      testDate: '2023-09-27',
      protein: UrineTestResult.NEGATIVO
    };
    
    const expectedResponse: UrineTest = {
      id: 'generated-id',
      ...mockUrineTest,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    service.create(mockUrineTest).subscribe(result => {
      expect(result).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}`);
    expect(req.request.method).toBe('POST');
    req.flush(expectedResponse);
  });
});
```

---

## 📚 Recursos Adicionales

### Documentación de Referencia
- **Swagger UI**: `http://localhost:3000/api`
- **Repositorio Backend**: [lis-dymind-be](https://github.com/israelsalinashn-g/lis-dymind-be)

### Librerías Recomendadas
- **Angular Material**: Para componentes UI
- **NgRx**: Para manejo de estado
- **Chart.js**: Para gráficas de estadísticas
- **Angular Flex Layout**: Para layouts responsive
- **ngx-loading**: Para indicadores de carga

### Estructura de Carpetas Sugerida
```
src/app/
├── components/
│   ├── urine-test-list/
│   ├── urine-test-form/
│   ├── urine-test-card/
│   └── urine-test-stats/
├── interfaces/
│   ├── urine-test.interface.ts
│   ├── urine-test-dto.interface.ts
│   └── medical-report.interface.ts
├── enums/
│   └── urine-test.enums.ts
├── services/
│   └── urine-test.service.ts
├── pipes/
│   └── urine-result-format.pipe.ts
├── validators/
│   └── urine-test.validators.ts
└── utils/
    ├── enum-helpers.ts
    └── error-messages.ts
```

---

**¡Happy Coding! 🚀**

*Este documento cubre toda la integración necesaria para desarrollar el frontend de exámenes de orina. Para dudas específicas, consulta la documentación Swagger o el código fuente del backend.*