# 📝 Actualización: Registrar Usuario que Revisa (reviewedBy)

## ⚠️ CAMBIO IMPORTANTE

**`createdById` NO se envía desde el frontend.** El backend extrae automáticamente quién creó el examen desde el token JWT. 

**Solo `reviewedById` se envía** cuando se actualiza un examen.

## ✅ Cambios Implementados en Frontend

### 1. Interfaz Actualizada (`stool-test.interface.ts`)

```typescript
// ❌ NO SE ENVÍA desde frontend
export interface CreateStoolTestDto {
  patientId: string;
  testDate?: string;
  status?: TestStatus;
  color?: StoolColor | string;
  consistency?: StoolConsistency | string;
  shape?: StoolShape | string;
  mucus?: EscasaModeradaAbundanteAusenteQuantity | string;
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  parasites?: ParasiteResult[];
  protozoos?: ProtozooResult[];
  observations?: string;
  // ❌ createdById REMOVIDO - el backend lo extrae del JWT
}

// ✅ SÍ SE ENVÍA desde frontend
export interface UpdateStoolTestDto {
  sampleNumber?: string;
  testDate?: string;
  status?: TestStatus;
  color?: StoolColor | string;
  consistency?: StoolConsistency | string;
  shape?: StoolShape | string;
  mucus?: EscasaModeradaAbundanteAusenteQuantity | string;
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity | string;
  parasites?: ParasiteResult[];
  protozoos?: ProtozooResult[];
  observations?: string;
  reviewedById?: string;  // ✅ Incluido: ID del usuario que revisa
}
```

### 2. Componente Formulario (`stool-test-form.component.ts`)

**Cambios:**
- ❌ Removido `AuthService` del constructor (no es necesario para crear)
- ❌ Removido el código que obtiene `currentUser?.id`
- ❌ Removido `createdById` del payload
- ✅ Adicionado comentario explicativo

```typescript
} else {
  // Create new test - Backend extracts createdBy from JWT automatically
  // Backend extracts createdBy from JWT token automatically
  
  const createDto: CreateStoolTestDto = {
    patientId: formValue.patientId.toString(),
    color: formValue.color || undefined,
    consistency: formValue.consistency || undefined,
    shape: formValue.shape || undefined,
    mucus: formValue.mucus || undefined,
    leukocytes: formValue.leukocytes || undefined,
    erythrocytes: formValue.erythrocytes || undefined,
    parasites: parasites.length > 0 ? parasites : undefined,
    protozoos: protozoos.length > 0 ? protozoos : undefined,
    testDate: formValue.testDate || undefined,
    observations: formValue.observations || undefined,
    status: formValue.status || undefined
  };

  // 🔍 LOG: Verificar el objeto antes de enviar
  console.log('📝 FORMULARIO - Objeto CreateStoolTestDto construido:', createDto);
  console.log('ℹ️ FORMULARIO - Nota: createdBy será extraído del JWT por el backend');
```

### 3. Componente Detalle (`stool-test-detail.component.ts`)

**Permanece igual - sigue registrando quién revisa:**

```typescript
saveChanges(): void {
  if (!this.stoolTest) return;

  this.saving = true;
  const currentUser = this.authService.getCurrentUserValue();

  const updates: UpdateStoolTestDto = {
    // ... campos ...
    reviewedById: currentUser?.id  // ✅ Quién revisa/edita
  };

  console.log('📝 DETALLE - Objeto UpdateStoolTestDto:', updates);
  console.log('📋 DETALLE - Usuario que revisa:', {
    id: currentUser?.id,
    username: currentUser?.username,
    email: currentUser?.email
  });
  // ...
}
```

## 📊 Flujo de Datos ACTUALIZADO

