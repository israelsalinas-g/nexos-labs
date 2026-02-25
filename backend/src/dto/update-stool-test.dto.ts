import { PartialType } from '@nestjs/swagger';
import { CreateStoolTestDto } from './create-stool-test.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator';

export class UpdateStoolTestDto extends PartialType(CreateStoolTestDto) {
  
  @ApiProperty({ 
    description: 'ID del usuario que revisó el examen',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  reviewedById?: string;
}