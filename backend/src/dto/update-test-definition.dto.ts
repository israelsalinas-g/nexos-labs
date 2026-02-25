import { PartialType } from '@nestjs/swagger';
import { CreateTestDefinitionDto } from './create-test-definition.dto';

export class UpdateTestDefinitionDto extends PartialType(CreateTestDefinitionDto) {}
