# Guía para Desarrolladores Frontend (Angular)

## Sistema LIS - Gestión de Exámenes Clínicos

Este documento describe en detalle todas las entidades, modelos, DTOs y endpoints que necesitas para implementar los CRUDs en Angular.

---

## ℹ️ Información Importante sobre IDs (UUIDs)

### Formato de IDs

Todos los IDs en este sistema son **UUIDs (Identificadores Universales Únicos)** generados por el backend en formato string:

```
Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Ejemplo: 550e8400-e29b-41d4-a716-446655440000
Tipo:    string
```

### Para Desarrolladores Angular

- Los IDs se reciben como `string` en todas las respuestas JSON del API
- Son seguros de enviar en URLs, query parameters y request bodies
- Angular los trata como strings normales - no requiere conversión especial
- Ideal para debugging: fácil de identificar por su formato

### Manejo en Angular

```typescript
// Estas operaciones funcionan normalmente:
this.route.params.subscribe(params => {
  const id = params['id'];  // Ya es string UUID
  this.http.get(`/api/test-definitions/${id}`);
});

// En templates:
<button [routerLink]="['/test-definitions', test.id]">
  Ver Detalles
</button>

// En formularios:
this.form.patchValue({
  categoryId: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890'
});
```

---

## 📋 Tabla de Contenidos

