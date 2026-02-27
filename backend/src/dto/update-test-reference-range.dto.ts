import { PartialType } from '@nestjs/mapped-types';
import { CreateTestReferenceRangeDto } from './create-test-reference-range.dto';

export class UpdateTestReferenceRangeDto extends PartialType(CreateTestReferenceRangeDto) {}
