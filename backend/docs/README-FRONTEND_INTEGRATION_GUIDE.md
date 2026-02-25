# API Documentation for Frontend Integration
## Laboratory Information System (LIS) - Angular Frontend Guide

### 📋 Resumen del Sistema

El LIS maneja dos equipos de laboratorio:
- **DH36:** Hematología (múltiples parámetros por muestra)
- **iChroma II:** Química clínica (un parámetro por test)

### 🌐 Base URL
```
http://localhost:3000
```

### 📚 Swagger Documentation
```
http://localhost:3000/api/docs
```

---

## 🔬 DH36 - Hematología (Lab Results)

### 📊 Endpoints Principales

#### GET /lab-results
**Descripción:** Obtener lista de resultados de hematología  
**Query Parameters:**
- `limit` (number, opcional): Límite de resultados (default: 100)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Respuesta:**
```typescript
interface LabResult[] {
  id: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  referenceGroup: string; // "Niño", "Adulto", etc.
  sampleNumber: string;
  analysisMode: string;
  testDate: string; // ISO date string
  parameters: TestParameter[];
  instrumentId: string; // "DYMIND_DH36"
  rawData: string;
  processingStatus: string;
  technicalNotes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface TestParameter {
  name: string; // "WBC", "RBC", "HGB", etc.
  result: string;
  unit: string;
  referenceRange?: string;
  status?: string; // "Normal", "High", "Low"
}
```

#### GET /lab-results/:id
**Descripción:** Obtener resultado específico  
**Parámetros:** `id` (number)

#### GET /lab-results/sample/:sampleNumber
**Descripción:** Buscar por número de muestra

#### GET /lab-results/patient/:patientId
**Descripción:** Obtener todos los resultados de un paciente

#### PUT /lab-results/:id
**Descripción:** Actualizar resultado (para técnicos)  
**Body:**
```typescript
interface UpdateLabResultDto {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientSex?: string;
  referenceGroup?: string;
  sampleNumber?: string;
  analysisMode?: string;
  testDate?: string;
  parameters?: TestParameter[];
  instrumentId?: string;
  rawData?: string;
  processingStatus?: ProcessingStatus;
  technicalNotes?: string;
}

enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ERROR = 'error',
  MANUAL_REVIEW = 'manual_review'
}
```

### 🧪 Parámetros de Hematología Típicos

```typescript
interface HematologyParameters {
  // Leucocitos
  WBC: string; // Leucocitos totales (10*3/uL)
  'LYM%': string; // Linfocitos %
  'GRA%': string; // Granulocitos %
  'MID%': string; // Monocitos %
  'LYM#': string; // Linfocitos absolutos
  'GRA#': string; // Granulocitos absolutos
  'MID#': string; // Monocitos absolutos
  
  // Eritrocitos
  RBC: string; // Eritrocitos (10*6/uL)
  HGB: string; // Hemoglobina (g/dL)
  HCT: string; // Hematocrito (%)
  MCV: string; // VCM (fL)
  MCH: string; // HCM (pg)
  MCHC: string; // CHCM (g/dL)
  'RDW-CV': string; // RDW-CV (%)
  'RDW-SD': string; // RDW-SD (fL)
  
  // Plaquetas
  PLT: string; // Plaquetas (10*3/uL)
  MPV: string; // VPM (fL)
  PDW: string; // PDW (fL)
  PCT: string; // PCT (%)
  'P-LCR': string; // P-LCR (%)
  'P-LCC': string; // P-LCC (10*9/L)
}
```

---

## 🧪 iChroma II - Química Clínica (iChroma Results)

### 📊 Endpoints Principales

