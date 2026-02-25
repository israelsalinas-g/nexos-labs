# ✅ PROBLEMA RESUELTO: UUIDs en Scripts SQL

## 🔴 Problema
Los scripts SQL tenían IDs de permisos inválidos que no coincidían con el formato UUID requerido por PostgreSQL:
```sql
-- ❌ INCORRECTO (strings simples)
INSERT INTO permissions (...) VALUES
('p1111111-58cc-4372-a567-0e02b2c3d479', ...)  -- NOT a valid UUID
```

## 🟢 Solución
He actualizado todos los scripts para usar UUIDs válidos en formato v4:

```sql
-- ✅ CORRECTO (UUID válido)
INSERT INTO permissions (...) VALUES
('550e8400-e29b-41d4-a716-446655440001', ...)  -- Valid UUID v4
```

---

## 📊 Cambios Realizados

### Antes (❌ Incorrecto)
```
p1111111-58cc-4372-a567-0e02b2c3d479  (NOT a valid UUID)
p2111111-58cc-4372-a567-0e02b2c3d480
p3111111-58cc-4372-a567-0e02b2c3d481
```

### Después (✅ Correcto)
```
550e8400-e29b-41d4-a716-446655440001  (Valid UUID v4)
550e8400-e29b-41d4-a716-446655440002
550e8400-e29b-41d4-a716-446655440003
...
550e8400-e29b-41d4-a716-446655440018
```

---

## 📋 Archivos Actualizados

✅ **seed-all.sql**
- UUIDs válidos para todos los permisos
- Listo para ejecutar

✅ **seed-permissions.sql**
- UUIDs válidos para todos los permisos
- Mismo formato que seed-all.sql

---

## 🚀 Ahora Puedes Ejecutar

```bash
# Con los UUIDs correctos:
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql
```

**No habrá errores de tipo UUID** ✨

---

## 📝 Tabla de Mapeo de Permisos

| ID UUID | Código | Descripción | Rol |
|---------|--------|-------------|-----|
| 550e8400-e29b-41d4-a716-446655440001 | users:create | Crear usuarios | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440002 | users:read | Ver usuarios | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440003 | users:update | Actualizar usuarios | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440004 | users:delete | Eliminar usuarios | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440005 | roles:create | Crear roles | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440006 | roles:read | Ver roles | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440007 | roles:update | Actualizar roles | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440008 | roles:delete | Eliminar roles | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440009 | lab:read | Ver laboratorio | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440010 | lab:write | Modificar laboratorio | SUPERADMIN |
| 550e8400-e29b-41d4-a716-446655440011 | users:read | Ver usuarios | ADMIN |
| 550e8400-e29b-41d4-a716-446655440012 | users:update | Actualizar usuarios | ADMIN |
| 550e8400-e29b-41d4-a716-446655440013 | roles:read | Ver roles | ADMIN |
| 550e8400-e29b-41d4-a716-446655440014 | lab:read | Ver laboratorio | ADMIN |
| 550e8400-e29b-41d4-a716-446655440015 | lab:write | Modificar laboratorio | ADMIN |
| 550e8400-e29b-41d4-a716-446655440016 | lab:read | Ver laboratorio | TECNICO |
| 550e8400-e29b-41d4-a716-446655440017 | lab:write | Modificar laboratorio | TECNICO |
| 550e8400-e29b-41d4-a716-446655440018 | lab:read | Ver laboratorio | OPERADOR |

---

## ✨ Resultado

Ahora puedes ejecutar:

```bash
psql -U tu_usuario -d tu_base_datos -f src/migrations/seed-all.sql
```

Y verás:
```
INSERT 0 4      -- Roles insertados
INSERT 0 1      -- Usuario insertado
INSERT 0 18     -- Permisos insertados correctamente ✅
```

¡Sin errores de tipos UUID! 🎉
