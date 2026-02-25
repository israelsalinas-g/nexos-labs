# Referencia Rápida - TestResultDefinition

## 🚀 Inicio Rápido

### 1. Registrar Módulo
```typescript
// src/app.module.ts o laboratory.module.ts
import { TestResultDefinitionModule } from './features/laboratory/test-result-definition/test-result-definition.module';

@Module({
  imports: [TestResultDefinitionModule],
})
export class AppModule {}
```

### 2. Ejecutar Migración
```bash
npm run migration:run
```

### 3. Crear Definiciones
```bash
POST /api/test-result-definitions
{
  "testDefinitionId": 1,
  "name": "Normal",
  "value": "NORMAL",
  "config": {
    "numericMin": 70,
    "numericMax": 100,
    "interpretation": "Normal",
    "alertLevel": "low",
    "color": "#4CAF50"
  }
}
```

---

## 📚 Estructura de Datos

### TestResultDefinition
```typescript
{
  id: number;                    // Auto-generado
  testDefinitionId: number;      // FK a TestDefinition
  name: string;                  // "Normal", "Positivo", etc.
  value?: string;                // "NORMAL", "POS", etc.
  config?: {                     // Configuración flexible
    // Para numéricos
    numericMin?: number;
    numericMax?: number;
    
    // Para escalas
    scaleValue?: string;
    scaleOrder?: number;
    
    // Para binarios
    binaryValue?: boolean;
    
    // Común
    interpretation?: string;     // "Normal", "Anormal", "Crítico"
    alertLevel?: 'low' | 'medium' | 'high' | 'critical';
    color?: string;              // "#4CAF50"
    icon?: string;               // "check", "warning", "error"
    description?: string;
    recommendation?: string;
  };
  displayOrder: number;          // Orden de visualización
  isActive: boolean;             // True/False
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔌 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/test-result-definitions` | Crear definición |
| GET | `/api/test-result-definitions` | Listar con paginación |
| GET | `/api/test-result-definitions/:id` | Obtener por ID |
| GET | `/api/test-result-definitions/test/:testId` | Listar por prueba |
| GET | `/api/test-result-definitions/validate/:testId?value=X` | Validar valor |
| GET | `/api/test-result-definitions/statistics` | Estadísticas |
| PATCH | `/api/test-result-definitions/:id` | Actualizar |
| DELETE | `/api/test-result-definitions/:id` | Eliminar |

---

## 💾 Inyectar Servicio

```typescript
import { TestResultDefinitionService } from './test-result-definition.service';

@Injectable()
export class MyService {
  constructor(
    private resultDefService: TestResultDefinitionService
  ) {}

  async validateAndCreate(testDefId: number, value: string) {
    // Validar
    const validation = await this.resultDefService.validateResultValue(
      testDefId,
      value
    );

    if (validation.isValid) {
      console.log('Definición encontrada:', validation.definition);
    }
  }

  async getDefinitions(testDefId: number) {
    return this.resultDefService.findByTestDefinition(testDefId);
  }
}
```

---

## 🎨 Tipos de Configuración por Tipo de Prueba

### BINARY (Positivo/Negativo)
```json
{
  "binaryValue": true,
  "interpretation": "Positivo",
  "alertLevel": "high",
  "color": "#FF5722"
}
```

### SCALE (Escala)
```json
{
  "scaleValue": "Moderado",
  "scaleOrder": 2,
  "interpretation": "Anormal",
  "alertLevel": "medium",
  "color": "#FFC107"
}
```

### NUMERIC (Rango)
```json
{
  "numericMin": 70,
  "numericMax": 100,
  "interpretation": "Normal",
  "alertLevel": "low",
  "color": "#4CAF50"
}
```

### TEXT (Libre)
```json
{
  "interpretation": "Ver observaciones",
  "alertLevel": "none"
}
```

### REACTIVE (Reactivo/No Reactivo)
```json
{
  "interpretation": "Reactivo",
  "alertLevel": "high",
  "recommendation": "Confirmar con prueba de confirmación"
}
```

---

## ✅ Validar Antes de Crear TestResult

```typescript
// Obtener definiciones posibles
const definitions = await this.resultDefService.findByTestDefinition(testDefId);

// Validar el valor
const result = await this.resultDefService.validateResultValue(testDefId, resultValue);

if (!result.isValid) {
  throw new BadRequestException('Valor inválido para esta prueba');
}

// Usar información de la definición
const alertLevel = result.definition.config.alertLevel;
const color = result.definition.config.color;
```

