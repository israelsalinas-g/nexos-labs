# 🧪 API de Exámenes de Orina - Guía de Integración Frontend

## 📋 Descripción General

Este módulo gestiona los exámenes generales de orina, incluyendo:
- Análisis físico (color, aspecto, densidad)
- Análisis químico (pH, proteínas, glucosa, etc.)
- Análisis microscópico (cristales, cilindros)

## 🔗 Endpoints

### Base URL: `/urine-tests`

#### 1. Obtener Lista de Exámenes
```http
GET /urine-tests?page=1&limit=10
```
**Query Parameters:**
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)
- `startDate`: filtrar desde fecha (YYYY-MM-DD)
- `endDate`: filtrar hasta fecha (YYYY-MM-DD)

**Response:**
```typescript
{
  items: UrineTest[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### 2. Obtener Examen por ID
```http
GET /urine-tests/:id
```

#### 3. Crear Nuevo Examen
```http
POST /urine-tests
```
**Body:** CreateUrineTestDto (ver DTOs)

#### 4. Actualizar Examen
```http
PATCH /urine-tests/:id
```
**Body:** UpdateUrineTestDto (ver DTOs)

#### 5. Eliminar Examen
```http
DELETE /urine-tests/:id
```

#### 6. Obtener por Paciente
```http
GET /urine-tests/patient/:patientId
```

#### 7. Obtener Estadísticas
```http
GET /urine-tests/statistics
```

## 📊 Estructuras de Datos

### Enums

#### UrineColor
\`\`\`typescript
enum UrineColor {
  AMARILLO = 'AMARILLO',
  AMBAR = 'AMBAR',
  CAFE = 'CAFE',
  ROJIZO = 'ROJIZO',
  ROJO = 'ROJO',
  NARANJA = 'NARANJA'
}
\`\`\`

#### UrineAspect
\`\`\`typescript
enum UrineAspect {
  TRANSPARENTE = 'TRANSPARENTE',
  LIGERAMENTE_TURBIO = 'LIGERAMENTE TURBIO',
  TURBIO = 'TURBIO'
}
\`\`\`

#### UrineDensity
\`\`\`typescript
enum UrineDensity {
  D_1000 = '1.000',
  D_1005 = '1.005',
  D_1010 = '1.010',
  D_1015 = '1.015',
  D_1020 = '1.020',
  D_1025 = '1.025',
  D_1030 = '1.030'
}
\`\`\`

#### UrinePH
\`\`\`typescript
enum UrinePH {
  PH_5 = '5.0',
  PH_6 = '6.0',
  PH_65 = '6.5',
  PH_7 = '7.0',
  PH_8 = '8.0',
  PH_9 = '9.0'
}
\`\`\`

#### NegativePositive4Plus
\`\`\`typescript
enum NegativePositive4Plus {
  NEGATIVO = 'Negativo',
  POSITIVO_1 = 'Positivo +',
  POSITIVO_2 = 'Positivo ++',
  POSITIVO_3 = 'Positivo +++',
  POSITIVO_4 = 'Positivo ++++'
}
\`\`\`

#### NegativePositive3Plus
\`\`\`typescript
enum NegativePositive3Plus {
  NEGATIVO = 'Negativo',
  POSITIVO_1 = 'Positivo +',
  POSITIVO_2 = 'Positivo ++',
  POSITIVO_3 = 'Positivo +++'
}
\`\`\`

#### NegativePositive
\`\`\`typescript
enum NegativePositive {
  NEGATIVO = 'Negativo',
  POSITIVO = 'Positivo'
}
\`\`\`

#### CrystalType
\`\`\`typescript
enum CrystalType {
  URATOS_AMORFOS = 'URATOS AMORFOS',
  ACIDO_URICO = 'ACIDO URICO',
  OXALATOS_CALCIO_MONOHIDRATADO = 'OXALATOS DE CALCIO, MONOHIDRATADO',
  OXALATOS_CALCIO_DIHIDRATADO = 'OXALATOS DE CALCIO, DIHIDRATADO',
  CISTINA = 'CISTINA',
  COLESTEROL = 'COLESTEROL',
  TIROSINA = 'TIROSINA',
  ACIDO_HIPURICO = 'ACIDO HIPURICO',
  URATO_SODIO = 'URATO DE SODIO',
  LEUCINA = 'LEUCINA',
  SULFATO_CALCIO = 'SULFATO DE CALCIO',
  FOSFATO_TRIPLE = 'FOSFATO TRIPLE',
  FOSFATOS_AMORFOS = 'FOSFATOS AMORFOS',
  FOSFATO_CALCIO = 'FOSFATO DE CALCIO',
  CARBONATO_CALCIO = 'CARBONATO DE CALCIO',
  BIURATO_AMONIO = 'BIURATO DE AMONIO',
  NO_SE_OBSERVAN = 'NO SE OBSERVAN'
}
\`\`\`

#### CylinderType
\`\`\`typescript
enum CylinderType {
  HIALINOS = 'CILINDRO HIALINOS',
  ERITROCITARIO = 'CILINDRO ERITROCITARIO',
  LEUCOCITARIO = 'CILINDRO LEUCOCITARIO',
  GRANULOSO_FINO = 'CILINDRO GRANULOSO FINO',
  GRANULOSO_GRUESO = 'CILINDRO GRANULOSO GRUESO',
  CEREO = 'CILINDRO CEREO',
  NO_SE_OBSERVAN = 'NO SE OBSERVAN'
}
\`\`\`

### Interfaces

#### CrystalResult
\`\`\`typescript
interface CrystalResult {
  type: CrystalType;
  quantity: string;  // Ej: "2-3 por campo", "abundante"
}
\`\`\`

#### CylinderResult
\`\`\`typescript
interface CylinderResult {
  type: CylinderType;
  quantity: string;  // Ej: "escasos", "1-2 por campo"
}
\`\`\`

### DTOs

#### CreateUrineTestDto
\`\`\`typescript
interface CreateUrineTestDto {
  patientId: string;  // UUID del paciente
  testDate: string;   // Fecha ISO (YYYY-MM-DDTHH:mm:ssZ)
  
  // Características físicas
  color: UrineColor;
  aspect: UrineAspect;
  density: UrineDensity;
  ph: UrinePH;
  
  // Análisis químico
  protein: NegativePositive4Plus;     // Negativo a ++++ 
  glucose: NegativePositive4Plus;     // Negativo a ++++
  ketones: NegativePositive3Plus;     // Negativo a +++
  bilirubin: NegativePositive4Plus;   // Negativo a ++++
  occultBlood: NegativePositive3Plus; // Negativo a +++
  nitrites: NegativePositive;         // Negativo/Positivo
  
  // Elementos microscópicos
  crystals: CrystalResult[];
  cylinders: CylinderResult[];
  
  // Campos opcionales
  observations?: string;   // Notas adicionales
  technicalNotes?: string; // Notas técnicas
}
\`\`\`

#### UpdateUrineTestDto
Extiende de `Partial<CreateUrineTestDto>` - todos los campos son opcionales.

### Entidad (Base de Datos)

\`\`\`typescript
interface UrineTest {
  id: number;              // PK, auto-incremental
  patientId: string;       // FK a la tabla de pacientes
  sampleNumber: string;    // Número único de muestra
  testDate: Date;         // Fecha y hora del examen
  
  // Características físicas
  color: UrineColor;
  aspect: UrineAspect;
  density: UrineDensity;
  ph: UrinePH;
  
  // Análisis químico
  protein: NegativePositive4Plus;
  glucose: NegativePositive4Plus;
  ketones: NegativePositive3Plus;
  bilirubin: NegativePositive4Plus;
  occultBlood: NegativePositive3Plus;
  nitrites: NegativePositive;
  
  // Elementos microscópicos
  crystals: CrystalResult[];
  cylinders: CylinderResult[];
  
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
Para crystals y cylinders, la cantidad puede expresarse usando los siguientes formatos:

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
const newTest: CreateUrineTestDto = {
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  testDate: "2025-10-04T22:30:00Z",
  color: UrineColor.AMARILLO,
  aspect: UrineAspect.TURBIO,
  density: UrineDensity.D_1020,
  ph: UrinePH.PH_6,
  
  protein: NegativePositive4Plus.POSITIVO_1,
  glucose: NegativePositive4Plus.NEGATIVO,
  ketones: NegativePositive3Plus.NEGATIVO,
  bilirubin: NegativePositive4Plus.NEGATIVO,
  occultBlood: NegativePositive3Plus.NEGATIVO,
  nitrites: NegativePositive.NEGATIVO,
  
  crystals: [
    { 
      type: CrystalType.ACIDO_URICO, 
      quantity: "2-3 por campo" 
    },
    { 
      type: CrystalType.FOSFATOS_AMORFOS, 
      quantity: "abundante" 
    }
  ],
  
  cylinders: [
    { 
      type: CylinderType.HIALINOS, 
      quantity: "escasos" 
    }
  ],
  
  observations: "Muestra bien preservada"
};

// Enviar al backend
await axios.post('http://api.example.com/urine-tests', newTest);
\`\`\`

## ⚠️ Validaciones

1. **PatientId**: UUID válido y existente en el sistema
2. **TestDate**: Fecha ISO 8601 válida, no futura
3. **Color/Aspect/Density/pH**: Debe ser uno de los valores del enum correspondiente
4. **Análisis químicos**: Deben usar el enum correcto según el tipo de resultado
5. **Crystals/Cylinders**:
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