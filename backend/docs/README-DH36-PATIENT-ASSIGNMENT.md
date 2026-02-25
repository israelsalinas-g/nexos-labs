# README - Asignación de Pacientes Dymind DH36

## 📋 Descripción General

El equipo **Dymind DH36** es un analizador hematológico que envía resultados completos de hemograma con información del paciente (nombre, edad, sexo) pero sin un `patientId` válido que coincida con los pacientes registrados en el sistema LIS. Este documento describe el proceso de asignación manual que permite a los técnicos de laboratorio asociar estos resultados con los pacientes correctos.

## 🎯 Problema y Solución

### **Problema:**
- El DH36 envía datos HL7 con `patient_name`, `patient_age`, `patient_sex`
- El campo `patientId` viene vacío o no coincide con la base de datos
- Cada resultado incluye 20+ parámetros hematológicos
- Necesidad de asociar manualmente estos resultados con pacientes registrados

### **Solución:**
- Sistema de asignación manual por técnicos de laboratorio
- Estados de procesamiento para tracking de asignaciones
- Búsqueda flexible por nombre de paciente
- Historial de asignaciones con auditoría completa
- Manejo específico de datos hematológicos complejos

## 🔄 Flujo de Trabajo

### 1. **Recepción Automática de Datos HL7**
```
DH36 → TCP Server (Puerto 5600) → Parser HL7 → Base de datos
Estado inicial: assignmentStatus = 'unassigned'
```

### 2. **Procesamiento Automático**
- Parsing de mensaje HL7 completo
- Extracción de 20+ parámetros hematológicos
- Separación de datos del paciente y resultados
- Generación de gráficos (histogramas) si están disponibles

### 3. **Revisión por Técnico de Laboratorio**
- Consultar resultados pendientes de asignación
- Verificar información del paciente (nombre, edad, sexo)
- Revisar parámetros hematológicos para validación
- Buscar paciente correcto en el sistema

### 4. **Asignación Manual**
- Seleccionar paciente correcto
- Verificar coherencia de datos (edad, sexo)
- Agregar notas de verificación si es necesario
- Confirmar asignación

### 5. **Verificación Final (Opcional)**
- Revisar parámetros críticos (Hb, Hematocrito, Leucocitos)
- Marcar como verificadas si es necesario
- Generar alertas para valores críticos

## 🛠️ Endpoints de la API

### **Ver Resultados Sin Asignar**
```http
GET /dymind-dh36-results/unassigned?limit=50&offset=0
```

**Descripción:** Lista todos los resultados de DH36 que necesitan asignación de paciente

**Parámetros:**
- `limit` (opcional): Número máximo de resultados (default: 50)
- `offset` (opcional): Número de resultados a omitir (default: 0)

**Respuesta:**
```json
[
  {
    "id": "456",
    "patientName": "Carlos Rodríguez",
    "testDate": "2025-09-30T08:45:00Z",
    "testName": "Hemograma Completo",
    "sampleNumber": "H240930001",
    "testType": "DH36",
    "result": "Hb: 14.2 g/dL, Hematocrito: 42.1%",
    "patientAge": 35,
    "patientSex": "M"
  }
]
```

### **Asignar Paciente a Resultado**
```http
PATCH /dymind-dh36-results/{id}/assign-patient
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Confirmado por cédula, edad y sexo coinciden"
}
```

**Respuesta:**
```json
{
  "id": 456,
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Carlos Rodríguez",
  "assignmentStatus": "assigned",
  "assignedAt": "2025-09-30T14:20:00Z",
  "assignmentNotes": "Confirmado por cédula, edad y sexo coinciden",
  "parameters": [
    {
      "name": "WBC",
      "value": "7.2",
      "unit": "x10³/μL",
      "referenceRange": "4.0-11.0",
      "status": "NORMAL"
    }
    // ... más parámetros
  ]
}
```

### **Buscar por Nombre de Paciente**
```http
GET /dymind-dh36-results/search/by-patient-name/{name}
```

**Ejemplo:** `GET /dymind-dh36-results/search/by-patient-name/Carlos Rodríguez`

