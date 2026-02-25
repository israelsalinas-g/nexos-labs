import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLaboratoryOrderDto } from './create-laboratory-order.dto';

export class UpdateLaboratoryOrderDto extends PartialType(
  OmitType(CreateLaboratoryOrderDto, [] as const)
) {}