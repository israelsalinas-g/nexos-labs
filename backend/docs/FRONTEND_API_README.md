# 📚 Guía de API para Desarrollador Frontend - Sistema de Autenticación y Gestión de Roles

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Usuarios](#endpoints-de-usuarios)
4. [Endpoints de Roles](#endpoints-de-roles)
5. [Endpoints de Permisos](#endpoints-de-permisos)
6. [Códigos de Error](#códigos-de-error)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎯 Introducción

Este documento describe todos los endpoints disponibles para:
- 🔐 **Autenticación**: Login, refresh token, cambio de contraseña
- 👥 **Gestión de Usuarios**: CRUD completo
- 🔑 **Gestión de Roles**: CRUD completo
- 🛡️ **Gestión de Permisos**: Lectura y asignación por rol

### Base URL
```
http://localhost:3000
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer <access_token>  (excepto en login)
```

### Estructura de Respuesta
```json
{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": { ... }
}
```

---

## 🔐 AUTENTICACIÓN

### 1. Login (Obtener Token)

**Endpoint:** `POST /auth/login`

**Descripción:** Autentica un usuario y retorna un JWT

**Parámetros (Body):**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Respuesta (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDdhYzEwYi01OGNjLTQzNzItYTU2Ny0wZTAyYjJjM2Q0NzkiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyYWRtaW5AbGFib3JhdG9yeWluZm8uY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJyb2xlTGV2ZWwiOjEsImlhdCI6MTcyOTk5OTk5OSwiZXhwIjoxNzMwMDAzNTk5fQ...",
  "user": {
    "id": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "superadmin",
    "email": "superadmin@laboratoryinfo.com",
    "role": "SUPERADMIN",
    "roleLevel": 1,
    "isActive": true
  }
}
```

**Errores Posibles:**
- `401 Unauthorized` - Usuario o contraseña incorrectos
- `400 Bad Request` - Datos faltantes o inválidos

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'
```

---

### 2. Obtener Usuario Actual

**Endpoint:** `GET /auth/me`

**Descripción:** Retorna los datos del usuario autenticado

**Headers Requeridos:**
```
Authorization: Bearer <access_token>
```

**Respuesta (200 OK):**
```json
{
  "sub": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "superadmin",
  "email": "superadmin@laboratoryinfo.com",
  "role": "SUPERADMIN",
  "roleLevel": 1,
  "iat": 1729999999,
  "exp": 1730003599
}
```

**Errores Posibles:**
- `401 Unauthorized` - Token inválido o expirado

---

### 3. Refrescar Token

**Endpoint:** `POST /auth/refresh`

**Descripción:** Genera un nuevo JWT usando uno existente

**Parámetros (Body):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Cambiar Contraseña

**Endpoint:** `POST /auth/change-password`

**Descripción:** Cambia la contraseña del usuario autenticado

**Headers Requeridos:**
```
Authorization: Bearer <access_token>
```

**Parámetros (Body):**
```json
{
  "currentPassword": "admin123",
  "newPassword": "nueva_contraseña_segura123"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores Posibles:**
- `400 Bad Request` - Contraseña actual incorrecta
- `401 Unauthorized` - No autenticado

---

## 👥 USUARIOS (CRUD)

### 1. Crear Usuario

**Endpoint:** `POST /users`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Parámetros (Body):**
```json
{
  "username": "tecnico01",
  "password": "TecnicoPass123!",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@lab.com",
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
  "isActive": true
}
```

**Respuesta (201 Created):**
```json
{
  "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
  "username": "tecnico01",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@lab.com",
  "role": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    "name": "TECNICO",
    "level": 3
  },
  "isActive": true,
  "createdAt": "2025-10-28T12:34:56.000Z",
  "updatedAt": "2025-10-28T12:34:56.000Z"
}
```

**Errores Posibles:**
- `403 Forbidden` - Sin permisos de administrador
- `409 Conflict` - Username o email ya existente
- `404 Not Found` - Role ID no existe

---

### 2. Listar Usuarios (Paginado)

**Endpoint:** `GET /users?page=1&limit=10`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | number | 1 | Número de página |
| limit | number | 10 | Registros por página |

**Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
      "username": "superadmin",
      "name": "Super",
      "lastName": "Admin",
      "email": "superadmin@laboratoryinfo.com",
      "role": {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "name": "SUPERADMIN",
        "level": 1
      },
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-10-28T10:00:00.000Z"
    },
    {
      "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
      "username": "tecnico01",
      "name": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@lab.com",
      "role": {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
        "name": "TECNICO",
        "level": 3
      },
      "isActive": true,
      "lastLogin": "2025-10-28T11:30:00.000Z",
      "createdAt": "2025-10-28T12:34:56.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3. Obtener Usuario por ID

**Endpoint:** `GET /users/:id`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Parámetros (URL):**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del usuario |

**Respuesta (200 OK):**
```json
{
  "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
  "username": "tecnico01",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@lab.com",
  "role": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    "name": "TECNICO",
    "level": 3,
    "permissions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440016",
        "code": "tecnico:lab:read",
        "description": "Ver datos de laboratorio"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440017",
        "code": "tecnico:lab:write",
        "description": "Modificar datos de laboratorio"
      }
    ]
  },
  "isActive": true,
  "lastLogin": "2025-10-28T11:30:00.000Z",
  "createdAt": "2025-10-28T12:34:56.000Z",
  "updatedAt": "2025-10-28T12:34:56.000Z"
}
```

---

### 4. Actualizar Usuario

**Endpoint:** `PATCH /users/:id`

**Roles Requeridos:** 
- Usuario puede actualizar sus propios datos
- `ADMIN`, `SUPERADMIN` pueden actualizar a otros

**Parámetros (URL):**
```
:id = UUID del usuario
```

**Parámetros (Body) - Todos opcionales:**
```json
{
  "name": "Juan",
  "lastName": "Pérez García",
  "email": "nuevo.email@lab.com",
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
  "isActive": false
}
```

**Respuesta (200 OK):**
```json
{
  "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
  "username": "tecnico01",
  "name": "Juan",
  "lastName": "Pérez García",
  "email": "nuevo.email@lab.com",
  "role": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    "name": "ADMIN",
    "level": 2
  },
  "isActive": false,
  "updatedAt": "2025-10-28T13:45:00.000Z"
}
```

---

### 5. Alternar Estado Activo/Inactivo

**Endpoint:** `PATCH /users/:id/toggle-active`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Respuesta (200 OK):**
```json
{
  "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
  "username": "tecnico01",
  "isActive": false,
  "message": "Estado del usuario actualizado"
}
```

---

### 6. Eliminar Usuario

**Endpoint:** `DELETE /users/:id`

**Roles Requeridos:** `SUPERADMIN` (solo SUPERADMIN puede eliminar)

**Respuesta (200 OK):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Errores Posibles:**
- `403 Forbidden` - Solo SUPERADMIN puede eliminar usuarios
- `404 Not Found` - Usuario no existe

---

### 7. Listar Usuarios por Rol

**Endpoint:** `GET /users/role/:roleId?page=1&limit=10`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Parámetros (URL):**
```
:roleId = UUID del rol
```

**Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": "b58bd21c-69dd-5483-b678-1f13c3d4e59a",
      "username": "tecnico01",
      "name": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@lab.com",
      "role": {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
        "name": "TECNICO",
        "level": 3
      },
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1
}
```

