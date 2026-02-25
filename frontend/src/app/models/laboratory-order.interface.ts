import { OrderStatus, OrderPriority } from '../enums/order-status.enums';

export interface LaboratoryOrder {
  // Identificadores
  id: string;                                    // UUID único
  orderNumber: string;                           // ORD-2025-000001

  // Relaciones
  patientId: string;                             // Referencia al paciente
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
  };

  doctorId?: string;                             // Doctor que ordena
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  // Detalles de la orden
  clinicalIndication?: string;                   // Motivo/Indicación clínica
  notes?: string;                                // Notas adicionales

  status: OrderStatus;                           // Estado actual
  priority: OrderPriority;                       // Prioridad de procesamiento

  // Fechas
  orderDate: Date;                               // Fecha de creación
  updatedAt: Date;
  completedAt?: Date;                            // Fecha de finalización

  // Relación con pruebas
  tests?: any[];                                 // Pruebas asociadas
}

export interface CreateLaboratoryOrderDto {
  patientId: string;
  doctorId?: string;
  clinicalIndication?: string;
  notes?: string;
  priority?: OrderPriority;
}

export interface UpdateLaboratoryOrderDto {
  clinicalIndication?: string;
  notes?: string;
  priority?: OrderPriority;
  status?: OrderStatus;
}

export interface AddTestItemDto {
  testDefinitionId?: string;         // ID de prueba individual
  testProfileId?: string;            // ID de perfil
  quantity?: number;                 // Cantidad de veces a repetir
}

export interface AddTestsToOrderDto {
  tests: AddTestItemDto[];           // Array de pruebas/perfiles
  sampleNumberBase?: string;         // Prefijo personalizado para muestra
  collectedBy?: string;              // Nombre del técnico
  metadata?: any;                    // Datos adicionales
}

