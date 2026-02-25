/**
 * Interfaz para acciones de confirmación en modales
 */
export interface ConfirmAction {
  title: string;
  message: string;
  action: () => void;
}
