# 🔌 Seleccionar Avatar de Usuario

## 1. Obtener Lista de Avatares Disponibles
```
GET /avatars/available
```

**No requiere autenticación**

**Respuesta (200):**
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.png",
    "avatar-03.png"
  ],
  "default": "default.png",
  "total": 4,
  "baseUrl": "/avatars"
}
```

---

## 2. Seleccionar Avatar para Usuario
```
POST /users/{userId}/avatar
```

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body - Con avatar:**
```json
{
  "avatar": "avatar-02.png"
}
```

**Body - Volver a default (null):**
```json
{
  "avatar": null
}
```

**Respuesta (200):**
```json
{
  "message": "Avatar selected successfully",
  "avatarUrl": "/avatars/avatar-02.png",
  "user": {
    "id": "550e8400-...",
    "username": "tecnico01",
    "name": "Juan",
    "avatar": "avatar-02.png",
    "isActive": true,
    ...
  }
}
```

**Errores:**
```json
// 400 - Avatar inválido
{
  "statusCode": 400,
  "message": "Avatar \"no-existe.png\" no es válido. Use GET /avatars/available para ver opciones"
}

// 400 - Nombre inválido (path traversal)
{
  "statusCode": 400,
  "message": "Avatar name inválido"
}

// 403 - Sin permisos
{
  "statusCode": 403,
  "message": "Solo puedes actualizar tu propio avatar"
}

// 404 - Usuario no encontrado
{
  "statusCode": 404,
  "message": "Usuario no encontrado"
}
```

---

## 3. Obtener Usuario (con avatar)
```
GET /users/{userId}
```

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta (200):**
```json
{
  "id": "550e8400-...",
  "username": "tecnico01",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@lab.com",
  "avatar": "avatar-02.png",
  "isActive": true,
  "role": {
    "id": "f47ac10b-...",
    "name": "TECNICO"
  },
  ...
}
```

---

## 4. Acceder a Imagen de Avatar
```
GET /avatars/{nombreArchivo}
```

**Ejemplos:**
```
GET /avatars/default.png
GET /avatars/avatar-01.png
GET /avatars/avatar-02.png
```

**Respuesta**: Archivo binario de imagen (Content-Type: image/*)

---

## Flujos en Postman

### Flujo Completo: Login → Obtener Avatares → Seleccionar

**1. Login:**
```
POST /auth/login
Body: {
  "username": "superadmin",
  "password": "admin123"
}

Guardar response.accessToken en variable {{ACCESS_TOKEN}}
Guardar response.user.id en variable {{USER_ID}}
```

**2. Obtener Avatares Disponibles:**
```
GET /avatars/available

Observar lista de avatares disponibles
```

**3. Seleccionar Avatar:**
```
POST /users/{{USER_ID}}/avatar
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

Body: {
  "avatar": "avatar-01.png"
}

Verificar que avatar se actualizó
```

**4. Verificar Usuario:**
```
GET /users/{{USER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}

Verificar que campo "avatar" = "avatar-01.png"
```

**5. Volver a Default:**
```
POST /users/{{USER_ID}}/avatar
Authorization: Bearer {{ACCESS_TOKEN}}

Body: {
  "avatar": null
}

Verificar que avatar ahora es null
```

**6. Acceder a Imagen:**
```
GET /avatars/avatar-01.png

Debería descargar la imagen
```

---

## Casos de Prueba

### Test 1: Avatar Válido
```
POST /users/{{USER_ID}}/avatar
Body: { "avatar": "avatar-02.png" }

✅ 200 OK
```

### Test 2: Avatar Inválido
```
POST /users/{{USER_ID}}/avatar
Body: { "avatar": "no-existe.png" }

❌ 400 Bad Request
"no es válido"
```

### Test 3: Path Traversal (Intento de Hack)
```
POST /users/{{USER_ID}}/avatar
Body: { "avatar": "../../../etc/passwd" }

❌ 400 Bad Request
"Avatar name inválido"
```

### Test 4: Sin Autenticación
```
POST /users/{{USER_ID}}/avatar
(Sin Authorization header)

❌ 401 Unauthorized
```

### Test 5: Sin Permisos
```
// LOGIN como OPERADOR
POST /auth/login
Body: { "username": "operador01", "password": "..." }

// INTENTAR CAMBIAR AVATAR DE OTRO USUARIO
POST /users/{otro-usuario}/avatar
Authorization: Bearer {{OPERADOR_TOKEN}}

❌ 403 Forbidden
"Solo puedes actualizar tu propio avatar"
```

---

## Postman Collection (JSON)

Agregar a colección "Users":

```json
{
  "name": "Avatar Selection",
  "item": [
    {
      "name": "Get Available Avatars",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/avatars/available"
      }
    },
    {
      "name": "Select Avatar",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/users/{{USER_ID}}/avatar",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{ACCESS_TOKEN}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"avatar\": \"avatar-01.png\"}"
        }
      }
    },
    {
      "name": "Reset Avatar to Default",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/users/{{USER_ID}}/avatar",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{ACCESS_TOKEN}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"avatar\": null}"
        }
      }
    }
  ]
}
```