---

## 🔍 Ejemplos de Búsqueda

```bash
# Listar todas
GET /api/test-result-definitions

# Con paginación
GET /api/test-result-definitions?page=1&limit=10

# Filtrar por prueba
GET /api/test-result-definitions?testDefinitionId=1

# Buscar por nombre
GET /api/test-result-definitions?search=positivo

# Validar valor
GET /api/test-result-definitions/validate/1?value=85

# Definiciones activas de una prueba
GET /api/test-result-definitions/test/1
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Obtener Opciones para Dropdown
```typescript
async getSelectOptions(testDefId: number) {
  const definitions = await this.service.findByTestDefinition(testDefId);
  return definitions.map(d => ({
    label: d.name,
    value: d.value,
    color: d.config?.color,
    icon: d.config?.icon
  }));
}
```

### Caso 2: Determinar si es Anormal
```typescript
async isResultAbnormal(testDefId: number, value: string) {
  const validation = await this.service.validateResultValue(testDefId, value);
  return validation.definition?.config?.alertLevel !== 'low';
}
```

### Caso 3: Obtener Recomendación
```typescript
async getRecommendation(testDefId: number, value: string) {
  const validation = await this.service.validateResultValue(testDefId, value);
  return validation.definition?.config?.recommendation || '';
}
```

### Caso 4: Obtener Interpretación
```typescript
async getInterpretation(testDefId: number, value: string) {
  const validation = await this.service.validateResultValue(testDefId, value);
  return validation.definition?.config?.interpretation || 'Pendiente de revisión';
}
```

---

## 🛠️ Integración con TestResult

```typescript
// Al crear TestResult
async create(createDto: CreateTestResultDto) {
  // 1. Validar el valor
  const validation = await this.resultDefService.validateResultValue(
    testDefId,
    createDto.resultValue
  );

  if (!validation.isValid) {
    throw new BadRequestException('Resultado inválido');
  }

  // 2. Determinar si es anormal
  const definition = validation.definition;
  const isAbnormal = definition.config.alertLevel !== 'low';

  // 3. Crear con información validada
  const testResult = new TestResult();
  testResult.resultValue = createDto.resultValue;
  testResult.isAbnormal = isAbnormal;
  testResult.abnormalFlag = this.getFlag(definition);
  
  return this.testResultRepository.save(testResult);
}

private getFlag(definition: TestResultDefinition): string {
  const alertLevel = definition.config.alertLevel;
  if (alertLevel === 'high' || alertLevel === 'critical') return 'H';
  if (alertLevel === 'medium') return 'L';
  return 'N';
}
```

---

## 📊 Base de Datos

### Tabla test_result_definitions
```sql
CREATE TABLE test_result_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_definition_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  value VARCHAR(100),
  config JSONB,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_definition_id) REFERENCES test_definitions(id) ON DELETE CASCADE,
  INDEX idx_test_definition_id (test_definition_id),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
);
```

---

## 🔗 Relaciones

```
ExamCategory (1:N) → TestDefinition
TestDefinition (1:N) → TestResultDefinition ← NEW
TestDefinition (N:M) → TestProfile
OrderTest (1:1) → TestResult
TestResult ← Usa valores de TestResultDefinition
```

---

## ⚡ Tips de Rendimiento

1. **Usar índices**: Ya están creados en la migración
2. **Cargar solo activos**: Usar `getActiveResultsForTest()`
3. **Cachear definiciones**: Las cambian raramente
4. **Validar en backend**: Siempre validar antes de crear resultado

```typescript
// Cachear definiciones
@Cacheable('testDef_results_:testDefId')
getActiveResultsForTest(testDefId: number) {
  return this.resultDefService.getActiveResultsForTest(testDefId);
}
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Módulo no importa | Verificar que está en `imports` del módulo padre |
| Tabla no existe | Ejecutar `npm run migration:run` |
| Validación falla | Verificar que el valor coincide exactamente |
| Endpoint 404 | Revisar ruta, debe ser `/api/test-result-definitions` |
| JSONB no funciona | Verificar que PostgreSQL soporta JSONB (>9.2) |

---

## 📖 Archivos de Referencia

- `ESTRUCTURA_MEJORADA.md` - Arquitectura completa
- `EJEMPLOS_PRACTICOS.md` - Ejemplos con curl
- `CAMBIOS_REALIZADOS.md` - Resumen de cambios
- `FRONTEND.md` - Guía para Angular

---

Ahora estás listo para usar TestResultDefinition! 🚀
