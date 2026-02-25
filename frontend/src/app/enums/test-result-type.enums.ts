export enum TestResultType {
  // Resultados cuantitativos
  NUMERIC = 'numeric',                          // Valor numérico (ej: 8.5)
  
  // Resultados cualitativos
  TEXT = 'text',                                // Texto libre
  POSITIVE_NEGATIVE = 'positive_negative',      // Positivo/Negativo
  POSITIVE_NEGATIVE_3PLUS = 'positive_negative_3plus',    // -, +, ++, +++
  POSITIVE_NEGATIVE_4PLUS = 'positive_negative_4plus',    // -, +, ++, +++, ++++
  ESCASA_MODERADA_ABUNDANTE = 'escasa_moderada_abundante', // Escasa/Moderada/Abundante
  ESCASA_MODERADA_ABUNDANTE_AUSENTE = 'escasa_moderada_abundante_ausente', // Escasa/Moderada/Abundante/Ausente
  REACTIVE_NON_REACTIVE = 'reactive_non_reactive',        // Reactivo/No Reactivo
  DETECTED_NOT_DETECTED = 'detected_not_detected'         // Detectado/No Detectado
}

export const TEST_RESULT_TYPE_LABELS: Record<TestResultType, string> = {
  [TestResultType.NUMERIC]: 'Numérico',
  [TestResultType.TEXT]: 'Texto libre',
  [TestResultType.POSITIVE_NEGATIVE]: 'Negativo/Positivo',
  [TestResultType.POSITIVE_NEGATIVE_3PLUS]: 'Negativo/Positivo (3+)',
  [TestResultType.POSITIVE_NEGATIVE_4PLUS]: 'Negativo/Positivo (4+)',
  [TestResultType.ESCASA_MODERADA_ABUNDANTE]: 'Escasa/Moderada/Abundante',
  [TestResultType.ESCASA_MODERADA_ABUNDANTE_AUSENTE]: 'Escasa/Moderada/Abundante/Ausente',
  [TestResultType.REACTIVE_NON_REACTIVE]: 'Reactivo/No reactivo',
  [TestResultType.DETECTED_NOT_DETECTED]: 'Detectado/No detectado'
};
