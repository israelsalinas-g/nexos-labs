# README - Asignación de Pacientes iChroma II

## 📋 Descripción General

El equipo **iChroma II** envía resultados de química clínica con información del paciente (nombre, edad, sexo) pero sin un `patientId` válido que coincida con los pacientes registrados en el sistema LIS. Este documento describe el proceso de asignación manual que permite a los técnicos de laboratorio asociar estos resultados con los pacientes correctos.

## 🎯 Problema y Solución

### **Problema:**
- El iChroma II envía datos con `patient_name`, `patient_age`, `patient_sex`
- El campo `patientId` viene vacío o no coincide con la base de datos
- Necesidad de asociar manualmente estos resultados con pacientes registrados

### **Solución:**
- Sistema de asignación manual por técnicos de laboratorio
- Estados de procesamiento para tracking de asignaciones
- Búsqueda flexible por nombre de paciente
- Historial de asignaciones con auditoría

## 🔄 Flujo de Trabajo

### 1. **Recepción Automática de Datos**
```
iChroma II → LIS Server → Base de datos
Estado inicial: assignmentStatus = 'unassigned'
```

### 2. **Revisión por Técnico de Laboratorio**
- Consultar resultados pendientes de asignación
- Verificar información del paciente (nombre, edad, sexo)
- Buscar paciente correcto en el sistema

### 3. **Asignación Manual**
- Seleccionar paciente correcto
- Agregar notas de verificación si es necesario
- Confirmar asignación

### 4. **Verificación Final (Opcional)**
- Revisar asignaciones realizadas
- Marcar como verificadas si es necesario

## 🛠️ Endpoints de la API

### **Ver Resultados Sin Asignar**
```http
GET /ichroma-results/unassigned?limit=50&offset=0
```

**Descripción:** Lista todos los resultados de iChroma II que necesitan asignación de paciente

**Parámetros:**
- `limit` (opcional): Número máximo de resultados (default: 50)
- `offset` (opcional): Número de resultados a omitir (default: 0)

**Respuesta:**
```json
[
  {
    "id": "123",
    "patientName": "María García",
    "testDate": "2025-09-30T10:30:00Z",
    "testName": "Beta HCG",
    "sampleNumber": "INVAA12",
    "testType": "ICHROMA",
    "result": "15.2 mIU/mL",
    "patientAge": 28,
    "patientSex": "F"
  }
]
```

### **Asignar Paciente a Resultado**
```http
PATCH /ichroma-results/{id}/assign-patient
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Confirmado por edad y documento de identidad"
}
```

**Respuesta:**
```json
{
  "id": 123,
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "María García",
  "assignmentStatus": "assigned",
  "assignedAt": "2025-09-30T14:15:00Z",
  "assignmentNotes": "Confirmado por edad y documento de identidad"
}
```

### **Buscar por Nombre de Paciente**
```http
GET /ichroma-results/search/by-patient-name/{name}
```

**Ejemplo:** `GET /ichroma-results/search/by-patient-name/María García`

**Descripción:** Busca resultados usando el nombre del paciente que viene del equipo (búsqueda parcial e insensible a mayúsculas)

### **Filtrar por Estado de Asignación**
```http
GET /ichroma-results/by-assignment-status/{status}?limit=50&offset=0
```

**Estados disponibles:**
- `unassigned`: Sin asignar (necesita intervención)
- `assigned`: Asignado por técnico
- `verified`: Verificado y confirmado

### **Buscar por Número de Muestra**
```http
GET /ichroma-results/sample/{sampleId}
```

**Ejemplo:** `GET /ichroma-results/sample/INVAA12`

## 📊 Estados de Procesamiento

| Estado | Descripción | Acción Requerida |
|--------|-------------|------------------|
| `unassigned` | Resultado recién recibido del equipo | ⚠️ Asignar paciente |
| `assigned` | Paciente asignado por técnico | ✅ Proceso completado |
| `verified` | Asignación verificada y confirmada | ✅ Validado |

## 🎨 Implementación Frontend

### **Ejemplo con Angular/TypeScript**

```typescript
// Interfaces
interface IChromaUnassignedResult {
  id: string;
  patientName: string;
  testDate: string;
  testName: string;
  sampleNumber: string;
  result: string;
  patientAge: number;
  patientSex: string;
}

interface AssignPatientRequest {
  patientId: string;
  notes?: string;
}

// Servicio
@Injectable()
export class IChromaAssignmentService {
  
  // Obtener resultados sin asignar
  getUnassignedResults(limit = 50, offset = 0) {
    return this.http.get<IChromaUnassignedResult[]>(
      `/ichroma-results/unassigned?limit=${limit}&offset=${offset}`
    );
  }
  
  // Asignar paciente
  assignPatient(resultId: string, request: AssignPatientRequest) {
    return this.http.patch(
      `/ichroma-results/${resultId}/assign-patient`, 
      request
    );
  }
  
  // Buscar por nombre
  searchByPatientName(name: string) {
    return this.http.get<IChromaUnassignedResult[]>(
      `/ichroma-results/search/by-patient-name/${encodeURIComponent(name)}`
    );
  }
}
```

