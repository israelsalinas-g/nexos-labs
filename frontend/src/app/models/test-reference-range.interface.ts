export type RangeGender = 'M' | 'F' | 'ANY';

export interface TestReferenceRange {
  id: number;
  testDefinitionId: string;
  gender: RangeGender;
  ageMinMonths: number;
  ageMaxMonths?: number;
  minValue?: number;
  maxValue?: number;
  textualRange?: string;
  interpretation?: string;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestReferenceRangeDto {
  testDefinitionId: string;
  gender: RangeGender;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  minValue?: number;
  maxValue?: number;
  textualRange?: string;
  interpretation?: string;
  unit?: string;
}

export interface UpdateTestReferenceRangeDto extends Partial<CreateTestReferenceRangeDto> {}
