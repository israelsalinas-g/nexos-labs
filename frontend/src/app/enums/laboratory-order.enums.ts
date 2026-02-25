export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat'
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.IN_PROGRESS]: 'En Progreso',
  [OrderStatus.COMPLETED]: 'Completado',
  [OrderStatus.CANCELLED]: 'Cancelado'
};

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  [OrderPriority.ROUTINE]: 'Rutina',
  [OrderPriority.URGENT]: 'Urgente',
  [OrderPriority.STAT]: 'STAT (Inmediato)'
};
