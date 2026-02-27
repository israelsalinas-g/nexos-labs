import { TestDefinition } from './test-definition.interface';
import { TestResponseOption } from './test-response-type.interface';

export interface UnifiedTestResult {
  id: number;
  orderTestId: number;
  testDefinitionId: number;
  testDefinition?: TestDefinition;

  // Resultado (solo uno tendrá valor)
  numericValue?: number | null;
  responseOptionId?: number | null;
  responseOption?: TestResponseOption | null;
  textValue?: string | null;

  isAbnormal?: boolean | null;
  notes?: string | null;
  enteredById?: string | null;
  enteredAt: string;
}

export interface CreateUnifiedTestResultDto {
  orderTestId: number;
  testDefinitionId: number;
  numericValue?: number;
  responseOptionId?: number;
  textValue?: string;
  isAbnormal?: boolean;
  notes?: string;
  enteredById?: string;
}

export interface UpdateUnifiedTestResultDto {
  numericValue?: number;
  responseOptionId?: number;
  textValue?: string;
  isAbnormal?: boolean;
  notes?: string;
}
