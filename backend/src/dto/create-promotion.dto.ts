import {
  IsString, IsOptional, IsBoolean, IsNumber, IsArray,
  MinLength, MaxLength, Min, IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Nombre de la promoción', example: 'Promoción Día del Padre 2025', minLength: 2, maxLength: 200 })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Descripción de la promoción', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio de la promoción', example: 75.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Fecha de inicio de vigencia (YYYY-MM-DD)', example: '2025-06-01' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Fecha de fin de vigencia (YYYY-MM-DD)', example: '2025-06-30' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ description: 'Indica si la promoción está activa', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'IDs de pruebas individuales incluidas',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testIds?: string[];

  @ApiProperty({
    description: 'IDs de perfiles incluidos',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileIds?: string[];
}
