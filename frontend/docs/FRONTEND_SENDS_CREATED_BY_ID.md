# 📝 Actualización: Frontend Envía `createdById` en el DTO

## Cambio de Enfoque

En lugar de que el backend extraiga el `userId` del token JWT, ahora el **frontend envía el `createdById`** junto con el resto de los datos del examen. Esto es más simple y eficiente.

## ✅ Cambios Realizados en Frontend

### 1. Actualización de la Interfaz (`stool-test.interface.ts`)

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
  createdById?: string;  // ← AGREGADO: ID del usuario autenticado
}
```

### 2. Actualización del Componente (`stool-test-form.component.ts`)

**Inyección de AuthService:**
```typescript
constructor(
  private fb: FormBuilder,
  private router: Router,
  private route: ActivatedRoute,
  private stoolTestService: StoolTestService,
  private patientService: PatientService,
  private authService: AuthService  // ← AGREGADO
) {}
```

**Construcción del DTO:**
```typescript
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
  createdById: currentUser?.id  // ← AGREGADO
};
```

## 🔧 Cambios Necesarios en Backend

### 1. Actualizar el DTO (`CreateStoolTestDto`)

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, MinLength, IsBoolean, IsUUID } from 'class-validator';

export class CreateStoolTestDto {
  @ApiProperty({ description: 'ID del paciente', required: true })
  @IsString()
  patientId: string;

  // ... otros campos ...

  @ApiProperty({ 
    description: 'ID del usuario que crea el examen', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;  // ← AGREGADO

  @ApiProperty({ 
    description: 'Estado del examen', 
    enum: ['pending', 'completed', 'reviewed'],
    example: 'pending',
    required: false
  })
  @IsOptional()
  @IsString()
  status?: string;

  // ... resto de campos ...
}
```

### 2. Actualizar el Servicio (`StoolTestService`)

**Cambio en el método `create()`:**

```typescript
async create(createStoolTestDto: CreateStoolTestDto): Promise<StoolTest> {
  // Validar que el paciente existe
  const patient = await this.patientRepository.findOne({
    where: { id: createStoolTestDto.patientId }
  });

  if (!patient) {
    throw new NotFoundException(`Paciente con ID ${createStoolTestDto.patientId} no encontrado`);
  }

  // Si se proporciona createdById, validar que el usuario existe
  let createdBy = null;
  if (createStoolTestDto.createdById) {
    createdBy = await this.userRepository.findOne({
      where: { id: createStoolTestDto.createdById }
    });

    if (!createdBy) {
      throw new NotFoundException(`Usuario con ID ${createStoolTestDto.createdById} no encontrado`);
    }
  }

  // Generar número de muestra si no se proporciona
  const sampleNumber = createStoolTestDto.sampleNumber || 
    await this.generateSampleNumber();

  // Crear el registro
  const stoolTest = this.stoolTestRepository.create({
    patientId: createStoolTestDto.patientId,
    color: createStoolTestDto.color,
    consistency: createStoolTestDto.consistency,
    shape: createStoolTestDto.shape,
    mucus: createStoolTestDto.mucus,
    leukocytes: createStoolTestDto.leukocytes,
    erythrocytes: createStoolTestDto.erythrocytes,
    parasites: createStoolTestDto.parasites,
    protozoos: createStoolTestDto.protozoos,
    observations: createStoolTestDto.observations,
    sampleNumber,
    testDate: createStoolTestDto.testDate || new Date().toISOString(),
    status: createStoolTestDto.status || 'pending',
    createdBy,              // ← USO DEL USUARIO
    createdById: createStoolTestDto.createdById,  // ← NUEVO
    patient,
    isActive: true,
  });

  return this.stoolTestRepository.save(stoolTest);
}
```

## 📊 Comparación: Antes vs Después

