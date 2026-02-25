# Dashboard API Endpoints

## Descripción General
API completa del dashboard para el sistema de gestión de laboratorio médico. Proporciona estadísticas en tiempo real, estado del sistema, y métricas de todos los tipos de exámenes médicos.

## Endpoints Principales

### 🏠 Estadísticas Generales del Dashboard
**GET** `/dashboard/stats`
- **Descripción**: Obtiene estadísticas completas del sistema médico
- **Respuesta**: Estadísticas generales incluyendo todos los tipos de exámenes, pacientes y estado del sistema
- **Uso**: Para la vista principal del dashboard con cards estadísticos

### 👥 Estadísticas de Pacientes
**GET** `/dashboard/patients/stats`
- **Descripción**: Estadísticas específicas de pacientes
- **Respuesta**: Total activos, nuevos hoy, nuevos esta semana, pacientes con pendientes
- **Uso**: Para mostrar métricas de gestión de pacientes

### 🏥 Estado de Salud del Sistema
**GET** `/dashboard/system/health`
- **Descripción**: Estado general del sistema y equipos conectados
- **Respuesta**: Estado (healthy/warning/error), equipos conectados, alertas, último procesamiento
- **Uso**: Para indicadores de estado del sistema y alertas

### 📊 Resumen Rápido
**GET** `/dashboard/summary`
- **Descripción**: Resumen rápido para notificaciones
- **Respuesta**: Total pendientes, alertas críticas, equipos offline
- **Uso**: Para badges de notificaciones y contadores rápidos

## Endpoints por Tipo de Examen

### 🩸 Hemogramas (DH36)
**GET** `/dashboard/hemogramas/stats`
- **Descripción**: Estadísticas específicas de hemogramas procesados por DH36
- **Uso**: Para la sección de hemogramas en el menú lateral

### 🧪 iChroma II
**GET** `/dashboard/ichroma/stats`
- **Descripción**: Estadísticas específicas de exámenes procesados por iChroma II
- **Uso**: Para la sección de iChroma en el menú lateral

### 💧 Exámenes de Orina
**GET** `/dashboard/orina/stats`
- **Descripción**: Estadísticas específicas de exámenes generales de orina
- **Uso**: Para la sección de orina en el menú lateral

### 💩 Exámenes de Heces
**GET** `/dashboard/heces/stats`
- **Descripción**: Estadísticas específicas de exámenes de heces (módulo futuro)
- **Uso**: Para la sección de heces en el menú lateral

### 🔧 Endpoint Genérico
**GET** `/dashboard/exams/{type}/stats`
- **Parámetros**: 
  - `type`: Enum (`hemogramas`, `ichroma`, `orina`, `heces`)
- **Descripción**: Endpoint genérico para obtener estadísticas de cualquier tipo de examen
- **Uso**: Para funcionalidad dinámica o programática

## Endpoints Auxiliares

### 🚨 Alertas del Sistema
**GET** `/dashboard/alerts`
- **Descripción**: Obtiene solo las alertas actuales del sistema
- **Respuesta**: Lista de alertas y nivel de severidad (info/warning/critical)
- **Uso**: Para componentes de alertas y notificaciones

### ⏳ Exámenes Pendientes de Revisión
**GET** `/dashboard/pending-reviews`
- **Descripción**: Número de exámenes pendientes de revisión por tipo
- **Respuesta**: Total y desglose por tipo de examen
- **Uso**: Para indicadores de trabajo pendiente

## Estructura de Respuestas

### DashboardStatsDto
```typescript
{
  resultadosEntregados: number;        // Total de resultados completados
  pendientesRevision: number;          // Total de exámenes pendientes
  muestrasRechazadas: number;          // Total de muestras rechazadas
  nuevosPacientesHoy: number;          // Nuevos pacientes registrados hoy
  estadisticasPorTipo: {
    hemogramas: ExamTypeStats;
    ichroma: ExamTypeStats;
    orina: ExamTypeStats;
    heces: ExamTypeStats;
  };
  pacientes: PatientStatsDto;
  estadoSistema: SystemHealthDto;
}
```

