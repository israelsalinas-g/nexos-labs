# Scripts SQL para Inicialización del Sistema de Roles y Usuarios

He generado **4 scripts SQL** para inicializar tu base de datos con roles, permisos y usuario administrativo:

## 📋 Archivos Creados

### 1. **seed-roles.sql** ⭐
Inserta los 4 roles predefinidos del sistema:
```sql
- SUPERADMIN (Nivel 1) - Acceso total
- ADMIN (Nivel 2) - Permisos administrativos
- TECNICO (Nivel 3) - Técnico de laboratorio
- OPERADOR (Nivel 4) - Permisos mínimos
```

### 2. **seed-superadmin-user.sql** 👤
Crea el usuario administrativo inicial:
```
Username: superadmin
Password: admin123
Email: superadmin@laboratoryinfo.com
```

### 3. **seed-permissions.sql** 🔐
Inserta permisos para cada rol:
- Gestión de usuarios
- Gestión de roles
- Lectura/escritura de datos de laboratorio

### 4. **seed-all.sql** 🚀
**Script completo integrado** que ejecuta los 3 anteriores en orden.

---

## 📝 Cómo Usar

### Opción A: Ejecutar el script completo (Recomendado)

```bash
# En PowerShell
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql

# O en WSL/Linux
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql
```

### Opción B: Ejecutar scripts individuales

```bash
# 1. Roles
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-roles.sql

# 2. Usuario SUPERADMIN
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-superadmin-user.sql

# 3. Permisos (Opcional)
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-permissions.sql
```

### Opción C: En pgAdmin o DBeaver

Copia el contenido de `seed-all.sql` y ejecútalo directamente en tu cliente SQL.

---

## ✅ Pasos Completos de Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Crear migración de tablas
npm run migration:run

# 3. Llenar datos iniciales
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql

# 4. Iniciar servidor
npm run start:dev
```

---

## 🔑 Credenciales de Prueba

```
Username: superadmin
Password: admin123
Email: superadmin@laboratoryinfo.com
```

---

## 🧪 Probar Login por API

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'
```

Respuesta esperada:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "superadmin",
    "email": "superadmin@laboratoryinfo.com",
    "role": "SUPERADMIN",
    "roleLevel": 1
  }
}
```

---

## 📊 Estructura de Datos

### Roles
| Rol | Nivel | Descripción |
|-----|-------|-------------|
| SUPERADMIN | 1 | Acceso total al sistema |
| ADMIN | 2 | Permisos administrativos amplios |
| TECNICO | 3 | Técnico de laboratorio |
| OPERADOR | 4 | Permisos mínimos |

### Permisos Principales
- `users:create/read/update/delete` - Gestión de usuarios
- `roles:create/read/update/delete` - Gestión de roles
- `lab:read/write` - Datos de laboratorio

---

## ⚠️ Notas Importantes

1. **Cambiar Contraseña**: Después del primer login, ejecuta:
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "contraseña_nueva"
  }'
```

2. **Hash de Contraseña**: 
   - `admin123` = `$2b$10$6.3CRzDm8pu8m1JWtK8/wuOqQEYf7j3fmZlC3g5.5pZ2Zx6c6RHbS`
   - Generado con bcrypt (10 rondas)

3. **UUIDs**: Puede cambiar los UUIDs en los scripts si lo necesita.

4. **Zona Horaria**: Los timestamps usan `NOW()` (hora del servidor PostgreSQL).

---

## 🛠️ Personalización

Si quieres agregar más usuarios después:

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nuevo_usuario",
    "password": "password123",
    "name": "Nombre",
    "lastName": "Apellido",
    "email": "nuevo@example.com",
    "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    "isActive": true
  }'
```

---

## 📚 Ver Más

Ver `SEED_README.md` para documentación completa.
