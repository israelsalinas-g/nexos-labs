# 🩺 API de Exámenes Coprológicos (Heces) - Guía para Frontend

## 📋 Descripción General

Este módulo maneja los exámenes coprológicos completos con análisis físico y microscópico. Incluye sistema de asignación de pacientes, estadísticas y reportes médicos.

> **⚠️ IMPORTANTE: Cambios en el Manejo de Datos del Paciente**
> 
> - Los datos del paciente (nombre, sexo) ya no se almacenan en la tabla de exámenes
> - Esta información se obtiene automáticamente de la tabla `patients` usando el `patientId`
> - Solo se guarda la edad del paciente al momento del examen
> - Los endpoints que retornan información del paciente la obtienen automáticamente de la tabla `patients`

## 🌐 Endpoints Disponibles

### Base URL: `/stool-tests`

#### 1. **Crear Examen Coprológico**
```http
POST /stool-tests
```

**Body (CreateStoolTestDto):**
```json
{
  "sampleNumber": "STOOL-2025-001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientAge": 35,
  "color": "café",
  "consistency": "formada",
  "shape": "moderado",
  "mucus": "no se observa",
  "leukocytes": "escaso",
  "erythrocytes": "no se observa",
  "parasites": [
    {
      "type": "ASCARIS LUMBRICOIDES",
      "quantity": "2-3 por campo"
    }
  ],
  "protozoos": [
    {
      "type": "ENTAMOEBA COLI",
      "quantity": "moderado"
    },
    {
      "type": "GIARDIA DUODENALIS",
      "quantity": "abundante"
    }
  ],
  "testDate": "2025-09-29T14:30:00Z",
  "observations": "Se observan parásitos y protozoos en la muestra",
  "technician": "Dr. García"
}
```

#### 2. **Listar Exámenes (Paginado)**
```http
GET /stool-tests?page=1&limit=10&patientId=xxx&status=pending
```

**Parámetros de Query:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `patientId` (opcional): Filtrar por ID del paciente
- `status` (opcional): Filtrar por estado (`pending`, `completed`, `reviewed`)
- `dateFrom` (opcional): Fecha desde (YYYY-MM-DD)
- `dateTo` (opcional): Fecha hasta (YYYY-MM-DD)

**Respuesta:**
```json
{
  "data": [
    {
      "id": 123,
      "sampleNumber": "STOOL-2025-001",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "testDate": "2025-09-29T14:30:00Z",
      "status": "completed",
      "color": "café",
      "consistency": "formada",
      "createdAt": "2025-09-29T14:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

#### 3. **Obtener Examen por ID**
```http
GET /stool-tests/:id
```

#### 4. **Exámenes por Paciente**
```http
GET /stool-tests/patient/:patientId
```

#### 5. **Estadísticas Generales**
```http
GET /stool-tests/statistics
```

**Respuesta:**
```json
{
  "general": {
    "totalTests": 150,
    "pendingTests": 12,
    "completedTests": 130,
    "reviewedTests": 8,

    "testsThisMonth": 45,
    "testsToday": 3
  },
  "distribution": {
    "colorStats": [
      { "color": "café", "count": "85" },
      { "color": "amarillo", "count": "32" },
      { "color": "verde", "count": "15" }
    ],
    "consistencyStats": [
      { "consistency": "formada", "count": "95" },
      { "consistency": "pastosa", "count": "35" },
      { "consistency": "líquida", "count": "20" }
    ]
  },
  "clinical": {
    "abnormalFindings": 25,
    "abnormalPercentage": "16.67"
  }
}
```

#### 6. **Exámenes Pendientes de Revisión**
```http
GET /stool-tests/pending-review
```

#### 7. **Reporte Médico**
```http
GET /stool-tests/:id/medical-report
```

#### 8. **Actualizar Examen**
```http
PATCH /stool-tests/:id
```

**Body (UpdateStoolTestDto):**
```json
{
  "status": "completed",
  "observations": "Resultados normales, sin hallazgos patológicos",
  "reviewedBy": "Dr. López"
}
```

#### 9. **Completar Examen**
```http
PATCH /stool-tests/:id/complete
```

#### 10. **Eliminar Examen**
```http
DELETE /stool-tests/:id
```

## 🏷️ Enums y Valores Válidos

### **ParasiteType (Parásitos)**
```typescript
enum ParasiteType {
  ASCARIS_LUMBRICOIDES = 'ASCARIS LUMBRICOIDES',
  ENTEROBIUS_VERMICULARIS = 'ENTEROBIUS VERMICULARIS',
  TRICHURIS_TRICHIURA = 'TRICHURIS TRICHIURA',
  ANCYLOSTOMA = 'ANCYLOSTOMA',
  TAENA_SP = 'TAENA SP',
  HYMENOLEPIS_NANA = 'HYMENOLEPIS NANA',
  HYMENOLEPIS_DIMUTA = 'HYMENOLEPIS DIMUTA',
  NONE = 'NO SE OBSERVAN EN ESTA MUESTRA'
}
```

### **ProtozooType (Protozoos)**
```typescript
enum ProtozooType {
  BLASTOCYSTIS_HOMINIS = 'BLASTOCYSTIS HOMINIS',
  ENTAMOEBA_COLI = 'ENTAMOEBA COLI',
  ENTAMOEBA_HARTMANNI = 'ENATMOEBA HARTMANNI',
  ENTAMOEBA_HISTOLYTICA = 'ENTAMOEBA HISTOLYTICA',
  GIARDIA_DUODENALIS = 'GIARDIA DUODENALIS',
  CHILOMASTIX_MESNILI = 'CHILOMASTIX MESNILI',
  ENDOLIMAX_NANA = 'ENDOLIMAX NANA',
  IODAMOEBA_BUTSCHLII = 'IODAMOEBA BUTSCHLII',
  URBANORUM_SPP = 'URBANORUM SPP',
  NONE = 'NO SE OBSERVA EN ESTA MUESTRA'
}
```

### **Interfaces para Resultados**
```typescript
interface ParasiteResult {
  type: ParasiteType;
  quantity: string;
}

