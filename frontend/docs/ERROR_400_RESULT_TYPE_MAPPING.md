# Error 400: testResultType debe ser un número

## ❌ PROBLEMA ORIGINAL (YA RESUELTO)

Al intentar actualizar una definición de test, el backend rechazaba con:
```
"property testResultType should be a number conforming to the specified constraints"
```

## ✅ SOLUCIÓN APLICADA

**El problema fue un malentendido**: El backend no espera `testResultType` como número, sino como un **enum string** en el campo `resultType`.

### Análisis del Backend

Entidad NestJS/TypeORM:
```typescript
@Column({ 
  name: 'result_type',
  type: 'enum', 
  enum: TestResultType,  // Enum TypeORM
  default: TestResultType.NUMERIC
})
resultType: TestResultType;  // Campo se llama resultType, no testResultType
```

El backend espera:
- Campo: `resultType` (no `testResultType`)
- Tipo: String enum como `'NUMERIC'`, `'TEXT'`, etc.
- **NO** un número

## Mismatch

| Concepto | Frontend | Backend |
|----------|----------|---------|
| Nombre del campo | `testResultType` (INCORRECTO) | `resultType` (CORRECTO) |
| Tipo de dato | String enum (CORRECTO) | String enum (CORRECTO) |
| Valores | "NUMERIC", "TEXT", etc. (CORRECTO) | "NUMERIC", "TEXT", etc. (CORRECTO) |

## Cambios Realizados

### 1. **test-definition.interface.ts**
   - ❌ Cambió de: `testResultType?: string | number`
   - ✅ Cambió a: `resultType?: string`

### 2. **test-definition-form.component.ts**
   - ❌ Eliminó mapeos numéricos (no era necesario)
   - ✅ Envía el string directamente: `resultType: formValue.resultType`
   - ✅ Removed conversion functions (NO eran necesarias)

## Flujo Correcto (Ahora)

## Mismatch

| Concepto | Frontend | Backend |
|----------|----------|---------|
| Tipo de dato | String (NUMERIC, TEXT, etc.) | Número (0, 1, 2, etc.) |
| Almacenamiento | Enum string | Enum numérico |
| En formulario | Select con strings | Debería ser select con números |

## Soluciones Propuestas

### Opción 1: Mapeo de String a Número (Recomendado por ahora)

Crear una función de conversión. **Mapeo completo de los 8 tipos:**

```typescript
private resultTypeStringToNumberMapping: Record<string, number> = {
  'NUMERIC': 0,
  'TEXT': 1,
  'POSITIVE_NEGATIVE': 2,
  'POSITIVE_NEGATIVE_3PLUS': 3,
  'POSITIVE_NEGATIVE_4PLUS': 4,
  'REACTIVE_NON_REACTIVE': 5,
  'DETECTED_NOT_DETECTED': 6
};

private resultTypeNumberToStringMapping: Record<number, string> = {
  0: 'NUMERIC',
  1: 'TEXT',
  2: 'POSITIVE_NEGATIVE',
  3: 'POSITIVE_NEGATIVE_3PLUS',
  4: 'POSITIVE_NEGATIVE_4PLUS',
  5: 'REACTIVE_NON_REACTIVE',
  6: 'DETECTED_NOT_DETECTED'
};
```

Mapeos de conversión:
```typescript
private mapResultTypeToNumber(resultType: string): number {
  return this.resultTypeStringToNumberMapping[resultType] ?? 0;
}

private mapNumberToResultType(num: number): string {
  return this.resultTypeNumberToStringMapping[num] ?? 'NUMERIC';
}
```

### Opción 2: Cambiar el Enum Frontend

Hacer que el enum sea numérico:
```typescript
export enum TestResultType {
  NUMERIC = 0,
  TEXT = 1,
  POSITIVE_NEGATIVE = 2,
  POSITIVE_NEGATIVE_3PLUS = 3,
  POSITIVE_NEGATIVE_4PLUS = 4,
  REACTIVE_NON_REACTIVE = 5,
  DETECTED_NOT_DETECTED = 6
}
```

Esto requeriría cambios en toda la aplicación.

### Opción 3: Cambiar el Backend

Hacer que el backend acepte strings en lugar de números (menos probable que sea viable).

## Recomendación

**Usar Opción 1** (Mapeo de String a Número) porque:
- ✅ Mantiene compatibilidad con el código actual
- ✅ No requiere cambiar toda la lógica del enum
- ✅ Es reversible
- ✅ El mapeo es explícito y fácil de mantener

## Archivos Afectados

- `test-definition-form.component.ts` - Agregar funciones de mapeo y usarlas en onSubmit
- `test-definition.service.ts` - Opcional: mejorar logging de requests
- `test-definition.interface.ts` - Considerar documentar el mapping

## Status

✅ **RESUELTO**: Mapeo implementado en test-definition-form.component.ts

### Flujo Correcto (Ahora)

```
1. Usuario selecciona en el formulario: "Positivo/Negativo"
   ↓
2. Formulario captura: formValue.resultType = "POSITIVE_NEGATIVE"
   ↓
3. onSubmit() envía:
   {
     resultType: "POSITIVE_NEGATIVE",  // String directamente
     name: "...",
     sectionId: "...",
     ...
   }
   ↓
4. Backend recibe en campo 'resultType' el string "POSITIVE_NEGATIVE"
   ↓
5. TypeORM valida contra enum TestResultType ✅
   ↓
6. Se guarda exitosamente
```

### Cómo Funciona

**Flujo de Actualización:**
```
1. Usuario selecciona resultType en el formulario (string: "NUMERIC")
2. onSubmit() se ejecuta
3. Convierte: "NUMERIC" → 0 usando resultTypeStringToNumberMapping
4. Envía updateData con testResultType: 0
5. Backend recibe el número y valida correctamente
```

**Flujo de Carga (Futuro):**
```
1. Backend devuelve resultType como número: 0
2. Al cargar en el formulario, convertir usando resultTypeNumberToStringMapping
3. Mostrar en el select como "NUMERIC"
```

### Testing

Para verificar que funciona:
1. Ir a Test Definitions
2. Editar cualquier prueba
3. Cambiar el "Tipo de Resultado"
4. Guardar
5. En la consola verá: `Converting resultType: "NUMERIC" → 0`
6. Debe guardar sin error 400
