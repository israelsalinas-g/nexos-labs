export enum OrderStatus {
  PENDING = 'PENDING',              // Orden creada, esperando procesamiento
  IN_PROGRESS = 'IN_PROGRESS',      // Pruebas en procesamiento
  COMPLETED = 'COMPLETED',          // Todos los resultados disponibles
  CANCELLED = 'CANCELLED',          // Orden cancelada
  ON_HOLD = 'ON_HOLD'               // En espera (requiere acción)
}

export enum OrderPriority {
  LOW = 'LOW',                      // Resultado dentro de 48-72 horas
  NORMAL = 'NORMAL',               // Resultado dentro de 24 horas (por defecto)
  HIGH = 'HIGH',                   // Resultado dentro de 4-6 horas
  STAT = 'STAT'                    // Resultado dentro de 1 hora (crítico)
}
