/**
 * Enum para los estados de una orden de laboratorio
 */
export enum OrderStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export const OrderStatusLabels = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.COMPLETED]: 'Completada',
  [OrderStatus.DELIVERED]: 'Entregada',
  [OrderStatus.CANCELLED]: 'Cancelada'
};
