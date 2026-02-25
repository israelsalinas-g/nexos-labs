# Cálculo de Edad - Documentación

## Descripción General

Se ha implementado un servicio centralizado `AgeCalculatorService` para calcular la edad de los pacientes basándose en su fecha de nacimiento. Esto garantiza consistencia y precisión en todos los componentes de la aplicación.

## Ubicación del Servicio

- **Archivo**: `src/app/services/age-calculator.service.ts`
- **Proveedor**: Root (disponible en toda la aplicación)

## Cómo Funciona

### 1. Cálculo Básico de Edad

El servicio calcula automáticamente la edad en años considerando:
- La fecha actual del sistema
- La fecha de nacimiento del paciente
- Ajuste por cumpleaños (si aún no ha cumplido años en el año actual)

**Fórmula:**
```
edad = año_actual - año_nacimiento
Si (mes_actual < mes_nacimiento) O (mes_actual = mes_nacimiento Y día_actual < día_nacimiento)
    edad = edad - 1
```

### 2. Validación de Fechas

El servicio valida que la fecha de nacimiento sea:
- Válida (formato correcto)
- No sea en el futuro
- Retorna 0 si la fecha es inválida

## Métodos Disponibles

### `calculateAge(birthDate: string | Date): number`

Calcula la edad en años.

**Parámetros:**
- `birthDate`: Fecha de nacimiento en formato YYYY-MM-DD o cualquier formato válido para Date

**Retorna:** Número entero representando los años (mínimo 0)

**Ejemplo de uso:**
```typescript
import { AgeCalculatorService } from '../../services/age-calculator.service';

constructor(private ageCalculator: AgeCalculatorService) {}

ngOnInit() {
  const edad = this.ageCalculator.calculateAge('1990-05-15');
  console.log('Edad:', edad); // Muestra la edad actual
}
```

### `isValidBirthDate(birthDate: string | Date): boolean`

Valida si una fecha de nacimiento es válida.

**Parámetros:**
- `birthDate`: Fecha de nacimiento a validar

**Retorna:** `true` si la fecha es válida y no es en el futuro, `false` en caso contrario

**Ejemplo de uso:**
```typescript
const esValida = this.ageCalculator.isValidBirthDate('1990-05-15');
if (esValida) {
  console.log('Fecha válida');
}
```

### `getAgeWithCategory(birthDate: string | Date): { age: number; category: string }`

Obtiene la edad junto con una categoría (útil para clasificar pacientes).

**Parámetros:**
- `birthDate`: Fecha de nacimiento

**Retorna:** Objeto con:
- `age`: Número entero de años
- `category`: Cadena con la clasificación
  - "Niño" si edad < 13
  - "Adolescente" si 13 ≤ edad < 18
  - "Adulto" si 18 ≤ edad < 60
  - "Adulto Mayor" si edad ≥ 60

**Ejemplo de uso:**
```typescript
const resultado = this.ageCalculator.getAgeWithCategory('1990-05-15');
console.log(`Edad: ${resultado.age} años - Categoría: ${resultado.category}`);
// Output: Edad: 34 años - Categoría: Adulto
```

## Integración en patient-form.component.ts

El componente de formulario de pacientes implementa el cálculo automático de edad:

### Características

1. **Cálculo Automático en Tiempo Real**
   - Cuando el usuario cambia la fecha de nacimiento, la edad se recalcula automáticamente
   - El campo de edad se actualiza sin necesidad de acción del usuario

2. **Campo de Edad Readonly**
   - El campo se muestra como deshabilitado (disabled) para evitar edición manual
   - Se mantiene sincronizado con la fecha de nacimiento

3. **Al Crear Paciente**
   - La edad se calcula justo antes de enviar los datos al backend
   - Se garantiza que la edad en la base de datos sea precisa

4. **Al Editar Paciente**
   - Se carga la edad calculada basada en la fecha de nacimiento del paciente
   - Se recalcula automáticamente si se modifica la fecha de nacimiento

## Cómo Usar en Otros Componentes

Si necesitas usar el cálculo de edad en otros componentes, sigue estos pasos:

### 1. Importar el Servicio

```typescript
import { AgeCalculatorService } from '../../services/age-calculator.service';
```

### 2. Inyectar el Servicio

```typescript
constructor(private ageCalculatorService: AgeCalculatorService) {}
```

### 3. Usar los Métodos

```typescript
// Opción 1: Cálculo simple
const edad = this.ageCalculatorService.calculateAge('1990-05-15');

// Opción 2: Con categoría
const { age, category } = this.ageCalculatorService.getAgeWithCategory('1990-05-15');

// Opción 3: Validar fecha
if (this.ageCalculatorService.isValidBirthDate(fechaIngresada)) {
  // Procesar...
}
```

## Flujo Completo en el Formulario de Paciente

```
1. Usuario ingresa fecha de nacimiento
                    ↓
2. Se dispara valueChanges del campo birthDate
                    ↓
3. Se llama calculateAge() del servicio
                    ↓
4. El campo de edad se actualiza con patchValue
                    ↓
5. Usuario ve la edad calculada en tiempo real
                    ↓
6. Al hacer submit del formulario:
   - Se recalcula la edad una vez más
   - Se incluye en los datos enviados al backend
```

## Consideraciones Importantes

1. **Precisión**: El cálculo siempre usa la fecha actual del sistema
2. **Validación**: Si la fecha es inválida o en el futuro, retorna 0
3. **Formato de Fecha**: Acepta múltiples formatos (YYYY-MM-DD, timestamp, etc.)
4. **Sincronización Backend**: El backend debe aceptar el campo `age` como un número entero
5. **Readonly en UI**: El usuario no puede editar manualmente la edad, solo la fecha de nacimiento

## Testing (Ejemplos de Casos)

```typescript
// Caso 1: Cumpleaños ya pasó este año
calculateAge('1990-05-15') // Si hoy es 2025-06-01 → 35 años

// Caso 2: Cumpleaños aún no llega este año
calculateAge('1990-05-15') // Si hoy es 2025-04-01 → 34 años

// Caso 3: Fecha inválida
calculateAge('fecha-invalida') // → 0

// Caso 4: Fecha en el futuro
calculateAge('2030-01-01') // → 0

// Caso 5: Fecha de hoy
calculateAge('2025-01-15') // Si hoy es 2025-01-15 → 0
```

## Cambios Realizados en patient-form.component.ts

1. ✅ Importado `AgeCalculatorService`
2. ✅ Inyectado en el constructor
3. ✅ Reemplazado método local `calculateAge()` por llamadas al servicio
4. ✅ Agregado campo visual "Edad Calculada" en el formulario
5. ✅ Campo deshabilitado y con hint explicativo
6. ✅ Sincronización automática al cambiar fecha de nacimiento

## Estado Actual

- ✅ Servicio creado y documentado
- ✅ Integración en patient-form.component.ts
- ✅ Sin errores de compilación
- ✅ Listo para usar en otros componentes si es necesario
