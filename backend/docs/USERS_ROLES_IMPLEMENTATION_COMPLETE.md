# ✅ Sistema de Usuarios y Roles - Implementación Completada

## 📋 Resumen de Archivos Creados

### 1. **Entidades** (3 archivos)
- ✅ `src/entities/role.entity.ts` - Entidad de Roles
- ✅ `src/entities/user.entity.ts` - Entidad de Usuarios
- ✅ `src/entities/permission.entity.ts` - Entidad de Permisos

### 2. **Enums e Interfaces** (2 archivos)
- ✅ `src/common/enums/role.enum.ts` - Enum con roles y niveles
- ✅ `src/common/interfaces/jwt-payload.interface.ts` - Interfaz de JWT payload

### 3. **DTOs** (3 archivos)
- ✅ `src/dto/auth.dto.ts` - DTOs de Login, Refresh, ChangePassword
- ✅ `src/dto/user.dto.ts` - DTOs de Create/Update User
- ✅ `src/dto/role.dto.ts` - DTOs de Create/Update Role y Permissions

### 4. **Auth Module** (5 archivos)
- ✅ `src/features/auth/auth.service.ts` - Lógica de autenticación
- ✅ `src/features/auth/auth.controller.ts` - Endpoints de login
- ✅ `src/features/auth/auth.module.ts` - Módulo Auth
- ✅ `src/features/auth/strategies/jwt.strategy.ts` - Estrategia JWT
- ✅ `src/features/auth/guards/jwt-auth.guard.ts` - Guard JWT

### 5. **Auth Utilities** (3 archivos)
- ✅ `src/features/auth/guards/roles.guard.ts` - Guard para validar roles
- ✅ `src/features/auth/decorators/roles.decorator.ts` - Decorador @Roles()
- ✅ `src/features/auth/decorators/current-user.decorator.ts` - Decorador @CurrentUser()

### 6. **Users Module** (3 archivos)
- ✅ `src/features/users/users.service.ts` - CRUD de usuarios
- ✅ `src/features/users/users.controller.ts` - Endpoints de usuarios
- ✅ `src/features/users/users.module.ts` - Módulo Users

### 7. **Roles Module** (3 archivos)
- ✅ `src/features/roles/roles.service.ts` - CRUD de roles y permisos
- ✅ `src/features/roles/roles.controller.ts` - Endpoints de roles
- ✅ `src/features/roles/roles.module.ts` - Módulo Roles

### 8. **Configuración** (2 archivos)
- ✅ `.env` - Actualizado con JWT_SECRET y JWT_EXPIRATION
- ✅ `src/app.module.ts` - Actualizado con nuevos módulos

### 9. **Migrations** (1 archivo)
- ✅ `src/migrations/1729780000000-CreateRoleUserPermissionTables.ts` - Migration para crear tablas

---

## 🚀 Cómo Usar

### 1. Instalar Dependencias Requeridas

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

### 2. Ejecutar Migrations

```bash
npm run migration:run
```

Esto creará las tablas `roles`, `users`, y `permissions` en tu BD.

### 3. Crear Roles Predefinidos (Seed)

Crea un script de seed o ejecuta esta query SQL directamente:

```sql
INSERT INTO roles (name, level, description) VALUES
('SUPERADMIN', 1, 'Acceso total al sistema'),
('ADMIN', 2, 'Administrador de datos'),
('TECNICO', 3, 'Técnico de laboratorio'),
('OPERADOR', 4, 'Operador - Solo lectura');
```

### 4. Crear Usuario SUPERADMIN Inicial

```bash
# Usa una herramienta para hacer POST a /auth/users o ejecuta manualmente:

INSERT INTO users (username, password, name, last_name, email, role_id, is_active) VALUES
('admin', '$2b$10$...', 'Admin', 'System', 'admin@lab.com', '<ROLE_ID_SUPERADMIN>', true);
```

**Nota:** Reemplaza `$2b$10$...` con un hash bcrypt de tu contraseña.

### 5. Compilar Proyecto

```bash
npm run build
```

### 6. Iniciar en Modo Desarrollo

```bash
npm run start:dev
```

---

## 🔐 Endpoints Disponibles

### Authentication (Públicos)

```
POST   /auth/login                  # Login con username/password
POST   /auth/refresh                # Refrescar JWT
GET    /auth/me                     # Obtener usuario actual (protegido)
POST   /auth/change-password        # Cambiar contraseña (protegido)
```

### Users (Protegido)

```
POST   /users                       # Crear usuario (ADMIN, SUPERADMIN)
GET    /users                       # Listar usuarios (ADMIN, SUPERADMIN)
GET    /users/:id                   # Obtener usuario
PATCH  /users/:id                   # Actualizar usuario
PATCH  /users/:id/toggle-active     # Activar/Desactivar (ADMIN, SUPERADMIN)
DELETE /users/:id                   # Eliminar usuario (SUPERADMIN)
GET    /users/role/:roleId          # Usuarios por rol (ADMIN, SUPERADMIN)
```