**Descripción:** Busca resultados usando el nombre del paciente que viene del equipo (búsqueda parcial e insensible a mayúsculas)

### **Filtrar por Estado de Asignación**
```http
GET /dymind-dh36-results/by-assignment-status/{status}?limit=50&offset=0
```

**Estados disponibles:**
- `unassigned`: Sin asignar (necesita intervención)
- `assigned`: Asignado por técnico
- `verified`: Verificado y confirmado

### **Obtener Resultado Completo con Parámetros**
```http
GET /dymind-dh36-results/{id}
```

**Respuesta incluye todos los parámetros hematológicos:**
```json
{
  "id": 456,
  "patientName": "Carlos Rodríguez",
  "sampleNumber": "H240930001",
  "parameters": [
    {
      "name": "WBC",
      "displayName": "Leucocitos",
      "value": "7.2",
      "unit": "x10³/μL",
      "referenceRange": "4.0-11.0",
      "status": "NORMAL",
      "flags": ""
    },
    {
      "name": "RBC",
      "displayName": "Eritrocitos", 
      "value": "4.8",
      "unit": "x10⁶/μL",
      "referenceRange": "4.5-5.5",
      "status": "NORMAL",
      "flags": ""
    },
    {
      "name": "HGB",
      "displayName": "Hemoglobina",
      "value": "14.2",
      "unit": "g/dL",
      "referenceRange": "13.5-17.5",
      "status": "NORMAL",
      "flags": ""
    }
    // ... 17+ parámetros más
  ],
  "graphs": ["base64_histogram_data..."],
  "assignmentStatus": "unassigned"
}
```

### **Buscar por Número de Muestra**
```http
GET /dymind-dh36-results/sample/{sampleNumber}
```

**Ejemplo:** `GET /dymind-dh36-results/sample/H240930001`

## 📊 Estados de Procesamiento

| Estado | Descripción | Acción Requerida |
|--------|-------------|------------------|
| `unassigned` | Resultado recién recibido del equipo DH36 | ⚠️ Asignar paciente |
| `assigned` | Paciente asignado por técnico | ✅ Proceso completado |
| `verified` | Asignación verificada y confirmada | ✅ Validado |

## 🩸 Parámetros Hematológicos Incluidos

### **Conteo Celular Completo:**
- **WBC** - Leucocitos totales
- **RBC** - Eritrocitos
- **HGB** - Hemoglobina
- **HCT** - Hematocrito
- **PLT** - Plaquetas

### **Índices Eritrocitarios:**
- **MCV** - Volumen Corpuscular Medio
- **MCH** - Hemoglobina Corpuscular Media
- **MCHC** - Concentración de Hemoglobina Corpuscular Media
- **RDW-CV** - Ancho de Distribución Eritrocitaria

### **Diferencial de Leucocitos:**
- **NEU%** - Neutrófilos (%)
- **LYM%** - Linfocitos (%)
- **MON%** - Monocitos (%)
- **EOS%** - Eosinófilos (%)
- **BAS%** - Basófilos (%)

### **Conteo Absoluto:**
- **NEU#** - Neutrófilos absolutos
- **LYM#** - Linfocitos absolutos
- **MON#** - Monocitos absolutos
- **EOS#** - Eosinófilos absolutos
- **BAS#** - Basófilos absolutos

### **Parámetros Plaquetarios:**
- **MPV** - Volumen Plaquetario Medio
- **PDW** - Ancho de Distribución Plaquetaria
- **PCT** - Plaquetocrito

## 🎨 Implementación Frontend

### **Ejemplo con Angular/TypeScript**

