/**
 * Enum para los estados de una orden de laboratorio
 */
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