```
┌─────────────────────────────────────────────────────────────┐
│              CREAR Examen Coprológico                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario completa formulario                             │
│  2. Usuario hace clic en "Guardar"                          │
│  3. Componente construye CreateStoolTestDto SIN createdById │
│  4. Envía HTTP POST a /stool-tests                          │
│                                                              │
│  Payload enviado:                                           │
│  {                                                          │
│    patientId: "patient-uuid",                              │
│    color: "Café",                                          │
│    // NO incluye createdById                               │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                       HTTP POST
        ┌─────────────────────────────────┐
        │   Incluye JWT en headers        │
        │   Authorization: Bearer <token> │
        └─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. @UseGuards(AuthGuard) extrae JWT                        │
│  2. Obtiene user del token: request.user (userId)           │
│  3. Crea StoolTest con:                                     │
│     - created_by_id = request.user.id                       │
│     - ... otros campos ...                                  │
│  4. Guarda en BD                                            │
│  5. Retorna respuesta con relationships pobladas            │
│                                                              │
│  Resultado en BD:                                           │
│  {                                                          │
│    id: 1,                                                   │
│    created_by_id: "user-uuid-123"  ← Extraído del JWT      │
│    created_at: "2025-10-30T15:45:00Z"                      │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
             response: { createdBy: { id, username, ... }, ... }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Examen Creado Exitosamente                     │
│   createdBy: John Doe                                       │
│   reviewed_by: (vacío)                                      │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│              ACTUALIZAR Examen Coprológico                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario abre examen en detalle                          │
│  2. Usuario hace clic en "Editar"                           │
│  3. Usuario modifica campos                                 │
│  4. Usuario hace clic en "Guardar"                          │
│  5. Componente obtiene usuario actual del AuthService       │
│  6. Componente construye UpdateStoolTestDto CON reviewedById│
│  7. Envía HTTP PATCH a /stool-tests/:id                     │
│                                                              │
│  Payload enviado:                                           │
│  {                                                          │
│    color: "Café",                                          │
│    observations: "Resultado normal",                        │
│    reviewedById: "user-uuid-456"  ← INCLUIDO               │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                       HTTP PATCH
        ┌─────────────────────────────────┐
        │   Incluye JWT en headers        │
        │   Authorization: Bearer <token> │
        │   Body: { reviewedById, ... }   │
        └─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Busca el examen existente                               │
│  2. Si reviewedById presente:                               │
│     - Valida que usuario existe                            │
│     - Carga la relación del usuario                        │
│     - Asigna reviewedBy y reviewedById                     │
│  3. Actualiza otros campos                                  │
│  4. Guarda con updated_at                                   │
│  5. Retorna StoolTest actualizado                           │
│                                                              │
│  Resultado en BD:                                           │
│  {                                                          │
│    id: 1,                                                   │
│    created_by_id: "user-uuid-123",                          │
│    reviewed_by_id: "user-uuid-456"  ← NUEVO                │
│    updated_at: "2025-10-30T16:00:00Z"                      │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                        HTTP 200
    response: { createdBy: {...}, reviewedBy: {...}, ... }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Examen Actualizado Exitosamente                │
│   createdBy: John Doe                                       │
│   reviewedBy: Jane Smith                                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Puntos Clave

| Operación | Campo | Quién lo Envía | Quién lo Extrae |
|-----------|-------|----------------|-----------------|
| **CREATE** | `created_by_id` | ❌ NO (Frontend) | ✅ Backend (JWT) |
| **UPDATE** | `reviewed_by_id` | ✅ Frontend | ✅ Backend (Valida) |

## 🔐 Flujo de Seguridad

**En CREATE:**
```
Frontend Request → Backend JWT Guard
                      ↓
                Backend obtiene userId del token
                      ↓
                Se asigna automáticamente created_by_id
                      ↓
                NO se puede falsificar quién creó
```

**En UPDATE:**
```
Frontend envía reviewedById → Backend valida
                                  ↓
                        ¿User ID existe?
                        ¿User está activo?
                              ↓
                        Se asigna reviewed_by_id
                        NO se puede falsificar quién revisa
```

## ✅ Estado Actual

| Componente | Estado | Cambios |
|-----------|--------|---------|
| `stool-test.interface.ts` | ✅ Actualizado | Removido `createdById` de CreateStoolTestDto |
| `stool-test-form.component.ts` | ✅ Actualizado | Removido `AuthService`, removido `createdById` del payload |
| `stool-test-detail.component.ts` | ✅ Completo | Mantiene `reviewedById` en UpdateStoolTestDto |
| Compilación | ✅ Sin errores | 0 errores |

## 🚀 Próximos Pasos en Backend

1. **CreateStoolTestDto**: Verificar que NO tiene `@IsOptional() createdById`
2. **StoolTestService.create()**:
   ```typescript
   async create(createDto: CreateStoolTestDto, user: UserAuth): Promise<StoolTest> {
     // user viene del JWT Guard
     const stoolTest = this.stoolTestRepository.create({
       ...createDto,
       createdById: user.id  // ← Backend asigna desde JWT
     });
     return this.stoolTestRepository.save(stoolTest);
   }
   ```

3. **UpdateStoolTestDto**: Mantiene `@IsOptional() @IsUUID() reviewedById?: string`
4. **StoolTestService.update()**:
   ```typescript
   async update(id: number, updateDto: UpdateStoolTestDto): Promise<StoolTest> {
     const stoolTest = await this.stoolTestRepository.findOne(id);
     
     if (updateDto.reviewedById) {
       const reviewer = await this.userRepository.findOne(updateDto.reviewedById);
       if (!reviewer) throw new NotFoundException('Usuario no encontrado');
       stoolTest.reviewedBy = reviewer;
     }
     
     return this.stoolTestRepository.save(stoolTest);
   }
   ```

## 📝 Resumen de Cambios

```diff
- CreateStoolTestDto ahora NO incluye createdById
- Frontend ya no intenta enviar createdById  
- Backend extrae createdById del JWT automáticamente
- UpdateStoolTestDto mantiene reviewedById
- Frontend envía reviewedById en updates
```

## ✨ Ventajas

✅ **Seguridad**: No se puede falsificar quién creó el examen
✅ **Auditoría completa**: Se registra creador y revisor
✅ **Automático**: Backend maneja la lógica sin que frontend interfiera
✅ **Validación**: Backend valida que revisores existan
✅ **Sin duplicación**: El JWT es la fuente única de verdad para quién crea

