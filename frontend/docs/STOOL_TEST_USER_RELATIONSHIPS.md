# Actualización: Relaciones de Usuario en Stool-Test

## Fecha
30 de Octubre, 2025

## Resumen de Cambios

Se ha refactorizado la entidad `StoolTest` para reemplazar los campos de texto `technician` y `reviewedBy` con relaciones de usuario propiamente configuradas. Esto permite un mejor rastreo de auditoría y una relación más fuerte entre los exámenes y los usuarios del sistema.

## Cambios en el Backend

### Nuevos Campos en la Entidad StoolTest

```typescript
// RELACIONES CON USUARIOS
@ApiProperty({ 
  description: 'Usuario que creó/realizó el examen',
  type: () => User
})
@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'created_by_id' })
createdBy: User;

@ApiProperty({ description: 'ID del usuario que creó el examen' })
@Column({ name: 'created_by_id', type: 'uuid', nullable: true })
createdById: string;

@ApiProperty({ 
  description: 'Usuario que revisó/aprobó el examen',
  type: () => User
})
@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'reviewed_by_id' })
reviewedBy: User;

@ApiProperty({ description: 'ID del usuario que revisó el examen' })
@Column({ name: 'reviewed_by_id', type: 'uuid', nullable: true })
reviewedById: string;

@ApiProperty({ description: 'Fecha de creación' })
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@ApiProperty({ description: 'Fecha de actualización' })
@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
```

## Cambios en el Frontend

### 1. Interfaz StoolTest (`stool-test.interface.ts`)

**Eliminado:**
- `technician?: string | null;`
- `reviewedBy?: string | null;` (el campo anterior que era string)

**Agregado:**
```typescript
// Relaciones con Usuarios
createdBy?: User | null;
createdById?: string | null;
reviewedBy?: User | null;
reviewedById?: string | null;
```

### 2. Interfaces de DTO

**CreateStoolTestDto** y **UpdateStoolTestDto**:
- Eliminados campos `technician` y `reviewedBy`
- El backend captura automáticamente `created_by_id` cuando se crea un registro
- El backend establece `reviewed_by_id` cuando se actualiza y cambia el estado a "revisado"

### 3. Componente de Detalle (`stool-test-detail.component.ts`)

**Cambios en la Plantilla:**
```typescript
// Antes
<span>{{ stoolTest.technician || 'N/A' }}</span>
<span>{{ stoolTest.reviewedBy }}</span>

// Ahora
<span>{{ stoolTest.createdBy?.name || 'N/A' }}</span>
<span>{{ stoolTest.reviewedBy.name }}</span>
```

**Cambios en TypeScript:**
- Eliminado campo `reviewedBy` del formulario de edición
- Eliminado input de texto para "Revisado por"
- La información del usuario que revisó se obtiene automáticamente del backend

### 4. Componente de Formulario (`stool-test-form.component.ts`)

**Eliminado:**
- Campo input para "Técnico"
- Campo input para "Revisado por"
- Referencias en `initializeForm()`
- Referencias en `loadTestData()`
- Referencias en `onSubmit()`

**Por qué:**
- El usuario que crea el registro se captura automáticamente en el backend
- El usuario autenticado en el frontend es identificado por el interceptor JWT
- No necesita ser ingresado manualmente por el usuario

## Flujo de Datos

### Creación de un Examen
1. Usuario autenticado abre el formulario de creación
2. Completa los datos del examen (sin campo de técnico)
3. Envía el formulario
4. Backend recibe la solicitud con token JWT
5. Backend extrae el `userId` del token
6. Backend automáticamente establece `created_by_id = userId`
7. El registro se crea con la relación establecida

### Actualización de un Examen
1. Usuario autenticado abre un examen para editar
2. Modifica los campos permitidos
3. Si cambia el estado a "revisado" (opcional en backend)
4. Envía los cambios
5. Backend recibe la solicitud
6. Backend puede establecer `reviewed_by_id = userId` si aplica
7. El registro se actualiza con las nuevas relaciones

## Beneficios

