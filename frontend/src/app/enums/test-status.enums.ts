export enum TestStatus {
  PENDING = 'PENDING',              // Esperando ser procesada
  IN_PROGRESS = 'IN_PROGRESS',      // En procesamiento en el equipo
  COMPLETED = 'COMPLETED',          // Resultado disponible
  FAILED = 'FAILED',                // Error en el procesamiento
  RETESTING = 'RETESTING'           // Se requiere re-prueba
}

// Para usar con @ApiProperty en los DTOs y entidades
export const TestStatusDescription = {
  PENDING: 'Prueba esperando ser procesada',
  IN_PROGRESS: 'Prueba en procesamiento en el equipo',
  COMPLETED: 'Prueba completada, resultado disponible',
  FAILED: 'Error en el procesamiento de la prueba',
  RETESTING: 'Se requiere re-prueba'
};

// Para usar con Swagger
export const TestStatusExample = {
  description: 'Estado actual del examen',
  enum: TestStatus,
  example: TestStatus.PENDING,
  default: TestStatus.PENDING
};