---

## 🔑 ROLES (CRUD)

### 1. Crear Rol

**Endpoint:** `POST /roles`

**Roles Requeridos:** `SUPERADMIN`

**Parámetros (Body):**
```json
{
  "name": "ESPECIALISTA",
  "level": 2,
  "description": "Especialista en análisis de laboratorio"
}
```

**Respuesta (201 Created):**
```json
{
  "id": "c69ce32d-7aee-6594-c789-2g24d4e5f60b",
  "name": "ESPECIALISTA",
  "level": 2,
  "description": "Especialista en análisis de laboratorio",
  "users": [],
  "permissions": [],
  "createdAt": "2025-10-28T14:00:00.000Z",
  "updatedAt": "2025-10-28T14:00:00.000Z"
}
```

**Errores Posibles:**
- `403 Forbidden` - Solo SUPERADMIN
- `409 Conflict` - El rol ya existe

---

### 2. Listar Roles (Paginado)

**Endpoint:** `GET /roles?page=1&limit=10`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "SUPERADMIN",
      "level": 1,
      "description": "Administrador supremo del sistema",
      "usersCount": 1,
      "permissionsCount": 10,
      "createdAt": "2025-10-28T10:00:00.000Z"
    },
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
      "name": "ADMIN",
      "level": 2,
      "description": "Administrador del sistema",
      "usersCount": 0,
      "permissionsCount": 5,
      "createdAt": "2025-10-28T10:00:00.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10
}
```

---

### 3. Obtener Rol por ID

**Endpoint:** `GET /roles/:id`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Respuesta (200 OK):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "SUPERADMIN",
  "level": 1,
  "description": "Administrador supremo del sistema",
  "users": [
    {
      "id": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
      "username": "superadmin",
      "email": "superadmin@laboratoryinfo.com",
      "isActive": true
    }
  ],
  "permissions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "superadmin:users:create",
      "description": "Crear usuarios"
    }
  ],
  "createdAt": "2025-10-28T10:00:00.000Z"
}
```

