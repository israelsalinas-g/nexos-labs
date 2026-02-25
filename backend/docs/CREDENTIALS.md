# 🔐 Credenciales de Acceso - Sistema de Laboratorio

## 👤 Usuario SUPERADMIN

### Credenciales
```
Username: superadmin
Password: admin123
Email:    superadmin@laboratoryinfo.com
```

### Hash de Contraseña (Bcrypt - 10 rondas)
```
$2b$10$6.3CRzDm8pu8m1JWtK8/wuOqQEYf7j3fmZlC3g5.5pZ2Zx6c6RHbS
```

---

## 🔓 Cómo Hacer Login

### Vía API REST

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'
```

### Respuesta Esperada
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

---

## 🛡️ Cambiar Contraseña (IMPORTANTE)

**Después del primer login, cambia la contraseña:**

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "tu_nueva_contraseña_segura"
  }'
```

---

## 📋 Información del Rol

| Propiedad | Valor |
|-----------|-------|
| Nombre | SUPERADMIN |
| Nivel | 1 (máximo) |
| Descripción | Administrador supremo del sistema con acceso total |
| ID | f47ac10b-58cc-4372-a567-0e02b2c3d479 |

### Permisos SUPERADMIN
```
✅ users:create      - Crear usuarios
✅ users:read        - Ver usuarios
✅ users:update      - Actualizar usuarios
✅ users:delete      - Eliminar usuarios
✅ roles:create      - Crear roles
✅ roles:read        - Ver roles
✅ roles:update      - Actualizar roles
✅ roles:delete      - Eliminar roles
✅ lab:read          - Ver datos de laboratorio
✅ lab:write         - Modificar datos de laboratorio
```

---

## 🗂️ Base de Datos

| Campo | Valor |
|-------|-------|
| Tabla | users |
| Usuario ID | a47ac10b-58cc-4372-a567-0e02b2c3d479 |
| Username | superadmin |
| Email | superadmin@laboratoryinfo.com |
| Nombre | Super |
| Apellido | Admin |
| Rol | SUPERADMIN |
| Activo | true |

---

## ⚠️ IMPORTANTE

1. **Contraseña por defecto**: `admin123` (CAMBIAR DESPUÉS DEL PRIMER LOGIN)
2. **No compartir credenciales**: Este usuario tiene acceso total al sistema
3. **Usar en producción**: Configurar contraseña fuerte (mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos)
4. **Bearer Token**: Usar en header `Authorization: Bearer <token>` para requests autenticados

---

## 🔑 Ejemplo: Crear Nuevo Usuario

Con el token del SUPERADMIN:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "username": "tecnico01",
    "password": "TecnicoPass123!",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@lab.com",
    "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    "isActive": true
  }'
```

---

## 📝 Notas

- El password está hasheado con bcrypt (10 rondas) en la base de datos
- El usuario está activo (`is_active = true`)
- La contraseña NO se retorna en respuestas de la API
- JWT expira en 1 hora (3600 segundos) por defecto

**Archivo ubicado en:** `src/migrations/seed-all.sql` (Línea 48)
