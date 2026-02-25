# 🔍 Debugging: Objeto CreateStoolTestDto Enviado desde Frontend

## Resumen

He agregado `console.log` en dos lugares clave para que puedas ver exactamente qué objeto se envía desde el frontend al backend cuando se crea un nuevo examen coprológico.

## Logs Agregados

### 1. En el Componente de Formulario (`stool-test-form.component.ts`)

**Ubicación:** Línea ~1075 (método `onSubmit`)

```typescript
const createDto: CreateStoolTestDto = {
  patientId: formValue.patientId.toString(),
  color: formValue.color || undefined,
  // ... otros campos
};

// 🔍 LOG: Verificar el objeto antes de enviar
console.log('📝 FORMULARIO - Objeto CreateStoolTestDto construido:', createDto);
console.log('📋 FORMULARIO - Verificación de campos:', {
  hasPatientId: !!createDto.patientId,
  hasColor: !!createDto.color,
  hasConsistency: !!createDto.consistency,
  hasParasites: !!(createDto.parasites && createDto.parasites.length > 0),
  hasProtozoos: !!(createDto.protozoos && createDto.protozoos.length > 0),
  hasObservations: !!createDto.observations,
  testDate: createDto.testDate,
  status: createDto.status
});
```

**Qué muestra:**
- El objeto completo `CreateStoolTestDto` que se va a enviar
- Un resumen de qué campos están presentes/ausentes

### 2. En el Servicio de StoolTest (`stool-test.service.ts`)

**Ubicación:** Línea ~55 (método `createStoolTest`)

```typescript
createStoolTest(data: CreateStoolTestDto): Observable<StoolTest> {
  // 🔍 LOG: Verificar el objeto que se envía
  console.log('📤 FRONTEND - Objeto enviado al backend (CreateStoolTestDto):', {
    payload: data,
    timestamp: new Date().toISOString()
  });

  return this.http.post<StoolTest>(this.baseUrl, data)
    .pipe(catchError(this.handleError));
}
```

**Qué muestra:**
- El objeto exacto que se envía a través de HTTP
- Timestamp de cuándo se envió

## Cómo Usar para Debugging

### Paso 1: Abre la consola del navegador
- Presiona `F12` en tu navegador
- Navega a la pestaña "Console"

### Paso 2: Crea un nuevo examen
- Completa el formulario de creación de stool-test
- Hace clic en "Guardar"

### Paso 3: Observa los logs
Deberías ver algo como:

```
📝 FORMULARIO - Objeto CreateStoolTestDto construido: {
  patientId: "550e8400-e29b-41d4-a716-446655440000"
  color: "Café"
  consistency: "Formada"
  shape: "Moderado"
  mucus: "No se observa"
  leukocytes: "No se observa"
  erythrocytes: "No se observa"
  parasites: Array(0)
  protozoos: Array(0)
  testDate: "2025-10-30T14:30:00"
  status: "pending"
}

📋 FORMULARIO - Verificación de campos: {
  hasPatientId: true
  hasColor: true
  hasConsistency: true
  hasParasites: false
  hasProtozoos: false
  hasObservations: false
  testDate: "2025-10-30T14:30:00"
  status: "pending"
}

📤 FRONTEND - Objeto enviado al backend (CreateStoolTestDto): {
  payload: { /* ... mismo objeto de arriba ... */ }
  timestamp: "2025-10-30T14:30:15.123Z"
}
```

## Puntos Importantes

### ❌ El `createdById` NO debe estar en el objeto

```typescript
// INCORRECTO - El frontend NO debe enviar esto:
{
  patientId: "...",
  createdById: "user-123",  // ❌ NO DEBE ESTAR AQUÍ
  ...
}
```

**Razón:** El `createdById` debe ser capturado **automáticamente en el backend** a partir del token JWT del usuario autenticado.

### ✅ El objeto debería verse así:

```typescript
// CORRECTO - Lo que el frontend debe enviar:
{
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  color: "Café",
  consistency: "Formada",
  shape: "Moderado",
  mucus: "No se observa",
  leukocytes: "No se observa",
  erythrocytes: "No se observa",
  parasites: [],
  protozoos: [],
  testDate: "2025-10-30T14:30:00",
  observations: undefined,
  status: "pending"
}
```