---

### 4. Actualizar Rol

**Endpoint:** `PATCH /roles/:id`

**Roles Requeridos:** `SUPERADMIN`

**Parámetros (Body):**
```json
{
  "description": "Nueva descripción del rol"
}
```

**Respuesta (200 OK):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "SUPERADMIN",
  "level": 1,
  "description": "Nueva descripción del rol",
  "updatedAt": "2025-10-28T14:15:00.000Z"
}
```

---

### 5. Eliminar Rol

**Endpoint:** `DELETE /roles/:id`

**Roles Requeridos:** `SUPERADMIN`

**Restricciones:**
- No se pueden eliminar roles predefinidos (SUPERADMIN, ADMIN, TECNICO, OPERADOR)
- No se pueden eliminar roles que tengan usuarios asignados

**Respuesta (200 OK):**
```json
{
  "message": "Rol eliminado exitosamente"
}
```

**Errores Posibles:**
- `400 Bad Request` - No se puede eliminar rol predefinido
- `409 Conflict` - Hay usuarios asignados a este rol

---

## 🛡️ PERMISOS

### 1. Obtener Permisos de un Rol

**Endpoint:** `GET /roles/:id/permissions`

**Roles Requeridos:** `ADMIN`, `SUPERADMIN`

**Respuesta (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "superadmin:users:create",
    "description": "Crear usuarios",
    "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "code": "superadmin:users:read",
    "description": "Ver usuarios",
    "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
]
```

---

### 2. Agregar Permiso a Rol

**Endpoint:** `POST /roles/:id/permissions`

**Roles Requeridos:** `SUPERADMIN`

**Parámetros (Body):**
```json
{
  "code": "especialista:lab:approve",
  "description": "Aprobar resultados de laboratorio"
}
```

**Respuesta (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  "code": "especialista:lab:approve",
  "description": "Aprobar resultados de laboratorio",
  "roleId": "c69ce32d-7aee-6594-c789-2g24d4e5f60b",
  "createdAt": "2025-10-28T14:30:00.000Z"
}
```

**Errores Posibles:**
- `409 Conflict` - El código de permiso ya existe

---

### 3. Remover Permiso de Rol

**Endpoint:** `DELETE /roles/:id/permissions/:permissionId`

**Roles Requeridos:** `SUPERADMIN`

**Parámetros (URL):**
```
:id = UUID del rol
:permissionId = UUID del permiso
```

**Respuesta (200 OK):**
```json
{
  "message": "Permiso eliminado exitosamente"
}
```

---

## ❌ Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | Bad Request | Datos inválidos o incompletos |
| 401 | Unauthorized | Token inválido, expirado o no proporcionado |
| 403 | Forbidden | Insuficientes permisos para la operación |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto de datos (duplicados, dependencias) |
| 500 | Internal Server Error | Error del servidor |

### Ejemplo de Respuesta de Error
```json
{
  "statusCode": 403,
  "message": "Acceso denegado. Se requieren los roles: ADMIN, SUPERADMIN",
  "error": "Forbidden"
}
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Flujo Completo de Login y Creación de Usuario

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'superadmin',
    password: 'admin123'
  })
});

