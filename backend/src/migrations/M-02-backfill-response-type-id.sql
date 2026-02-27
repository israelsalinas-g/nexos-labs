-- =============================================================================
-- M-02: Backfill response_type_id en test_definitions
-- =============================================================================
-- Propósito: Asignar el FK response_type_id en cada test_definition
--            basándose en el valor actual de la columna result_type (enum).
--
-- Prerequisito: Haber ejecutado el seed de test_response_types
--               (arrancar la app con SEED_INITIAL_DATA=true al menos una vez).
--
-- Seguro para re-ejecutar: sí (WHERE response_type_id IS NULL).
-- =============================================================================

-- ── Paso 1: Verificar que el seed de tipos de respuesta ya fue ejecutado ─────
DO $$
DECLARE
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM test_response_types;
  IF cnt = 0 THEN
    RAISE EXCEPTION 'La tabla test_response_types está vacía. '
      'Ejecuta primero: SEED_INITIAL_DATA=true npm run start:dev';
  END IF;
  RAISE NOTICE '✓ test_response_types tiene % registros', cnt;
END $$;

-- ── Paso 2: Mapear result_type → response_type_id ────────────────────────────
-- Los slugs de test_response_types coinciden 1:1 con los valores del enum
-- TestResultType (columna result_type). El cast a text es necesario porque
-- result_type es un tipo enum de PostgreSQL.

UPDATE test_definitions td
SET response_type_id = rt.id
FROM test_response_types rt
WHERE rt.slug = td.result_type::text
  AND td.response_type_id IS NULL;

-- ── Paso 3: Verificar cobertura ───────────────────────────────────────────────
SELECT
  result_type,
  COUNT(*)                                        AS total,
  COUNT(response_type_id)                         AS mapeados,
  COUNT(*) - COUNT(response_type_id)              AS sin_mapear
FROM test_definitions
GROUP BY result_type
ORDER BY result_type;

-- ── Paso 4 (opcional): Mostrar pruebas sin mapear ────────────────────────────
-- Si alguna fila queda sin mapear es porque su result_type no tiene slug
-- equivalente en test_response_types. Añadir el tipo faltante y re-ejecutar.
SELECT id, name, code, result_type
FROM test_definitions
WHERE response_type_id IS NULL
ORDER BY name;
