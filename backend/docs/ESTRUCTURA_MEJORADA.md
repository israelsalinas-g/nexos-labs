# Estructura Mejorada del Sistema de Resultados de Pruebas LIS

## Resumen de Cambios

Se ha implementado una nueva estructura más flexible y robusta para manejar los resultados de pruebas de laboratorio con múltiples tipos de datos y configuraciones.

## Entidades Principales

### 1. **ExamCategory** (Categorías de Exámenes)
```
- Química Sanguínea
- Serología
- Inmunología
- Microbiología
- Uroanálisis
- Etc.
```

### 2. **TestDefinition** (Definición de Pruebas)
Representa una prueba individual dentro de una categoría.

**Cambios Importantes:**
- Nueva relación `OneToMany` con `TestResultDefinition`
- Permite definir exactamente qué valores son válidos para cada prueba

```typescript
// Ejemplo: Prueba de Glucosa
{
  id: 1,
  name: "Glucosa",
  code: "GLUC",
  categoryId: 1,
  testResultType: "NUMERIC",
  unit: "mg/dL",
  referenceRange: "Ayuno: 70-100 mg/dL, 2 hrs: <140 mg/dL",
  method: "Oxidasa-Peroxidasa",
  resultDefinitions: [
    { id: 1, name: "Normal", value: "NORMAL", config: {...} },
    { id: 2, name: "Alterado", value: "ALTERED", config: {...} },
    { id: 3, name: "Crítico", value: "CRITICAL", config: {...} }
  ]
}
```

### 3. **TestResultDefinition** (NUEVA - Definición de Resultados) ⭐
Esta es la entidad clave para la mejora. Define exactamente qué valores puede tener una prueba.

```typescript
// Ejemplo 1: Resultado Binario (VDRL)
{
  id: 1,
  testDefinitionId: 5,
  name: "Positivo",
  value: "POS",
  config: {
    binaryValue: true,
    interpretation: "Anormal",
    color: "#FF5722",
    alertLevel: "high",
    recommendation: "Referir a especialista"
  },
  displayOrder: 1,
  isActive: true
}

// Ejemplo 2: Resultado en Escala (Proteinuria)
{
  id: 2,
  testDefinitionId: 10,
  name: "Escaso",
  value: "TRACE",
  config: {
    scaleValue: "Escaso",
    scaleOrder: 1,
    interpretation: "Normal",
    color: "#4CAF50",
    alertLevel: "low"
  },
  displayOrder: 1,
  isActive: true
}

// Ejemplo 3: Rango Numérico (Hematocrito)
{
  id: 3,
  testDefinitionId: 8,
  name: "Normal Hombre",
  value: "NORMAL",
  config: {
    numericMin: 41,
    numericMax: 50,
    interpretation: "Normal",
    color: "#4CAF50",
    alertLevel: "low"
  },
  displayOrder: 1,
  isActive: true
}
```

### 4. **TestProfile** (Perfiles de Pruebas)
Agrupa múltiples pruebas en un paquete (sin cambios en la relación, pero ahora con más flexibilidad).

### 5. **TestResult** (Resultado de Prueba)
Almacena el resultado actual de una prueba realizada a un paciente.

```typescript
{
  id: 1,
  orderTestId: 5,
  resultValue: "85",        // El valor tal como está
  resultNumeric: 85,         // Para comparaciones numéricas
  isAbnormal: false,         // Determinado automáticamente
  isCritical: false,
  abnormalFlag: "N",         // Normal, High, Low
  reference: "70-100 mg/dL", // Referencia para este paciente
  testedAt: "2025-10-16",
  testedBy: "Lic. María",
  validatedBy: "Dr. Carlos",
  observations: "Paciente en ayunas",
  createdAt: "2025-10-16"
}
```

## Flujo de Trabajo

### 1️⃣ Configuración Inicial (Administrador)

```bash
# Crear categoría
POST /api/exam-categories
{
  "name": "Química Sanguínea",
  "code": "QS",
  "description": "..."
}

# Crear definición de prueba
POST /api/test-definitions
{
  "categoryId": 1,
  "name": "Glucosa",
  "code": "GLUC",
  "testResultType": "NUMERIC",
  "unit": "mg/dL",
  "referenceRange": "Ayuno: 70-100 mg/dL"
}

# Crear definiciones de resultados
POST /api/test-result-definitions
{
  "testDefinitionId": 1,
  "name": "Normal",
  "value": "NORMAL",
  "config": {
    "numericMin": 70,
    "numericMax": 100,
    "interpretation": "Normal",
    "color": "#4CAF50",
    "alertLevel": "low"
  },
  "displayOrder": 1
}
```

### 2️⃣ Ingreso de Resultados (Técnico/Laboratorio)

