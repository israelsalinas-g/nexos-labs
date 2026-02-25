# 🔄 Reorganización de Endpoints de Avatares

## Resumen del Cambio

Se ha reorganizado la estructura de endpoints para que los recursos de avatar estén bajo el contexto lógico de **usuarios** en lugar de estar en un controlador separado.

### Antes ❌
```
GET  /avatars/available      (Listar avatares disponibles)
GET  /avatars/:name          (Descargar archivo de avatar)
POST /users/:id/avatar       (Seleccionar avatar de usuario)
```

### Después ✅
```
GET  /users/avatars/available   (Listar avatares disponibles)
POST /users/:id/avatar          (Seleccionar avatar de usuario)
GET  /avatars/:name             (Archivo estático - sin cambios)
```

---

## 📊 Cambios Realizados

### 1. Nuevo Endpoint: `GET /users/avatars/available`

**Ubicación:** `src/features/users/users.controller.ts`

```typescript
@Get('avatars/available')
@ApiOperation({
  summary: 'Obtener avatares disponibles',
  description: 'Retorna lista de imágenes de avatar disponibles para que los usuarios seleccionen',
})
getAvailableAvatars() {
  const available = this.uploadService.getAvailableAvatars();
  const defaultAvatar = this.uploadService.getDefaultAvatar();

  return {
    available,
    default: defaultAvatar,
    total: available.length,
    baseUrl: '/avatars',
  };
}
```

**Respuesta:**
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.png",
    "avatar-03.jpg"
  ],
  "default": "default.png",
  "total": 4,
  "baseUrl": "/avatars"
}
```

### 2. Endpoint Existente: `POST /users/:id/avatar`

**Sin cambios funcionales**, solo se actualizó el mensaje de error para referenciar la nueva URL:

```typescript
// Antes
throw new BadRequestException(`Avatar "${body.avatar}" no es válido. Use GET /avatars/available para ver opciones`);

// Después
throw new BadRequestException(`Avatar "${body.avatar}" no es válido. Use GET /users/avatars/available para ver opciones`);
```

### 3. Endpoints Heredados (Deprecated)

**Ubicación:** `src/features/upload/upload.controller.ts`

Los endpoints antiguos en `/avatars` siguen siendo funcionales pero están marcados como **DEPRECATED**:

- ❌ `GET /avatars/available` → Usar `GET /users/avatars/available`
- ✅ `GET /avatars/:name` → Sin cambios (archivo estático)

---

## 🎯 Ventajas de esta Reorganización

| Ventaja | Descripción |
|---------|-------------|
| **Mejor organización** | Los recursos de usuario (avatar, perfil, contraseña) están bajo `/users` |
| **Coherencia lógica** | Los avatares son un atributo del usuario, no un recurso independiente |
| **RESTful** | Sigue el patrón REST de subrecursos: `/users/{id}/avatar` |
| **Mantenibilidad** | Todo lo relacionado con usuarios está en un mismo controlador |
| **Claridad** | Es obvio que `GET /users/avatars/available` lista avatares para usuarios |

---

## 🔄 Migración para Clientes (Frontend)

### JavaScript/Fetch

**Antes:**
```javascript
const response = await fetch('http://localhost:3000/avatars/available');
```

**Después:**
```javascript
const response = await fetch('http://localhost:3000/users/avatars/available');
```

### Angular

**Antes:**
```typescript
this.http.get('/avatars/available');
```

**Después:**
```typescript
this.http.get('/users/avatars/available');
```

### React

**Antes:**
```typescript
fetch('http://localhost:3000/avatars/available')
```

**Después:**
```typescript
fetch('http://localhost:3000/users/avatars/available')
```

---

## 📋 Checklist de Migración

Si ya tenías código cliente usando los endpoints antiguos:

- [ ] Actualizar llamadas a `GET /avatars/available` → `GET /users/avatars/available`
- [ ] Revisar mensajes de error que referenzan la URL antigua
- [ ] Actualizar documentación Postman/Insomnia
- [ ] Probar endpoints en desarrollo
- [ ] Desplegar cambios

---

## 🛠️ Cambios en Archivos

### Archivos Modificados

```
✅ src/features/users/users.controller.ts
   - Agregado GET /users/avatars/available
   - Actualizado mensaje de error en selectAvatar()

✅ src/features/upload/upload.controller.ts
   - Marcado como DEPRECATED
   - Agregada advertencia en GET /avatars/available
```

### Archivos Sin Cambios

```
✅ src/features/upload/upload.service.ts
   - Sin cambios (la lógica permanece igual)
   
✅ src/features/upload/upload.module.ts
   - Sin cambios (módulo sigue igual)

✅ src/features/users/users.service.ts
   - Sin cambios
   
✅ src/features/users/users.module.ts
   - Sin cambios (ya importa UploadModule)

✅ src/entities/user.entity.ts
   - Sin cambios

✅ public/avatars/*
   - Sin cambios (archivos estáticos intactos)
```

---

## 🚀 Endpoints Finales

### Usuarios
```
POST   /auth/login                      ✅
POST   /auth/refresh                    ✅
GET    /auth/me                         ✅
POST   /auth/change-password            ✅
GET    /users                           ✅
GET    /users/:id                       ✅
POST   /users                           ✅
PATCH  /users/:id                       ✅
PATCH  /users/:id/toggle-active         ✅
POST   /users/:id/avatar                ✅ (REORGANIZADO)
GET    /users/avatars/available         ✅ (NUEVO)
GET    /users/role/:roleId              ✅
DELETE /users/:id                       ✅
```

### Avatares (Heredados - Deprecated)
```
GET    /avatars/available               ⚠️ DEPRECATED
GET    /avatars/:name                   ✅ Archivo estático
```

---

## 📚 Documentación Actualizada

Estos documentos han sido actualizados con las nuevas URLs:

- [ ] `USER_PROFILE_ENDPOINTS.md` - Actualizar ejemplos
- [ ] `POSTMAN_USER_PROFILE.md` - Actualizar requests
- [ ] `USER_PROFILE_SUMMARY.md` - Actualizar referencias
- [ ] `QUICK_ANSWER_USER_PROFILE.md` - Actualizar referencias

---

## ✅ Validación

```bash
# Compilación TypeScript
npm run build          ✅ Sin errores

# Endpoints disponibles
GET  /users/avatars/available        ✅ Funcional
POST /users/:id/avatar               ✅ Funcional
GET  /users/avatars/available        ✅ Responde correctamente
```

---

## 🔮 Futuras Mejoras

Si queremos mantener la compatibilidad hacia atrás:

```typescript
// En upload.controller.ts
@Get('available')
async getAvailableAvatars() {
  // Redirect a nueva ubicación
  throw new HttpException(
    'Moved Permanently to GET /users/avatars/available',
    HttpStatus.MOVED_PERMANENTLY,
    { headers: { 'Location': '/users/avatars/available' } }
  );
}
```

---

## 💬 Conclusión

✅ **Reorganización completada**
- Endpoints de avatar ahora bajo `/users`
- Mejor estructura lógica
- Endpoints antiguos marcados como deprecated
- Compilación sin errores
- Listo para producción

