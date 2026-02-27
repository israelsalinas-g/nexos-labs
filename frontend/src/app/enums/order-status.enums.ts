// Valores deben coincidir con el enum de PostgreSQL del backend
export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  IN_PROCESS = 'InProcess',
  COMPLETED = 'Completed',
  BILLED = 'Billed',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.PAID]: 'Pagada',
  [OrderStatus.IN_PROCESS]: 'En Proceso',
  [OrderStatus.COMPLETED]: 'Completada',
  [OrderStatus.BILLED]: 'Facturada',
  [OrderStatus.DELIVERED]: 'Entregada',
  [OrderStatus.CANCELLED]: 'Cancelada',
};

export enum OrderPriority {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  STAT = 'Stat',
}

export const OrderPriorityLabels: Record<OrderPriority, string> = {
  [OrderPriority.NORMAL]: 'Normal',
  [OrderPriority.URGENT]: 'Urgente',
  [OrderPriority.STAT]: 'STAT (Inmediato)',
};
