import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUrineTestDto } from './create-urine-test.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateUrineTestDto extends PartialType(CreateUrineTestDto) {
     @ApiProperty({ 
        description: 'ID del usuario que revisó el examen', 
        required: false,
        example: '550e8400-e29b-41d4-a716-446655440000'
      })
      @IsOptional()
      @IsUUID()
      reviewedById?: string;
}