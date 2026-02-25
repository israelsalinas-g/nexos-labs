# 🎉 SOLUCIÓN LISTA: Insertar 18 Permisos

## 📊 Tu Situación Actual

```
✅ ROLES (4)
├── SUPERADMIN: f47ac10b-58cc-4372-a567-0e02b2c3d479
├── ADMIN:      f47ac10b-58cc-4372-a567-0e02b2c3d480
├── TECNICO:    f47ac10b-58cc-4372-a567-0e02b2c3d481
└── OPERADOR:   f47ac10b-58cc-4372-a567-0e02b2c3d482

✅ USUARIO (1)
└── superadmin / admin123 (SUPERADMIN)

⏳ PERMISOS (18) ← AQUÍ ESTAMOS
```

---

## 🚀 LA SOLUCIÓN MÁS SIMPLE

### Opción 1: Una línea en PowerShell ⚡

```powershell
psql -U postgres -d lab_db -f src/migrations/insert-permissions-only.sql
```

*(Reemplaza `postgres`, `lab_db` con tus datos)*

**Listo. Fin.**

---

### Opción 2: Copiar y Pegar en pgAdmin

1. Abre: `PERMISOS_COPIAR_PEGAR.sql`
2. Copia TODO
3. Pégalo en pgAdmin Query Tool
4. Ejecuta
5. Listo

---

## 📁 Archivos Generados

| Archivo | Contenido |
|---------|-----------|
| ✅ `insert-permissions-only.sql` | Script completo con comentarios |
| ✅ `PERMISOS_COPIAR_PEGAR.sql` | SQL puro (sin comentarios) |
| ✅ `INSTRUCCIONES_PASO_A_PASO.md` | Paso a paso detallado |
| ✅ `PERMISOS_GUIA_RAPIDA.md` | Guía de referencia rápida |
| ✅ `PERMISOS_RESUMEN_FINAL.md` | Resumen y checklist |

---

## 🔢 Qué Se Insertará

```
SUPERADMIN (10 permisos)
  ├── users:create, read, update, delete
  ├── roles:create, read, update, delete
  └── lab:read, write

ADMIN (5 permisos)
  ├── users:read, update
  ├── roles:read
  └── lab:read, write

TECNICO (2 permisos)
  └── lab:read, write

OPERADOR (1 permiso)
  └── lab:read
```

---

## ✅ Después de Ejecutar

Verás:
```
INSERT 0 10
INSERT 0 5
INSERT 0 2
INSERT 0 1
```

Y una tabla de resumen:
```
    rol    | cantidad_permisos
-----------+------------------
 SUPERADMIN|               10
 ADMIN     |                5
 TECNICO   |                2
 OPERADOR  |                1
```

---

## 🎯 Próximos Pasos

1. ✅ Ejecuta el script de permisos
2. ✅ Verifica: `SELECT COUNT(*) FROM permissions;` (debe ser 18)
3. ✅ Inicia el servidor: `npm run start:dev`
4. ✅ Haz login con superadmin/admin123
5. ✅ ¡Usa el API!

---

## 🔐 Test Rápido

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"superadmin\",\"password\":\"admin123\"}"

# Copiar el accessToken de la respuesta y luego:

# Ver usuario actual
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Listar roles
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer <accessToken>"
```

---

## ⚡ TL;DR (Versión Súper Corta)

```powershell
psql -U postgres -d lab_db -f src/migrations/insert-permissions-only.sql
```

Cambia `postgres` y `lab_db` por tus datos. ✨

---

**¡Los permisos están listos! 🚀**

Elige tu método favorito arriba y ejecuta.

Si necesitas ayuda, revisa `INSTRUCCIONES_PASO_A_PASO.md`.
