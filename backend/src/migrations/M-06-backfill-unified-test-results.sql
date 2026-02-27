-- =============================================================================
-- M-06: Backfill unified_test_results desde test_results (legados)
-- =============================================================================
-- Propósito: Copiar todos los resultados existentes en test_results
--            a la nueva tabla unified_test_results.
--            Nueva captura usará unified_test_results directamente.
--
-- Estrategia de valor:
--   • Si result_numeric IS NOT NULL  → numeric_value   (resultado numérico)
--   • Si result_numeric IS NULL      → text_value      (resultado textual)
--   • response_option_id siempre NULL (no hay mapeo automático para enum)
--
-- Seguro para re-ejecutar: sí (WHERE NOT EXISTS evita duplicados).
-- =============================================================================

-- ── Paso 1: Mostrar resumen antes del backfill ────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM test_results)         AS resultados_legados,
  (SELECT COUNT(*) FROM unified_test_results) AS resultados_unificados_actuales;

-- ── Paso 2: Copiar de test_results → unified_test_results ────────────────────
INSERT INTO unified_test_results (
  order_test_id,
  test_definition_id,
  numeric_value,
  text_value,
  is_abnormal,
  notes,
  entered_at
)
SELECT
  tr.order_test_id,
  ot.test_definition_id,
  -- Valor numérico cuando existe
  tr.result_numeric,
  -- Valor textual sólo cuando no hay numérico
  CASE
    WHEN tr.result_numeric IS NULL THEN tr.result_value
    ELSE NULL
  END                                             AS text_value,
  tr.is_abnormal,
  -- Combinar referencia y observaciones como notas
  CASE
    WHEN tr.reference_range IS NOT NULL AND tr.observations IS NOT NULL
      THEN 'Referencia: ' || tr.reference_range || ' | ' || tr.observations
    WHEN tr.reference_range IS NOT NULL
      THEN 'Referencia: ' || tr.reference_range
    ELSE tr.observations
  END                                             AS notes,
  tr.tested_at                                    AS entered_at
FROM test_results tr
INNER JOIN order_tests ot ON ot.id = tr.order_test_id
WHERE NOT EXISTS (
  SELECT 1
  FROM unified_test_results utr
  WHERE utr.order_test_id = tr.order_test_id
);

-- ── Paso 3: Verificar resultado ───────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM test_results)                         AS legados,
  (SELECT COUNT(*) FROM unified_test_results)                 AS unificados,
  (SELECT COUNT(*) FROM unified_test_results WHERE numeric_value IS NOT NULL)
                                                              AS con_valor_numerico,
  (SELECT COUNT(*) FROM unified_test_results WHERE text_value IS NOT NULL
    AND numeric_value IS NULL)                                AS con_valor_textual,
  (SELECT COUNT(*) FROM unified_test_results WHERE is_abnormal = true)
                                                              AS anormales;
