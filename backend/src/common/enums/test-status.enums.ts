export enum TestStatus {
  PENDING = 'EN PROCESO',         // Examen registrado pero no procesado
  COMPLETED = 'COMPLETADO',     // Examen completado, pendiente de revisión
  CANCELLED = 'CANCELADO'     // Examen cancelado/anulado
}

// Para usar con @ApiProperty en los DTOs y entidades
export const TestStatusDescription = {
  PENDING: 'Examen pendiente de procesar',
  COMPLETED: 'Examen completado, pendiente de revisión médica',
  CANCELLED: 'Examen cancelado o anulado'
};

// Para usar con Swagger
export const TestStatusExample = {
  description: 'Estado actual del examen',
  enum: TestStatus,
  example: TestStatus.PENDING,
  default: TestStatus.PENDING
};