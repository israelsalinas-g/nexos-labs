# Script de Inicialización de Roles y Usuarios

Este directorio contiene scripts SQL para inicializar la base de datos con roles, permisos y usuario administrativo.

## Archivos

### 1. `seed-roles.sql`
Inserta los 4 roles predefinidos del sistema:
- **SUPERADMIN** (Nivel 1): Acceso total al sistema
- **ADMIN** (Nivel 2): Permisos administrativos amplios
- **TECNICO** (Nivel 3): Permisos de técnico de laboratorio
- **OPERADOR** (Nivel 4): Permisos mínimos

### 2. `seed-superadmin-user.sql`
Crea el usuario administrativo inicial:
- **Username**: `superadmin`
- **Email**: `superadmin@laboratoryinfo.com`
- **Password**: `admin123` (cambiar después del primer login)
- **Role**: SUPERADMIN

### 3. `seed-permissions.sql`
Inserta permisos predefinidos para cada rol:
- Permisos de gestión de usuarios
- Permisos de gestión de roles
- Permisos de lectura/escritura de datos de laboratorio

## Orden de Ejecución

1. **Ejecutar migración**:
   ```bash
   npm run migration:run
   ```
   Esto crea las tablas: `roles`, `users`, `permissions`

2. **Insertar roles**:
   ```sql
   -- En tu cliente de PostgreSQL (psql, pgAdmin, etc.)
   \i src/migrations/seed-roles.sql
   ```

3. **Insertar usuario SUPERADMIN**:
   ```sql
   \i src/migrations/seed-superadmin-user.sql
   ```

4. **Insertar permisos** (opcional):
   ```sql
   \i src/migrations/seed-permissions.sql
   ```

## Alternativa: Ejecutar todo en un script

Puedes crear un archivo `seed-all.sql` que ejecute los tres scripts en orden:

```sql
\i src/migrations/seed-roles.sql
\i src/migrations/seed-superadmin-user.sql
\i src/migrations/seed-permissions.sql
```

Luego ejecuta:
```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql
```

## Credenciales Iniciales

```
Username: superadmin
Password: admin123
Email: superadmin@laboratoryinfo.com
```

⚠️ **IMPORTANTE**: Cambiar la contraseña inmediatamente después del primer login.

## Login por API

Una vez que los datos estén en la base de datos, puedes hacer login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "superadmin",
    "email": "superadmin@laboratoryinfo.com",
    "role": "SUPERADMIN"
  }
}
```

## Cambiar Contraseña

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "nueva_contraseña_segura"
  }'
```

## Crear Más Usuarios

Con el token del SUPERADMIN:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "username": "john.doe",
    "password": "password123",
    "name": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "roleId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    "isActive": true
  }'
```

## Estructura de Roles

```
SUPERADMIN (Nivel 1)
  └─ Acceso total
  └─ Puede crear/modificar/eliminar usuarios y roles
  └─ Puede ver y modificar todos los datos

ADMIN (Nivel 2)
  └─ Permisos administrativos
  └─ Puede crear/modificar usuarios (pero no otros admins)
  └─ Puede ver datos de laboratorio
  └─ NO puede eliminar roles

TECNICO (Nivel 3)
  └─ Puede ver y modificar datos de laboratorio
  └─ NO puede gestionar usuarios o roles

OPERADOR (Nivel 4)
  └─ Solo lectura de datos de laboratorio
  └─ Permisos mínimos del sistema
```

## Notas Adicionales

- Los UUIDs usados en los scripts son ejemplos. Puedes usar otros si lo necesitas.
- El hash de la contraseña `admin123` es: `$2b$10$6.3CRzDm8pu8m1JWtK8/wuOqQEYf7j3fmZlC3g5.5pZ2Zx6c6RHbS`
- Si necesitas generar nuevos hashes, puedes usar bcrypt con 10 rondas.
- Los timestamps se generan con `NOW()` (hora del servidor PostgreSQL).