### **Componente de Asignación**

```typescript
@Component({
  template: `
    <div class="assignment-panel">
      <h3>Resultados iChroma II - Pendientes de Asignación</h3>
      
      <div *ngFor="let result of unassignedResults" class="result-card">
        <div class="patient-info">
          <strong>{{result.patientName}}</strong>
          <span>{{result.patientAge}} años, {{result.patientSex}}</span>
        </div>
        <div class="test-info">
          <span>{{result.testName}}: {{result.result}}</span>
          <small>Muestra: {{result.sampleNumber}}</small>
        </div>
        <button (click)="openPatientSelection(result)" class="btn-assign">
          Asignar Paciente
        </button>
      </div>
    </div>
  `
})
export class IChromaAssignmentComponent {
  unassignedResults: IChromaUnassignedResult[] = [];
  
  ngOnInit() {
    this.loadUnassignedResults();
  }
  
  loadUnassignedResults() {
    this.ichromaService.getUnassignedResults().subscribe(results => {
      this.unassignedResults = results;
    });
  }
  
  openPatientSelection(result: IChromaUnassignedResult) {
    // Abrir modal/componente para seleccionar paciente correcto
    // Implementar búsqueda de pacientes por nombre similar
  }
}
```

## 📈 Casos de Uso Comunes

### **Caso 1: Asignación Directa**
- Técnico encuentra coincidencia exacta por nombre
- Verifica edad y sexo
- Asigna directamente sin notas adicionales

### **Caso 2: Verificación por Documento**
- Nombre similar pero no exacto
- Técnico solicita documento al paciente
- Confirma identidad y asigna con nota explicativa

### **Caso 3: Homonimia**
- Múltiples pacientes con nombres similares
- Verificación por edad, sexo, y documento
- Nota detallada del proceso de verificación

## 🔍 Búsqueda y Filtros Avanzados

### **Por Rango de Fechas**
```http
GET /ichroma-results?startDate=2025-09-01&endDate=2025-09-30
```

### **Por Tipo de Test**
```http
GET /ichroma-results/by-test-type/Beta%20HCG
```

### **Historial de Asignaciones**
```http
GET /ichroma-results?assignedBy=usuario123&assignmentDate=2025-09-30
```

## 🚨 Consideraciones Importantes

### **Seguridad:**
- Todas las asignaciones quedan registradas con timestamp
- Se recomienda implementar autenticación de usuario
- Logs de auditoría para trazabilidad

### **Validaciones:**
- Verificar que el paciente existe en el sistema
- Confirmar que el patientId es válido (UUID)
- Validar que el resultado no esté ya asignado

### **Rendimiento:**
- Usar paginación para listas grandes
- Implementar caché para búsquedas frecuentes
- Índices en campos de búsqueda (patientName, sampleNumber)

## 📞 Soporte y Troubleshooting

### **Errores Comunes:**

1. **404 - Resultado no encontrado**
   ```json
   {
     "statusCode": 404,
     "message": "Resultado de iChroma no encontrado"
   }
   ```

2. **400 - PatientId inválido**
   ```json
   {
     "statusCode": 400,
     "message": "ID de paciente inválido o no existe"
   }
   ```

3. **409 - Resultado ya asignado**
   ```json
   {
     "statusCode": 409,
     "message": "Este resultado ya tiene un paciente asignado"
   }
   ```

### **Logs y Monitoreo:**
- Revisar logs en `/logs/ichroma-assignment.log`
- Métricas disponibles en dashboard de administración
- Alertas automáticas para resultados sin asignar > 24h

---

## 📚 Documentación Adicional

- **[PATIENT-ASSIGNMENT-SYSTEM.md](./PATIENT-ASSIGNMENT-SYSTEM.md)** - Sistema completo de asignación
- **[ICHROMA_SYSTEM_DOCUMENTATION.md](./ICHROMA_SYSTEM_DOCUMENTATION.md)** - Documentación técnica iChroma II
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Guía completa de integración frontend

---

**Versión:** 1.0  
**Última actualización:** Septiembre 30, 2025  
**Autor:** Sistema LIS - Dymind  
**Contacto:** Equipo de Desarrollo LIS