interface ProtozooResult {
  type: ProtozooType;
  quantity: string;
}
```

### **StoolColor (Color)**
```typescript
enum StoolColor {
  AMARILLO = 'amarillo',
  NEGRO = 'negro',
  BLANCO = 'blanco',
  CAFE = 'café',
  VERDE = 'verde',
  ROJO = 'rojo'
}
```

### **StoolConsistency (Consistencia)**
```typescript
enum StoolConsistency {
  BLANDA = 'blanda',
  FORMADA = 'formada',
  PASTOSA = 'pastosa',
  LIQUIDA = 'líquida',
  DIARREICA = 'diarreica'
}
```

### **StoolShape (Forma/Cantidad)**
```typescript
enum StoolShape {
  ESCASO = 'escaso',
  MODERADO = 'moderado',
  ABUNDANTE = 'abundante'
}
```

### **StoolMucus (Moco)**
```typescript
enum StoolMucus {
  ESCASO = 'escaso',
  MODERADO = 'moderado',
  ABUNDANTE = 'abundante',
  NO_SE_OBSERVA = 'no se observa'
}
```

### **MicroscopicLevel (Leucocitos, Eritrocitos)**
```typescript
enum MicroscopicLevel {
  ESCASO = 'escaso',
  MODERADO = 'moderado',
  ABUNDANTE = 'abundante',
  NO_SE_OBSERVA = 'no se observa'
}
```

### **Estado del Examen**
```typescript
enum TestStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed'
}
```



## 📊 Estructura de Datos

### **StoolTest Entity**
```typescript
interface StoolTest {
  id: number;
  patientId: string;      // ID del paciente en la tabla patients
  patientAge?: number;     // Edad al momento del examen
  
  // Examen Físico
  color: StoolColor;
  consistency: StoolConsistency;
  shape: StoolShape;
  mucus: StoolMucus;
  
  // Examen Microscópico
  leukocytes: MicroscopicLevel;
  erythrocytes: MicroscopicLevel;
  
  // Parásitos y Protozoos
  parasites: ParasiteResult[];  // Array de resultados de parásitos
  protozoos: ProtozooResult[];  // Array de resultados de protozoos
  
