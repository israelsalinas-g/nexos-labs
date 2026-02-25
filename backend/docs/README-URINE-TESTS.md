# Documentación de Urine Tests

Esta documentación proporciona información detallada sobre la estructura y uso del módulo de exámenes de orina (Urine Tests) para desarrolladores frontend.

## Índice
- [Estructura de Datos](#estructura-de-datos)
- [Endpoints](#endpoints)
- [DTOs](#dtos)
- [Enumeraciones](#enumeraciones)
- [Ejemplos](#ejemplos)

## Estructura de Datos

### UrineTest Entity

La entidad principal que representa un examen de orina contiene los siguientes grupos de datos:

#### Información General
```typescript
{
  id: string;                // UUID
  patientId: string;        // UUID del paciente
  testDate: Date;           // Fecha del examen
  emissionDate: Date;       // Fecha de emisión del reporte
}
```

#### Examen Físico
```typescript
{
  volume: string;           // Ejemplo: "60 ml"
  color: UrineColor;        // Enum
  aspect: UrineAspect;      // Enum
  sediment: UrineSediment;  // Enum
}
```

#### Examen Químico
```typescript
{
  density: UrineDensity;      // Enum
  ph: UrinePH;                // Enum
  protein: UrineTestResult;   // Enum
  glucose: UrineTestResult;   // Enum
  bilirubin: UrineTestResult; // Enum
  ketones: UrineTestResult;   // Enum
  occultBlood: UrineTestResult; // Enum
  nitrites: PositiveNegative; // Enum
  urobilinogen: Urobilinogen; // Enum
  leukocytes: UrineTestResult; // Enum
}
```

#### Examen Microscópico
```typescript
{
  epithelialCells: MicroscopicQuantity;  // Enum
  leukocytesField: string;               // Ejemplo: "0-2 x campo"
  erythrocytesField: string;             // Ejemplo: "0-2 x campo"
  bacteria: MicroscopicQuantity;         // Enum
  mucousFilaments: MicroscopicQuantity;  // Enum
  yeasts: YeastQuantity;                 // Enum
  crystals: CrystalResult[];             // Array de objetos
  cylinders: CylinderResult[];           // Array de objetos
  others: string;                        // Texto libre
  observations: string;                  // Observaciones generales
}
```

## Endpoints

### GET /urine-tests
Obtiene lista paginada de exámenes de orina.

**Query Parameters:**
- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 10)
- `patientId`: filtrar por paciente
- `status`: filtrar por estado
- `dateFrom`: fecha inicial (YYYY-MM-DD)
- `dateTo`: fecha final (YYYY-MM-DD)

### GET /urine-tests/:id
Obtiene un examen específico por ID.

### POST /urine-tests
Crea un nuevo examen de orina.

### PATCH /urine-tests/:id
Actualiza un examen existente.

### DELETE /urine-tests/:id
Elimina (soft delete) un examen.

### GET /urine-tests/patient/:patientId
Obtiene todos los exámenes de un paciente específico.

### GET /urine-tests/:id/medical-report
Obtiene el reporte médico interpretado del examen.

## Enumeraciones

### UrineColor
```typescript
enum UrineColor {
  AMARILLO = 'Amarillo',
  AMBAR = 'Ambar',
  CAFE = 'Café',
  ROJIZO = 'Rojizo',
  ROJO = 'Rojo',
  NARANJA = 'Naranja'
}
```

### UrineAspect
```typescript
enum UrineAspect {
  TRANSPARENTE = 'Transparente',
  LIGERAMENTE_TURBIO = 'Ligeramente Turbio',
  TURBIO = 'Turbio'
}
```

### UrineSediment
```typescript
enum UrineSediment {
  ESCASO = 'Escaso',
  MODERADO = 'Moderado',
  ABUNDANTE = 'Abundante'
}
```

### UrineTestResult
```typescript
enum UrineTestResult {
  NEGATIVO = 'Negativo',
  POSITIVO_1 = 'Positivo +',
  POSITIVO_2 = 'Positivo ++',
  POSITIVO_3 = 'Positivo +++',
  POSITIVO_4 = 'Positivo ++++'
}
```

### YeastQuantity (Nuevo)
```typescript
enum YeastQuantity {
  ESCASA_CANTIDAD = 'ESCASA CANTIDAD',
  MODERADA_CANTIDAD = 'MODERADA CANTIDAD',
  ABUNDANTE_CANTIDAD = 'ABUNDANTE CANTIDAD',
  NO_SE_OBSERVA = 'NO SE OBSERVA'
}
```

### MicroscopicQuantity
```typescript
enum MicroscopicQuantity {
  ESCASA = 'Escasa',
  MODERADA = 'Moderada',
  ABUNDANTE = 'Abundante'
}
```

## Ejemplo de Petición POST

```typescript
{
  "testDate": "2025-10-02T08:45:00Z",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "volume": "60 ml",
  "color": "Amarillo",
  "aspect": "Turbio",
  "sediment": "Abundante",
  "density": "1.020",
  "ph": "6.0",
  "protein": "Negativo",
  "glucose": "Negativo",
  "ketones": "Negativo",
  "bilirubin": "Negativo",
  "urobilinogen": "0.1 mg/dl",
  "nitrites": "Negativo",
  "leukocytes": "Negativo",
  "occultBlood": "Negativo",
  "crystals": [
    { 
      "type": "URATOS AMORFOS",
      "quantity": "2-3 por campo"
    }
  ],
  "cylinders": [
    {
      "type": "CILINDRO HIALINOS",
      "quantity": "0-2 por campo"
    }
  ],
  "epithelialCells": "Escasa",
  "leukocytesField": "0-2 x campo",
  "erythrocytesField": "0-2 x campo",
  "bacteria": "Escasa",
  "mucousFilaments": "Escasa",
  "yeasts": "ESCASA CANTIDAD",
  "others": "Sin otros hallazgos",
  "observations": "Muestra bien preservada",
  "status": "completed"
}
```

### Notas Importantes

1. Los campos de tipo array (`crystals` y `cylinders`) pueden contener múltiples elementos
2. Las fechas deben enviarse en formato ISO
3. Todos los campos son opcionales excepto `patientId` y `testDate`
4. Los valores de los enums deben coincidir exactamente con los valores definidos
5. El campo `yeasts` acepta uno de los cuatro valores definidos en `YeastQuantity`