**Lo que DEBE hacer el backend:**
1. Recibir el objeto anterior
2. Extraer el `userId` del token JWT
3. Establecer automáticamente `createdById = userId`
4. Guardar en la BD

## Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario completa el formulario                          │
│  2. Usuario hace clic en "Guardar"                          │
│  3. Componente construye CreateStoolTestDto                 │
│     (SIN createdById)                                       │
│  4. Componente hace console.log() ← 📝 LOG 1              │
│  5. Servicio llama a createStoolTest()                      │
│  6. Servicio hace console.log() ← 📤 LOG 2                │
│  7. HttpClient envía POST a /stool-tests                    │
│     + Incluye Auth header con JWT token                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                         HTTP POST
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Controlador recibe CreateStoolTestDto                   │
│  2. Guard JWT extrae userId del token                       │
│  3. Servicio inyecta REQUEST y obtiene usuario actual       │
│  4. Servicio establece:                                     │
│     - createdBy = objeto User del request                  │
│     - createdById = userId                                 │
│  5. Servicio guarda en BD                                  │
│  6. Servicio retorna StoolTest completo                    │
│     (con createdBy y createdById poblados)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                        HTTP 201
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Servicio recibe respuesta con createdBy y createdById   │
│  2. Componente navega a la página de detalle                │
│  3. Usuario ve el examen con "Técnico: [Nombre del User]"   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Archivos Modificados

1. ✅ `src/app/components/stool-tests/stool-test-form.component.ts`
   - Agregado console.log para verificar objeto CreateStoolTestDto

2. ✅ `src/app/services/stool-test.service.ts`
   - Agregado console.log para verificar objeto antes de HTTP POST

## Próximos Pasos

1. **Ejecuta la aplicación** con `ng serve`
2. **Abre la consola del navegador** (F12)
3. **Crea un nuevo examen** completando el formulario
4. **Observa los logs** para confirmar que el objeto es correcto
5. **Verifica en el backend** que el `createdById` se está poblando en la BD

## Qué Buscar en los Logs

### ✅ Señales Positivas
- El objeto tiene `patientId` poblado
- No tiene `createdById` (correcto, lo agrega el backend)
- Tiene los campos que completas (color, consistency, etc.)
- El timestamp se captura correctamente

### ❌ Señales de Problema
- Si ves errores 401 → Token JWT no está siendo enviado correctamente
- Si ves errores 400 → El objeto tiene campos inválidos
- Si ves `createdById` en el objeto → El frontend no debería enviarlo

## Notas Técnicas

### Por qué el frontend NO envía `createdById`

Es un principio de seguridad: **No permitas que el cliente especifique quién es "él"**.

- ❌ Mal: Frontend dice "Yo soy el usuario John"
- ✅ Bien: Frontend dice "Aquí está mi token JWT", Backend verifica y extrae la identidad

El `authInterceptor` en el frontend es responsable de inyectar el token JWT en cada solicitud. El backend luego extrae la identidad del token.

## Archivos Relevantes

- `src/app/components/stool-tests/stool-test-form.component.ts` - Componente que construye el DTO
- `src/app/services/stool-test.service.ts` - Servicio que envía el DTO
- `src/app/models/stool-test.interface.ts` - Definición de CreateStoolTestDto
- Backend: `CreateStoolTestDto` - Debe no incluir createdById
- Backend: `StoolTestService.create()` - Debe capturar userId del request

## Comandos Útiles

### Para ver los logs en tiempo real:
```bash
# En la consola del navegador, en la pestaña "Network"
# Busca la solicitud POST a /stool-tests
# Expande "Request" para ver el payload
```

### Para limpiar los logs:
```javascript
// En la consola del navegador
console.clear();
```

### Para filtrar logs:
```javascript
// En la consola, escribe:
// Esto muestra solo los logs que contienen "FORMULARIO"
// Por defecto, la consola permite filtrado por text
```

## Conclusión

Con estos logs, podrás ver exactamente:
1. ¿Qué está enviando el frontend?
2. ¿Está el objeto correctamente formado?
3. ¿El frontend está incluyendo createdById (cuando no debería)?
4. ¿Cuándo se envía exactamente?

Una vez confirmes que el frontend está enviando el objeto correcto (SIN createdById), el problema estará en el backend para capturarlo correctamente.
