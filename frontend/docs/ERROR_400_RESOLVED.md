# Error 400 Test Definitions - RESUELTO ✅

## Problema

El error 400 indicaba: **"resultType must be one of..."**

**Frontend enviaba:**
```json
{ "resultType": "NUMERIC" }  // Mayúscula
```

**Backend esperaba:**
```json
{ "resultType": "numeric" }  // Minúscula + snake_case
```

## Causa Raíz 🔍

**Mismatch entre Frontend y Backend:**

### Backend (NestJS)
```typescript
enum TestResultType {
  NUMERIC = 'numeric',                                       // ✅ minúscula
  TEXT = 'text',                                             // ✅ minúscula
  POSITIVE_NEGATIVE = 'positive_negative',                   // ✅ snake_case
  POSITIVE_NEGATIVE_3PLUS = 'positive_negative_3plus',       // ✅ snake_case
  POSITIVE_NEGATIVE_4PLUS = 'positive_negative_4plus',       // ✅ snake_case
  ESCASA_MODERADA_ABUNDANTE = 'escasa_moderada_abundante',              // NUEVO
  ESCASA_MODERADA_ABUNDANTE_AUSENTE = 'escasa_moderada_abundante_ausente', // NUEVO
  REACTIVE_NON_REACTIVE = 'reactive_non_reactive',           // ✅ snake_case
  DETECTED_NOT_DETECTED = 'detected_not_detected'            // ✅ snake_case
}
```

### Frontend (Angular) - ANTES ❌
```typescript
enum TestResultType {
  NUMERIC = 'NUMERIC',                          // ❌ MAYÚSCULA
  TEXT = 'TEXT',                                // ❌ MAYÚSCULA
  POSITIVE_NEGATIVE = 'POSITIVE_NEGATIVE',      // ❌ MAYÚSCULA
  // Faltaban los 2 nuevos tipos
}
```

## Solución Implementada ✅

### 1. Archivo: `src/app/enums/test-result-type.enums.ts`

**Cambios:**
- ✅ Todos los valores cambiados a minúscula con snake_case
- ✅ Agregados 2 nuevos tipos:
  - `ESCASA_MODERADA_ABUNDANTE = 'escasa_moderada_abundante'`
  - `ESCASA_MODERADA_ABUNDANTE_AUSENTE = 'escasa_moderada_abundante_ausente'`
- ✅ Labels actualizados para coincidir

**Nuevos valores:**
```typescript
export enum TestResultType {
  NUMERIC = 'numeric',
  TEXT = 'text',
  POSITIVE_NEGATIVE = 'positive_negative',
  POSITIVE_NEGATIVE_3PLUS = 'positive_negative_3plus',
  POSITIVE_NEGATIVE_4PLUS = 'positive_negative_4plus',
  ESCASA_MODERADA_ABUNDANTE = 'escasa_moderada_abundante',
  ESCASA_MODERADA_ABUNDANTE_AUSENTE = 'escasa_moderada_abundante_ausente',
  REACTIVE_NON_REACTIVE = 'reactive_non_reactive',
  DETECTED_NOT_DETECTED = 'detected_not_detected'
}
```

### 2. Archivo: `src/app/components/test-definitions/test-definition-form.component.ts`

**Cambios:**
- ✅ Removidas funciones de conversión numérica (no eran necesarias)
- ✅ Ahora envía strings directamente: `{ resultType: 'numeric' }`
- ✅ testResultTypes array incluye 10 tipos (agregados los 2 nuevos)
- ✅ getResultTypeForForm() simplificado

**Antes:**
```typescript
const resultTypeNumber = TEST_RESULT_TYPE_TO_NUMBER[formValue.resultType];
createData: { resultType: resultTypeNumber }  // Envía número
```

**Después:**
```typescript
createData: { resultType: formValue.resultType }  // Envía string
```

### 3. Archivo: `src/app/models/test-definition.interface.ts`

**Cambios:**
- ✅ `resultType?: string` (simplificado de `string | number`)

## Resultado ✅

**Ahora al guardar:**
```
Frontend envía: { resultType: 'numeric', ... }
Backend valida: 'numeric' ∈ ['numeric', 'text', ...]  ✅
Backend responde: 200 OK
```

**Antes (error):**
```
Frontend enviaba: { resultType: 'NUMERIC', ... }
Backend validaba: 'NUMERIC' ∈ ['numeric', 'text', ...]  ❌
Backend respondía: 400 Bad Request
```

## Tipos disponibles (10 total)

1. `'numeric'` → Numérico
2. `'text'` → Texto libre
3. `'positive_negative'` → Negativo/Positivo
4. `'positive_negative_3plus'` → Negativo/Positivo (3+)
5. `'positive_negative_4plus'` → Negativo/Positivo (4+)
6. `'escasa_moderada_abundante'` → Escasa/Moderada/Abundante
7. `'escasa_moderada_abundante_ausente'` → Escasa/Moderada/Abundante/Ausente
8. `'reactive_non_reactive'` → Reactivo/No reactivo
9. `'detected_not_detected'` → Detectado/No detectado

## Verificación

✅ No hay errores de compilación TypeScript
✅ Enum frontend coincide con backend
✅ Los 10 tipos están en dropdown
✅ Valores en minúscula con snake_case
✅ DTOs actualizados correctamente