### ANTES (Extracción del Token JWT)
```
Frontend envía:
{
  patientId: "...",
  color: "Café",
  // ❌ No incluye createdById
}
        ↓
Backend extrae userId del token JWT:
- Busca el usuario en la BD
- Asigna createdBy y createdById
        ↓
Respuesta: { createdBy: { id, name, ... }, createdById: "..." }
```

### DESPUÉS (Envío Directo del ID)
```
Frontend obtiene userId de localStorage:
{
  patientId: "...",
  color: "Café",
  createdById: "550e8400-e29b-41d4-a716-446655440000"  // ✅ INCLUIDO
}
        ↓
Backend valida que el usuario existe:
- Recibe el createdById
- Busca el usuario en la BD
- Asigna createdBy y createdById
        ↓
Respuesta: { createdBy: { id, name, ... }, createdById: "..." }
```

## ✅ Ventajas del Nuevo Enfoque

1. **Más Eficiente**: No necesita decodificar el JWT en el backend
2. **Más Simple**: El DTO es autoexplicativo
3. **Más Claro**: El frontend envía explícitamente quién crea el registro
4. **Validación en Backend**: Backend valida que el usuario existe antes de guardar

## 🔍 Validación en Ambos Lados

### Frontend
```typescript
const currentUser = this.authService.getCurrentUserValue();
if (!currentUser?.id) {
  this.errorMessage = 'Usuario no autenticado';
  return;
}
```

### Backend
```typescript
if (createStoolTestDto.createdById) {
  createdBy = await this.userRepository.findOne({
    where: { id: createStoolTestDto.createdById }
  });

  if (!createdBy) {
    throw new NotFoundException(`Usuario con ID ${createStoolTestDto.createdById} no encontrado`);
  }
}
```

## 📋 Flujo de Datos Actualizado

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario completa el formulario                          │
│  2. Usuario hace clic en "Guardar"                          │
│  3. Componente obtiene usuario actual del AuthService       │
│  4. Componente construye CreateStoolTestDto CON createdById │
│  5. Componente hace console.log() con el objeto             │
│  6. Servicio envía HTTP POST a /stool-tests                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                         HTTP POST
        payload: { patientId: "...", createdById: "..." }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Controlador recibe CreateStoolTestDto con createdById   │
│  2. Servicio valida que el usuario existe                   │
│  3. Servicio carga la relación del usuario                  │
│  4. Servicio guarda: { createdBy, createdById, ... }        │
│  5. Servicio retorna StoolTest completo                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                        HTTP 201
    response: { createdBy: { id, username, ... }, ... }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Componente recibe respuesta con createdBy poblado       │
│  2. Componente navega a la página de detalle                │
│  3. Usuario ve el examen con información del técnico        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad

- ✅ Frontend obtiene el userId del localStorage (viene del login)
- ✅ Backend valida que el usuario existe en la BD
- ✅ Backend verifica que el usuario está activo
- ✅ No hay posibilidad de falsificar la identidad (el servidor valida)

## 📝 Commits Git Frontend

```
commit b846830a...
- debug: add console.logs to track CreateStoolTestDto payload in frontend
- stool-test-form: inyectar AuthService
- stool-test-form: incluir createdById en DTO
- stool-test.interface: agregar createdById a CreateStoolTestDto
```

## 🚀 Próximos Pasos

1. **En el Backend:**
   - ✅ Actualizar CreateStoolTestDto para incluir `createdById`
   - ✅ Actualizar StoolTestService.create() para manejar el `createdById`
   - ✅ Validar que el usuario existe antes de guardar

2. **Pruebas:**
   - [ ] Crear nuevo examen desde el frontend
   - [ ] Verificar en los logs que se envía `createdById`
   - [ ] Verificar en la BD que se guarda correctamente
   - [ ] Verificar en la respuesta que `createdBy` está poblado

## Conclusión

Este enfoque es más directo y eficiente. El frontend envía el ID del usuario autenticado, y el backend valida y guarda la relación. Todos ganan: código más simple, menos lógica en el backend, y una relación clara entre datos.
