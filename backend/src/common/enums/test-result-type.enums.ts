/**
 * Enum para los diferentes tipos de resultados que puede tener una prueba de laboratorio
 */
export enum TestResultType {
  /** Resultado numérico (ej: 120, 5.5) */
  NUMERIC = 'numeric',
  
  /** Texto libre */
  TEXT = 'text',
  
  /** Negativo/Positivo */
  POSITIVE_NEGATIVE = 'positive_negative',
  
  /** Negativo/Positivo con escala de 3 cruces (Positivo +, ++, +++) */
  POSITIVE_NEGATIVE_3PLUS = 'positive_negative_3plus',
  
  /** Negativo/Positivo con escala de 4 cruces (Positivo +, ++, +++, ++++) */
  POSITIVE_NEGATIVE_4PLUS = 'positive_negative_4plus',
  
  /** Escasa cantidad/Moderada cantidad/Abundante cantidad */
  ESCASA_MODERADA_ABUNDANTE = 'escasa_moderada_abundante',
  
  /** Escasa cantidad/Moderada cantidad/Abundante cantidad/No se observa */
  ESCASA_MODERADA_ABUNDANTE_AUSENTE = 'escasa_moderada_abundante_ausente',
  
  /** Reactivo/No reactivo (común en serología) */
  REACTIVE_NON_REACTIVE = 'reactive_non_reactive',
  
  /** Detectado/No detectado */
  DETECTED_NOT_DETECTED = 'detected_not_detected'
}

export const TestResultTypeLabels = {
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
