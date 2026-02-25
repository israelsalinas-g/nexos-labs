# 📚 Guía de Uso: Sistema de Roles y Usuarios Mejorado

## 🎯 Resumen de Mejoras Implementadas

### ✅ Correcciones Aplicadas

1. **Bug crítico en validación de permisos corregido** - Ahora SUPERADMIN puede crear usuarios con cualquier rol
2. **RolesGuard mejorado** - Usa jerarquía de niveles (SUPERADMIN automáticamente tiene acceso a rutas de roles inferiores)
3. **Validaciones unificadas** - Todas usan `roleLevel` del JWT payload
4. **Decorador @Auth() combinado** - Simplifica el uso de guards
5. **Seed automático** - Crea roles y usuario SUPERADMIN inicial

---

## 🚀 Inicio Rápido

### 1. Configuración Inicial

Actualizar el archivo `.env`:

```env
# Configuración JWT
JWT_SECRET=tu-super-secreto-muy-largo-aleatorio-aqui
JWT_EXPIRATION=3600

# Habilitar seed de datos iniciales
SEED_INITIAL_DATA=true
```

### 2. Iniciar la Aplicación

```bash
npm run start:dev
```

El seed creará automáticamente:
- 4 roles predefinidos (SUPERADMIN, ADMIN, TECNICO, OPERADOR)
- Usuario SUPERADMIN inicial
  - Username: `admin`
  - Password: `Admin@123`

---

## 🔐 Autenticación

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@lab.com",
    "name": "Administrador",
    "lastName": "del Sistema",
    "role": "SUPERADMIN"
  }
}
```

### Usar Token en Peticiones

```bash
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 Gestión de Usuarios

### Crear Usuario

Solo SUPERADMIN y ADMIN pueden crear usuarios (con roles de menor jerarquía):

```bash
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "tecnico01",
  "password": "Tecnico@123",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "tecnico@lab.com",
  "roleId": "<uuid-del-rol-tecnico>",
  "isActive": true
}
```

**Reglas de Jerarquía:**
- ✅ SUPERADMIN puede crear: ADMIN, TECNICO, OPERADOR
- ✅ ADMIN puede crear: TECNICO, OPERADOR
- ❌ TECNICO NO puede crear usuarios
- ❌ OPERADOR NO puede crear usuarios

### Listar Usuarios

```bash
GET /users?page=1&limit=10
Authorization: Bearer <token>
```

### Actualizar Usuario

```bash
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Juan Carlos",
  "email": "juancarlos@lab.com"
}
```

**Reglas:**
- Cualquier usuario puede actualizar su propio perfil
- Solo SUPERADMIN puede actualizar otros usuarios

### Activar/Desactivar Usuario

Solo ADMIN y SUPERADMIN:

```bash
PATCH /users/:id/toggle-active
Authorization: Bearer <token>
```

### Eliminar Usuario

Solo SUPERADMIN:

```bash
DELETE /users/:id
Authorization: Bearer <token>
```

---

## 🛡️ Protección de Rutas

### Opción 1: Decoradores Separados (Tradicional)

```typescript
import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('test-results')
export class TestResultsController {
  
  // Ruta pública - sin protección
  @Get('public')
  getPublicInfo() {
    return { message: 'Información pública' };
  }

  // Requiere autenticación (cualquier usuario autenticado)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // Requiere autenticación + rol ADMIN o superior (SUPERADMIN)
  // Gracias a la jerarquía, no es necesario listar SUPERADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteResult(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // Requiere TECNICO o superior (SUPERADMIN, ADMIN tienen acceso)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TECNICO')
  @Post()
  createResult(@Body() dto: CreateResultDto) {
    return this.service.create(dto);
  }
}
```

### Opción 2: Decorador @Auth() Combinado (Recomendado) ✨

```typescript
import { Controller, Get, Post, Delete } from '@nestjs/common';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('test-results')
export class TestResultsController {
  
  // Ruta pública - sin decorador
  @Get('public')
  getPublicInfo() {
    return { message: 'Información pública' };
  }

  // Solo requiere autenticación
  @Auth()
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // Requiere ADMIN o superior
  @Auth('ADMIN')
  @Delete(':id')
  deleteResult(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // Requiere TECNICO o superior
  @Auth('TECNICO')
  @Post()
  createResult(@Body() dto: CreateResultDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user);
  }

  // Requiere explícitamente OPERADOR (solo ese rol)
  // Nota: Debido a la jerarquía, roles superiores también tendrán acceso
  @Auth('OPERADOR')
  @Get('readonly')
  getReadOnlyData() {
    return this.service.getReadOnly();
  }
}
```

---

## 🎨 Ejemplos Prácticos por Módulo

### Módulo de Pacientes

```typescript
@Controller('patients')
export class PatientsController {
  
  // Cualquier usuario autenticado puede ver pacientes
  @Auth()
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.patientsService.findAll(query);
  }

  // Solo TECNICO y superiores pueden crear pacientes
  @Auth('TECNICO')
  @Post()
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: JwtPayload) {
    return this.patientsService.create(dto, user);
  }

  // Solo ADMIN y SUPERADMIN pueden eliminar
  @Auth('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
```

### Módulo de Órdenes de Laboratorio

```typescript
@Controller('laboratory-orders')
export class LaboratoryOrdersController {
  
  // Todos pueden ver órdenes
  @Auth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // TECNICO y superiores pueden crear órdenes
  @Auth('TECNICO')
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user);
  }

  // TECNICO y superiores pueden actualizar
  @Auth('TECNICO')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  // Solo ADMIN puede eliminar órdenes
  @Auth('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### Módulo de Configuración

```typescript
@Controller('test-definitions')
export class TestDefinitionsController {
  
