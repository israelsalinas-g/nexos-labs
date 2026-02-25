# 📋 INSERTAR PERMISOS - Guía Rápida

## ✅ Estado Actual
- ✅ Roles insertados (4 roles)
- ✅ Usuario SUPERADMIN insertado
- ⏳ **Falta: Insertar 18 permisos**

## 🆔 IDs de Roles Confirmados
```
SUPERADMIN: f47ac10b-58cc-4372-a567-0e02b2c3d479
ADMIN:      f47ac10b-58cc-4372-a567-0e02b2c3d480
TECNICO:    f47ac10b-58cc-4372-a567-0e02b2c3d481
OPERADOR:   f47ac10b-58cc-4372-a567-0e02b2c3d482
```

---

## 🚀 Opción 1: Ejecutar desde Terminal (Recomendado)

```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/insert-permissions-only.sql
```

---

## 🖱️ Opción 2: Ejecutar en pgAdmin / DBeaver

1. Abre tu cliente PostgreSQL
2. Selecciona tu base de datos
3. Copia el SQL desde: `src/migrations/insert-permissions-only.sql`
4. Pégalo y ejecuta

---

## 📊 Lo Que Se Insertará

### SUPERADMIN (10 permisos)
```
✅ users:create    - Crear usuarios
✅ users:read      - Ver usuarios
✅ users:update    - Actualizar usuarios
✅ users:delete    - Eliminar usuarios
✅ roles:create    - Crear roles
✅ roles:read      - Ver roles
✅ roles:update    - Actualizar roles
✅ roles:delete    - Eliminar roles
✅ lab:read        - Ver datos de laboratorio
✅ lab:write       - Modificar datos de laboratorio
```

### ADMIN (5 permisos)
```
✅ users:read      - Ver usuarios
✅ users:update    - Actualizar usuarios
✅ roles:read      - Ver roles
✅ lab:read        - Ver datos de laboratorio
✅ lab:write       - Modificar datos de laboratorio
```

### TECNICO (2 permisos)
```
✅ lab:read        - Ver datos de laboratorio
✅ lab:write       - Modificar datos de laboratorio
```

### OPERADOR (1 permiso)
```
✅ lab:read        - Ver datos de laboratorio
```

---

## ✨ Después de Ejecutar

Verás en la consola:
```
INSERT 0 10    -- Permisos SUPERADMIN
INSERT 0 5     -- Permisos ADMIN
INSERT 0 2     -- Permisos TECNICO
INSERT 0 1     -- Permisos OPERADOR
```

Y una tabla con el resumen:
```
       rol    | cantidad_permisos
--------------+------------------
 SUPERADMIN   |                10
 ADMIN        |                 5
 TECNICO      |                 2
 OPERADOR     |                 1
```

---

## ✅ Verificación

Para verificar que todo está bien, ejecuta:

```sql
SELECT r.name as rol, COUNT(*) as permisos
FROM permissions p
LEFT JOIN roles r ON p.role_id = r.id
GROUP BY r.name
ORDER BY r.level;
```

---

## 🧪 Probar el Sistema Completo

Una vez que los permisos estén insertados, puedes hacer login:

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
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "superadmin",
    "email": "superadmin@laboratoryinfo.com",
    "role": "SUPERADMIN"
  }
}
```

---

## 📝 Notas

- ✅ Los UUIDs de los permisos son únicos y válidos
- ✅ Los IDs de roles coinciden con los que ya tienes en la BD
- ✅ Los timestamps usarán la hora actual del servidor
- ✅ No hay restricciones de duplicate keys

¡Ya casi está listo! 🎉
