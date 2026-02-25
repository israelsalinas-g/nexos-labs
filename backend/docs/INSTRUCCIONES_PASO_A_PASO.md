# 🎯 INSTRUCCIONES PASO A PASO - Insertar Permisos

## Estado: Roles ✅ | Usuario ✅ | Permisos ⏳

---

## 🟢 OPCIÓN 1: Terminal (PowerShell) - MÁS RÁPIDO

```powershell
# Abre PowerShell en: C:\Users\User\Desktop\lab-integration-be\lis-dymind-be

# Ejecuta:
psql -U tu_usuario -d tu_base_datos -f src/migrations/insert-permissions-only.sql

# Ejemplo (reemplaza con tus datos reales):
psql -U postgres -d lab_db -f src/migrations/insert-permissions-only.sql
```

**Resultado esperado:**
```
INSERT 0 10
INSERT 0 5
INSERT 0 2
INSERT 0 1
       rol    | cantidad_permisos
```

---

## 🟢 OPCIÓN 2: pgAdmin 4 - VISUAL

### Paso 1️⃣
Abre pgAdmin → Conéctate a tu servidor

### Paso 2️⃣
Navega a: Servers → tu_servidor → Databases → tu_base_datos → Tools → Query Tool

### Paso 3️⃣
En el editor de Query, abre el archivo:
```
c:\Users\User\Desktop\lab-integration-be\lis-dymind-be\PERMISOS_COPIAR_PEGAR.sql
```

### Paso 4️⃣
Copia TODO el contenido (Ctrl+A → Ctrl+C)

### Paso 5️⃣
Pégalo en la ventana de Query de pgAdmin (Ctrl+V)

### Paso 6️⃣
Presiona **▶️ Execute** (o F5)

**Resultado:** Verás "Command completed" sin errores

---

## 🟢 OPCIÓN 3: DBeaver - VISUAL

### Paso 1️⃣
Abre DBeaver → Conéctate a tu base de datos

### Paso 2️⃣
Right-click en la base de datos → SQL Editor → New SQL Script

### Paso 3️⃣
Abre: `PERMISOS_COPIAR_PEGAR.sql`

### Paso 4️⃣
Copia TODO (Ctrl+A → Ctrl+C)

### Paso 5️⃣
Pégalo en DBeaver (Ctrl+V)

### Paso 6️⃣
Ejecuta: Ctrl+Enter o Botón ▶️

**Resultado:** Los permisos aparecen en la tabla `permissions`

---

## ✅ VERIFICAR QUE FUNCIONÓ

Después de ejecutar, en psql o en tu cliente SQL, ejecuta:

```sql
-- Ver resumen
SELECT r.name as rol, COUNT(*) as permisos
FROM permissions p
LEFT JOIN roles r ON p.role_id = r.id
GROUP BY r.id, r.name
ORDER BY r.level;
```

Deberías ver:
```
   rol    | permisos
----------+----------
 SUPERADMIN|       10
 ADMIN    |        5
 TECNICO  |        2
 OPERADOR |        1
(4 rows)
```

---

## 🧪 PROBAR EL LOGIN

Una vez que los permisos estén insertados:

```bash
# En PowerShell o CMD:
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"superadmin\",\"password\":\"admin123\"}"
```

Deberías recibir:
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

## 🆘 PROBLEMAS COMUNES

### ❌ Error: "duplicate key value violates unique constraint"
**Solución:** Los permisos ya existen en la BD
```sql
-- Elimina los permisos existentes y reintentas:
DELETE FROM permissions;

-- Luego ejecuta insert-permissions-only.sql otra vez
```

### ❌ Error: "role_id does not exist"
**Solución:** Los IDs de roles no coinciden
```sql
-- Verifica que los IDs de roles sean exactos:
SELECT id, name FROM roles;

-- Deberías ver:
-- f47ac10b-58cc-4372-a567-0e02b2c3d479 | SUPERADMIN
-- f47ac10b-58cc-4372-a567-0e02b2c3d480 | ADMIN
-- f47ac10b-58cc-4372-a567-0e02b2c3d481 | TECNICO
-- f47ac10b-58cc-4372-a567-0e02b2c3d482 | OPERADOR
```

### ❌ No puedo conectarme con psql
**Solución:** Verifica tu usuario y contraseña
```bash
# Test de conexión:
psql -U postgres -d postgres -c "SELECT 1;"

# Si funciona, entonces:
psql -U tu_usuario -d tu_base_datos -f src/migrations/insert-permissions-only.sql
```

---

## 📋 Archivos Disponibles

| Archivo | Para Qué |
|---------|----------|
| `insert-permissions-only.sql` | Terminal (psql) |
| `PERMISOS_COPIAR_PEGAR.sql` | pgAdmin / DBeaver |
| `PERMISOS_GUIA_RAPIDA.md` | Guía rápida |
| `PERMISOS_RESUMEN_FINAL.md` | Resumen general |

---

## ✨ ¡Listo!

Elige una opción arriba (1, 2 o 3) y ejecuta.

En segundos tendrás los 18 permisos insertados correctamente. 🎉

Si tienes dudas, revisa los archivos `.md` para más información.
