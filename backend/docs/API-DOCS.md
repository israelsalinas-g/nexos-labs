# API Documentation for Frontend Development

## Table of Contents
1. [Common Enums](#common-enums)
2. [Doctors Management](#doctors-management)
3. [Exam Categories Management](#exam-categories-management)
4. [Test Definitions Management](#test-definitions-management)
5. [Test Profiles Management](#test-profiles-management)
6. [Test Results Management](#test-results-management)

## Common Enums

### ResultType
Tipo de resultado que puede producir una prueba.
```typescript
enum ResultType {
  NUMERIC = 'NUMERIC',           // Resultado numérico (ej: 1.2)
  TEXT = 'TEXT',                 // Resultado de texto libre
  OPTIONS = 'OPTIONS',           // Opciones predefinidas (ej: Positivo/Negativo)
  DETECTED = 'DETECTED',         // Detectado/No detectado
  REACTIVE = 'REACTIVE'          // Reactivo/No reactivo
}
```

### OrderStatus
Estado de una orden de laboratorio.
```typescript
enum OrderStatus {
  PENDING = 'PENDING',           // Pendiente de procesar
  IN_PROCESS = 'IN_PROCESS',     // En proceso
  COMPLETED = 'COMPLETED',       // Completada
  CANCELLED = 'CANCELLED',       // Cancelada
  DELIVERED = 'DELIVERED'        // Entregada al paciente
}
```

### TestStatus
Estado de una prueba individual.
```typescript
enum TestStatus {
  PENDING = 'PENDING',           // Pendiente de procesar
  SAMPLING = 'SAMPLING',         // En toma de muestra
  PROCESSING = 'PROCESSING',     // En procesamiento
  COMPLETED = 'COMPLETED',       // Completada
  CANCELLED = 'CANCELLED'        // Cancelada
}
```

### OrderPriority
Prioridad de una orden.
```typescript
enum OrderPriority {
  ROUTINE = 'ROUTINE',          // Rutina
  URGENT = 'URGENT',           // Urgente
  STAT = 'STAT'               // Emergencia
}
```

## Doctors Management

### Entity: Doctor
```typescript
interface Doctor {
  id: string;                 // UUID
  firstName: string;          // Requerido
  lastName: string;          // Requerido
  specialty?: string;        // Opcional
  licenseNumber?: string;    // Opcional, único
  phone?: string;           // Opcional
  email?: string;           // Opcional, único
  address?: string;         // Opcional
  institution?: string;     // Opcional
  isStaff: boolean;        // Default: false
  isActive: boolean;       // Default: true
  notes?: string;         // Opcional
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### GET /api/doctors
Obtener lista de médicos.
- Query params:
  - `includeInactive` (boolean, opcional): Incluir médicos inactivos
  - `staffOnly` (boolean, opcional): Solo médicos del staff

#### GET /api/doctors/:id
Obtener un médico por su ID.

#### POST /api/doctors
Crear un nuevo médico.
- Body: CreateDoctorDto

#### PATCH /api/doctors/:id
Actualizar un médico.
- Body: UpdateDoctorDto

#### PATCH /api/doctors/:id/toggle-active
Activar/Desactivar un médico.

#### DELETE /api/doctors/:id
Eliminar un médico (solo si no tiene órdenes asociadas).

## Exam Categories Management

### Entity: ExamCategory
```typescript
interface ExamCategory {
  id: number;
  name: string;              // Único
  code?: string;            // Opcional, único
  description?: string;     // Opcional
  color?: string;          // Opcional, formato: #RRGGBB
  displayOrder: number;    // Default: 0
  isActive: boolean;      // Default: true
  tests: TestDefinition[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### GET /api/exam-categories
Obtener lista de categorías.
- Query params:
  - `includeInactive` (boolean, opcional): Incluir categorías inactivas

#### GET /api/exam-categories/:id
Obtener una categoría por su ID.

#### POST /api/exam-categories
Crear una nueva categoría.
- Body: CreateExamCategoryDto

#### PATCH /api/exam-categories/:id
Actualizar una categoría.
- Body: UpdateExamCategoryDto

#### PATCH /api/exam-categories/:id/toggle-active
Activar/Desactivar una categoría.

#### DELETE /api/exam-categories/:id
Eliminar una categoría (solo si no tiene pruebas asociadas).

## Test Definitions Management

### Entity: TestDefinition
```typescript
interface TestDefinition {
  id: number;
  categoryId: number;
  name: string;
  code?: string;            // Opcional, único
  description?: string;     // Opcional
  resultType: ResultType;   // Enum
  unit?: string;           // Opcional
  referenceRange?: string; // Opcional
  method?: string;        // Opcional
  sampleType?: string;   // Opcional
  processingTime?: number; // Opcional, en horas
  price?: number;        // Opcional
  displayOrder: number;  // Default: 0
  isActive: boolean;    // Default: true
  profiles: TestProfile[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### GET /api/test-definitions
Obtener lista de definiciones de pruebas.
- Query params:
  - `categoryId` (number, opcional): Filtrar por categoría
  - `includeInactive` (boolean, opcional): Incluir pruebas inactivas

#### GET /api/test-definitions/:id
Obtener una definición por su ID.

#### POST /api/test-definitions
Crear una nueva definición.
- Body: CreateTestDefinitionDto

#### PATCH /api/test-definitions/:id
Actualizar una definición.
- Body: UpdateTestDefinitionDto

#### PATCH /api/test-definitions/:id/toggle-active
Activar/Desactivar una definición.

#### DELETE /api/test-definitions/:id
Eliminar una definición (solo si no está en perfiles).

## Test Profiles Management

### Entity: TestProfile
```typescript
interface TestProfile {
  id: number;
  categoryId: number;
  name: string;
  code?: string;           // Opcional, único
  description?: string;    // Opcional
  testIds: number[];      // IDs de TestDefinition
  price?: number;        // Opcional
  displayOrder: number; // Default: 0
  isActive: boolean;   // Default: true
  tests: TestDefinition[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### GET /api/test-profiles
Obtener lista de perfiles.
- Query params:
  - `categoryId` (number, opcional): Filtrar por categoría
  - `includeInactive` (boolean, opcional): Incluir perfiles inactivos

#### GET /api/test-profiles/:id
Obtener un perfil por su ID.

#### POST /api/test-profiles
Crear un nuevo perfil.
- Body: CreateTestProfileDto

#### PATCH /api/test-profiles/:id
Actualizar un perfil.
- Body: UpdateTestProfileDto

#### PATCH /api/test-profiles/:id/toggle-active
Activar/Desactivar un perfil.

#### DELETE /api/test-profiles/:id
Eliminar un perfil.

## Test Results Management

### Entity: TestResult
```typescript
interface TestResult {
  id: number;
  orderTestId: number;     // ID de OrderTest
  resultValue: string;     // Valor como string
  resultNumeric?: number;  // Opcional, para búsquedas
  referenceRange?: string; // Opcional
  isAbnormal: boolean;    // Default: false
  isCritical: boolean;   // Default: false
  abnormalFlag?: string; // Opcional (H/L/N)
  testedAt: Date;
  testedBy?: string;    // Opcional
  validatedAt?: Date;   // Opcional
  validatedBy?: string; // Opcional
  instrument?: string;  // Opcional
  observations?: string; // Opcional
  metadata?: any;      // Opcional, datos extra
  createdAt: Date;
  updatedAt: Date;
}
```

### Notas Importantes

1. **Autenticación**
   - Todos los endpoints requieren un token JWT válido en el header:
   ```
   Authorization: Bearer <token>
   ```

2. **Manejo de Errores**
   - Los errores siguen el formato estándar:
   ```typescript
   interface ErrorResponse {
     statusCode: number;
     message: string;
     error: string;
   }
   ```

3. **Paginación**
   - Los endpoints que retornan listas soportan paginación con query params:
     - `page` (number): Página actual
     - `limit` (number): Elementos por página
     - `sort` (string): Campo de ordenamiento
     - `order` (asc|desc): Dirección del ordenamiento

4. **Validaciones**
   - Los DTOs incluyen validaciones usando class-validator
   - Los errores de validación retornan 400 Bad Request con detalles

5. **Swagger/OpenAPI**
   - Documentación interactiva disponible en `/api-docs`
   - Swagger JSON disponible en `/api-docs-json`