### Roles (Protegido)

```
POST   /roles                       # Crear rol (SUPERADMIN)
GET    /roles                       # Listar roles (ADMIN, SUPERADMIN)
GET    /roles/:id                   # Obtener rol
PATCH  /roles/:id                   # Actualizar rol (SUPERADMIN)
DELETE /roles/:id                   # Eliminar rol (SUPERADMIN)
GET    /roles/:id/permissions       # Permisos del rol (ADMIN, SUPERADMIN)
POST   /roles/:id/permissions       # Agregar permiso (SUPERADMIN)
DELETE /roles/:id/permissions/:permissionId # Remover permiso (SUPERADMIN)
```

---

## 📝 Ejemplos de Uso

### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@lab.com",
    "name": "Admin",
    "lastName": "System",
    "role": "SUPERADMIN"
  }
}
```

### 2. Obtener Usuario Actual

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "username": "admin",
  "email": "admin@lab.com",
  "role": "SUPERADMIN",
  "roleLevel": 1
}
```

### 3. Crear Nuevo Usuario

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tecnico01",
    "password": "Tecnico123!",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "tecnico@lab.com",
    "roleId": "550e8400-e29b-41d4-a716-446655440001",
    "isActive": true
  }'
```

### 4. Listar Usuarios

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 5. Cambiar Contraseña

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "NewAdmin123!"
  }'
```

---

## 🔒 Jerarquía de Permisos

| Rol | Nivel | Permisos |
|-----|-------|----------|
| **SUPERADMIN** | 1 | ✅ Todo (crear roles, crear usuarios, editar cualquier usuario, eliminar, auditoría) |
| **ADMIN** | 2 | ✅ Crear/editar usuarios con rol >= TECNICO, editar test-definitions, ver auditoría |
| **TECNICO** | 3 | ✅ Crear/actualizar exámenes, ver resultados, generar reportes |
| **OPERADOR** | 4 | ✅ Solo lectura: consultar exámenes, pacientes, resultados |

---

## 🛡️ Seguridad Implementada

### ✅ Hashing de Contraseñas
- Usando bcrypt con 10 rounds
- Nunca se almacena contraseña en texto plano

### ✅ JWT Stateless
- Tokens con expiración configurable
- Secret en variables de entorno
- Validación automática en rutas protegidas

### ✅ Validación de Permisos
- Guards verifican rol del usuario
- No se pueden asignar roles superiores
- Solo SUPERADMIN puede crear/editar roles

### ✅ Auditoría
- Campo `createdBy` y `updatedBy` en usuarios
- Campo `lastLogin` para tracking
- Logging de todas las operaciones críticas

---

## ⚙️ Configuración .env

```env
# JWT
JWT_SECRET=tu-super-secreto-muy-largo-aleatorio-CAMBIAR-EN-PRODUCCION
JWT_EXPIRATION=3600  # 1 hora

# Para producción:
NODE_ENV=production
```

---

## 🧪 Testing Recomendado

1. **Login fallido:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -d '{"username":"invalid","password":"wrong"}'
   # Debería retornar 401 Unauthorized
   ```

2. **Acceso sin token:**
   ```bash
   curl -X GET http://localhost:3000/users
   # Debería retornar 401 Unauthorized
   ```

3. **Permisos insuficientes:**
   ```bash
   curl -X POST http://localhost:3000/roles \
     -H "Authorization: Bearer <TECNICO_TOKEN>" \
     -d '{...}'
   # Debería retornar 403 Forbidden
   ```

4. **Usuario duplicado:**
   ```bash
   curl -X POST http://localhost:3000/users \
     -H "Authorization: Bearer <ADMIN_TOKEN>" \
     -d '{"username":"admin",...}'
   # Debería retornar 409 Conflict
   ```

---

## 📚 Próximos Pasos (Opcional)

1. **Refresh Tokens** - Implementar tokens de larga duración
2. **2FA** - Autenticación de dos factores
3. **OAuth2** - Integración con Google/GitHub
4. **Rate Limiting** - Protección contra fuerza bruta
5. **Email Verification** - Confirmación de email al registrarse
6. **Audit Logs** - Tabla separada de auditoría detallada

---

## ✅ Checklist de Implementación

- [x] Crear entidades (Role, User, Permission)
- [x] Crear DTOs
- [x] Crear AuthService + AuthController
- [x] Implementar JWT + Passport
- [x] Crear Guards y Decoradores
- [x] Crear UsersService + UsersController
- [x] Crear RolesService + RolesController
- [x] Crear Migration
- [x] Actualizar AppModule
- [x] Actualizar .env
- [x] Documentación completa

---

## 🎯 Estado: LISTO PARA COMPILAR Y EJECUTAR

**Próximo paso:** 

```bash
npm run build && npm run migration:run && npm run start:dev
```

¡Listo! 🚀