#### GET /ichroma-results
**Descripción:** Obtener lista de resultados de química clínica  
**Query Parameters:**
- `limit` (number, opcional): Límite de resultados (default: 100)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Respuesta:**
```typescript
interface IChromaResult[] {
  id: number;
  messageType: string; // "MSH"
  deviceId: string; // "^~\\&"
  patientId: string;
  patientName: string;
  patientAge: number | null;
  patientSex: string;
  testType: string; // "SL033", "SL001", etc.
  testName: string; // "Beta HCG", "PSA", etc.
  result: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  cartridgeSerial: string;
  cartridgeLot: string;
  humidity: number | null;
  sampleBarcode: string;
  testDate: string; // ISO date string
  rawMessage: string;
  rawData: any; // JSON object
  instrumentId: string; // "ICHROMA_II"
  processingStatus: string;
  technicalNotes: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

#### GET /ichroma-results/:id
**Descripción:** Obtener resultado específico  
**Parámetros:** `id` (number)

#### GET /ichroma-results/patient/:patientId
**Descripción:** Obtener todos los resultados de un paciente

#### GET /ichroma-results/test-type/:testType
**Descripción:** Obtener resultados por tipo de test

#### GET /ichroma-results/stats/summary
**Descripción:** Estadísticas de resultados iChroma  
**Respuesta:**
```typescript
interface IChromaStats {
  total: number;
  byTestType: Array<{
    testType: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
}
```

#### PUT /ichroma-results/:id
**Descripción:** Actualizar resultado iChroma  
**Body:**
```typescript
interface UpdateIChromaResultDto {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientSex?: string;
  testType?: string;
  testName?: string;
  result?: string;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  processingStatus?: IChromaProcessingStatus;
  technicalNotes?: string;
  testDate?: string;
}

enum IChromaProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ERROR = 'error',
  MANUAL_REVIEW = 'manual_review'
}
```

### 🧪 Tipos de Tests iChroma II

```typescript
interface IChromaTestTypes {
  SL033: {
    name: 'Beta HCG';
    description: 'Prueba de embarazo';
    unit: 'mIU/mL';
    normalRange: '< 5.00';
    category: 'Hormonas';
  };
  SL001: {
    name: 'PSA';
    description: 'Antígeno Prostático Específico';
    unit: 'ng/mL';
    normalRange: '0-4.0';
    category: 'Marcadores Tumorales';
  };
  SL002: {
    name: 'Troponina I';
    description: 'Marcador Cardíaco';
    unit: 'ng/mL';
    normalRange: '< 0.04';
    category: 'Cardíacos';
  };
  SL015: {
    name: 'CRP';
    description: 'Proteína C Reactiva';
    unit: 'mg/L';
    normalRange: '< 3.0';
    category: 'Inflamación';
  };
  SL020: {
    name: 'D-Dimer';
    description: 'Marcador de Coagulación';
    unit: 'mg/L';
    normalRange: '< 0.5';
    category: 'Coagulación';
  };
}
```

---

## 👥 Pacientes (Patients)

### 📊 Endpoints

#### GET /patients
**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Límite por página (default: 10)
- `search` (string, opcional): Búsqueda por nombre o DNI
- `sex` (string, opcional): Filtro por sexo
- `active` (boolean, opcional): Filtro por estado activo

#### GET /patients/:id

#### POST /patients
**Body:**
```typescript
interface CreatePatientDto {
  name: string; // REQUERIDO
  birthDate: string; // REQUERIDO - ISO date
  sex: PatientSex; // REQUERIDO
  phone: string; // REQUERIDO
  dni?: string;
  email?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
}

enum PatientSex {
  MALE = 'Masculino',
  FEMALE = 'Femenino',
  OTHER = 'Otro'
}
```

#### PUT /patients/:id

#### PATCH /patients/:id/activate

#### PATCH /patients/:id/deactivate

#### GET /patients/stats/summary

---

## 🎨 Componentes Angular Sugeridos

### 1. Lab Results List Component

```typescript
// lab-results-list.component.ts
interface LabResultsListComponent {
  // Propiedades
  results: LabResult[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Métodos
  loadResults(page: number, limit: number): void;
  searchByPatient(patientId: string): void;
  searchBySample(sampleNumber: string): void;
  viewDetail(id: number): void;
  editResult(id: number): void;
  exportToPdf(id: number): void;
  refreshList(): void;
}
```

### 2. Lab Result Detail Component

```typescript
// lab-result-detail.component.ts
interface LabResultDetailComponent {
  // Propiedades
  result: LabResult | null;
  parameters: TestParameter[];
  editMode: boolean;
  
