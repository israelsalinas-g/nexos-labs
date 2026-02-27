# Guía de Migración — NEXOS Labs v1.0

## Contexto

Este proyecto usa `synchronize: true` en TypeORM, por lo que **las tablas nuevas y
columnas nuevas se crean automáticamente al iniciar la aplicación**. Los scripts de
migración en este directorio son exclusivamente de **datos** (backfill/seed).

---

## Orden de Ejecución

### Paso 0 — Levantar la aplicación con seed

```bash
SEED_INITIAL_DATA=true npm run start:dev
```

Esto ejecuta automáticamente `SeedResponseTypes` (`OnModuleInit`) que:
- Crea las tablas: `test_response_types`, `test_response_options`,
  `test_reference_ranges`, `unified_test_results` (via synchronize)
- Inserta los **14 tipos de respuesta** predefinidos con sus opciones

Verifica que el seed corrió:
```sql
SELECT slug, name FROM test_response_types ORDER BY id;
-- Debe retornar 14 filas
```

---

### M-01 ✅ — test_response_types + test_response_options

**Manejado por:** `seed/seed.response-types.ts` (automático con `SEED_INITIAL_DATA=true`)

Tipos creados:
| slug | Descripción |
|------|-------------|
| `numeric` | Resultado numérico con unidades |
| `text` | Texto libre |
| `positive_negative` | Negativo / Positivo |
| `positive_negative_3plus` | Negativo / Positivo con 3 cruces |
| `positive_negative_4plus` | Negativo / Positivo con 4 cruces |
| `escasa_moderada_abundante` | Escala de cantidad (3 niveles) |
| `escasa_moderada_abundante_ausente` | Escala de cantidad + No se observa |
| `reactive_non_reactive` | Reactivo / No reactivo |
| `detected_not_detected` | Detectado / No detectado |
| `reactive_1_256` | Titulación serológica 1:2 a 1:256 |
| `negative200_positive12800` | Titulación 200–12800 IU/mL |
| `negative6_positive3072` | Titulación 6–3072 IU/mL (ASO) |
| `negative8_positive1024` | Titulación 8–1024 IU/mL (FR) |
| `urine_culture_colonies` | Colonias urocultivo UFC/ml |

---

### M-02 — Backfill response_type_id en test_definitions

**Script:** `M-02-backfill-response-type-id.sql`

Asigna el FK `response_type_id` en cada `test_definition` basándose en el
valor actual del enum `result_type`. Los slugs coinciden 1:1 con los valores
del enum `TestResultType`.

```bash
# Ejecutar en PostgreSQL (psql, pgAdmin, DBeaver, etc.)
psql -U nexos -d nexos_labs -f src/migrations/M-02-backfill-response-type-id.sql
```

**Prerequisito:** Paso 0 (seed de tipos de respuesta) completado.

**Resultado esperado:** Todas las filas de `test_definitions` tienen
`response_type_id IS NOT NULL`.

---

### M-03 ✅ — test_reference_ranges

**Manejado por:** TypeORM synchronize (tabla auto-creada al arrancar)

No requiere datos iniciales. Los rangos se configuran desde la UI en
`/test-definitions` → pestaña **Rangos** de cada prueba.

---

### M-04 ✅ — promotions + promotion_tests + promotion_profiles

**Manejado por:** TypeORM synchronize (tablas auto-creadas al arrancar)

Para seed de datos de ejemplo de promociones, ver
`seed/seed.promotions.ts` (Fase 2).

---

### M-05 ✅ — unified_test_results

**Manejado por:** TypeORM synchronize (tabla auto-creada al arrancar)

Nueva captura de resultados usa esta tabla directamente.
Coexiste con `test_results` (tabla legada).

---

### M-06 — Backfill unified_test_results desde test_results

**Script:** `M-06-backfill-unified-test-results.sql`

Copia todos los resultados legados de `test_results` a `unified_test_results`
para unificar el historial de pacientes.

```bash
psql -U nexos -d nexos_labs -f src/migrations/M-06-backfill-unified-test-results.sql
```

**Prerequisito:** M-05 (tabla existe, garantizada por arrancar la app).

**Nota sobre `response_option_id`:** Los resultados backfilleados quedan con
`response_option_id = NULL` porque `test_results.result_value` es texto libre
y no hay mapeo automático hacia `test_response_options`. Esto es aceptable:
el historial legado muestra el valor textual, no la opción seleccionada.

---

## Resumen de Estado por Entorno

| Entorno | M-01 | M-02 | M-03 | M-04 | M-05 | M-06 |
|---------|------|------|------|------|------|------|
| Dev nuevo (sin datos) | Auto ✅ | No aplica | Auto ✅ | Auto ✅ | Auto ✅ | No aplica |
| Dev con datos existentes | Auto ✅ | **Ejecutar** | Auto ✅ | Auto ✅ | Auto ✅ | **Ejecutar** |
| Producción | Auto ✅ | **Ejecutar** | Auto ✅ | Auto ✅ | Auto ✅ | **Ejecutar** |

---

## Rollback

### Deshacer M-02

```sql
-- Limpiar response_type_id (no elimina datos de test_definitions)
UPDATE test_definitions SET response_type_id = NULL;
```

### Deshacer M-06

```sql
-- Eliminar sólo los registros backfilleados (los que tienen notes 'Referencia:...'
-- o que coinciden con un order_test_id de test_results)
DELETE FROM unified_test_results
WHERE order_test_id IN (SELECT order_test_id FROM test_results);
```

---

## Verificación Final

```sql
-- 1. Todos los test_definitions tienen response_type
SELECT COUNT(*) AS sin_tipo
FROM test_definitions
WHERE response_type_id IS NULL AND is_active = true;
-- Esperado: 0

-- 2. unified_test_results tiene los mismos registros que test_results
SELECT
  (SELECT COUNT(*) FROM test_results) AS legados,
  (SELECT COUNT(*) FROM unified_test_results) AS unificados;
-- Esperado: unificados >= legados

-- 3. Tipos de respuesta completos
SELECT COUNT(*) FROM test_response_types;
-- Esperado: 14
```
