# 📝 Registro de Usuario en Stool-Tests (Frontend)

## ✅ Implementación Final

El frontend **SÍ envía** `createdById` y `reviewedById` con los datos del usuario autenticado.

## 🎯 Flujos Implementados

### 1. CREAR Examen Coprológico

**Componente:** `stool-test-form.component.ts`

```typescript
} else {
  // Create new test - Get current user from token
  const currentUser = this.authService.getCurrentUserValue();
  
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
    status: formValue.status || undefined,
    createdById: currentUser?.id  // ✅ INCLUIDO
  };

  console.log('📝 FORMULARIO - Objeto CreateStoolTestDto construido:', createDto);
  console.log('📋 FORMULARIO - Usuario autenticado:', {
    id: currentUser?.id,
    username: currentUser?.username,
    email: currentUser?.email,
    role: currentUser?.role
  });
  
  this.stoolTestService.createStoolTest(createDto).subscribe({...});
}
```

**Payload enviado al backend:**
```json
{
  "patientId": "patient-uuid-123",
  "color": "Café",
  "consistency": "Formada",
  "shape": "Moderado",
  "mucus": "No se observa",
  "leukocytes": "No se observa",
  "erythrocytes": "No se observa",
  "observations": "Examen normal",
  "status": "completed",
  "createdById": "user-uuid-456"
}
```

---

### 2. ACTUALIZAR Examen Coprológico

**Componente:** `stool-test-detail.component.ts`

```typescript
saveChanges(): void {
  if (!this.stoolTest) return;

  this.saving = true;
  const currentUser = this.authService.getCurrentUserValue();

  const updates: UpdateStoolTestDto = {
    color: this.editForm.color,
    consistency: this.editForm.consistency,
    shape: this.editForm.shape,
    mucus: this.editForm.mucus,
    leukocytes: this.editForm.leukocytes,
    erythrocytes: this.editForm.erythrocytes,
    parasites: this.editForm.parasites,
    protozoos: this.editForm.protozoos,
    observations: this.editForm.observations,
    status: this.editForm.status,
    reviewedById: currentUser?.id  // ✅ INCLUIDO
  };

  console.log('📝 DETALLE - Objeto UpdateStoolTestDto:', updates);
  console.log('📋 DETALLE - Usuario que revisa:', {
    id: currentUser?.id,
    username: currentUser?.username,
    email: currentUser?.email
  });

  this.stoolTestService.updateStoolTest(this.stoolTest.id, updates).subscribe({...});
}
```

**Payload enviado al backend:**
```json
{
  "color": "Café",
  "consistency": "Formada",
  "observations": "Resultado normal",
  "reviewedById": "user-uuid-789"
}
```

---

## 📊 Interfaces DTOs

### CreateStoolTestDto
```typescript
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
  createdById?: string; // ✅ ID del usuario que crea
}
```

### UpdateStoolTestDto
```typescript
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
  reviewedById?: string; // ✅ ID del usuario que revisa
}
```

---

## 🔄 Flujo de Datos Completo

```
┌─────────────────────────────────────┐
│   USUARIO AUTENTICADO EN FRONTEND   │
│                                     │
│  localStorage → JWT Token           │
│         ↓                           │
│  AuthService.getCurrentUserValue()  │
│         ↓                           │
│  { id, username, email, role, ... } │
└─────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   CREAR EXAMEN        │
        └───────────────────────┘
                    ↓
      ┌─────────────────────────┐
      │ stool-test-form.ts      │
      │ onSubmit()              │
      │                         │
      │ 1. Obtiene currentUser  │
      │ 2. Construye DTO        │
      │ 3. Incluye createdById  │
      │ 4. Envía POST           │
      └─────────────────────────┘
                    ↓
        HTTP POST /stool-tests
        {
          patientId: "...",
          createdById: "user-uuid"  ← Frontend envía
        }
                    ↓
      ┌─────────────────────────┐
      │   BACKEND (NestJS)      │
      │                         │
      │ 1. Recibe DTO           │
      │ 2. Valida usuario       │
      │ 3. Crea relación        │
      │ 4. Guarda en BD         │
      │                         │
      │ DB: created_by_id = ... │
      └─────────────────────────┘
                    ↓
        Response 201 Created
        {
          id: 1,
          createdBy: { id, username, ... },
          createdById: "user-uuid"
        }
                    ↓
      ┌─────────────────────────┐
      │  ACTUALIZAR EXAMEN      │
      └─────────────────────────┘
                    ↓
      ┌─────────────────────────┐
      │ stool-test-detail.ts    │
      │ saveChanges()           │
      │                         │
      │ 1. Obtiene currentUser  │
      │ 2. Construye DTO        │
      │ 3. Incluye reviewedById │
      │ 4. Envía PATCH          │
      └─────────────────────────┘
                    ↓
        HTTP PATCH /stool-tests/:id
        {
          color: "Café",
          reviewedById: "user-uuid"  ← Frontend envía
        }
                    ↓
      ┌─────────────────────────┐
      │   BACKEND (NestJS)      │
      │                         │
      │ 1. Recibe DTO           │
      │ 2. Valida reviewer      │
      │ 3. Actualiza relación   │
      │ 4. Guarda en BD         │
      │                         │
      │ DB: reviewed_by_id = ...│
      └─────────────────────────┘
                    ↓
        Response 200 OK
        {
          id: 1,
          reviewedBy: { id, username, ... },
          reviewedById: "user-uuid"
        }
```

---

## ✅ Resumen de Implementación

