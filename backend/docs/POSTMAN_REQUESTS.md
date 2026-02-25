# 📮 Colección de Requests API - Postman/Insomnia

## 🔗 Variables de Entorno

Crear estas variables en tu cliente REST:

```
BASE_URL = http://localhost:3000
ACCESS_TOKEN = (se obtiene del login)
USER_ID = (se obtiene al crear usuario)
ROLE_ID = f47ac10b-58cc-4372-a567-0e02b2c3d481
```

---

## 🔐 AUTH - AUTENTICACIÓN

### 1. Login
```
POST /auth/login
```
**Body:**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Guardar para próximas requests:**
- Copiar `response.accessToken` a variable `ACCESS_TOKEN`

---

### 2. Obtener Usuario Actual
```
GET /auth/me
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 3. Cambiar Contraseña
```
POST /auth/change-password
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```
**Body:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "nueva_contraseña_123"
}
```

---

### 4. Refrescar Token
```
POST /auth/refresh
```
**Body:**
```json
{
  "token": "{{ACCESS_TOKEN}}"
}
```

---

## 👥 USUARIOS - CRUD

### 1. Listar Usuarios
```
GET /users?page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 2. Listar Usuarios de un Rol
```
GET /users/role/{{ROLE_ID}}?page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 3. Obtener Usuario por ID
```
GET /users/{{USER_ID}}
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 4. Crear Usuario (TECNICO)
```
POST /users
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```
**Body:**
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

**Guardar:**
- Copiar `response.id` a variable `USER_ID`

---

### 5. Crear Usuario (ADMIN)
```
POST /users
```
**Body:**
```json
{
  "username": "admin01",
  "password": "AdminPass123!",
  "name": "Carlos",
  "lastName": "López",
  "email": "carlos.lopez@lab.com",
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
  "isActive": true
}
```

---

### 6. Crear Usuario (OPERADOR)
```
POST /users
```
**Body:**
```json
{
  "username": "operador01",
  "password": "OperadorPass123!",
  "name": "María",
  "lastName": "García",
  "email": "maria.garcia@lab.com",
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d482",
  "isActive": true
}
```

---

### 7. Actualizar Usuario
```
PATCH /users/{{USER_ID}}
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Juan Carlos",
  "lastName": "Pérez García",
  "email": "juancarlos@lab.com"
}
```

---

### 8. Cambiar Rol de Usuario
```
PATCH /users/{{USER_ID}}
```
**Body:**
```json
{
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d480"
}
```

---

### 9. Activar/Desactivar Usuario
```
PATCH /users/{{USER_ID}}/toggle-active
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 10. Eliminar Usuario
```
DELETE /users/{{USER_ID}}
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🔑 ROLES - CRUD

### 1. Listar Roles
```
GET /roles?page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 2. Obtener Rol por ID
```
GET /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 3. Crear Rol Personalizado
```
POST /roles
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "ESPECIALISTA",
  "level": 2,
  "description": "Especialista en análisis de laboratorio avanzado"
}
```

---

### 4. Actualizar Rol
```
PATCH /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479
```
**Body:**
```json
{
  "description": "Nueva descripción del rol"
}
```

---

### 5. Eliminar Rol
```
DELETE /roles/{{ROLE_ID}}
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🛡️ PERMISOS

### 1. Listar Permisos de Rol
```
GET /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479/permissions
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

### 2. Agregar Permiso a Rol
```
POST /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479/permissions
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```
**Body:**
```json
{
  "code": "superadmin:custom:action",
  "description": "Acción personalizada para SUPERADMIN"
}
```

---

### 3. Remover Permiso de Rol
```
DELETE /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479/permissions/550e8400-e29b-41d4-a716-446655440001
```
**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📦 Importar en Postman

### Método 1: Crear Colección Manualmente

1. Crear nueva colección "Lab System API"
2. Agregar carpeta "Auth"
3. Agregar carpeta "Usuarios"
4. Agregar carpeta "Roles"
5. Agregar carpeta "Permisos"
6. Copiar los requests anteriores en cada carpeta

### Método 2: JSON Collection

```json
{
  "info": {
    "name": "Lab System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{BASE_URL}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"superadmin\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Usuarios",
      "item": [
        {
          "name": "Listar Usuarios",
          "request": {
            "method": "GET",
            "url": "{{BASE_URL}}/users?page=1&limit=10",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{ACCESS_TOKEN}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 Flujo de Prueba Completo

### Paso 1: Login
```
POST /auth/login
→ Copiar accessToken
```

### Paso 2: Listar Usuarios
```
GET /users
→ Verificar que el SUPERADMIN existe
```

### Paso 3: Crear Usuario
```
POST /users
→ Guardar el ID del nuevo usuario
```

### Paso 4: Obtener Usuario Creado
```
GET /users/{{NEW_USER_ID}}
→ Verificar que todos los datos son correctos
```

### Paso 5: Actualizar Usuario
```
PATCH /users/{{NEW_USER_ID}}
→ Cambiar nombre o email
```

### Paso 6: Listar Roles
```
GET /roles
→ Verificar que los 4 roles predefinidos existen
```

### Paso 7: Obtener Rol con Permisos
```
GET /roles/f47ac10b-58cc-4372-a567-0e02b2c3d479
→ Verificar que SUPERADMIN tiene 10 permisos
```

### Paso 8: Cambiar Contraseña
```
POST /auth/change-password
→ Cambiar a nueva contraseña
```

### Paso 9: Login con Nueva Contraseña
```
POST /auth/login (con nueva contraseña)
→ Verificar que funciona
```

### Paso 10: Eliminar Usuario
```
DELETE /users/{{NEW_USER_ID}}
→ Verificar que se elimina
```

---

## 🔍 Ejemplos de Respuesta

### Login Success (200)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### Create User Success (201)
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
  "createdAt": "2025-10-28T12:34:56.000Z"
}
```

### Error (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Acceso denegado. Se requieren los roles: SUPERADMIN",
  "error": "Forbidden"
}
```

---

## 🔐 Headers Requeridos por Endpoint

| Endpoint | GET | POST | PATCH | DELETE |
|----------|-----|------|-------|--------|
| /auth/login | - | ✅ | - | - |
| /auth/me | ✅ | - | - | - |
| /users | ✅ | ✅ | ✅ | ✅ |
| /roles | ✅ | ✅ | ✅ | ✅ |
| /permissions | ✅ | ✅ | - | ✅ |

**Nota:** Todos excepto `/auth/login` requieren `Authorization: Bearer {{ACCESS_TOKEN}}`

---

## 📝 Checklist de Pruebas

- [ ] Login exitoso
- [ ] Obtener token
- [ ] Listar usuarios
- [ ] Crear usuario TECNICO
- [ ] Crear usuario ADMIN
- [ ] Crear usuario OPERADOR
- [ ] Obtener usuario creado
- [ ] Actualizar usuario
- [ ] Cambiar rol de usuario
- [ ] Activar/desactivar usuario
- [ ] Eliminar usuario
- [ ] Listar roles
- [ ] Obtener rol con permisos
- [ ] Listar permisos de rol
- [ ] Cambiar contraseña
- [ ] Login con nueva contraseña
- [ ] Verificar 403 sin permisos (login con OPERADOR)
- [ ] Verificar 401 sin token

---

**Versión:** 1.0
**Fecha:** 28 de octubre de 2025
