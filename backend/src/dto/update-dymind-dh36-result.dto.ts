import { PartialType } from '@nestjs/mapped-types';
import { CreateDymindDh36ResultDto } from './create-dymind-dh36-result.dto';

export class UpdateDymindDh36ResultDto extends PartialType(CreateDymindDh36ResultDto) {}