  // Sistema
  sampleNumber: string;
  testDate: Date;
  observations?: string;
  status: string;
  technician?: string;
  reviewedBy?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Servicio Angular con Paginación

```typescript
// Interfaces para el nuevo formato paginado
interface PaginatedStoolTestResponse {
  data: StoolTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StoolTestFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Servicio Angular
@Injectable({
  providedIn: 'root'
})
export class StoolTestService {
  private baseUrl = '/api/stool-tests';
  
  constructor(private http: HttpClient) {}
  
  // Obtener lista paginada con filtros
  getAll(filters: StoolTestFilters = {}): Observable<PaginatedStoolTestResponse> {
    let params = new HttpParams();
    
    // Aplicar filtros como parámetros de query
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return this.http.get<PaginatedStoolTestResponse>(this.baseUrl, { params });
  }
  
  // Crear nuevo examen
  create(data: CreateStoolTestDto): Observable<StoolTest> {
    return this.http.post<StoolTest>(this.baseUrl, data);
  }
  
  // Obtener por ID
  getById(id: number): Observable<StoolTest> {
    return this.http.get<StoolTest>(`${this.baseUrl}/${id}`);
  }
  
  // Obtener exámenes de un paciente
  getByPatient(patientId: string): Observable<StoolTest[]> {
    return this.http.get<StoolTest[]>(`${this.baseUrl}/patient/${patientId}`);
  }
  
  // Obtener estadísticas
  getStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/statistics`);
  }
  
  // Actualizar examen
  update(id: number, data: UpdateStoolTestDto): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}`, data);
  }
  
  // Marcar como completado
  markAsCompleted(id: number, reviewedBy?: string): Observable<StoolTest> {
    return this.http.patch<StoolTest>(`${this.baseUrl}/${id}/complete`, { reviewedBy });
  }
  
  // Eliminar examen
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### **Componente de Lista con Paginación**

```typescript
@Component({
  selector: 'app-stool-tests-list',
  template: `
    <div class="stool-tests-container">
      <!-- Filtros -->
      <div class="filters-panel">
        <input type="text" 
               placeholder="ID del paciente"
               [(ngModel)]="filters.patientId"
               (keyup.enter)="loadTests()">
        
        <select [(ngModel)]="filters.status" (change)="loadTests()">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="completed">Completado</option>
          <option value="reviewed">Revisado</option>
        </select>
        
        <button (click)="loadTests()" [disabled]="loading">
          🔍 Buscar
        </button>
      </div>
      
      <!-- Lista de exámenes -->
      <div class="tests-grid" *ngIf="!loading; else loadingTemplate">
        <div *ngFor="let test of stoolTests" class="test-card">
          <div class="test-header">
            <span class="sample-number">{{test.sampleNumber}}</span>
            <span class="status" [ngClass]="test.status">{{test.status}}</span>
          </div>
          <div class="test-body">
            <p><strong>ID Paciente:</strong> {{test.patientId}}</p>
            <p><strong>Fecha:</strong> {{test.testDate | date:'dd/MM/yyyy'}}</p>
            <p><strong>Color:</strong> {{test.color}}</p>
            <p><strong>Consistencia:</strong> {{test.consistency}}</p>
          </div>
          <div class="test-actions">
            <button (click)="viewTest(test.id)">Ver Detalle</button>
            <button (click)="editTest(test.id)">Editar</button>
          </div>
        </div>
      </div>
      
      <!-- Paginación -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          (click)="goToPage(currentPage - 1)" 
          [disabled]="currentPage <= 1">
          ◀ Anterior
        </button>
        
        <span class="page-info">
          Página {{currentPage}} de {{totalPages}} 
          ({{totalTests}} resultados)
        </span>
        
        <button 
          (click)="goToPage(currentPage + 1)" 
          [disabled]="currentPage >= totalPages">
          Siguiente ▶
        </button>
      </div>
    </div>
    
    <ng-template #loadingTemplate>
      <div class="loading">Cargando exámenes...</div>
    </ng-template>
  `
})
export class StoolTestsListComponent implements OnInit {
  stoolTests: StoolTest[] = [];
  loading = false;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalTests = 0;
  totalPages = 0;
  
  // Filtros
  filters: StoolTestFilters = {
    page: 1,
    limit: 10
  };
  
  constructor(private stoolTestService: StoolTestService) {}
  
  ngOnInit(): void {
    this.loadTests();
  }
  
  loadTests(): void {
    this.loading = true;
    
    const queryFilters = {
      ...this.filters,
      page: this.currentPage,
      limit: this.pageSize
    };
    
    this.stoolTestService.getAll(queryFilters).subscribe({
      next: (response: PaginatedStoolTestResponse) => {
        this.stoolTests = response.data;
        this.totalTests = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stool tests:', error);
        this.loading = false;
      }
    });
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTests();
    }
  }
  
  viewTest(id: number): void {
    // Navegar a vista detalle
    // this.router.navigate(['/stool-tests', id]);
  }
  
  editTest(id: number): void {
    // Navegar a edición
    // this.router.navigate(['/stool-tests', id, 'edit']);
  }
}
```

## 🎨 Componentes de Frontend Sugeridos

### **1. Formulario de Creación**
```typescript
interface StoolTestForm {
  // Datos del paciente (requeridos)
  patientInfo: {
    id: string;
    name: string;
    age?: number;
    sex?: string;
  };
  
  // Número de muestra
  sampleNumber: string;
  
  // Examen físico (dropdowns con enums)
  physicalExam: {
    color: StoolColor;
    consistency: StoolConsistency;
    shape: StoolShape;
    mucus: StoolMucus;
  };
  
  // Examen microscópico (dropdowns con enums)
  microscopicExam: {
    leukocytes: MicroscopicLevel;
    erythrocytes: MicroscopicLevel;
    yeast: YeastLevel;
    parasites: string; // Campo de texto libre
  };
  