### ExamTypeStats
```typescript
{
  totalHoy: number;                    // Total procesado hoy
  completados: number;                 // Exámenes completados
  pendientes: number;                  // Exámenes pendientes
  enProgreso: number;                  // Exámenes en progreso
  rechazados: number;                  // Exámenes rechazados
  promedioDiario: number;              // Promedio de exámenes por día
  tendencia: 'up' | 'down' | 'stable'; // Tendencia vs. período anterior
}
```

### PatientStatsDto
```typescript
{
  totalActivos: number;                // Total de pacientes activos
  nuevosHoy: number;                   // Nuevos pacientes hoy
  nuevosEstaSemana: number;            // Nuevos pacientes esta semana
  pacientesConPendientes: number;      // Pacientes con exámenes pendientes
}
```

### SystemHealthDto
```typescript
{
  estado: 'healthy' | 'warning' | 'error'; // Estado general del sistema
  equiposConectados: number;               // Número de equipos conectados
  alertas: string[];                       // Lista de alertas activas
  ultimoProcesamientoAutomatico: Date;     // Último procesamiento automático
}
```

## Casos de Uso Frontend

### Dashboard Principal
```typescript
// Obtener estadísticas completas para cards principales
const stats = await fetch('/api/dashboard/stats');
```

### Menú Lateral - Navegación por Tipo
```typescript
// Para cada sección del menú lateral
const orinaStats = await fetch('/api/dashboard/orina/stats');
const iChromaStats = await fetch('/api/dashboard/ichroma/stats');
const hemogramaStats = await fetch('/api/dashboard/hemogramas/stats');
```

### Componente de Alertas
```typescript
// Para mostrar alertas en tiempo real
const alerts = await fetch('/api/dashboard/alerts');
```

### Indicador de Trabajo Pendiente
```typescript
// Para badges de notificación
const pending = await fetch('/api/dashboard/pending-reviews');
```

### Monitor de Estado del Sistema
```typescript
// Para indicadores de estado de equipos
const health = await fetch('/api/dashboard/system/health');
```

## Integración con Frontend Angular

### Servicios Recomendados
```typescript
// dashboard.service.ts
@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>('/api/dashboard/stats');
  }

  getExamTypeStats(type: ExamType): Observable<ExamTypeStats> {
    return this.http.get<ExamTypeStats>(`/api/dashboard/exams/${type}/stats`);
  }
}
```

### Componentes Sugeridos
1. **DashboardComponent**: Vista principal con cards estadísticos
2. **SystemHealthComponent**: Indicadores de estado y alertas
3. **ExamTypeCardComponent**: Cards para cada tipo de examen
4. **PendingReviewsComponent**: Lista de pendientes por tipo
5. **AlertsComponent**: Notificaciones y alertas del sistema

## Notas Técnicas

### Rendimiento
- Todas las consultas están optimizadas con agregaciones de base de datos
- Las estadísticas se calculan en tiempo real pero pueden ser cacheadas si es necesario
- Se usan consultas paralelas para mejorar el tiempo de respuesta

### Escalabilidad
- El sistema está diseñado para manejar múltiples tipos de exámenes
- Nuevos tipos de examen se pueden agregar fácilmente
- La arquitectura modular permite extensión sin impacto en funcionalidad existente

### Documentación Swagger
- Todos los endpoints están documentados con Swagger/OpenAPI
- Disponible en `/api/docs` cuando el servidor esté ejecutándose
- Incluye ejemplos de respuesta y códigos de estado

### Estados de Exámenes Soportados
- **Orina**: `pending`, `in_progress`, `completed`, `rejected`
- **iChroma II**: `pending`, `processing`, `completed`, `error`
- **Hemogramas**: (Por implementar) `pending`, `processing`, `completed`, `failed`
- **Heces**: (Módulo futuro) Estados por definir