1. [Información sobre IDs (UUIDs)](#ℹ️-información-importante-sobre-ids-uuids)
2. [Modelos de Datos](#modelos-de-datos)
3. [DTOs (Data Transfer Objects)](#dtos)
4. [Endpoints](#endpoints)
5. [Relaciones entre Entidades](#relaciones-entre-entidades)
6. [Casos de Uso Comunes](#casos-de-uso-comunes)
7. [Ejemplos de Integración Angular](#ejemplos-de-integración-angular)

---

## Modelos de Datos

### 1. ExamCategory (Categoría de Exámenes)

Agrupa las pruebas en categorías como Serología, Inmunología, Química Sanguínea, etc.

#### Campos:

```typescript
interface ExamCategory {
  id: string;                 // UUID generado por el backend
  name: string;               // Ej: "Serología", "Inmunología"
  description?: string;       // Descripción detallada (opcional)
  isActive: boolean;          // Indica si está disponible para usar
  createdAt: Date;            // Fecha de creación (ISO 8601)
  updatedAt: Date;            // Fecha última actualización (ISO 8601)
}
```

#### Validaciones:
- `name`: Requerido, mínimo 3 caracteres, máximo 100
- `name`: Debe ser único en la base de datos
- `description`: Máximo 500 caracteres

#### Ejemplo:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Serología",
  "description": "Pruebas serológicas para detección de anticuerpos",
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

---

### 2. TestDefinition (Definición de Prueba)

Define cada prueba específica que se puede realizar. Una prueba pertenece a una categoría.

#### Campos:

```typescript
interface TestDefinition {
  id: string;                 // UUID generado por el backend
  code: string;               // Código único (Ej: "GLU", "HB")
  name: string;               // Nombre descriptivo (Ej: "Glucosa")
  categoryId: string;         // UUID de la categoría a la que pertenece
  category: ExamCategory;     // Objeto completo de la categoría (relación)
  description?: string;       // Descripción de la prueba (opcional)
  method?: string;            // Método de análisis (Ej: "Enzimático")
  unit?: string;              // Unidad de medida (Ej: "mg/dL", "g/dL")
  resultType: string;         // Tipo de resultado
  displayOrder?: number;      // Orden de visualización en UI
  isActive: boolean;          // Disponible para usar
  createdAt: Date;            // Fecha de creación
  updatedAt: Date;            // Fecha última actualización
  resultDefinitions?: TestResultDefinition[]; // Valores posibles
}
```

#### ResultType (Tipos de Resultado):

```typescript
enum ResultType {
  BINARY = 'binary',          // Positivo/Negativo
  SCALE = 'scale',            // Escala: Escaso, Moderado, Abundante
  NUMERIC = 'numeric',        // Valor numérico (Ej: 100.5)
  TEXT = 'text',              // Texto libre (Ej: Descripción microscópica)
  REACTIVE = 'reactive'       // Reactivo/No reactivo
}
```

#### Validaciones:
- `code`: Requerido, único, alfanumérico, máximo 20 caracteres
- `name`: Requerido, único, mínimo 3 caracteres, máximo 100
- `categoryId`: Requerido, debe existir en exam_categories
- `resultType`: Requerido, debe ser uno de los valores del enum

#### Ejemplo:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "code": "GLU",
  "name": "Glucosa",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Química Sanguínea",
    "isActive": true
  },
  "description": "Medición de glucosa en sangre",
  "method": "Enzimático",
  "unit": "mg/dL",
  "resultType": "numeric",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z",
  "resultDefinitions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Glucosa Normal",
      "config": {
        "numericMin": 70,
        "numericMax": 100,
        "interpretation": "Normal",
        "color": "#4CAF50"
      }
    }
  ]
}
```

---

### 3. TestResultDefinition (Definición de Resultado de Prueba)

Define los valores posibles y configuraciones para los resultados de una prueba.

#### Campos:

```typescript
interface TestResultDefinition {
  id: string;                 // UUID generado por el backend
  name: string;               // Ej: "Positivo", "Escaso", "Normal"
  testDefinitionId: string;   // UUID de la prueba a la que pertenece
  testDefinition: TestDefinition; // Objeto completo de la prueba (relación)
  config: {
    // Para resultados BINARY
    binaryValue?: boolean;    // true/false
    
    // Para resultados SCALE
    scaleValue?: string;      // Ej: "Escaso", "Moderado", "Abundante"
    scaleOrder?: number;      // Orden para visualización: 1, 2, 3
    
    // Para resultados NUMERIC
    numericMin?: number;      // Valor mínimo de rango normal
    numericMax?: number;      // Valor máximo de rango normal
    
    // Interpretación clínica común para todos
    interpretation?: string;  // "Normal", "Anormal", "Crítico", "Positivo", etc
    color?: string;           // Color para UI: "#4CAF50", "#FF5722", "#FF9800"
  };
  isActive: boolean;          // Disponible para usar
  createdAt: Date;            // Fecha de creación
  updatedAt: Date;            // Fecha última actualización
}
```

#### Ejemplos por Tipo:

**BINARY (Positivo/Negativo):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Positivo",
    "config": {
      "binaryValue": true,
      "interpretation": "Positivo",
      "color": "#FF5722"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Negativo",
    "config": {
      "binaryValue": false,
      "interpretation": "Negativo",
      "color": "#4CAF50"
    }
  }
]
```

**SCALE (Escala):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440005",
    "name": "Escaso",
    "config": {
      "scaleValue": "Escaso",
      "scaleOrder": 1,
      "interpretation": "Escaso",
      "color": "#4CAF50"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440006",
    "name": "Moderado",
    "config": {
      "scaleValue": "Moderado",
      "scaleOrder": 2,
      "interpretation": "Moderado",
      "color": "#FF9800"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440007",
    "name": "Abundante",
    "config": {
      "scaleValue": "Abundante",
      "scaleOrder": 3,
      "interpretation": "Abundante",
      "color": "#FF5722"
    }
  }
]
```

**NUMERIC (Rango Normal):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440008",
    "name": "Glucosa Normal",
    "config": {
      "numericMin": 70,
      "numericMax": 100,
      "interpretation": "Normal",
      "color": "#4CAF50"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440009",
    "name": "Glucosa Elevada",
    "config": {
      "numericMin": 100,
      "numericMax": null,
      "interpretation": "Anormal",
      "color": "#FF5722"
    }
  }
]
```

---

### 4. TestProfile (Perfil de Pruebas)

Un perfil agrupa múltiples pruebas que típicamente se solicitan juntas.

#### Campos:

```typescript
interface TestProfile {
  id: string;                 // UUID generado por el backend
  code: string;               // Código único (Ej: "PROFILE-CARDIO")
  name: string;               // Nombre descriptivo (Ej: "Perfil Cardiológico")
  description?: string;       // Descripción del perfil (opcional)
  testDefinitionIds: string[]; // Array de UUIDs de pruebas
  testDefinitions?: TestDefinition[]; // Array completo de pruebas (relación)
  displayOrder?: number;      // Orden de visualización
  isActive: boolean;          // Disponible para usar
  createdAt: Date;            // Fecha de creación
  updatedAt: Date;            // Fecha última actualización
}
```

#### Validaciones:
- `code`: Requerido, único, alfanumérico, máximo 50
- `name`: Requerido, único, mínimo 3 caracteres, máximo 100
- `testDefinitionIds`: Requerido, array con mínimo 1 elemento
- Todos los IDs en `testDefinitionIds` deben existir

#### Ejemplo:
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440010",
  "code": "PROFILE-COMPLETE-BLOOD",
  "name": "Hemograma Completo",
  "description": "Incluye conteo completo de células sanguíneas",
  "testDefinitionIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002",
    "660e8400-e29b-41d4-a716-446655440003"
  ],
  "testDefinitions": [
    { /* TestDefinition objeto */ },
    { /* TestDefinition objeto */ },
    { /* TestDefinition objeto */ }
  ],
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

---

### 5. TestResult (Resultado de Prueba)

Almacena el resultado real de una prueba realizada a un paciente.

#### Campos:

```typescript
interface TestResult {
  id: string;                 // UUID generado por el backend
  patientExaminationId: string; // UUID del examen del paciente
  testDefinitionId: string;   // UUID de la definición de prueba
  testDefinition?: TestDefinition; // Objeto completo (relación, opcional)
  resultValue: string;        // Valor del resultado como texto
                              // Ej: "100.5", "Positivo", "Moderado"
  resultInterpretation?: string; // Ej: "Normal", "Anormal", "Crítico"
  isAbnormal: boolean;        // Indica si el resultado es anormal
  reference?: string;         // Referencias según sexo/edad
                              // Ej: "70-100 mg/dL (Adultos)"
                              //     "M: 13.5-17.5 g/dL, F: 12-15 g/dL"
  notes?: string;             // Notas adicionales (máximo 500 caracteres)
  resultDate?: Date;          // Fecha en que se realizó la prueba
  createdAt: Date;            // Fecha de creación del registro
  updatedAt: Date;            // Fecha de última actualización
}
```

#### Validaciones:
- `patientExaminationId`: Requerido, debe existir
- `testDefinitionId`: Requerido, debe existir
- `resultValue`: Requerido, máximo 255 caracteres
- `isAbnormal`: Requerido, booleano

#### Ejemplo:
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440011",
  "patientExaminationId": "bb0e8400-e29b-41d4-a716-446655440012",
  "testDefinitionId": "660e8400-e29b-41d4-a716-446655440001",
  "testDefinition": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "code": "GLU",
    "name": "Glucosa",
    "unit": "mg/dL"
  },
  "resultValue": "95.5",
  "resultInterpretation": "Normal",
  "isAbnormal": false,
  "reference": "70-100 mg/dL (Ayunas)",
  "notes": "Paciente en ayunas de 8 horas",
  "resultDate": "2025-10-16T08:00:00Z",
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

---

## DTOs

Los DTOs se utilizan para enviar datos al backend. Son estructuras simplificadas para creación y actualización.

### CreateExamCategoryDto

```typescript
interface CreateExamCategoryDto {
  name: string;               // Requerido
  description?: string;       // Opcional
}
```

### UpdateExamCategoryDto

```typescript
interface UpdateExamCategoryDto {
  name?: string;              // Opcional
  description?: string;       // Opcional
  isActive?: boolean;         // Opcional
}
```

### CreateTestDefinitionDto

```typescript
interface CreateTestDefinitionDto {
  code: string;               // Requerido
  name: string;               // Requerido
  categoryId: string;         // Requerido (UUID)
  description?: string;       // Opcional
  method?: string;            // Opcional
  unit?: string;              // Opcional
  resultType: string;         // Requerido (enum)
  displayOrder?: number;      // Opcional
}
```

### UpdateTestDefinitionDto

```typescript
interface UpdateTestDefinitionDto {
  code?: string;              // Opcional
  name?: string;              // Opcional
  categoryId?: string;        // Opcional
  description?: string;       // Opcional
  method?: string;            // Opcional
  unit?: string;              // Opcional
  resultType?: string;        // Opcional
  displayOrder?: number;      // Opcional
  isActive?: boolean;         // Opcional
}
```

### CreateTestResultDefinitionDto

```typescript
interface CreateTestResultDefinitionDto {
  name: string;               // Requerido
  testDefinitionId: string;   // Requerido (UUID)
  config: {
    binaryValue?: boolean;    // Para BINARY
    scaleValue?: string;      // Para SCALE
    scaleOrder?: number;      // Para SCALE
    numericMin?: number;      // Para NUMERIC
    numericMax?: number;      // Para NUMERIC
    interpretation?: string;  // Recomendado
    color?: string;           // Recomendado
  };
}
```

### UpdateTestResultDefinitionDto

```typescript
interface UpdateTestResultDefinitionDto {
  name?: string;              // Opcional
  config?: {                  // Objeto parcial
    binaryValue?: boolean;
    scaleValue?: string;
    scaleOrder?: number;
    numericMin?: number;
    numericMax?: number;
    interpretation?: string;
    color?: string;
  };
  isActive?: boolean;         // Opcional
}
```

### CreateTestProfileDto

```typescript
interface CreateTestProfileDto {
  code: string;               // Requerido
  name: string;               // Requerido
  description?: string;       // Opcional
  testDefinitionIds: string[]; // Requerido, mínimo 1 elemento
  displayOrder?: number;      // Opcional
}
```

### UpdateTestProfileDto

```typescript
interface UpdateTestProfileDto {
  code?: string;              // Opcional
  name?: string;              // Opcional
  description?: string;       // Opcional
  testDefinitionIds?: string[]; // Opcional
  displayOrder?: number;      // Opcional
  isActive?: boolean;         // Opcional
}
```

### CreateTestResultDto

```typescript
interface CreateTestResultDto {
  patientExaminationId: string; // Requerido (UUID)
  testDefinitionId: string;     // Requerido (UUID)
  resultValue: string;          // Requerido
  resultInterpretation?: string; // Opcional
  isAbnormal?: boolean;         // Opcional, default: false
  reference?: string;           // Opcional
  notes?: string;               // Opcional
  resultDate?: Date;            // Opcional
}
```

### UpdateTestResultDto

```typescript
interface UpdateTestResultDto {
  resultValue?: string;         // Opcional
  resultInterpretation?: string; // Opcional
  isAbnormal?: boolean;         // Opcional
  reference?: string;           // Opcional
  notes?: string;               // Opcional
  resultDate?: Date;            // Opcional
}
```

---

## Endpoints

### ExamCategory

#### GET /api/exam-categories
Obtener todas las categorías con paginación.

**Query Parameters:**
```typescript
{
  page?: number;              // Página (default: 1)
  limit?: number;             // Elementos por página (default: 10)
  search?: string;            // Búsqueda por nombre
  isActive?: boolean;         // Filtrar por estado
}
```

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Serología",
      "description": "...",
      "isActive": true,
      "createdAt": "2025-10-16T10:30:00Z",
      "updatedAt": "2025-10-16T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

#### GET /api/exam-categories/:id
Obtener una categoría específica.

**Respuesta (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Serología",
  "description": "...",
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

**Errores:**
- 404: Si el ID no existe

#### POST /api/exam-categories
Crear una nueva categoría.

**Body:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción opcional"
}
```

**Respuesta (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nueva Categoría",
  "description": "Descripción opcional",
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

**Errores:**
- 400: Datos inválidos o nombre duplicado
- 422: Validación fallida

#### PATCH /api/exam-categories/:id
Actualizar una categoría.

**Body:**
```json
{
  "name": "Nombre actualizado",
  "description": "Nueva descripción",
  "isActive": false
}
```

**Respuesta (200):** Categoría actualizada

**Errores:**
- 404: ID no existe
- 400: Datos inválidos
- 422: Validación fallida

#### DELETE /api/exam-categories/:id
Eliminar una categoría (soft delete).

**Respuesta (200):**
```json
{
  "message": "Categoría eliminada correctamente"
}
```

**Errores:**
- 404: ID no existe
- 409: Conflicto si tiene pruebas asociadas

---

### TestDefinition

#### GET /api/test-definitions
Obtener todas las definiciones de pruebas.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;        // Filtrar por categoría
  resultType?: string;        // Filtrar por tipo de resultado
  isActive?: boolean;
}
```

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "code": "GLU",
      "name": "Glucosa",
      "categoryId": "550e8400-e29b-41d4-a716-446655440000",
      "category": { /* ExamCategory */ },
      "description": "...",
      "method": "Enzimático",
      "unit": "mg/dL",
      "resultType": "numeric",
      "displayOrder": 1,
      "isActive": true,
      "createdAt": "2025-10-16T10:30:00Z",
      "updatedAt": "2025-10-16T10:30:00Z",
      "resultDefinitions": [ /* array de TestResultDefinition */ ]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### GET /api/test-definitions/:id
Obtener una definición específica.

**Respuesta (200):** TestDefinition completo con todas sus relaciones

#### POST /api/test-definitions
Crear nueva definición.

**Body:**
```json
{
  "code": "GLU",
  "name": "Glucosa",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Medición de glucosa",
  "method": "Enzimático",
  "unit": "mg/dL",
  "resultType": "numeric",
  "displayOrder": 1
}
```

**Respuesta (201):** TestDefinition creado

#### PATCH /api/test-definitions/:id
Actualizar definición.

**Body:** Cualquier campo del DTO UpdateTestDefinitionDto

#### DELETE /api/test-definitions/:id
Eliminar definición (soft delete).

---

### TestResultDefinition

#### GET /api/test-result-definitions
Obtener definiciones de resultados.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  testDefinitionId?: string;  // Filtrar por prueba
  isActive?: boolean;
}
```

#### GET /api/test-result-definitions/:id
Obtener una definición específica.

#### POST /api/test-result-definitions
Crear nueva definición de resultado.

**Body:**
```json
{
  "name": "Glucosa Normal",
  "testDefinitionId": "660e8400-e29b-41d4-a716-446655440001",
  "config": {
    "numericMin": 70,
    "numericMax": 100,
    "interpretation": "Normal",
    "color": "#4CAF50"
  }
}
```

#### PATCH /api/test-result-definitions/:id
Actualizar definición.

#### DELETE /api/test-result-definitions/:id
Eliminar definición.

---

### TestProfile

#### GET /api/test-profiles
Obtener todos los perfiles.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
```

