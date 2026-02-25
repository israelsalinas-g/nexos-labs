# ✅ Solución Completa: Error de Clave Duplicada en Permisos

## 🔴 Problema Identificado

```
ERROR: llave duplicada viola restricción de unicidad
Ya existe la llave (code)=(users:read).
```

**Causa:** El campo `code` en la tabla `permissions` es **UNIQUE**. No podemos tener dos permisos con el mismo código.

---

## ✅ Solución: Códigos Únicos por Rol

### Antes (❌ Incorrecto - Códigos Duplicados)
```sql
-- Mismo código para SUPERADMIN
INSERT INTO permissions VALUES (..., 'users:read', ..., role_superadmin);

-- Mismo código para ADMIN (¡DUPLICADO!)
INSERT INTO permissions VALUES (..., 'users:read', ..., role_admin);
```

### Después (✅ Correcto - Códigos Únicos)
```sql
-- Código único para SUPERADMIN
INSERT INTO permissions VALUES (..., 'superadmin:users:read', ..., role_superadmin);

-- Código único para ADMIN (¡DIFERENTE!)
INSERT INTO permissions VALUES (..., 'admin:users:read', ..., role_admin);
```

---

## 📋 Pasos para Ejecutar

### 1️⃣ Limpia los permisos anteriores (opcional pero recomendado)
```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/cleanup-permissions.sql
```

### 2️⃣ Inserta los permisos corregidos
```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-permissions-fixed.sql
```

---

## 📊 Formato de Códigos

Todos los códigos siguen el patrón: **`{rol}:{recurso}:{acción}`**

```
superadmin:users:create      ✅
superadmin:users:read        ✅
admin:users:read             ✅ (diferente de superadmin:users:read)
tecnico:lab:write            ✅
operador:lab:read            ✅
```

---

## 📈 Resumen de Permisos Insertados

| Rol | Permisos | Total |
|-----|----------|-------|
| SUPERADMIN | users:CRUD, roles:CRUD, lab:read/write | **10** |
| ADMIN | users:read/update, roles:read, lab:read/write | **5** |
| TECNICO | lab:read/write | **2** |
| OPERADOR | lab:read | **1** |
| **TOTAL** | | **18** ✅ |

---

## 🚀 Archivos Nuevos

✅ **`seed-permissions-fixed.sql`** - Script con códigos únicos (USAR ESTE)
✅ **`cleanup-permissions.sql`** - Script para limpiar permisos anteriores
✅ **`PERMISSIONS_FIX.md`** - Documentación completa

---

## 🎯 Resultado Final

Después de ejecutar los scripts:

```sql
-- Verificar permisos inseridos
SELECT * FROM permissions ORDER BY code;

-- Debería mostrar 18 permisos con códigos únicos:
superadmin:lab:read
superadmin:lab:write
superadmin:roles:create
superadmin:roles:delete
superadmin:roles:read
superadmin:roles:update
superadmin:users:create
superadmin:users:delete
superadmin:users:read
superadmin:users:update
admin:lab:read
admin:lab:write
admin:roles:read
admin:users:read
admin:users:update
tecnico:lab:read
tecnico:lab:write
operador:lab:read
```

---

## ✨ ¡Listo!

Tu sistema de roles y permisos está completo y funcional:

✅ **4 Roles** insertados
✅ **1 Usuario SUPERADMIN** creado
✅ **18 Permisos** únicos por rol

🎉 **¡Sistema de autenticación listo para usar!**