  // Información adicional
  observations?: string;
  technician?: string;
}
```

### **2. Lista de Exámenes**
```typescript
interface StoolTestsListProps {
  tests: StoolTest[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  filters: {
    status?: TestStatus;
    patientName?: string;
    dateRange?: { start: Date; end: Date; };
  };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewReport: (id: number) => void;
}
```

### **3. Dashboard de Estadísticas**
```typescript
interface StoolTestsStatsProps {
  generalStats: {
    total: number;
    pending: number;
    completed: number;
    reviewed: number;
    todayCount: number;
  };
  distributionCharts: {
    colorDistribution: { label: string; value: number; }[];
    consistencyDistribution: { label: string; value: number; }[];
  };
  abnormalFindings: {
    count: number;
    percentage: string;
  };
}
```

## 🔧 Funciones de Utilidad Sugeridas

### **Validación de Formularios**
```typescript
const validateStoolTest = (data: StoolTestForm): string[] => {
  const errors: string[] = [];
  
  if (!data.sampleNumber?.trim()) {
    errors.push('Número de muestra es requerido');
  }
  
  if (data.sampleNumber?.length < 3) {
    errors.push('Número de muestra debe tener al menos 3 caracteres');
  }
  
  if (!data.patientInfo.id?.trim()) {
    errors.push('ID del paciente es requerido');
  }
  
  if (!data.patientInfo.name?.trim()) {
    errors.push('Nombre del paciente es requerido');
  }
  
  return errors;
};
```

### **Formateo de Datos**
```typescript
const formatStoolTestForDisplay = (test: StoolTest) => ({
  id: test.id,
  sampleNumber: test.sampleNumber,
  patient: test.patientName,
  date: new Date(test.testDate).toLocaleDateString('es-ES'),
  status: getStatusLabel(test.status),
  hasAbnormalFindings: hasAbnormalFindings(test)
});

const hasAbnormalFindings = (test: StoolTest): boolean => {
  return test.leukocytes !== 'no se observa' ||
         test.erythrocytes !== 'no se observa' ||
         test.yeast !== 'no se observa' ||
         !test.parasites?.includes('NO SE OBSERVA');
};

const getStatusLabel = (status: string): string => {
  const labels = {
    pending: 'Pendiente',
    completed: 'Completado',
    reviewed: 'Revisado'
  };
  return labels[status] || status;
};
```

### **Colores para UI**
```typescript
const getStatusColor = (status: string): string => {
  const colors = {
    pending: '#fbbf24', // amarillo
    completed: '#10b981', // verde
    reviewed: '#3b82f6'   // azul
  };
  return colors[status] || '#6b7280';
};

const getAbnormalityColor = (hasAbnormal: boolean): string => {
  return hasAbnormal ? '#ef4444' : '#10b981'; // rojo : verde
};
```

## 📱 Ejemplos de Uso en Frontend

### **React Hook para Gestión de Exámenes (Formato Actualizado)**
```typescript
interface PaginatedStoolTestState {
  data: StoolTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const useStoolTests = () => {
  const [state, setState] = useState<PaginatedStoolTestState>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    error: null
  });
  
  const fetchTests = async (filters?: StoolTestFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await api.get(`/stool-tests?${params}`);
      const result: PaginatedStoolTestResponse = response.data;
      
      setState(prev => ({
        ...prev,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        loading: false
      }));
      
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar exámenes',
        loading: false
      }));
    }
  };
  
  const createTest = async (data: CreateStoolTestDto) => {
    try {
      const response = await api.post('/stool-tests', data);
      await fetchTests(); // Recargar lista actual
      return response.data;
    } catch (err) {
      throw new Error('Error al crear examen');
    }
  };
  
  const updateTest = async (id: number, data: UpdateStoolTestDto) => {
    try {
      const response = await api.patch(`/stool-tests/${id}`, data);
      await fetchTests(); // Recargar lista actual
      return response.data;
    } catch (err) {
      throw new Error('Error al actualizar examen');
    }
  };
  
  return {
    tests,
    loading,
    error,
    fetchTests,
    createTest,
    updateTest
  };
};
```

## 🚀 Integración con Dashboard

Los exámenes de heces están integrados con:

- **Dashboard General**: `/dashboard/stats` incluye estadísticas de heces
- **Historial de Pacientes**: `/patients/:id/history` incluye exámenes coprológicos
- **Búsqueda Unificada**: `/patients/history/search` busca en todos los tipos de examen

## 📋 Notas Importantes

1. **Números de Muestra**: Deben ser únicos en el sistema
2. **Valores por Defecto**: Los enums tienen valores predeterminados normales
3. **Parásitos**: Campo de texto libre, valor por defecto "NO SE OBSERVA EN ESTA MUESTRA"
4. **Estados**: Flujo: pending → completed → reviewed
5. **Pacientes**: Los campos patientId y patientName son REQUERIDOS al crear el examen
6. **Ingreso Manual**: Los técnicos ingresan todos los datos incluyendo información del paciente

¡Esta documentación te permitirá implementar una interfaz completa para el manejo de exámenes coprológicos! 🎯