#### GET /api/test-profiles/:id
Obtener un perfil específico.

#### POST /api/test-profiles
Crear nuevo perfil.

**Body:**
```json
{
  "code": "PROFILE-COMPLETE-BLOOD",
  "name": "Hemograma Completo",
  "description": "Incluye conteo completo de células",
  "testDefinitionIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002"
  ],
  "displayOrder": 1
}
```

#### PATCH /api/test-profiles/:id
Actualizar perfil.

#### DELETE /api/test-profiles/:id
Eliminar perfil.

---

### TestResult

#### GET /api/test-results
Obtener resultados.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  patientExaminationId?: string;
  testDefinitionId?: string;
  isAbnormal?: boolean;
  dateFrom?: string;        // ISO 8601
  dateTo?: string;          // ISO 8601
}
```

#### GET /api/test-results/:id
Obtener un resultado específico.

#### POST /api/test-results
Crear nuevo resultado.

**Body:**
```json
{
  "patientExaminationId": "bb0e8400-e29b-41d4-a716-446655440012",
  "testDefinitionId": "660e8400-e29b-41d4-a716-446655440001",
  "resultValue": "95.5",
  "resultInterpretation": "Normal",
  "isAbnormal": false,
  "reference": "70-100 mg/dL",
  "notes": "Paciente en ayunas",
  "resultDate": "2025-10-16T08:00:00Z"
}
```

#### PATCH /api/test-results/:id
Actualizar resultado.

#### DELETE /api/test-results/:id
Eliminar resultado.

---

## Relaciones entre Entidades

### Diagrama de Relaciones

```
┌─────────────────────┐
│   ExamCategory      │
│ (Serología, etc)    │
└──────────┬──────────┘
           │ 1:N
           ▼
