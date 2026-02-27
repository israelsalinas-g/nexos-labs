import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTestResponseTypeDto } from './create-test-response-type.dto';

export class UpdateTestResponseTypeDto extends PartialType(CreateTestResponseTypeDto) {
  @ApiProperty({ description: 'Activar/desactivar el tipo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
