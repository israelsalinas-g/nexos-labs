# Arquitectura y Flujo de Trabajo del Sistema LIS

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Entidades Principales](#entidades-principales)
3. [Relaciones entre Entidades](#relaciones-entre-entidades)
4. [Flujo de Configuración Inicial](#flujo-de-configuración-inicial)
5. [Flujo de Solicitud de Exámenes](#flujo-de-solicitud-de-exámenes)
6. [Flujo Completo: Desde la Orden hasta el Resultado](#flujo-completo-desde-la-orden-hasta-el-resultado)
7. [Diagramas de Relaciones](#diagramas-de-relaciones)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎯 Visión General

El sistema LIS gestiona la solicitud, procesamiento y reporte de exámenes clínicos de laboratorio. Se divide en dos fases:

### **FASE 1: CONFIGURACIÓN (Administrativo - Una sola vez)**
- El administrador define categorías de exámenes
- El administrador define qué exámenes existen y sus posibles resultados
- El administrador agrupa exámenes en perfiles/paquetes comunes

### **FASE 2: OPERACIONAL (Médicos y Pacientes - Diariamente)**
- El médico solicita exámenes específicos o perfiles completos para un paciente
- El laboratorista procesa las muestras
- El sistema registra los resultados
- Se generan reportes

---

## 🏗️ Entidades Principales

### 1. **ExamCategory** (Categoría de Exámenes)
**Propósito:** Agrupar exámenes por área médica

**Campos clave:**
```typescript
{
  id: string (UUID);          // Identificador único
  name: string;               // Ej: "Serología", "Química Sanguínea", "Hematología"
  description?: string;       // Descripción del área
  isActive: boolean;          // Disponible para usar
  createdAt: Date;
  updatedAt: Date;
}
```

**Ejemplos:**
- Serología (pruebas de anticuerpos)
- Química Sanguínea (glucosa, urea, creatinina)
- Hematología (hemograma, coagulación)
- Inmunología (COVID, otros)
- Uroanálisis

---

### 2. **TestDefinition** (Definición de Examen)
**Propósito:** Define cada examen específico que se puede realizar

**Campos clave:**
```typescript
{
  id: string (UUID);
  code: string;               // Ej: "GLU", "HB", "VDR" (ÚNICO)
  name: string;               // Ej: "Glucosa", "Hemoglobina"
  categoryId: string;         // FK a ExamCategory
  resultType: enum;           // BINARY | SCALE | NUMERIC | TEXT | REACTIVE
  unit?: string;              // Ej: "mg/dL", "g/dL"
  referenceRange?: string;    // Ej: "70-100 mg/dL"
  method?: string;            // Ej: "Enzimático"
  isActive: boolean;
  resultDefinitions: TestResultDefinition[]; // Relación 1:N
}
```

**Relación con ExamCategory:**
```
ExamCategory (1) ──── (N) TestDefinition
```
Una categoría puede tener múltiples exámenes.

**Ejemplo:**
```
Categoría: "Química Sanguínea"
  ├─ TestDefinition: GLU (Glucosa) → resultType: NUMERIC
  ├─ TestDefinition: URE (Urea) → resultType: NUMERIC
  └─ TestDefinition: CREAT (Creatinina) → resultType: NUMERIC
```

---

### 3. **TestResultDefinition** (Definición de Resultado)
**Propósito:** Define exactamente QUÉ valores son válidos para cada examen

**Campos clave:**
```typescript
{
  id: string (UUID);
  testDefinitionId: string;   // FK a TestDefinition
  name: string;               // Ej: "Glucosa Normal", "Positivo"
  config: {
    // Para BINARY (Sí/No, Positivo/Negativo)
    binaryValue?: boolean;
    
    // Para SCALE (Cualitativo)
    scaleValue?: string;      // Ej: "Escaso", "Moderado", "Abundante"
    scaleOrder?: number;      // Orden: 1, 2, 3
    
    // Para NUMERIC (Cuantitativo)
    numericMin?: number;      // Rango mínimo normal
    numericMax?: number;      // Rango máximo normal
    
    // Común a todos
    interpretation?: string;  // "Normal", "Anormal", "Crítico"
    color?: string;           // Color para UI
  };
  isActive: boolean;
}
```

**Relación con TestDefinition:**
```
TestDefinition (1) ──── (N) TestResultDefinition
```
Un examen puede tener múltiples resultados posibles.

**Ejemplo para Glucosa (NUMERIC):**
```
TestDefinition: GLU (Glucosa)
  ├─ ResultDefinition: "Normal" (70-100 mg/dL) → Green
  ├─ ResultDefinition: "Prediabétes" (100-126) → Yellow
  └─ ResultDefinition: "Diabético" (>126) → Red
```

**Ejemplo para VDRL (BINARY):**
```
TestDefinition: VDRL
  ├─ ResultDefinition: "Positivo" (true) → Red
  └─ ResultDefinition: "Negativo" (false) → Green
```

---

### 4. **TestProfile** (Perfil/Paquete de Exámenes)
**Propósito:** Agrupar múltiples exámenes que típicamente se solicitan juntos

**Campos clave:**
```typescript
{
  id: string (UUID);
  code: string;               // Ej: "PROF-CARDIO"
  name: string;               // Ej: "Perfil Cardiológico"
  categoryId: string;         // FK a ExamCategory (opcional, referencia)
  testIds: string[];          // Array de IDs de TestDefinition
  description?: string;
  isActive: boolean;
}
```

**Relación con TestDefinition:**
```
TestProfile (1) ──── (N) TestDefinition
            (Relación Many-to-Many via profile_tests)
```

**Ejemplos:**
```
Profile 1: "Hemograma Completo"
  ├─ GLU (Glucosa)
  ├─ HB (Hemoglobina)
  ├─ HTO (Hematocrito)
  └─ WBC (Glóbulos Blancos)

Profile 2: "Perfil Renal"
  ├─ URE (Urea)
  ├─ CREAT (Creatinina)
  └─ K (Potasio)

Profile 3: "Perfil Lipídico"
  ├─ COLT (Colesterol Total)
  ├─ TRIGL (Triglicéridos)
  ├─ HDL (Colesterol HDL)
  └─ LDL (Colesterol LDL)
```

---

### 5. **LaboratoryOrder** (Orden de Laboratorio)
**Propósito:** Registra la solicitud de exámenes de un paciente (por médico)

**Campos clave:**
```typescript
{
  id: string (UUID);
  orderNumber: string;        // Número único de orden (Ej: "ORD-20251017-001")
  patientId: string;          // FK a Patient
  doctorId: string;           // FK a Doctor (quien solicita)
  status: enum;               // PENDING | IN_PROCESS | COMPLETED | CANCELLED
  priority: enum;             // NORMAL | URGENT | STAT
  diagnosis?: string;         // Diagnóstico del paciente
  observations?: string;      // Notas adicionales
  estimatedDelivery?: Date;   // Fecha esperada de entrega
  deliveredAt?: Date;         // Fecha de entrega real
  totalCost?: decimal;        // Costo total de todos los exámenes
  createdAt: Date;
  updatedAt: Date;
}
```

**Relaciones:**
```
LaboratoryOrder (1) ──── (N) OrderTest
LaboratoryOrder (N) ──── (1) Patient
LaboratoryOrder (N) ──── (1) Doctor
```

---

### 6. **OrderTest** (Prueba en la Orden)
**Propósito:** Cada examen específico solicitado en una orden

**Campos clave:**
```typescript
{
  id: string (UUID);
  orderId: string;            // FK a LaboratoryOrder
  testDefinitionId: string;   // FK a TestDefinition
  status: enum;               // EN PROCESO | COMPLETADO | CANCELADO
  sampleNumber?: string;      // Identificador de la muestra
  sampleCollectedAt?: Date;   // Cuándo se tomó la muestra
  collectedBy?: string;       // Quién tomó la muestra
  createdAt: Date;
  updatedAt: Date;
}
```

**Relaciones:**
```
LaboratoryOrder (1) ──── (N) OrderTest
TestDefinition (1) ──── (N) OrderTest
```

---

### 7. **TestResult** (Resultado de Examen)
**Propósito:** Almacena el resultado real del examen

**Campos clave:**
```typescript
{
  id: string (UUID);
  orderTestId: string;        // FK a OrderTest (relación 1:1)
  resultValue: string;        // El valor capturado (Ej: "95.5", "Positivo")
  resultNumeric?: decimal;    // Para cálculos y gráficos
  referenceRange?: string;    // Rango de referencia aplicable
  isAbnormal: boolean;        // ¿Es anormal?
  isCritical: boolean;        // ¿Es crítico?
  abnormalFlag?: string;      // Banderas: "H" (High), "L" (Low), "C" (Critical)
  testedAt: Date;             // Cuándo se ejecutó el análisis
  testedBy?: string;          // Quién ejecutó
  validatedAt?: Date;         // Cuándo se validó
  validatedBy?: string;       // Quién validó
  observations?: string;      // Notas del resultado
  createdAt: Date;
  updatedAt: Date;
}
```

**Relación con OrderTest:**
```
OrderTest (1) ──── (1) TestResult
```
Cada test ordenado tendrá exactamente UN resultado.

---

## 🔗 Relaciones entre Entidades

### **Diagrama General:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMINISTRACIÓN (Setup)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │ ExamCategory │ (1)                                       │
│  └──────────────┘                                           │
│         │                                                    │
│         │ (1:N)                                             │
│         ▼                                                    │
│  ┌──────────────────────┐                                  │
│  │  TestDefinition      │ (1)                              │
│  │  - code              │                                  │
│  │  - name              │                                  │
│  │  - resultType        │                                  │
│  └──────────────────────┘                                  │
│         │                                                    │
│         │ (1:N)                                             │
│         ▼                                                    │
│  ┌────────────────────────────┐                            │
│  │ TestResultDefinition       │                            │
│  │ - name                     │                            │
│  │ - config (valores posibles)│                            │
│  └────────────────────────────┘                            │
│                                                              │
│  ┌──────────────────┐                                       │
│  │  TestProfile     │ (1)                                  │
│  │  - code          │                                      │
│  │  - name          │                                      │
│  │  - testIds[]     │ (M:N con TestDefinition)            │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              OPERACIONAL (Solicitudes de Exámenes)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐     ┌──────────────┐                │
│  │ LaboratoryOrder  │────►│   Patient    │                │
│  │ - orderNumber    │     └──────────────┘                │
│  │ - status         │                                      │
│  │ - priority       │     ┌──────────────┐                │
│  │ - diagnosis      │────►│    Doctor    │                │
│  └──────────────────┘     └──────────────┘                │
│         │                                                    │
│         │ (1:N)                                             │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │   OrderTest      │     ┌──────────────────┐            │
│  │ - status         │────►│  TestDefinition  │            │
│  │ - sampleNumber   │     └──────────────────┘            │
│  └──────────────────┘                                       │
│         │                                                    │
│         │ (1:1)                                             │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │  TestResult      │                                      │
│  │ - resultValue    │                                      │
│  │ - isAbnormal     │                                      │
│  │ - isCritical     │                                      │
│  └──────────────────┘                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flujo de Configuración Inicial

### **Paso 1: Crear Categorías**
```
POST /exam-categories
{
  "name": "Serología",
  "description": "Pruebas serológicas"
}

POST /exam-categories
{
  "name": "Química Sanguínea",
  "description": "Exámenes químicos"
}
```

### **Paso 2: Crear TestDefinitions**
```
POST /test-definitions
{
  "code": "VDR",
  "name": "VDRL",
  "categoryId": "550e8400-...",      // ID de Serología
  "resultType": "binary",
  "method": "RPR",
  "unit": "Cualitativo"
}

POST /test-definitions
{
  "code": "GLU",
  "name": "Glucosa",
  "categoryId": "550e8401-...",      // ID de Química Sanguínea
  "resultType": "numeric",
  "method": "Enzimático",
  "unit": "mg/dL",
  "referenceRange": "70-100"
}
```

### **Paso 3: Crear TestResultDefinitions**
```
// Para VDRL (BINARY)
POST /test-result-definitions
{
  "name": "Positivo",
  "testDefinitionId": "660e8400-...",  // ID de VDRL
  "config": {
    "binaryValue": true,
    "interpretation": "Positivo",
    "color": "#FF5722"
  }
}

POST /test-result-definitions
{
  "name": "Negativo",
  "testDefinitionId": "660e8400-...",
  "config": {
    "binaryValue": false,
    "interpretation": "Negativo",
    "color": "#4CAF50"
  }
}

// Para Glucosa (NUMERIC)
POST /test-result-definitions
{
  "name": "Glucosa Normal",
  "testDefinitionId": "660e8401-...",
  "config": {
    "numericMin": 70,
    "numericMax": 100,
    "interpretation": "Normal",
    "color": "#4CAF50"
  }
}

POST /test-result-definitions
{
  "name": "Glucosa Elevada",
  "testDefinitionId": "660e8401-...",
  "config": {
    "numericMin": 100,
    "numericMax": 999,
    "interpretation": "Anormal",
    "color": "#FF5722"
  }
}
```

### **Paso 4: Crear TestProfiles**
```
POST /test-profiles
{
  "code": "PROF-GENERAL",
  "name": "Perfil General",
  "description": "Pruebas básicas generales",
  "testIds": [
    "660e8400-...",  // ID de VDRL
    "660e8401-...",  // ID de Glucosa
    "660e8402-..."   // ID de otros
  ]
}
```

---

## 📋 Flujo de Solicitud de Exámenes

### **Escenario 1: Solicitar un examen individual**

```
PASO 1: Crear LaboratoryOrder
POST /laboratory-orders
{
  "patientId": "770e8400-...",        // ID del paciente
  "doctorId": "880e8400-...",         // ID del médico
  "diagnosis": "Sospecha de diabetes",
  "priority": "NORMAL"
}

Respuesta:
{
  "id": "990e8400-...",
  "orderNumber": "ORD-20251017-001",
  "status": "PENDING",
  ...
}

PASO 2: Agregar examen a la orden
POST /laboratory-orders/990e8400-.../order-tests
{
  "testDefinitionId": "660e8401-...",  // ID de Glucosa
  "sampleNumber": "SAMPLE-001"
}

Respuesta:
{
  "id": "aa0e8400-...",
  "orderId": "990e8400-...",
  "testDefinitionId": "660e8401-...",
  "status": "EN PROCESO"
}

PASO 3: Cambiar estado a IN_PROCESS
PATCH /laboratory-orders/990e8400-.../status?status=IN_PROCESS

PASO 4: Registrar resultado
POST /test-results
{
  "orderTestId": "aa0e8400-...",
  "resultValue": "95.5",
  "resultNumeric": 95.5,
  "isAbnormal": false,
  "testedBy": "Técnico Juan"
}

PASO 5: Cambiar estado a COMPLETED
PATCH /laboratory-orders/990e8400-.../status?status=COMPLETED
```

---

### **Escenario 2: Solicitar un perfil completo**

```
PASO 1: Crear LaboratoryOrder con perfil
POST /laboratory-orders
{
  "patientId": "770e8400-...",
  "doctorId": "880e8400-...",
  "diagnosis": "Chequeo general",
  "testProfileId": "bb0e8400-...",    // ID del Perfil General
  "priority": "NORMAL"
}

Backend automáticamente:
✓ Crea una LaboratoryOrder
✓ Crea múltiples OrderTest (uno por cada TestDefinition en el perfil)
✓ Todos quedan con status = "EN PROCESO"

Respuesta:
{
  "id": "990e8400-...",
  "orderNumber": "ORD-20251017-002",
  "status": "PENDING",
  "totalTests": 5,  // Porque el perfil tiene 5 exámenes
  "tests": [
    { "id": "aa0e8400-...", "testCode": "VDR", "status": "EN PROCESO" },
    { "id": "aa0e8401-...", "testCode": "GLU", "status": "EN PROCESO" },
    { "id": "aa0e8402-...", "testCode": "URE", "status": "EN PROCESO" },
    ...
  ]
}

PASO 2: Procesar cada examen y registrar resultados
[Para cada OrderTest en la orden...]

POST /test-results
{
  "orderTestId": "aa0e8400-...",  // VDRL
  "resultValue": "Negativo",
  "testedBy": "Técnico Juan"
}

POST /test-results
{
  "orderTestId": "aa0e8401-...",  // Glucosa
  "resultValue": "95.5",
  "resultNumeric": 95.5,
  "testedBy": "Técnico Juan"
}

[Más resultados...]

PASO 3: Cuando todos están completos, cambiar estado
PATCH /laboratory-orders/990e8400-.../status?status=COMPLETED
```

---

## 🔄 Flujo Completo: Desde la Orden hasta el Resultado

```
┌─────────────────────────────────────────────────────────────────┐
│ MÉDICO SOLICITA EXÁMENES (Frontend)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Selecciona paciente                                         │
│  2. Selecciona médico                                           │
│  3. Escribe diagnóstico                                         │
│  4. Elige exámenes:                                             │
│     - Opción A: Examen individual → GLU (Glucosa)             │
│     - Opción B: Perfil → "Perfil General" (GLU + URE + ...)   │
│  5. Envía POST a /laboratory-orders                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: CREAR ORDEN (POST /laboratory-orders)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Crea LaboratoryOrder                                         │
│    - orderNumber = "ORD-20251017-001" (autogenerado)          │
│    - status = "PENDING"                                        │
│    - patientId = [validado que existe]                        │
│    - doctorId = [validado que existe]                         │
│                                                                  │
│  ✓ Si es un examen individual:                                 │
│    - Crea 1 OrderTest                                          │
│                                                                  │
│  ✓ Si es un perfil:                                             │
│    - Crea N OrderTest (uno por cada TestDefinition)           │
│    - Todos con status = "EN PROCESO"                          │
│                                                                  │
│  Retorna:                                                        │
│  {                                                              │
│    "id": "990e8400-...",                                       │
│    "orderNumber": "ORD-20251017-001",                         │
│    "status": "PENDING",                                        │
│    "orderTests": [{ id, testCode, status }, ...]             │
│  }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ LABORATORISTA: CAMBIAR ESTADO A IN_PROCESS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PATCH /laboratory-orders/{id}/status?status=IN_PROCESS       │
│                                                                  │
│  Backend:                                                        │
│  ✓ Actualiza LaboratoryOrder.status = "IN_PROCESS"            │
│  ✓ Actualiza todos los OrderTest.status = "EN PROCESO"        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ LABORATORISTA: TOMAR MUESTRAS Y PROCESAR                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PATCH /order-tests/{orderTestId}                              │
│  {                                                               │
│    "sampleCollectedAt": "2025-10-17T10:30:00Z",               │
│    "collectedBy": "Técnico María"                             │
│  }                                                               │
│                                                                  │
│  ✓ Procesa las muestras en el laboratorio                      │
│  ✓ Obtiene los resultados                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ LABORATORISTA: REGISTRAR RESULTADOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /test-results                                            │
│  {                                                               │
│    "orderTestId": "aa0e8400-...",                             │
│    "resultValue": "95.5",                                     │
│    "resultNumeric": 95.5,                                     │
│    "referenceRange": "70-100 mg/dL",                         │
│    "isAbnormal": false,                                       │
│    "testedBy": "Técnico Juan",                               │
│    "observations": "Muestra clara, sin hemólisis"            │
│  }                                                               │
│                                                                  │
│  Backend:                                                        │
│  ✓ Crea TestResult                                             │
│  ✓ Determina si es anormal comparando con TestResultDefinition│
│  ✓ Asigna color según config de TestResultDefinition         │
│  ✓ Actualiza OrderTest.status = "COMPLETADO"                │
│                                                                  │
│  [REPITE PARA CADA EXAMEN EN LA ORDEN]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SISTEMA: VERIFICAR SI TODOS LOS EXÁMENES ESTÁN LISTOS         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cuando se registra el último resultado:                        │
│                                                                  │
│  Backend verifica:                                              │
│  SELECT COUNT(*) FROM OrderTest                               │
│  WHERE orderId = '990e8400-...'                               │
│  AND status != 'COMPLETADO'                                   │
│                                                                  │
│  Si COUNT = 0:                                                  │
│  ✓ Todos los exámenes están listos                            │
│  ✓ Notificar al médico (email/push)                          │
│  ✓ Generar reporte automático                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ MÉDICO/USUARIO: VER RESULTADOS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /laboratory-orders/{id}                                   │
│                                                                  │
│  Respuesta:                                                      │
│  {                                                               │
│    "id": "990e8400-...",                                       │
│    "orderNumber": "ORD-20251017-001",                         │
│    "status": "COMPLETED",                                      │
│    "patientName": "Juan Pérez",                              │
│    "diagnosis": "Sospecha de diabetes",                       │
│    "results": [                                                │
│      {                                                          │
│        "testCode": "GLU",                                      │
│        "testName": "Glucosa",                                 │
│        "resultValue": "95.5",                                │
│        "unit": "mg/dL",                                       │
│        "referenceRange": "70-100",                           │
│        "isAbnormal": false,                                   │
│        "interpretation": "Normal",                            │
│        "color": "#4CAF50"  ← Para UI                         │
│      },                                                        │
│      { ... más resultados ... }                               │
│    ]                                                            │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Diagramas de Relaciones

### **Estado de una Orden (LaboratoryOrder Status Flow)**

```
┌─────────┐
│ PENDING │  ← Se crea la orden, aún no se procesa
└────┬────┘
     │ (médico/sistema inicia procesamiento)
     ▼
┌──────────────┐
│ IN_PROCESS   │  ← Se está procesando la orden
└────┬─────────┘
     │ (se registran todos los resultados)
     ▼
┌───────────┐
│ COMPLETED │  ← Orden lista, resultados disponibles
└───────────┘
     │ (opcionalmente)
     ▼
┌───────────┐
│ CANCELLED │  ← Se canceló la orden
└───────────┘
```

### **Estado de un Examen Individual (OrderTest Status Flow)**

```
┌──────────────┐
│ EN PROCESO   │  ← Pendiente de procesar
└────┬─────────┘
     │ (se procesa y se registra resultado)
     ▼
┌───────────────┐
│ COMPLETADO    │  ← Resultado registrado
└───────────────┘
     │ (opcionalmente)
     ▼
┌───────────────┐
│ CANCELADO     │  ← Se canceló este examen
└───────────────┘
```

---

## 💡 Ejemplos Prácticos

### **Ejemplo 1: Un paciente solicita "Chequeo General"**

```
1. Médico selecciona paciente: "Carlos López"
2. Médico selecciona perfil: "Chequeo General"
3. Sistema crea:
   
   LaboratoryOrder {
     id: "990e8400-...",
     orderNumber: "ORD-20251017-100",
     patientId: "770e8400-...",     ← Carlos López
     status: "PENDING"
   }
   
   OrderTest #1 { testDefinitionId: GLU (Glucosa) }
   OrderTest #2 { testDefinitionId: URE (Urea) }
   OrderTest #3 { testDefinitionId: CREAT (Creatinina) }
   OrderTest #4 { testDefinitionId: HB (Hemoglobina) }
   OrderTest #5 { testDefinitionId: COLT (Colesterol) }
   
4. Laboratorista procesa todas las muestras
5. Laboratorista registra 5 resultados
6. Sistema genera reporte con 5 valores + interpretaciones
7. Médico ve reporte con colores: todos verdes = normal
```

---

### **Ejemplo 2: Un paciente tiene resultado crítico**

```
1. Laboratorista registra resultado:
   POST /test-results
   {
     "orderTestId": "aa0e8402-...",  ← Glucosa
     "resultValue": "450",           ← CRÍTICO
     "resultNumeric": 450,
     "testedBy": "Técnico Ana"
   }

2. Backend verifica TestResultDefinition:
   ✓ Encuentra: "Glucosa Crítica" con config:
     {
       "numericMin": 300,
       "numericMax": 999,
       "interpretation": "CRÍTICO",
       "color": "#FF0000",
       "alertLevel": "critical"
     }

3. Sistema determina:
   - isAbnormal = true
   - isCritical = true
   - color = "#FF0000"
   - flagAbnormal = "C" (Critical)

4. Sistema envía notificación urgente:
   - Email al médico
   - Push notification
   - Alert en dashboard

5. Médico ve en UI:
   ╔════════════════════════════════╗
   ║ GLUCOSA: 450 mg/dL            ║ ← Rojo brillante
   ║ Rango: 70-100                 ║
   ║ ⚠️ CRÍTICO - REQUIERE ACCIÓN   ║
   ╚════════════════════════════════╝
```

---

### **Ejemplo 3: Cambiar de perfil a exámenes individuales**

```
Caso: El médico inició con "Perfil Renal" pero necesita agregar 2 exámenes más

OPCIÓN A: En una misma orden (si está en PENDING)
  PATCH /laboratory-orders/990e8400-.../order-tests/add
  {
    "testDefinitionIds": ["660e8403-...", "660e8404-..."]
  }

OPCIÓN B: En una orden separada
  POST /laboratory-orders
  {
    "patientId": "770e8400-...",
    "doctorId": "880e8400-...",
    "externalOrderId": "990e8400-...",  ← Referencia a la orden anterior
    "notes": "Exámenes adicionales"
  }
```

---

## 🔐 Notas Importantes

### **1. Sobre las Órdenes (LaboratoryOrder)**
- Actualmente **en desarrollo** - no está habilitado en frontend
- Se usa para tracking administrativo interno
- Permite auditoría completa del proceso
- Integrable con sistemas de facturación

### **2. Sobre TestResultDefinition**
- Define los rangos normales y anormales
- Permite cambiar interpretaciones sin alterar la data histórica
- Soporta múltiples tipos de resultados en un sistema
- Crítico para generar reportes automáticos

### **3. Flujo Recomendado para Nuevo Laboratorio**

```
SEMANA 1: Configuración
├─ Crear 5-10 ExamCategories
├─ Crear 50-100 TestDefinitions
└─ Crear TestResultDefinitions para cada test

SEMANA 2: Perfiles
├─ Agrupar tests en perfiles lógicos
├─ Validar con médicos
└─ Hacer testing

SEMANA 3-4: Operación
├─ Iniciar toma de órdenes
├─ Procesar y registrar resultados
└─ Monitorear flujo
```

---

## 📞 Contacto y Soporte

Para preguntas sobre la arquitectura, contacta al equipo de desarrollo.

---

**Versión:** 1.0  
**Última actualización:** 2025-10-17  
**Estado:** Producción