  // Métodos
  loadResult(id: number): void;
  toggleEditMode(): void;
  updateResult(data: UpdateLabResultDto): void;
  addTechnicalNote(note: string): void;
  printResult(): void;
  goBack(): void;
}
```

### 3. iChroma Results List Component

```typescript
// ichroma-results-list.component.ts
interface IChromaResultsListComponent {
  // Propiedades
  results: IChromaResult[];
  loading: boolean;
  selectedTestType: string | null;
  stats: IChromaStats;
  
  // Métodos
  loadResults(): void;
  filterByTestType(testType: string): void;
  searchByPatient(patientId: string): void;
  viewDetail(id: number): void;
  loadStats(): void;
}
```

### 4. iChroma Result Detail Component

```typescript
// ichroma-result-detail.component.ts
interface IChromaResultDetailComponent {
  // Propiedades
  result: IChromaResult | null;
  testTypeInfo: any;
  
  // Métodos
  loadResult(id: number): void;
  getTestTypeInfo(testType: string): any;
  updateResult(data: UpdateIChromaResultDto): void;
  interpretResult(): string; // "Normal", "Anormal", etc.
}
```

---

## 🎯 Modelos TypeScript para Angular

### Crear estos archivos en tu proyecto Angular:

#### models/lab-result.model.ts
```typescript
export interface LabResult {
  id: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  referenceGroup: string;
  sampleNumber: string;
  analysisMode: string;
  testDate: string;
  parameters: TestParameter[];
  instrumentId: string;
  rawData: string;
  processingStatus: ProcessingStatus;
  technicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestParameter {
  name: string;
  result: string;
  unit: string;
  referenceRange?: string;
  status?: ParameterStatus;
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ERROR = 'error',
  MANUAL_REVIEW = 'manual_review'
}

export enum ParameterStatus {
  NORMAL = 'Normal',
  HIGH = 'High',
  LOW = 'Low'
}
```

#### models/ichroma-result.model.ts
```typescript
export interface IChromaResult {
  id: number;
  messageType: string;
  deviceId: string;
  patientId: string;
  patientName: string;
  patientAge: number | null;
  patientSex: string;
  testType: string;
  testName: string;
  result: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  cartridgeSerial: string;
  cartridgeLot: string;
  humidity: number | null;
  sampleBarcode: string;
  testDate: string;
  rawMessage: string;
  rawData: any;
  instrumentId: string;
  processingStatus: IChromaProcessingStatus;
  technicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum IChromaProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ERROR = 'error',
  MANUAL_REVIEW = 'manual_review'
}

export interface IChromaStats {
  total: number;
  byTestType: Array<{
    testType: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
}
```

#### models/patient.model.ts
```typescript
export interface Patient {
  id: string;
  name: string;
  dni: string | null;
  birthDate: string;
  age: number;
  sex: PatientSex;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  medicalHistory: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PatientSex {
  MALE = 'Masculino',
  FEMALE = 'Femenino',
  OTHER = 'Otro'
}
```

---

## 🔧 Services Angular Sugeridos

#### services/lab-results.service.ts
```typescript
@Injectable({
  providedIn: 'root'
})
export class LabResultsService {
  private apiUrl = 'http://localhost:3000/lab-results';

  constructor(private http: HttpClient) {}