  // Todos pueden ver definiciones
  @Auth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Solo ADMIN puede crear/modificar definiciones
  @Auth('ADMIN')
  @Post()
  create(@Body() dto: CreateTestDefinitionDto) {
    return this.service.create(dto);
  }

  @Auth('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestDefinitionDto) {
    return this.service.update(id, dto);
  }

  // Solo SUPERADMIN puede eliminar
  @Auth('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

---

## 🔄 Jerarquía de Roles Explicada

### Cómo Funciona

Los roles tienen niveles numéricos:
- SUPERADMIN = nivel 1 (máximo poder)
- ADMIN = nivel 2
- TECNICO = nivel 3
- OPERADOR = nivel 4 (mínimo poder)

Cuando usas `@Auth('TECNICO')`:
- ✅ SUPERADMIN (nivel 1) tiene acceso
- ✅ ADMIN (nivel 2) tiene acceso
- ✅ TECNICO (nivel 3) tiene acceso
- ❌ OPERADOR (nivel 4) NO tiene acceso

### Tabla de Acceso

| Decorador | SUPERADMIN | ADMIN | TECNICO | OPERADOR |
|-----------|------------|-------|---------|----------|
| `@Auth()` | ✅ | ✅ | ✅ | ✅ |
| `@Auth('SUPERADMIN')` | ✅ | ❌ | ❌ | ❌ |
| `@Auth('ADMIN')` | ✅ | ✅ | ❌ | ❌ |
| `@Auth('TECNICO')` | ✅ | ✅ | ✅ | ❌ |
| `@Auth('OPERADOR')` | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 Validaciones en Servicios

### Acceder al Usuario Actual

```typescript
@Injectable()
export class MyService {
  
  async create(dto: CreateDto, currentUser: JwtPayload) {
    // Validar por nivel de rol
    if (currentUser.roleLevel > 2) {
      throw new ForbiddenException('Solo ADMIN y SUPERADMIN');
    }

    // Validar por nombre de rol
    if (currentUser.role === 'OPERADOR') {
      throw new ForbiddenException('Los operadores no pueden crear');
    }

    // Guardar auditoría
    const entity = this.repository.create({
      ...dto,
      createdBy: { id: currentUser.sub } as User,
    });

    return this.repository.save(entity);
  }
}
```

---

## 📊 Resumen de Mejoras vs Versión Anterior

### Antes ❌

```typescript
// Tenías que listar todos los roles manualmente
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'ADMIN', 'TECNICO')
@Post()
create() { ... }

// Validaciones inconsistentes
if (ROLE_LEVELS[currentUser.role] > 2) { ... }

// Bug: SUPERADMIN no podía crear ADMIN
if (ROLE_LEVELS[currentUser.role] >= role.level) { ... }
```

### Ahora ✅

```typescript
// Más limpio y automático por jerarquía
@Auth('TECNICO') // SUPERADMIN y ADMIN automáticamente incluidos
@Post()
create() { ... }

// Validaciones consistentes
if (currentUser.roleLevel > 2) { ... }

// Bug corregido: SUPERADMIN puede crear cualquier rol
if (currentUser.roleLevel >= role.level) { ... }
```

---

## 🎯 Mejores Prácticas

### 1. Usa el Decorador @Auth() Combinado

```typescript
// ✅ Recomendado
@Auth('ADMIN')
@Delete(':id')
deleteUser() { ... }

// ⚠️ Funciona pero más verboso
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
deleteUser() { ... }
```

### 2. Confía en la Jerarquía

```typescript
// ✅ Simple y efectivo
@Auth('TECNICO') // Automáticamente permite ADMIN y SUPERADMIN

// ❌ Innecesario listar todos
@Auth('SUPERADMIN', 'ADMIN', 'TECNICO')
```

### 3. Usa roleLevel para Validaciones

```typescript
// ✅ Directo y consistente
if (currentUser.roleLevel > 2) { ... }

// ❌ Indirecto
if (ROLE_LEVELS[currentUser.role] > 2) { ... }
```

### 4. Implementa Auditoría

```typescript
// Siempre registrar quién hace cambios
entity.createdBy = { id: currentUser.sub } as User;
entity.updatedBy = { id: currentUser.sub } as User;
```

---

## 🐛 Solución de Problemas

### Error: "Acceso denegado. Usuario sin rol asignado"

**Causa:** El token JWT no contiene información del rol.

**Solución:** Hacer login nuevamente para obtener un token actualizado.

### Error: "Solo puedes actualizar tu propio perfil"

**Causa:** Un usuario que no es SUPERADMIN intenta actualizar otro usuario.

**Solución:** Solo SUPERADMIN puede actualizar otros usuarios. Los demás solo su propio perfil.

### Error: "No tienes permiso para asignar este rol"

**Causa:** Intentas asignar un rol de nivel igual o superior al tuyo.

**Solución:** Solo puedes asignar roles de menor jerarquía. Por ejemplo, ADMIN puede crear TECNICO pero no SUPERADMIN.

---

## 📝 Checklist de Implementación

### Para Agregar Autenticación a un Módulo Existente

- [ ] Importar decorador `@Auth()` y `@CurrentUser()`
- [ ] Agregar `@Auth()` a rutas que requieren autenticación
- [ ] Especificar rol mínimo: `@Auth('TECNICO')`, `@Auth('ADMIN')`, etc.
- [ ] Inyectar `@CurrentUser()` en métodos que necesitan el usuario actual
- [ ] Actualizar servicios para recibir `currentUser: JwtPayload`
- [ ] Implementar auditoría (createdBy, updatedBy) si aplica
- [ ] Probar con diferentes roles

---

**¡Sistema de Roles y Usuarios completamente funcional y mejorado!** 🎉
