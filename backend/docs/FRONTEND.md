# Guía de Integración Frontend - Sistema LIS

Este documento describe las entidades y endpoints necesarios para implementar los CRUDs en el frontend del sistema LIS.

## Entidades Principales

### 1. Categorías de Exámenes (exam-categories)

```typescript
interface ExamCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /api/exam-categories` - Listar categorías (paginado)
- `GET /api/exam-categories/:id` - Obtener una categoría
- `POST /api/exam-categories` - Crear nueva categoría
- `PATCH /api/exam-categories/:id` - Actualizar categoría
- `DELETE /api/exam-categories/:id` - Eliminar categoría (soft delete)

### 2. Órdenes de Laboratorio (laboratory-order)

```typescript
interface LaboratoryOrder {
  id: string;
  patientId: string;
  orderNumber: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  requestedBy: string;
  requestDate: Date;
  dueDate?: Date;
  diagnosisNotes?: string;
  testProfiles: TestProfile[];
  testDefinitions: TestDefinition[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /api/laboratory-orders` - Listar órdenes (paginado)
- `GET /api/laboratory-orders/:id` - Obtener una orden
- `POST /api/laboratory-orders` - Crear nueva orden
- `PATCH /api/laboratory-orders/:id` - Actualizar orden
- `DELETE /api/laboratory-orders/:id` - Cancelar orden

### 3. Definiciones de Pruebas (test-definitions)

```typescript
interface TestDefinition {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  method?: string;
  unit?: string;
  referenceRanges?: {
    gender?: 'M' | 'F';
    minAge?: number;
    maxAge?: number;
    minValue: number;
    maxValue: number;
    description?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /api/test-definitions` - Listar definiciones (paginado)
- `GET /api/test-definitions/:id` - Obtener una definición
- `POST /api/test-definitions` - Crear nueva definición
- `PATCH /api/test-definitions/:id` - Actualizar definición
- `DELETE /api/test-definitions/:id` - Eliminar definición (soft delete)

### 4. Perfiles de Pruebas (test-profile)

```typescript
interface TestProfile {
  id: string;
  code: string;
  name: string;
  description?: string;
  testDefinitions: string[]; // Array de IDs de TestDefinition
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /api/test-profiles` - Listar perfiles (paginado)
- `GET /api/test-profiles/:id` - Obtener un perfil
- `POST /api/test-profiles` - Crear nuevo perfil
- `PATCH /api/test-profiles/:id` - Actualizar perfil
- `DELETE /api/test-profiles/:id` - Eliminar perfil (soft delete)

### 5. Resultados de Pruebas (test-results)

```typescript
interface TestResult {
  id: string;
  orderId: string;
  testDefinitionId: string;
  value: string | number;
  unit?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  isAbnormal: boolean;
  notes?: string;
  performedBy?: string;
  verifiedBy?: string;
  performedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /api/test-results` - Listar resultados (paginado)
- `GET /api/test-results/:id` - Obtener un resultado
- `POST /api/test-results` - Crear nuevo resultado
- `PATCH /api/test-results/:id` - Actualizar resultado
- `DELETE /api/test-results/:id` - Eliminar resultado

## Paginación

Todos los endpoints de listado soportan los siguientes parámetros de query:

```typescript
interface PaginationQuery {
  page?: number;      // Página actual (default: 1)
  limit?: number;     // Elementos por página (default: 10)
  search?: string;    // Búsqueda general
  sortBy?: string;    // Campo por el cual ordenar
  sortOrder?: 'ASC' | 'DESC'; // Dirección del ordenamiento
}
```

La respuesta paginada tiene la siguiente estructura:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Filtros Comunes

Los endpoints de listado también soportan filtros específicos:

### laboratory-order
- `status`: Estado de la orden
- `priority`: Prioridad de la orden
- `patientId`: ID del paciente
- `dateFrom`: Fecha inicial
- `dateTo`: Fecha final

### test-results
- `orderId`: ID de la orden
- `status`: Estado del resultado
- `testDefinitionId`: ID de la definición de prueba
- `dateFrom`: Fecha inicial
- `dateTo`: Fecha final

## Manejo de Errores

Las respuestas de error seguirán este formato:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}
```

Códigos de estado comunes:
- 400: Bad Request - Datos inválidos
- 401: Unauthorized - No autenticado
- 403: Forbidden - No autorizado
- 404: Not Found - Recurso no encontrado
- 422: Unprocessable Entity - Validación fallida
- 500: Internal Server Error - Error del servidor

## Validaciones Importantes

### exam-categories
- `name`: Requerido, único, mínimo 3 caracteres
- `description`: Opcional, máximo 500 caracteres

### laboratory-order
- `patientId`: Requerido, debe existir
- `testProfiles` o `testDefinitions`: Al menos uno debe estar presente
- `requestDate`: No puede ser futura
- `dueDate`: Debe ser posterior a requestDate

### test-definitions
- `code`: Requerido, único, formato alfanumérico
- `name`: Requerido, único
- `categoryId`: Requerido, debe existir
- `referenceRanges`: Debe tener valores válidos y coherentes

### test-profile
- `code`: Requerido, único, formato alfanumérico
- `name`: Requerido, único
- `testDefinitions`: Array no vacío de IDs válidos

### test-results
- `orderId`: Requerido, debe existir
- `testDefinitionId`: Requerido, debe existir
- `value`: Requerido, debe coincidir con el tipo esperado
- `status`: Transiciones válidas: pending -> in-progress -> completed -> verified