```typescript
// Interfaces específicas para DH36
interface DH36UnassignedResult {
  id: string;
  patientName: string;
  testDate: string;
  testName: string;
  sampleNumber: string;
  result: string;
  patientAge: number;
  patientSex: string;
}

interface DH36Parameter {
  name: string;
  displayName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  flags: string;
}

interface DH36CompleteResult {
  id: number;
  patientName: string;
  sampleNumber: string;
  parameters: DH36Parameter[];
  graphs?: string[];
  assignmentStatus: string;
  testDate: string;
}

// Servicio
@Injectable()
export class DH36AssignmentService {
  
  // Obtener resultados sin asignar
  getUnassignedResults(limit = 50, offset = 0) {
    return this.http.get<DH36UnassignedResult[]>(
      `/dymind-dh36-results/unassigned?limit=${limit}&offset=${offset}`
    );
  }
  
  // Obtener resultado completo con parámetros
  getCompleteResult(id: string) {
    return this.http.get<DH36CompleteResult>(`/dymind-dh36-results/${id}`);
  }
  
  // Asignar paciente
  assignPatient(resultId: string, request: AssignPatientRequest) {
    return this.http.patch(
      `/dymind-dh36-results/${resultId}/assign-patient`, 
      request
    );
  }
}
```

### **Componente de Visualización de Hemograma**

```typescript
@Component({
  template: `
    <div class="hemogram-panel">
      <div class="patient-header">
        <h3>{{result.patientName}} - {{result.sampleNumber}}</h3>
        <span class="status" [ngClass]="result.assignmentStatus">
          {{result.assignmentStatus | titlecase}}
        </span>
      </div>
      
      <div class="parameters-grid">
        <!-- Conteo Principal -->
        <div class="parameter-section">
          <h4>Conteo Celular</h4>
          <div *ngFor="let param of mainParameters" 
               class="parameter-row" 
               [ngClass]="param.status.toLowerCase()">
            <span class="param-name">{{param.displayName}}</span>
            <span class="param-value">{{param.value}} {{param.unit}}</span>
            <span class="param-range">{{param.referenceRange}}</span>
            <span class="param-status">{{param.status}}</span>
          </div>
        </div>
        
        <!-- Diferencial -->
        <div class="parameter-section">
          <h4>Diferencial de Leucocitos</h4>
          <div *ngFor="let param of differentialParameters" 
               class="parameter-row"
               [ngClass]="param.status.toLowerCase()">
            <span class="param-name">{{param.displayName}}</span>
            <span class="param-value">{{param.value}}{{param.unit}}</span>
            <span class="param-range">{{param.referenceRange}}</span>
          </div>
        </div>
      </div>
      
      <div class="assignment-controls" *ngIf="result.assignmentStatus === 'unassigned'">
        <button (click)="openPatientSelection()" class="btn-assign">
          Asignar Paciente
        </button>
      </div>
    </div>
  `
})
export class DH36HemogramComponent {
  result: DH36CompleteResult;
  mainParameters: DH36Parameter[] = [];
  differentialParameters: DH36Parameter[] = [];
  
  ngOnInit() {
    this.categorizeParameters();
  }
  
  categorizeParameters() {
    const mainParams = ['WBC', 'RBC', 'HGB', 'HCT', 'PLT', 'MCV', 'MCH', 'MCHC'];
    const diffParams = ['NEU%', 'LYM%', 'MON%', 'EOS%', 'BAS%'];
    
    this.mainParameters = this.result.parameters.filter(p => 
      mainParams.includes(p.name)
    );
    
    this.differentialParameters = this.result.parameters.filter(p => 
      diffParams.includes(p.name)
    );
  }
  
  openPatientSelection() {
    // Implementar modal de selección de paciente
  }
}
```

## 📈 Casos de Uso Específicos DH36

### **Caso 1: Hemograma Normal**
- Todos los parámetros dentro del rango normal
- Asignación directa por coincidencia de nombre
- Verificación rápida de edad y sexo

### **Caso 2: Valores Críticos**
- Hemoglobina < 7 g/dL o Leucocitos > 50,000
- Verificación adicional del paciente
- Nota obligatoria sobre verificación de valores críticos
- Alertas automáticas al sistema

### **Caso 3: Pediatría**
- Rangos de referencia diferentes según edad
- Verificación cuidadosa de la edad del paciente
- Nota sobre grupo de referencia utilizado

### **Caso 4: Muestras Duplicadas**
- Mismo paciente, múltiples muestras del día
- Verificación de horarios y números de muestra
- Asignación secuencial con notas de seguimiento

## 🔍 Filtros y Búsquedas Avanzadas

### **Por Valores Críticos**
```http
GET /dymind-dh36-results/critical-values?parameter=HGB&threshold=7.0
```