const { accessToken, user } = await loginResponse.json();
console.log('Usuario autenticado:', user);

// 2. Crear nuevo usuario
const createUserResponse = await fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    username: 'nuevo_tecnico',
    password: 'NuevoPass123!',
    name: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@lab.com',
    roleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    isActive: true
  })
});

const newUser = await createUserResponse.json();
console.log('Usuario creado:', newUser);
```

---

### Ejemplo 2: Obtener Rol con sus Permisos

```javascript
const roleResponse = await fetch(
  'http://localhost:3000/roles/f47ac10b-58cc-4372-a567-0e02b2c3d479',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const role = await roleResponse.json();
console.log(`Rol: ${role.name}`);
console.log(`Permisos: ${role.permissions.map(p => p.code).join(', ')}`);
```

---

### Ejemplo 3: Listar Usuarios con Paginación

```javascript
const usersResponse = await fetch(
  'http://localhost:3000/users?page=1&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { data, total, page, totalPages } = await usersResponse.json();
console.log(`Mostrando ${data.length} de ${total} usuarios (Página ${page}/${totalPages})`);
```

---

### Ejemplo 4: Manejo de Errores

```javascript
try {
  const response = await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ /* datos */ })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}: ${error.message}`);
    
    if (response.status === 401) {
      // Token expirado, refrescar
      const newToken = await refreshToken(accessToken);
    } else if (response.status === 403) {
      // Sin permisos
      alert('No tienes permisos para esta acción');
    }
  }

  const data = await response.json();
  console.log('Éxito:', data);
} catch (error) {
  console.error('Error de red:', error);
}
```

---

## 🔐 Roles y Niveles de Acceso

| Rol | Nivel | Descripción | Permisos |
|-----|-------|-------------|----------|
| SUPERADMIN | 1 | Acceso total | users:CRUD, roles:CRUD, lab:read/write |
| ADMIN | 2 | Administrativo | users:read/update, roles:read, lab:read/write |
| TECNICO | 3 | Técnico | lab:read/write |
| OPERADOR | 4 | Lectura | lab:read |

---

## 📝 Notas Importantes

1. **Token JWT**: Expira en 1 hora (3600 segundos). Usa `/auth/refresh` para renovar.
2. **Contraseñas**: Se almacenan hasheadas con Bcrypt (10 rondas). Nunca se retornan en la API.
3. **Paginación**: Por defecto es page=1, limit=10. Máximo 100 registros por página.
4. **CORS**: Configurado para desarrollo. Ajustar en producción.
5. **Validación**: Los correos deben ser únicos. Los usernames también.
6. **Permisos**: Solo se pueden crear/eliminar por rol. No hay permisos globales.

---

## 🚀 Quick Start

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'

# 2. Copiar accessToken de la respuesta

# 3. Listar usuarios
curl -X GET http://localhost:3000/users?page=1&limit=10 \
  -H "Authorization: Bearer <accessToken>"

# 4. Crear usuario
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "username":"nuevo_usuario",
    "password":"Pass123!",
    "name":"Nombre",
    "lastName":"Apellido",
    "email":"email@lab.com",
    "roleId":"f47ac10b-58cc-4372-a567-0e02b2c3d481",
    "isActive":true
  }'
```

---

## 📞 Soporte

Para preguntas o problemas con la API:
- Revisar logs del servidor: `npm run start:dev`
- Verificar que el token no esté expirado
- Confirmar que tienes los roles requeridos para la operación
- Validar que todos los campos obligatorios estén presentes

---

**Última actualización:** 28 de octubre de 2025
**Versión API:** 1.0.0
**Estado:** ✅ Producción
