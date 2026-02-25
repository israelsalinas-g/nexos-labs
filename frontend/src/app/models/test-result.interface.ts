export interface TestResult {
  // Identificadores
  id: number;
  orderTestId: number;                           // Referencia a OrderTest

  // Resultado según tipo
  resultValue?: string;                          // Resultado en texto (TEXT, POSITIVE, etc)
  resultNumeric?: number;                        // Resultado numérico
  referenceRange?: string;                       // Rango de referencia (ej: 4.0-10.0)
  sampleNumber?: string;                         // Número de muestra asociado

  // Análisis de resultados
  isAbnormal: boolean;                           // ¿Fuera del rango normal?
  isCritical: boolean;                           // ¿Resultado crítico?
  observations?: string;                         // Observaciones del laboratorista

  // Auditoría de procesamiento
  testedAt?: Date;                               // Cuándo se realizó la prueba
  testedBy?: string;                             // Técnico que realizó la prueba
  validatedAt?: Date;                            // Cuándo se validó el resultado
  validatedBy?: string;                          // Profesional que validó

  // Auditoría
  createdAt: Date;
  updatedAt: Date;

  // Relación
  orderTest?: any;                               // OrderTest información
}

export interface CreateTestResultDto {
  orderTestId: number;               // ID de OrderTest (requerido)
  resultValue?: string;              // Resultado textual
  resultNumeric?: number;            // Resultado numérico
  referenceRange?: string;           // Rango normal (ej: 4.0-10.0)
  isAbnormal?: boolean;              // ¿Valor anormal?
  isCritical?: boolean;              // ¿Valor crítico?
  observations?: string;             // Notas del laboratorista
  testedBy?: string;                 // Quién realizó la prueba
  testedAt?: Date;                   // Cuándo se realizó
}

export interface UpdateTestResultDto {
  resultValue?: string;
  resultNumeric?: number;
  referenceRange?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
  observations?: string;
  validatedBy?: string;              // Quien valida el resultado
  validatedAt?: Date;                // Cuándo se validó
}