### **Por Rango de Fechas y Estado**
```http
GET /dymind-dh36-results?startDate=2025-09-01&endDate=2025-09-30&status=unassigned
```

### **Por Parámetros Específicos**
```http
GET /dymind-dh36-results/by-parameter?name=WBC&minValue=15.0
```

## 🚨 Alertas y Valores Críticos

### **Valores que Requieren Atención Inmediata:**
- **Hemoglobina:** < 7.0 g/dL o > 18.0 g/dL
- **Leucocitos:** < 1.0 x10³/μL o > 50.0 x10³/μL
- **Plaquetas:** < 20 x10³/μL o > 1000 x10³/μL
- **Hematocrito:** < 20% o > 55%

### **Configuración de Alertas:**
```json
{
  "criticalValues": {
    "HGB": { "min": 7.0, "max": 18.0 },
    "WBC": { "min": 1.0, "max": 50.0 },
    "PLT": { "min": 20, "max": 1000 },
    "HCT": { "min": 20.0, "max": 55.0 }
  },
  "notifications": {
    "email": "laboratorio@hospital.com",
    "sms": "+1234567890",
    "dashboard": true
  }
}
```

## 🔧 Configuración del Equipo DH36

### **Parámetros de Conexión:**
- **IP del Servidor LIS:** 192.168.1.100
- **Puerto:** 5600
- **Protocolo:** TCP
- **Formato:** HL7 v2.x
- **Timeout:** 30 segundos

### **Configuración HL7:**
```
MSH|^~\&|DH36|LAB|LIS|HOSPITAL|20250930084500||ORU^R01|12345|P|2.3
PID|1||H240930001^^^LAB||Rodriguez^Carlos^||19890315|M|||123 Main St
OBR|1|||CBC^Complete Blood Count|||20250930084500
OBX|1|NM|WBC^Leucocitos|1|7.2|x10³/μL|4.0-11.0|N|||F
```

## 📞 Soporte y Troubleshooting

### **Errores Comunes:**

1. **Parsing HL7 Fallido**
   ```json
   {
     "error": "HL7_PARSE_ERROR",
     "message": "Formato de mensaje HL7 inválido",
     "segment": "OBX|1|NM|WBC..."
   }
   ```

2. **Parámetro Desconocido**
   ```json
   {
     "error": "UNKNOWN_PARAMETER",
     "message": "Parámetro XYZ no reconocido",
     "parameter": "XYZ"
   }
   ```

3. **Valores Fuera de Rango**
   ```json
   {
     "warning": "VALUE_OUT_OF_RANGE",
     "message": "Hemoglobina 25.0 g/dL excede límites normales",
     "parameter": "HGB",
     "value": "25.0"
   }
   ```

### **Logs y Monitoreo:**
- **TCP Connection Logs:** `/logs/dh36-tcp.log`
- **HL7 Parsing Logs:** `/logs/dh36-hl7.log`
- **Assignment Logs:** `/logs/dh36-assignment.log`
- **Critical Values:** `/logs/dh36-critical.log`

### **Métricas de Rendimiento:**
- Mensajes procesados por hora
- Tiempo promedio de parsing HL7
- Tasa de asignación exitosa
- Alertas de valores críticos generadas

## 📊 Dashboard y Reportes

### **Métricas Clave:**
- Resultados sin asignar por día
- Tiempo promedio de asignación
- Valores críticos detectados
- Tendencias de parámetros por paciente

### **Reportes Automáticos:**
- Resumen diario de actividad
- Alertas de valores críticos
- Estadísticas de asignación
- Rendimiento del equipo DH36

---

## 📚 Documentación Adicional

- **[PATIENT-ASSIGNMENT-SYSTEM.md](./PATIENT-ASSIGNMENT-SYSTEM.md)** - Sistema completo de asignación
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Guía completa de integración frontend
- **[README.md](./README.md)** - Configuración general del sistema

---

**Versión:** 1.0  
**Última actualización:** Septiembre 30, 2025  
**Autor:** Sistema LIS - Dymind  
**Contacto:** Equipo de Desarrollo LIS