```bash
# Ingresar resultado
POST /api/test-results
{
  "orderTestId": 5,
  "resultValue": "85",
  "resultNumeric": 85,
  "isAbnormal": false,
  "testedAt": "2025-10-16T10:30:00Z",
  "testedBy": "Lic. María"
}

# O validar antes de ingresar
GET /api/test-result-definitions/validate/1?value=85
Response: {
  "isValid": true,
  "definition": { /* TestResultDefinition */ }
}
```

### 3️⃣ Consulta y Análisis (Médico/Sistema)

```bash
# Obtener definiciones para una prueba
GET /api/test-result-definitions/test/1
Response: [
  { name: "Normal", config: { ... } },
  { name: "Alterado", config: { ... } },
  { name: "Crítico", config: { ... } }
]

# Obtener estadísticas
GET /api/test-result-definitions/statistics
Response: {
  "total": 45,
  "byType": [
    { testDefinitionId: 1, testName: "Glucosa", count: 3 }
  ]
}
```

## Ventajas de la Nueva Estructura

### ✅ Flexibilidad
- Soporta cualquier tipo de resultado: binario, escala, numérico, texto
- Fácil agregar nuevas opciones de resultado sin cambiar código

### ✅ Validación Automática
- Sistema puede validar si un resultado es válido
- Evita errores de entrada de datos

### ✅ Interpretación Inteligente
- Cada resultado puede tener interpretación automática
- Alertas automáticas según nivel de criticidad
- Recomendaciones asociadas

### ✅ UI Mejorada
- Frontend sabe exactamente qué renderizar para cada prueba
- Colores y iconos predefinidos
- Órdenes de visualización configurable

### ✅ Auditoría y Reportes
- Rastreo completo de qué resultado se eligió
- Análisis por tipo de resultado
- Estadísticas de resultados anormales

### ✅ Escalabilidad
- Agregar nuevos tipos de pruebas sin afectar las existentes
- Múltiples laboratorios pueden tener diferentes configuraciones

## Tipos de Resultados Soportados

### 1. BINARY (Binario)
```json
{
  "binaryValue": true,
  "interpretation": "Positivo",
  "alertLevel": "high"
}
```
Ejemplos: VDRL, VIH, COVID-19

### 2. SCALE (Escala)
```json
{
  "scaleValue": "Moderado",
  "scaleOrder": 2,
  "interpretation": "Anormal",
  "alertLevel": "medium"
}
```
Ejemplos: Proteinuria (Escaso/Moderado/Abundante), Bacterias

### 3. NUMERIC (Numérico)
```json
{
  "numericMin": 70,
  "numericMax": 100,
  "interpretation": "Normal",
  "alertLevel": "low"
}
```
Ejemplos: Glucosa, Creatinina, Hemoglobina

### 4. TEXT (Texto)
```json
{
  "interpretation": "Especificar",
  "alertLevel": "none"
}
```
Ejemplos: Observaciones, Descripciones microscópicas

### 5. REACTIVE (Reactivos)
```json
{
  "interpretation": "Reactivo",
  "alertLevel": "high",
  "recommendation": "Confirmar con prueba definitiva"
}
```
Ejemplos: Pruebas rápidas, serologías

## DTOs para Frontend

### Crear TestResultDefinition
```typescript
{
  testDefinitionId: number;
  name: string;
  value?: string;
  config?: {
    interpretation?: string;
    alertLevel?: 'low' | 'medium' | 'high' | 'critical';
    color?: string;
    icon?: string;
  };
  displayOrder?: number;
  isActive?: boolean;
}
```

### Crear TestResult
```typescript
{
  orderTestId: number;
  resultValue: string;
  resultNumeric?: number;
  referenceRange?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
  testedAt?: Date;
  testedBy?: string;
  observations?: string;
  metadata?: any;
}
```

## Endpoints Nuevos/Modificados

```
POST   /api/test-result-definitions              - Crear
GET    /api/test-result-definitions              - Listar (con paginación)
GET    /api/test-result-definitions/:id          - Obtener uno
GET    /api/test-result-definitions/test/:testId - Obtener por prueba
GET    /api/test-result-definitions/validate/:testId?value=xxx - Validar valor
GET    /api/test-result-definitions/statistics   - Estadísticas
PATCH  /api/test-result-definitions/:id          - Actualizar
DELETE /api/test-result-definitions/:id          - Eliminar
```

## Migración de Datos (si hay datos existentes)

Si tienes datos existentes en `test_results`, se pueden mantener sin cambios. La nueva tabla `test_result_definitions` es complementaria y facilita la validación y configuración.

## Próximos Pasos

1. Ejecutar la migración: `npm run migration:run`
2. Importar el módulo en tu módulo padre
3. Crear definiciones de resultados para las pruebas existentes
4. Integrar validaciones en el servicio de TestResults
5. Actualizar el frontend para usar las nuevas configuraciones
