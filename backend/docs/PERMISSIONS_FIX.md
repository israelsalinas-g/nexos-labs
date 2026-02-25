# 🔧 Solución: Error de Clave Duplicada en Permisos

## 🔴 El Problema
```
ERROR:  llave duplicada viola restricción de unicidad «UQ_8dad765629e83229da6feda1c1d»
Ya existe la llave (code)=(users:read).
```

### Causa
La columna `code` en la tabla `permissions` tiene una restricción **UNIQUE**. No pueden existir dos permisos con el mismo código.

En el script anterior, estábamos usando códigos genéricos:
```sql
-- ❌ INCORRECTO - mismo código para múltiples roles
INSERT INTO permissions (...) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'users:read', ..., 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
('550e8400-e29b-41d4-a716-446655440011', 'users:read', ..., 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
-- users:read está duplicado ❌
```

---

## ✅ La Solución
Cada permiso debe tener un código **único** añadiendo el prefijo del rol:

```sql
-- ✅ CORRECTO - códigos únicos por rol
INSERT INTO permissions (...) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'superadmin:users:read', ..., 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
('550e8400-e29b-41d4-a716-446655440011', 'admin:users:read', ..., 'f47ac10b-58cc-4372-a567-0e02b2c3d480');
-- Códigos diferentes ✅
```

---

## 📋 Formato de Códigos

Todos los permisos ahora siguen el patrón:

```
{rol}:{recurso}:{acción}
```

### Ejemplos:
| Código | Descripción |
|--------|-------------|
| `superadmin:users:create` | Crear usuarios (SUPERADMIN) |
| `superadmin:users:read` | Ver usuarios (SUPERADMIN) |
| `admin:users:read` | Ver usuarios (ADMIN) |
| `admin:users:update` | Actualizar usuarios (ADMIN) |
| `tecnico:lab:read` | Ver laboratorio (TECNICO) |
| `operador:lab:read` | Ver laboratorio (OPERADOR) |

---

## 🚀 Cómo Ejecutar

### Paso 1: Primero elimina los permisos duplicados (si los insertaste)

Si ya intentaste insertar los permisos con códigos duplicados, elimínalos primero:

```sql
-- Opción A: Eliminar todos los permisos
DELETE FROM permissions;

-- Opción B: Solo los duplicados (si sabes cuáles son)
DELETE FROM permissions 
WHERE code IN ('users:read', 'users:update', 'roles:read', 'lab:read', 'lab:write');
```

### Paso 2: Ejecuta el nuevo script

```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-permissions-fixed.sql
```

---

## ✨ Resultado Esperado

```
INSERT 0 10   -- 10 permisos para SUPERADMIN
INSERT 0 5    -- 5 permisos para ADMIN
INSERT 0 2    -- 2 permisos para TECNICO
INSERT 0 1    -- 1 permiso para OPERADOR

Permisos insertados correctamente
```

Y una tabla como esta:
```
                   id                   |           code           |                description                |    rol
────────────────────────────────────────┼──────────────────────────┼────────────────────────────────────────────┼────────────
 550e8400-e29b-41d4-a716-446655440001   | superadmin:users:create  | Crear usuarios (SUPERADMIN)                | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440002   | superadmin:users:read    | Ver usuarios (SUPERADMIN)                  | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440003   | superadmin:users:update  | Actualizar usuarios (SUPERADMIN)           | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440004   | superadmin:users:delete  | Eliminar usuarios (SUPERADMIN)             | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440005   | superadmin:roles:create  | Crear roles (SUPERADMIN)                   | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440006   | superadmin:roles:read    | Ver roles (SUPERADMIN)                     | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440007   | superadmin:roles:update  | Actualizar roles (SUPERADMIN)              | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440008   | superadmin:roles:delete  | Eliminar roles (SUPERADMIN)                | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440009   | superadmin:lab:read      | Ver datos de laboratorio (SUPERADMIN)      | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440010   | superadmin:lab:write     | Modificar datos de laboratorio (SUPERADMIN) | SUPERADMIN
 550e8400-e29b-41d4-a716-446655440011   | admin:users:read         | Ver usuarios (ADMIN)                       | ADMIN
 550e8400-e29b-41d4-a716-446655440012   | admin:users:update       | Actualizar usuarios (ADMIN)                | ADMIN
 550e8400-e29b-41d4-a716-446655440013   | admin:roles:read         | Ver roles (ADMIN)                          | ADMIN
 550e8400-e29b-41d4-a716-446655440014   | admin:lab:read           | Ver datos de laboratorio (ADMIN)           | ADMIN
 550e8400-e29b-41d4-a716-446655440015   | admin:lab:write          | Modificar datos de laboratorio (ADMIN)     | ADMIN
 550e8400-e29b-41d4-a716-446655440016   | tecnico:lab:read         | Ver datos de laboratorio (TECNICO)         | TECNICO
 550e8400-e29b-41d4-a716-446655440017   | tecnico:lab:write        | Modificar datos de laboratorio (TECNICO)   | TECNICO
 550e8400-e29b-41d4-a716-446655440018   | operador:lab:read        | Ver datos de laboratorio (OPERADOR)        | OPERADOR
```

---

## 📝 Resumen de Permisos

### SUPERADMIN (10 permisos)
- ✅ users:create, users:read, users:update, users:delete
- ✅ roles:create, roles:read, roles:update, roles:delete
- ✅ lab:read, lab:write

### ADMIN (5 permisos)
- ✅ users:read, users:update
- ✅ roles:read
- ✅ lab:read, lab:write

### TECNICO (2 permisos)
- ✅ lab:read, lab:write

### OPERADOR (1 permiso)
- ✅ lab:read

---

## 🎯 Total: 18 Permisos Únicos

Archivo: `seed-permissions-fixed.sql` 📁

¡Ahora puedes ejecutar sin errores de duplicación! 🎉
