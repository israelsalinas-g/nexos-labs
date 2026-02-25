# 🔬 API de Exámenes Coprológicos - Guía de Integración Frontend

## 📋 Descripción General

Este módulo gestiona los exámenes coprológicos (análisis de heces), incluyendo:
- Características macroscópicas (color, consistencia, forma)
- Presencia de moco
- Análisis de parásitos
- Análisis de protozoos

## 🔗 Endpoints

### Base URL: `/stool-tests`

#### 1. Obtener Lista de Exámenes
```http
GET /stool-tests?page=1&limit=10
```
**Query Parameters:**
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)
- `startDate`: filtrar desde fecha (YYYY-MM-DD)
- `endDate`: filtrar hasta fecha (YYYY-MM-DD)

**Response:**
```typescript
{
  items: StoolTest[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### 2. Obtener Examen por ID
```http
GET /stool-tests/:id
```

#### 3. Crear Nuevo Examen
```http
POST /stool-tests
```
**Body:** CreateStoolTestDto (ver DTOs)

#### 4. Actualizar Examen
```http
PATCH /stool-tests/:id
```
**Body:** UpdateStoolTestDto (ver DTOs)

#### 5. Eliminar Examen
```http
DELETE /stool-tests/:id
```

#### 6. Obtener por Paciente
```http
GET /stool-tests/patient/:patientId
```

#### 7. Generar Reporte Médico
```http
GET /stool-tests/:id/medical-report
```

#### 8. Marcar como Completado
```http
PATCH /stool-tests/:id/complete
```

## 📊 Estructuras de Datos

### Enums

#### StoolColor
\`\`\`typescript
enum StoolColor {
  AMARILLO = 'AMARILLO',
  NEGRO = 'NEGRO',
  BLANCO = 'BLANCO',
  CAFE = 'CAFE',
  VERDE = 'VERDE',
  ROJO = 'ROJO'
}
\`\`\`

#### StoolConsistency
\`\`\`typescript
enum StoolConsistency {
  BLANDA = 'BLANDA',
  FORMADA = 'FORMADA',
  PASTOSA = 'PASTOSA',
  LIQUIDA = 'LIQUIDA',
  DIARREICA = 'DIARREICA'
}
\`\`\`

#### StoolShape
\`\`\`typescript
enum StoolShape {
  ESCASO = 'ESCASO',
  MODERADO = 'MODERADO',
  ABUNDANTE = 'ABUNDANTE'
}
\`\`\`

#### EscasaModeradaAbundanteAusenteQuantity
\`\`\`typescript
enum EscasaModeradaAbundanteAusenteQuantity {
  ESCASA = 'ESCASA',
  MODERADA = 'MODERADA',
  ABUNDANTE = 'ABUNDANTE',
  AUSENTE = 'AUSENTE'
}
\`\`\`

#### ParasiteType
\`\`\`typescript
enum ParasiteType {
  ASCARIS_LUMBRICOIDES = 'ASCARIS LUMBRICOIDES',
  ENTEROBIUS_VERMICULARIS = 'ENTEROBIUS VERMICULARIS',
  TRICHURIS_TRICHIURA = 'TRICHURIS TRICHIURA',
  TAENIA_SP = 'TAENIA SP',
  UNCINARIAS = 'UNCINARIAS',
  HYMENOLEPIS_NANA = 'HYMENOLEPIS NANA',
  STRONGYLOIDES_STERCORALIS = 'STRONGYLOIDES STERCORALIS',
  NO_SE_OBSERVAN = 'NO SE OBSERVAN'
}
\`\`\`

#### ProtozooType
\`\`\`typescript
enum ProtozooType {
  BLASTOCYSTIS_HOMINIS = 'BLASTOCYSTIS HOMINIS',
  ENTAMOEBA_COLI = 'ENTAMOEBA COLI',
  ENTAMOEBA_HISTOLYTICA = 'ENTAMOEBA HISTOLYTICA',
  GIARDIA_LAMBLIA = 'GIARDIA LAMBLIA',
  CHILOMASTIX_MESNILI = 'CHILOMASTIX MESNILI',
  ENDOLIMAX_NANA = 'ENDOLIMAX NANA',
  IODAMOEBA_BUTSCHLII = 'IODAMOEBA BUTSCHLII',
  NO_SE_OBSERVAN = 'NO SE OBSERVAN'
}
\`\`\`

### Interfaces

#### ParasiteResult
\`\`\`typescript
interface ParasiteResult {
  type: ParasiteType;
  quantity: string;  // Ej: "2-3 por campo", "abundante"
}
\`\`\`

#### ProtozooResult
\`\`\`typescript
interface ProtozooResult {
  type: ProtozooType;
  quantity: string;  // Ej: "escasos", "1-2 por campo"
}
\`\`\`

### DTOs

#### CreateStoolTestDto
\`\`\`typescript
interface CreateStoolTestDto {
  patientId: string;  // UUID del paciente
  testDate: string;   // Fecha ISO (YYYY-MM-DDTHH:mm:ssZ)
  
  // Características macroscópicas
  color: StoolColor;
  consistency: StoolConsistency;
  shape: StoolShape;
  mucus: EscasaModeradaAbundanteAusenteQuantity;
  
  // Análisis microscópico
  parasites: ParasiteResult[];
  protozoos: ProtozooResult[];
  
  // Campos opcionales
  observations?: string;   // Notas adicionales
  technicalNotes?: string; // Notas técnicas
}
\`\`\`

#### UpdateStoolTestDto
Extiende de `Partial<CreateStoolTestDto>` - todos los campos son opcionales.

### Entidad (Base de Datos)

\`\`\`typescript
interface StoolTest {
  id: number;              // PK, auto-incremental
  patientId: string;       // FK a la tabla de pacientes
  sampleNumber: string;    // Número único de muestra
  testDate: Date;         // Fecha y hora del examen
  
  // Características macroscópicas
  color: StoolColor;
  consistency: StoolConsistency;
  shape: StoolShape;
  mucus: EscasaModeradaAbundanteAusenteQuantity;
  
  // Análisis microscópico
  parasites: ParasiteResult[];
  protozoos: ProtozooResult[];
  
  // Metadatos
  observations?: string;
  technicalNotes?: string;
  status: string;          // 'pending' | 'completed' | 'cancelled'
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## 📝 Guías de Uso

### Formato de Cantidades
Para parasites y protozoos, la cantidad puede expresarse usando los siguientes formatos:

1. **Conteo por campo**: 
   - "1-2 por campo"
   - "2-3 por campo"
   - "3-5 por campo"

2. **Descripción cualitativa**:
   - "escaso(s)"
   - "moderado(s)"
   - "abundante(s)"

3. **Sistema de cruces**:
   - "+" (escasos)
   - "++" (moderados)
   - "+++" (abundantes)

4. **Descriptores específicos**:
   - "ocasional(es)"
   - "presente(s)"
   - "aislado(s)"
   - "numeroso(s)"

### Ejemplo de Uso

\`\`\`typescript
// Crear un nuevo examen
const newTest: CreateStoolTestDto = {
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  testDate: "2025-10-04T22:30:00Z",
  color: StoolColor.CAFE,
  consistency: StoolConsistency.FORMADA,
  shape: StoolShape.MODERADO,
  mucus: EscasaModeradaAbundanteAusenteQuantity.ESCASA,
  
  parasites: [
    { 
      type: ParasiteType.ASCARIS_LUMBRICOIDES, 
      quantity: "2-3 por campo" 
    }
  ],
  
  protozoos: [
    { 
      type: ProtozooType.BLASTOCYSTIS_HOMINIS, 
      quantity: "abundante" 
    }
  ],
  
  observations: "Muestra bien preservada"
};

// Enviar al backend
await axios.post('http://api.example.com/stool-tests', newTest);
\`\`\`

## ⚠️ Validaciones

1. **PatientId**: UUID válido y existente en el sistema
2. **TestDate**: Fecha ISO 8601 válida, no futura
3. **Color/Consistency/Shape**: Debe ser uno de los valores del enum correspondiente
4. **Mucus**: Debe usar el enum EscasaModeradaAbundanteAusenteQuantity
5. **Parasites/Protozoos**:
   - Tipos deben coincidir con los enums
   - Cantidades en formato libre pero se recomienda usar los formatos estándar
   - Arrays vacíos se interpretan como "NO SE OBSERVAN"

## 🛠️ Manejo de Errores

La API retorna errores en el siguiente formato:

\`\`\`typescript
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}
\`\`\`

Códigos comunes:
- `400`: Datos inválidos
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: muestra duplicada)
- `500`: Error interno del servidor

## 📊 Paginación

Las respuestas paginadas siguen esta estructura:

\`\`\`typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
\`\`\`

## 🔍 Filtros

Los endpoints que soportan filtrado aceptan query params:

- `startDate`: Fecha inicial (YYYY-MM-DD)
- `endDate`: Fecha final (YYYY-MM-DD)
- `status`: Estado del examen
- `patientId`: ID del paciente
- `sampleNumber`: Número de muestra

## 🔒 Autenticación

Todos los endpoints requieren un token JWT válido en el header:

```http
Authorization: Bearer <token>
```

## 🎯 Características Especiales

### Generación de Reportes Médicos

El endpoint `/stool-tests/:id/medical-report` genera un reporte médico detallado que incluye:

1. Datos del paciente
2. Resultados del examen
3. Interpretación de resultados
4. Recomendaciones basadas en hallazgos

### Estado del Examen

El examen puede tener los siguientes estados:
- `pending`: Recién creado o en proceso
- `completed`: Revisado y completado
- `cancelled`: Cancelado

Para marcar un examen como completado, use el endpoint:
```http
PATCH /stool-tests/:id/complete
```

### Número de Muestra

El sistema genera automáticamente un número de muestra único con el formato:
```
ST[YY][MM][DD][SEQUENCE]
```
Ejemplo: `ST251004001` (Año 25, mes 10, día 04, secuencia 001)