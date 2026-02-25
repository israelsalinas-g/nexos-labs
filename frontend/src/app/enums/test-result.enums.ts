export enum TestResultStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified'
}

export const TEST_RESULT_STATUS_LABELS: Record<TestResultStatus, string> = {
  [TestResultStatus.PENDING]: 'Pendiente',
  [TestResultStatus.IN_PROGRESS]: 'En Progreso',
  [TestResultStatus.COMPLETED]: 'Completado',
  [TestResultStatus.VERIFIED]: 'Verificado'
};
