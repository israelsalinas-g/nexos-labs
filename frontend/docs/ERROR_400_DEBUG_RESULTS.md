# Debug Results - Error 400 en Test Definitions

## Estado Actual

### Form Submission Log (Console)
```
Form Value: {
  sectionId: '02ca540c-ac13-4e1e-8f63-1c48187061a4',
  name: 'HDL Colesterol',
  code: 'HDL',
  description: 'Lipoproteína de alta densidad',
  resultType: 'NUMERIC',
  ...
}

resultType value: NUMERIC
resultType type: string
sectionId value: 02ca540c-ac13-4e1e-8f63-1c48187061a4
sectionId type: string

Update Data to send: {
  sectionId: '02ca540c-ac13-4e1e-8f63-1c48187061a4',
  name: 'HDL Colesterol',
  code: 'HDL',
  description: 'Lipoproteína de alta densidad',
  resultType: 'NUMERIC',
  ...
}
```

### HTTP Response Error
```
PATCH http://localhost:3000/test-definitions/ea120e4e-2bb7-4ecb-9440-fffaf1aa0cf2 400 (Bad Request)

Status: 400
Error: "resultType must be one of... a number conforming to the specified constraints"
```

## Análisis

### ✅ Lo que funciona correctamente:
1. **Frontend enum** - `TestResultType.NUMERIC` = `'NUMERIC'` ✓
2. **Tipo de dato** - Es string ✓
3. **Valor siendo enviado** - `'NUMERIC'` (válido) ✓
4. **Estructura del DTO** - Parece correcta ✓

### ❌ Problema identificado:
El error dice: **"resultType must be one of... a number conforming to the specified constraints"**

Esto es contradictorio:
- Dice "must be one of..." (implica enum values)
- Pero también dice "a number" (implica número)

### Posibles causas:

1. **Validador del backend espera números, no strings**
   - Backend: `@IsEnum(TestResultType)` pero TestResultType es enum numérico en backend
   - Frontend: Estamos enviando strings

2. **Backend enum tiene valores numéricos**
   - Backend: `enum TestResultType { NUMERIC = 0, TEXT = 1, ... }`
   - Frontend: Enviando `'NUMERIC'` en lugar de `0`

3. **Mismatch entre nombres de enums**
   - Frontend tiene: NUMERIC, TEXT, POSITIVE_NEGATIVE, etc.
   - Backend tiene: diferentes nombres (NEGATIF, POSITIF, etc.)

4. **Campo no siendo mapeado correctamente**
   - DTO espera diferente nombre de campo
   - DTO espera diferente estructura

## Soluciones a investigar:

### 1️⃣ Verificar enum del backend
¿El backend NestJS tiene:
```typescript
// Opción A: Enum de strings (lo que frontend envía)
enum TestResultType {
  NUMERIC = 'NUMERIC',
  TEXT = 'TEXT',
  ...
}

// Opción B: Enum numérico (necesitaría convertir)
enum TestResultType {
  NUMERIC = 0,
  TEXT = 1,
  ...
}
```

### 2️⃣ Verificar UpdateTestDefinitionDto
¿El DTO tiene validador?
```typescript
// Backend
export class UpdateTestDefinitionDto {
  @IsEnum(TestResultType)
  resultType?: TestResultType;
  // ¿O espera número?
  @IsEnum(TestResultType, { each: false })
  resultType?: number; // ← PROBLEMA
}
```

### 3️⃣ Verificar TypeORM Entity
¿La columna está bien definida?
```typescript
@Column({
  type: 'enum',
  enum: TestResultType,
  nullable: true
})
resultType: TestResultType;
```

## 🔧 Solución Implementada:

El backend espera **números (0-6)** en lugar de strings. Se implementó:

1. **Mapeo Bidireccional:**
   - `TEST_RESULT_TYPE_TO_NUMBER`: Convierte string → número (NUMERIC → 0)
   - `TEST_RESULT_TYPE_FROM_NUMBER`: Convierte número → string (0 → NUMERIC)

2. **Conversión al Enviar:**
   - En `onSubmit()`: Convierte `formValue.resultType` (string) a número antes de enviar
   - Ambos createData y updateData ahora envían números

3. **Conversión al Cargar:**
   - Nuevo método `getResultTypeForForm()` en edit mode
   - Convierte número recibido del backend a string para mostrar en dropdown

4. **Actualización del DTO:**
   - `CreateTestDefinitionDto.resultType`: Ahora acepta `string | number`
   - `UpdateTestDefinitionDto` hereda lo mismo

### Mapeo de Valores:
```typescript
0: NUMERIC
1: TEXT
2: POSITIVE_NEGATIVE
3: POSITIVE_NEGATIVE_3PLUS
4: POSITIVE_NEGATIVE_4PLUS
5: REACTIVE_NON_REACTIVE
6: DETECTED_NOT_DETECTED
```

## Frontend Current Implementation

**test-result-type.enums.ts:**
```typescript
export enum TestResultType {
  NUMERIC = 'NUMERIC',
  TEXT = 'TEXT',
  POSITIVE_NEGATIVE = 'POSITIVE_NEGATIVE',
  POSITIVE_NEGATIVE_3PLUS = 'POSITIVE_NEGATIVE_3PLUS',
  POSITIVE_NEGATIVE_4PLUS = 'POSITIVE_NEGATIVE_4PLUS',
  REACTIVE_NON_REACTIVE = 'REACTIVE_NON_REACTIVE',
  DETECTED_NOT_DETECTED = 'DETECTED_NOT_DETECTED'
}
```

**Enviando:** `resultType: 'NUMERIC'` (string)

**Backend rechaza con:** "resultType must be one of... a number conforming to the specified constraints"

**Conclusión:** Probablemente el backend espera un número, no un string.
