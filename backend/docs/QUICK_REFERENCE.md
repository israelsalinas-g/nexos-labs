# 🚀 Guía Rápida de API - Frontend

## 📌 Información Esencial

### Base URL
```
http://localhost:3000
```

### Headers Estándar
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <access_token>'  // Excepto en login
}
```

---

## 🔐 AUTENTICACIÓN (3 pasos)

### 1️⃣ Login
```
POST /auth/login
```
```javascript
{
  "username": "superadmin",
  "password": "admin123"
}
```
✅ Retorna: `accessToken` + datos del usuario

---

### 2️⃣ Usar Token en Requests
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

---

### 3️⃣ Cambiar Contraseña
```
POST /auth/change-password
```
```javascript
{
  "currentPassword": "admin123",
  "newPassword": "nueva_contraseña"
}
```

---

## 👥 USUARIOS - CRUD

### 📋 Listar
```
GET /users?page=1&limit=10
```
Retorna: Array de usuarios + pagination

---

### ➕ Crear
```
POST /users
```
```javascript
{
  "username": "usuario_nuevo",
  "password": "Pass123!",
  "name": "Nombre",
  "lastName": "Apellido",
  "email": "email@example.com",
  "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
  "isActive": true
}
```
✅ Roles requeridos: ADMIN, SUPERADMIN

---

### 🔍 Ver Detalle
```
GET /users/:id
```
Retorna: Usuario + rol + permisos

---

### ✏️ Actualizar
```
PATCH /users/:id
```
```javascript
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "roleId": "...",
  "isActive": true
}
```
⚠️ El usuario puede actualizar sus propios datos
👮 Admin puede actualizar a otros

---

### ❌ Eliminar
```
DELETE /users/:id
```
✅ Solo SUPERADMIN puede eliminar

---

### 🔄 Alternar Activo/Inactivo
```
PATCH /users/:id/toggle-active
```
✅ Roles requeridos: ADMIN, SUPERADMIN

---

### 🎯 Listar por Rol
```
GET /users/role/:roleId?page=1&limit=10
```

---

## 🔑 ROLES - CRUD

### 📋 Listar
```
GET /roles?page=1&limit=10
```

---

### ➕ Crear
```
POST /roles
```
```javascript
{
  "name": "NUEVO_ROL",
  "level": 3,
  "description": "Descripción del rol"
}
```
✅ Solo SUPERADMIN

---

### 🔍 Ver Detalle
```
GET /roles/:id
```
Retorna: Rol + usuarios + permisos

---

### ✏️ Actualizar
```
PATCH /roles/:id
```
```javascript
{
  "description": "Nueva descripción"
}
```
✅ Solo SUPERADMIN

---

### ❌ Eliminar
```
DELETE /roles/:id
```
❌ No se puede si:
- Es rol predefinido (SUPERADMIN, ADMIN, TECNICO, OPERADOR)
- Tiene usuarios asignados

---

## 🛡️ PERMISOS

### 📋 Listar Permisos de Rol
```
GET /roles/:id/permissions
```

---

### ➕ Agregar Permiso a Rol
```
POST /roles/:id/permissions
```
```javascript
{
  "code": "rol:recurso:accion",
  "description": "Descripción del permiso"
}
```
✅ Solo SUPERADMIN

---

### ❌ Eliminar Permiso
```
DELETE /roles/:id/permissions/:permissionId
```
✅ Solo SUPERADMIN

---

## 📊 Estructura de Datos

### Usuario
```javascript
{
  "id": "uuid",
  "username": "string (único)",
  "name": "string",
  "lastName": "string",
  "email": "string (único)",
  "role": { id, name, level },
  "isActive": boolean,
  "lastLogin": datetime,
  "createdAt": datetime,
  "updatedAt": datetime
}
```

### Rol
```javascript
{
  "id": "uuid",
  "name": "string (único)",
  "level": number (1-4),
  "description": "string",
  "users": [{ id, username, email }],
  "permissions": [{ id, code, description }],
  "createdAt": datetime,
  "updatedAt": datetime
}
```

### Permiso
```javascript
{
  "id": "uuid",
  "code": "string (único)",
  "description": "string",
  "roleId": "uuid",
  "createdAt": datetime,
  "updatedAt": datetime
}
```

---

## ⚡ Roles y Niveles

| Rol | Nivel | Permisos |
|-----|-------|----------|
| SUPERADMIN | 1 | ✅ Todo |
| ADMIN | 2 | ✅ Usuarios, Roles (lectura), Laboratorio |
| TECNICO | 3 | ✅ Laboratorio (lectura/escritura) |
| OPERADOR | 4 | ✅ Laboratorio (lectura) |

---

## 🚨 Códigos de Error

| Código | Causa |
|--------|-------|
| 400 | Datos inválidos |
| 401 | Token inválido/expirado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 409 | Conflicto (duplicados) |
| 500 | Error del servidor |

---

## 💻 Código de Ejemplo (JavaScript/Fetch)

```javascript
// 1. LOGIN
const login = async (username, password) => {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

// 2. OBTENER USUARIOS
const getUsers = async (accessToken, page = 1, limit = 10) => {
  const res = await fetch(
    `http://localhost:3000/users?page=${page}&limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );
  return res.json();
};

// 3. CREAR USUARIO
const createUser = async (accessToken, userData) => {
  const res = await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(userData)
  });
  return res.json();
};

// 4. ACTUALIZAR USUARIO
const updateUser = async (accessToken, userId, data) => {
  const res = await fetch(`http://localhost:3000/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// 5. ELIMINAR USUARIO
const deleteUser = async (accessToken, userId) => {
  const res = await fetch(`http://localhost:3000/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return res.json();
};

// 6. OBTENER ROLES
const getRoles = async (accessToken) => {
  const res = await fetch('http://localhost:3000/roles', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return res.json();
};

// USO
(async () => {
  // Login
  const { accessToken, user } = await login('superadmin', 'admin123');
  console.log('Autenticado como:', user.username);

  // Obtener usuarios
  const { data: users } = await getUsers(accessToken);
  console.log('Usuarios:', users);

  // Crear usuario
  const newUser = await createUser(accessToken, {
    username: 'tecnico02',
    password: 'Pass123!',
    name: 'Pedro',
    lastName: 'García',
    email: 'pedro@lab.com',
    roleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    isActive: true
  });
  console.log('Usuario creado:', newUser);

  // Actualizar usuario
  const updated = await updateUser(accessToken, newUser.id, {
    name: 'Pedro José',
    isActive: false
  });
  console.log('Usuario actualizado:', updated);

  // Eliminar usuario
  const deleted = await deleteUser(accessToken, newUser.id);
  console.log('Usuario eliminado:', deleted.message);
})();
```

---

## 🔄 Axios Example

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000'
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
export const loginAPI = (username, password) =>
  API.post('/auth/login', { username, password });

// Usuarios
export const getUsersAPI = (page = 1, limit = 10) =>
  API.get('/users', { params: { page, limit } });

export const createUserAPI = (userData) =>
  API.post('/users', userData);

export const updateUserAPI = (userId, data) =>
  API.patch(`/users/${userId}`, data);

export const deleteUserAPI = (userId) =>
  API.delete(`/users/${userId}`);

// Roles
export const getRolesAPI = () =>
  API.get('/roles');

export const getRoleByIdAPI = (roleId) =>
  API.get(`/roles/${roleId}`);

export const getPermissionsByRoleAPI = (roleId) =>
  API.get(`/roles/${roleId}/permissions`);

// USO
try {
  const { data } = await loginAPI('superadmin', 'admin123');
  localStorage.setItem('accessToken', data.accessToken);
  
  const users = await getUsersAPI();
  console.log(users.data);
} catch (error) {
  console.error('Error:', error.response.data.message);
}
```

---

## 🛠️ Troubleshooting

### "401 Unauthorized"
- ❌ Token expirado o inválido
- ✅ Hacer login nuevamente
- ✅ Verificar que el header sea: `Authorization: Bearer <token>`

### "403 Forbidden"
- ❌ Sin permisos para esta acción
- ✅ Verificar rol del usuario
- ✅ Verificar que el usuario tenga el rol requerido

### "409 Conflict"
- ❌ El username o email ya existe
- ✅ Usar valores únicos
- ✅ El código de permiso ya está asignado a otro rol

### "404 Not Found"
- ❌ El recurso no existe
- ✅ Verificar el ID
- ✅ Verificar que el usuario/rol/permiso existe

---

## 📚 Credenciales Iniciales

```
Username: superadmin
Password: admin123
Email:    superadmin@laboratoryinfo.com
Rol:      SUPERADMIN
```

⚠️ **CAMBIAR DESPUÉS DEL PRIMER LOGIN**

---

**Última actualización:** 28 de octubre de 2025
