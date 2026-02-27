export interface TestResponseOption {
  id?: number;
  value: string;
  label?: string;
  displayOrder: number;
  color?: string;
  isDefault?: boolean;
}

export interface TestResponseType {
  id: number;
  name: string;
  slug: string;
  inputType: 'numeric' | 'text' | 'enum';
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  options: TestResponseOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestResponseTypeDto {
  name: string;
  slug: string;
  inputType: 'numeric' | 'text' | 'enum';
  description?: string;
  options?: Omit<TestResponseOption, 'id'>[];
}

export interface UpdateTestResponseTypeDto extends Partial<CreateTestResponseTypeDto> {
  isActive?: boolean;
}