| Operación | Componente | Campo | Quién lo Envía | Valor |
|-----------|-----------|-------|----------------|-------|
| **CREATE** | stool-test-form | `createdById` | Frontend | `currentUser?.id` |
| **UPDATE** | stool-test-detail | `reviewedById` | Frontend | `currentUser?.id` |

---

## 🔍 Logs en Consola del Navegador

### Al Crear Examen (F12 Console):
```
📝 FORMULARIO - Objeto CreateStoolTestDto construido: {
  patientId: "550e8400-e29b-41d4-a716-446655440000"
  color: "Café"
  consistency: "Formada"
  shape: "Moderado"
  mucus: "No se observa"
  leukocytes: "No se observa"
  erythrocytes: "No se observa"
  parasites: []
  protozoos: []
  observations: "Resultado normal"
  status: "completed"
  createdById: "550e8400-e29b-41d4-a716-446655440111"  ← ✅ PRESENTE
}

📋 FORMULARIO - Usuario autenticado: {
  id: "550e8400-e29b-41d4-a716-446655440111"
  username: "john.doe"
  email: "john@example.com"
  role: "laboratory_technician"
}
```

### Al Actualizar Examen (F12 Console):
```
📝 DETALLE - Objeto UpdateStoolTestDto: {
  color: "Café"
  consistency: "Formada"
  shape: "Moderado"
  mucus: "No se observa"
  leukocytes: "No se observa"
  erythrocytes: "No se observa"
  parasites: []
  protozoos: []
  observations: "Resultado normal"
  status: "completed"
  reviewedById: "550e8400-e29b-41d4-a716-446655440222"  ← ✅ PRESENTE
}

📋 DETALLE - Usuario que revisa: {
  id: "550e8400-e29b-41d4-a716-446655440222"
  username: "jane.smith"
  email: "jane@example.com"
}
```

---

## 🚀 Próximos Pasos en Backend

### 1. CreateStoolTestDto (Backend)
```typescript
export class CreateStoolTestDto {
  patientId: string;
  testDate?: string;
  status?: TestStatus;
  color?: StoolColor;
  consistency?: StoolConsistency;
  shape?: StoolShape;
  mucus?: EscasaModeradaAbundanteAusenteQuantity;
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity;
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity;
  parasites?: ParasiteResult[];
  protozoos?: ProtozooResult[];
  observations?: string;

  @IsOptional()
  @IsUUID()
  createdById?: string;  // ← VALIDAR QUE EXISTA
}
```

### 2. StoolTestController.create()
```typescript
@Post()
async create(
  @Body() createDto: CreateStoolTestDto,
  @Req() req: Request
): Promise<StoolTest> {
  // Si viene createdById, validar que existe
  if (createDto.createdById) {
    const user = await this.userRepository.findOne(createDto.createdById);
    if (!user) throw new NotFoundException('Usuario no encontrado');
  }
  
  return this.stoolTestService.create(createDto);
}
```

### 3. StoolTestService.create()
```typescript
async create(createDto: CreateStoolTestDto): Promise<StoolTest> {
  const stoolTest = this.stoolTestRepository.create({
    ...createDto,
    createdBy: createDto.createdById 
      ? { id: createDto.createdById } 
      : undefined
  });

  return this.stoolTestRepository.save(stoolTest);
}
```

### 4. StoolTestService.update()
```typescript
async update(id: number, updateDto: UpdateStoolTestDto): Promise<StoolTest> {
  const stoolTest = await this.stoolTestRepository.findOne(id);
  
  if (updateDto.reviewedById) {
    const reviewer = await this.userRepository.findOne(updateDto.reviewedById);
    if (!reviewer) throw new NotFoundException('Usuario revisor no encontrado');
    
    stoolTest.reviewedBy = reviewer;
  }

  Object.assign(stoolTest, updateDto);
  return this.stoolTestRepository.save(stoolTest);
}
```

---

## 📋 Checklist de Validación

- [x] Frontend envía `createdById` al crear
- [x] Frontend envía `reviewedById` al actualizar
- [x] AuthService obtiene usuario del localStorage
- [x] Logs console muestran datos correctos
- [x] DTOs incluyen campos de usuario
- [ ] Backend recibe y procesa `createdById`
- [ ] Backend recibe y procesa `reviewedById`
- [ ] BD guardaproperly las relaciones
- [ ] Response incluye objetos User poblados

---

## 📝 Cambios en Frontend Realizados

1. **stool-test.interface.ts**
   - ✅ `CreateStoolTestDto.createdById` agregado
   - ✅ `UpdateStoolTestDto.reviewedById` presente

2. **stool-test-form.component.ts**
   - ✅ `AuthService` inyectado
   - ✅ `createdById: currentUser?.id` incluido en payload
   - ✅ Logs detallados agregados

3. **stool-test-detail.component.ts**
   - ✅ `AuthService` inyectado
   - ✅ `reviewedById: currentUser?.id` incluido en payload
   - ✅ Logs detallados agregados

---

## 🎯 Resultado Final

Ahora el frontend:
- ✅ Captura quién crea exámenes (`createdById`)
- ✅ Captura quién revisa exámenes (`reviewedById`)
- ✅ Envía correctamente los datos del usuario autenticado
- ✅ Permite auditoría completa de quién hizo qué

El backend recibe toda la información necesaria para:
- ✅ Establecer relaciones correctas con usuarios
- ✅ Mantener auditoría completa
- ✅ Validar que los usuarios existen