✅ **Mejor Auditoría**: Registro completo de quién creó y revisó cada examen
✅ **Relaciones de Base de Datos**: Conexiones propias entre tablas, no solo strings
✅ **Integridad Referencial**: Si un usuario se elimina, los registros se preservan (ON DELETE SET NULL)
✅ **Información Completa**: Acceso a todos los datos del usuario (nombre, email, rol, etc.)
✅ **Menos Propenso a Errores**: No depende de entrada manual de nombres

## Interfaz de Usuario

### Vistas Actualizadas

1. **Detalle del Examen**:
   - Muestra "Técnico" como el nombre del usuario que creó el examen
   - Muestra "Revisado por" como el nombre del usuario que lo revisó (si aplica)

2. **Formulario de Creación**:
   - Ya no hay campo para ingresar "Técnico"
   - Se captura automáticamente del usuario autenticado

3. **Formulario de Edición**:
   - Ya no hay campo para ingresar "Revisado por"
   - Se actualiza automáticamente en el backend si es necesario

## Ejemplo de Respuesta API

```json
{
  "id": 1,
  "patientId": "uuid-123",
  "sampleNumber": "STOOL-2025-001",
  "testDate": "2025-10-30T14:30:00Z",
  "status": "completed",
  "color": "Café",
  "consistency": "Formada",
  "createdBy": {
    "id": "user-uuid-1",
    "username": "john.doe",
    "name": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": {
      "id": "role-uuid-1",
      "name": "TECNICO"
    }
  },
  "createdById": "user-uuid-1",
  "createdAt": "2025-10-30T14:30:00Z",
  "reviewedBy": null,
  "reviewedById": null,
  "updatedAt": "2025-10-30T14:30:00Z"
}
```

## Archivos Modificados

1. ✅ `src/app/models/stool-test.interface.ts` - Interfaces actualizadas
2. ✅ `src/app/components/stool-tests/stool-test-detail.component.ts` - Plantilla y lógica actualizada
3. ✅ `src/app/components/stool-tests/stool-test-form.component.ts` - Campos de formulario eliminados

## Notas Técnicas

### Importancia del Interceptor JWT
El `authInterceptor` es crítico para este flujo:
- Inyecta automáticamente el token JWT en cada solicitud
- El backend extrae el `userId` del token
- Establece las relaciones de usuario automáticamente

### Consideraciones de Seguridad
- ✅ Solo el usuario autenticado puede crear exámenes (se valida en backend)
- ✅ El `userId` viene del token JWT, no de entrada del usuario
- ✅ Imposible falsificar quién creó o revisó un examen

## Próximas Mejoras Sugeridas

1. **Auditoría de Cambios**: Guardar historial de quién cambió qué y cuándo
2. **Aprobación de Exámenes**: Workflow explícito para revisar y aprobar exámenes
3. **Permisos Granulares**: Diferentes permisos para técnicos vs. revisores
4. **Notificaciones**: Alertar a los revisores cuando hay exámenes pendientes
5. **Reportes de Auditoría**: Reportes que muestren actividad por usuario

## Testing Recomendado

### En el Frontend
1. ✅ Crear nuevo examen y verificar que muestre el usuario correcto
2. ✅ Editar examen y verificar que se actualice correctamente
3. ✅ Ver detalles del examen y verificar información del usuario

### En el Backend
1. ✅ Verificar que `created_by_id` se establezca automáticamente
2. ✅ Verificar que `reviewed_by_id` se establezca cuando sea necesario
3. ✅ Verificar que las relaciones funcionen correctamente
4. ✅ Probar eliminación de usuario (ON DELETE SET NULL)

## Commit Git

```
commit bc3adb0
Author: Sistema
Date: 30 de Octubre, 2025

refactor: update stool-test model to use user relationships

- Replace technician and reviewedBy string fields with user object relationships
- Add createdBy/createdById and reviewedBy/reviewedById relationships to User model
- Remove technician input from stool-test-form component
- Remove reviewedBy input from stool-test-detail component
- Update all StoolTest related interfaces
- Backend automatically captures created_by_id when record is created
- Backend can set reviewed_by_id when record is reviewed
```

## Conclusión

Esta refactorización mejora significativamente la integridad de los datos y la auditoría del sistema. Ahora es posible rastrear exactamente quién realizó cada examen y quién lo revisó, con acceso a toda la información del usuario y no solo sus nombres.
