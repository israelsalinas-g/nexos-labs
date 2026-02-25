import { TestStatus } from '../enums/test-status.enums';

export interface OrderTest {
  // Identificadores
  id: number;                                    // ID secuencial
  orderId: string;                               // Referencia a LaboratoryOrder
  testDefinitionId: number;                      // Referencia a TestDefinition

  // Información de la muestra
  sampleNumber?: string;                         // ej: S-2025-550e8400-001
  sampleCollectedAt?: Date;                      // Cuándo se tomó la muestra
  collectedBy?: string;                          // Quién tomó la muestra

  // Estado
  status: TestStatus;                            // PENDING, IN_PROGRESS, COMPLETED, FAILED, RETESTING

  // Auditoría
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  result?: any;                                  // TestResult asociado
  testDefinition?: any;                          // TestDefinition información
}