┌──────────────────────────────┐
│    TestDefinition            │
│ (Pruebas específicas)        │
└──────────┬───────────────────┘
           │ 1:N
           ▼
┌──────────────────────────────┐
│  TestResultDefinition        │
│ (Posibles valores/rangos)    │
└──────────────────────────────┘

┌──────────────────────────────┐
│    TestDefinition            │ ◄────────┐
│                              │ N:N      │
└──────────────────────────────┘          │
           │                              │
           │ 1:N                    ┌──────┴──────────┐
           ▼                        │   TestProfile   │
┌──────────────────────────────┐   │ (Hemogramas)    │
│      TestResult              │   └─────────────────┘
│ (Resultados de pruebas)      │
└──────────────────────────────┘
```

### Flujo de Datos

1. **Configuración Inicial:**
   ```
   Crear ExamCategory
   → Crear TestDefinition(s)
   → Crear TestResultDefinition(s) para cada TestDefinition
   → Crear TestProfile(s) que agrupen TestDefinition(s)
   ```

2. **Uso en Resultados:**
   ```
   Paciente se somete a examen
   → Se crea PatientExamination
   → Se crean TestResult(s) para cada prueba
   → Cada TestResult referencia TestDefinition
   → TestDefinition tiene TestResultDefinition(s)
   ```

---

## Casos de Uso Comunes

### 1. Crear una Nueva Categoría de Pruebas

```typescript
// 1. Llamar al endpoint
POST /api/exam-categories
{
  "name": "Endocrinología",
  "description": "Pruebas hormonales"
}

