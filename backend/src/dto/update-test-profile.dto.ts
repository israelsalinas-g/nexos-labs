import { PartialType } from '@nestjs/swagger';
import { CreateTestProfileDto } from './create-test-profile.dto';

export class UpdateTestProfileDto extends PartialType(CreateTestProfileDto) {}
