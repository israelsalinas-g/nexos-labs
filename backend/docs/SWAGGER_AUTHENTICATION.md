# 🔐 Autenticación en Swagger UI

## Cómo usar el Token JWT en Swagger

Ya está configurado para que puedas enviar el token JWT directamente desde Swagger UI.

### 📋 Pasos:

#### 1️⃣ Abre Swagger
```
http://localhost:3000/api
```

#### 2️⃣ Obtén un Token (Login)

Busca el endpoint `POST /auth/login` y haz clic en "Try it out":

```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

Copia el `accessToken` de la respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### 3️⃣ Autoriza en Swagger

En la parte superior derecha de Swagger, verás un botón **"Authorize"** 🔓

Haz clic en él y pega el token en el campo:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O simplemente:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Haz clic en **"Authorize"** y luego **"Close"**

#### 4️⃣ Usa los Endpoints Protegidos

Ahora todos los endpoints que requieren autenticación (con 🔒 en Swagger) funcionarán automáticamente.

Puedes probar:
- ✅ `GET /users` - Ver lista de usuarios
- ✅ `GET /roles` - Ver lista de roles
- ✅ `POST /users/:id/avatar` - Cambiar avatar
- ✅ `POST /auth/change-password` - Cambiar contraseña
- Etc.

---

## 🎯 Características de la Configuración

| Característica | Descripción |
|----------------|------------|
| **Tipo** | Bearer Token (JWT) |
| **Formato** | HTTP Bearer |
| **Persistencia** | ✅ Automática (se guarda en navegador) |
| **Descripción** | "Ingresa tu JWT token aquí. Primero haz login en POST /auth/login" |
| **Nombre en código** | JWT-auth |

---

## 📸 Donde está el botón Authorize

```
┌─────────────────────────────────────────────────────────┐
│ Swagger UI                              [⚪ Authorize] │
├─────────────────────────────────────────────────────────┤
│ LIS Dymind API v1.0                                     │
│ API REST para servidor LIS...                           │
│                                                         │
│ [Servers: http://localhost:3000 ▼]                     │
│                                                         │
│ ├─ Auth (7)                                            │
│ ├─ Users (11)                                          │
│ ├─ Roles (9)                                           │
│ └─ ...                                                  │
└─────────────────────────────────────────────────────────┘
```

Haz clic en **Authorize** en la esquina superior derecha.

---

## 🔄 Ventajas de esta Configuración

✅ **Fácil de usar**: Solo copiar-pegar el token  
✅ **Persistente**: Se guarda en el navegador entre sesiones  
✅ **Automático**: Se agrega a todos los requests protegidos  
✅ **Seguro**: Solo se envía en conexiones HTTPS en producción  
✅ **Standard**: Usa formato Bearer Token estándar  

---

## ⚠️ Importante

- El token expira después de un tiempo (depende de tu configuración)
- Si expira, necesitas hacer login nuevamente
- En producción, siempre usa HTTPS

---

## 🧪 Flujo Completo de Prueba

1. **Login**: `POST /auth/login`
   ```json
   {
     "username": "superadmin",
     "password": "admin123"
   }
   ```
   Response:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { "id": "...", "username": "superadmin" }
   }
   ```

2. **Copiar token**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Autorizar en Swagger**
   - Clic en "Authorize" 
   - Pegar token
   - Clic en "Authorize"

4. **Probar endpoints protegidos**
   - Todos los 🔒 endpoints funcionarán
   - El token se agrega automáticamente

5. **Refrescar token (opcional)**
   ```
   POST /auth/refresh
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

---

## 🛠️ Configuración en el Código

La configuración está en `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('LIS Dymind API')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingresa tu JWT token aquí. Primero haz login en POST /auth/login',
    },
    'JWT-auth',
  )
  .build();
```

Con `persistAuthorization: true` se guarda automáticamente.

---

## ❓ Troubleshooting

### "Authorization no aparece"
- Actualiza la página (F5)
- Limpia caché del navegador

### "Token rechazado"
- Verifica que el token sea correcto (sin espacios)
- Verifica que no haya expirado
- Haz login nuevamente

### "No funciona en endpoints sin 🔒"
- Los endpoints públicos no requieren token
- Puedes usarlos sin autorizar