  getResults(limit = 100, offset = 0): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  getResult(id: number): Observable<LabResult> {
    return this.http.get<LabResult>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: string): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getBySample(sampleNumber: string): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/sample/${sampleNumber}`);
  }

  updateResult(id: number, data: Partial<LabResult>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
```

#### services/ichroma-results.service.ts
```typescript
@Injectable({
  providedIn: 'root'
})
export class IChromaResultsService {
  private apiUrl = 'http://localhost:3000/ichroma-results';

  constructor(private http: HttpClient) {}

  getResults(limit = 100, offset = 0): Observable<IChromaResult[]> {
    return this.http.get<IChromaResult[]>(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  getResult(id: number): Observable<IChromaResult> {
    return this.http.get<IChromaResult>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: string): Observable<IChromaResult[]> {
    return this.http.get<IChromaResult[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByTestType(testType: string): Observable<IChromaResult[]> {
    return this.http.get<IChromaResult[]>(`${this.apiUrl}/test-type/${testType}`);
  }

  getStats(): Observable<IChromaStats> {
    return this.http.get<IChromaStats>(`${this.apiUrl}/stats/summary`);
  }

  updateResult(id: number, data: Partial<IChromaResult>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
```

---

## 📱 Ejemplos de Respuestas de API

### Lab Results (DH36) - GET /lab-results/1
```json
{
  "id": 1,
  "patientId": "12345",
  "patientName": "Camila Briyith Banegas Figueroa",
  "patientAge": 10,
  "patientSex": "Femenino",
  "referenceGroup": "Niño",
  "sampleNumber": "1050",
  "analysisMode": "Automated Count",
  "testDate": "2025-09-20T11:15:36.000Z",
  "parameters": [
    {
      "name": "WBC",
      "result": "8.52",
      "unit": "10*3/uL",
      "referenceRange": "4.0-10.0",
      "status": "Normal"
    },
    {
      "name": "RBC",
      "result": "4.52",
      "unit": "10*6/uL",
      "referenceRange": "4.0-5.5",
      "status": "Normal"
    }
  ],
  "instrumentId": "DYMIND_DH36",
  "processingStatus": "processed",
  "createdAt": "2025-09-20T11:20:00.000Z",
  "updatedAt": "2025-09-20T11:20:00.000Z"
}
```

### iChroma Results - GET /ichroma-results/1
```json
{
  "id": 1,
  "patientId": "1",
  "patientName": "josselyn caroli",
  "patientAge": 26,
  "patientSex": "Femenino",
  "testType": "SL033",
  "testName": "Beta HCG",
  "result": "< 5.00",
  "unit": "mIU/mL",
  "referenceMin": null,
  "referenceMax": 1,
  "cartridgeSerial": "T",
  "cartridgeLot": "2.6",
  "sampleBarcode": "HCUGG05EX",
  "testDate": "2025-09-27T14:41:32.709Z",
  "instrumentId": "ICHROMA_II",
  "processingStatus": "processed",
  "createdAt": "2025-09-27T14:45:00.000Z",
  "updatedAt": "2025-09-27T14:45:00.000Z"
}
```

---

## 🎨 Consideraciones de UI/UX

### Colores por Estado
```scss
.status-processed { color: #28a745; }    // Verde
.status-pending { color: #ffc107; }      // Amarillo
.status-error { color: #dc3545; }        // Rojo
.status-manual-review { color: #007bff; } // Azul
```

### Iconos por Tipo de Test
```typescript
const TEST_ICONS = {
  'DH36': 'fas fa-microscope',      // Hematología
  'ICHROMA_II': 'fas fa-vial',      // Química clínica
  'Beta HCG': 'fas fa-baby',        // Embarazo
  'PSA': 'fas fa-male',             // Próstata
  'CRP': 'fas fa-fire',             // Inflamación
  'Troponina I': 'fas fa-heartbeat' // Cardíaco
};
```

### Formato de Fechas
```typescript
// Usar Angular DatePipe o moment.js
{{ result.testDate | date:'dd/MM/yyyy HH:mm' }}
```

---

## 🚀 Implementación Sugerida

1. **Crear módulos separados:**
   - `HematologyModule` (DH36)
   - `ChemistryModule` (iChroma II)
   - `PatientsModule`

2. **Implementar lazy loading:**
   ```typescript
   const routes: Routes = [
     { 
       path: 'hematology', 
       loadChildren: () => import('./hematology/hematology.module').then(m => m.HematologyModule) 
     },
     { 
       path: 'chemistry', 
       loadChildren: () => import('./chemistry/chemistry.module').then(m => m.ChemistryModule) 
     }
   ];
   ```

3. **Usar Angular Material:**
   - `MatTableModule` para las listas
   - `MatPaginatorModule` para paginación
   - `MatDialogModule` para detalles
   - `MatChipsModule` para estados

4. **Implementar filtros y búsquedas:**
   - Por fecha
   - Por paciente
   - Por estado
   - Por tipo de test (iChroma)

¡Con esta información el frontend puede integrarse completamente con el sistema LIS! 🚀