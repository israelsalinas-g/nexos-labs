/**
 * Enum para la prioridad de una orden de laboratorio
 */
export enum OrderPriority {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  STAT = 'Stat'  // STAT = Inmediato (término médico para urgente crítico)
}

export const OrderPriorityLabels = {
  [OrderPriority.NORMAL]: 'Normal',
  [OrderPriority.URGENT]: 'Urgente',
  [OrderPriority.STAT]: 'STAT (Inmediato)'
};