// 2. Respuesta
{
  "id": "new-uuid",
  "name": "Endocrinología",
  "description": "Pruebas hormonales",
  "isActive": true,
  "createdAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

### 2. Crear una Prueba con Resultado Numérico y Rangos

```typescript
// 1. Crear la definición de prueba
POST /api/test-definitions
{
  "code": "TSH",
  "name": "TSH",
  "categoryId": "endocrinology-uuid",
  "description": "Hormona estimulante de la tiroides",
  "unit": "mIU/L",
  "resultType": "numeric",
  "method": "Inmunoensayo"
}

// 2. Crear definiciones de resultado para diferentes rangos
POST /api/test-result-definitions
{
  "name": "TSH Normal",
  "testDefinitionId": "tsh-uuid",
  "config": {
    "numericMin": 0.4,
    "numericMax": 4.0,
    "interpretation": "Normal",
    "color": "#4CAF50"
  }
}

POST /api/test-result-definitions
{
  "name": "TSH Bajo",
  "testDefinitionId": "tsh-uuid",
  "config": {
    "numericMin": 0,
    "numericMax": 0.4,
    "interpretation": "Bajo",
    "color": "#FF9800"
  }
}

POST /api/test-result-definitions
{
  "name": "TSH Alto",
  "testDefinitionId": "tsh-uuid",
  "config": {
    "numericMin": 4.0,
    "numericMax": 999,
    "interpretation": "Alto",
    "color": "#FF5722"
  }
}
```

### 3. Crear un Perfil de Pruebas

```typescript
// Agrupar varias pruebas en un perfil
POST /api/test-profiles
{
  "code": "PROFILE-THYROID",
  "name": "Panel Tiroideo",
  "description": "TSH, T3 libre, T4 libre",
  "testDefinitionIds": [
    "tsh-uuid",
    "t3-uuid",
    "t4-uuid"
  ]
}
```

### 4. Registrar Resultado de Prueba

```typescript
POST /api/test-results
{
  "patientExaminationId": "exam-uuid",
  "testDefinitionId": "tsh-uuid",
  "resultValue": "2.5",
  "resultInterpretation": "Normal",
  "isAbnormal": false,
  "reference": "0.4-4.0 mIU/L",
  "notes": "Resultado dentro de parámetros normales"
}
```

---

## Ejemplos de Integración Angular

### Crear el Servicio

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ExamCategory
  getExamCategories(page = 1, limit = 10): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/exam-categories?page=${page}&limit=${limit}`
    );
  }

  createExamCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/exam-categories`, data);
  }

  updateExamCategory(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/exam-categories/${id}`, data);
  }

  deleteExamCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/exam-categories/${id}`);
  }

  // TestDefinition
  getTestDefinitions(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/test-definitions`, { params });
  }

  createTestDefinition(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/test-definitions`, data);
  }

  updateTestDefinition(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/test-definitions/${id}`, data);
  }

  deleteTestDefinition(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/test-definitions/${id}`);
  }

  // TestProfile
  getTestProfiles(page = 1, limit = 10): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/test-profiles?page=${page}&limit=${limit}`
    );
  }

  createTestProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/test-profiles`, data);
  }

  updateTestProfile(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/test-profiles/${id}`, data);
  }

  deleteTestProfile(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/test-profiles/${id}`);
  }

  // TestResult
  getTestResults(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/test-results`, { params });
  }

  createTestResult(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/test-results`, data);
  }

  updateTestResult(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/test-results/${id}`, data);
  }

  deleteTestResult(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/test-results/${id}`);
  }
}
```

### Usar en un Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { LaboratoryService } from './laboratory.service';

@Component({
  selector: 'app-test-results',
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css']
})
export class TestResultsComponent implements OnInit {
  testResults: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private laboratoryService: LaboratoryService) {}

  ngOnInit(): void {
    this.loadTestResults();
  }

  loadTestResults(): void {
    this.loading = true;
    this.laboratoryService.getTestResults({ page: 1, limit: 10 })
      .subscribe({
        next: (response) => {
          this.testResults = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar resultados';
          this.loading = false;
        }
      });
  }

  createResult(data: any): void {
    this.laboratoryService.createTestResult(data)
      .subscribe({
        next: (result) => {
          this.testResults.unshift(result);
          alert('Resultado creado exitosamente');
        },
        error: (err) => {
          alert('Error: ' + err.error.message);
        }
      });
  }
}
```

---

## Notas Importantes

1. **Tipos de Resultado:** Asegúrate de usar el `resultType` correcto al crear TestDefinition
2. **Colores en UI:** Usa los colores en `config.color` para visualización en tiempo real
3. **Referencias:** El campo `reference` es flexible para aceptar diferentes formatos (sexo, edad, etc)
4. **Paginación:** Siempre verifica `totalPages` para navegación
5. **Errores:** Maneja los códigos de error 400, 404, 422 apropiadamente
6. **Validación:** Valida en frontend antes de enviar al backend

---

## Contacto

Si tienes preguntas sobre la integración, contacta al equipo de backend.

Última actualización: 16 de Octubre de 2025
