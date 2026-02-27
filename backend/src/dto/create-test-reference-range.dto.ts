import { IsString, IsOptional, IsInt, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RangeGender } from '../entities/test-reference-range.entity';

export class CreateTestReferenceRangeDto {
  @ApiProperty({ description: 'ID de la prueba a la que aplica', example: 'uuid-de-la-prueba' })
  @IsString()
  testDefinitionId: string;

  @ApiProperty({ description: 'Sexo aplicable', enum: RangeGender, example: RangeGender.ANY })
  @IsEnum(RangeGender)
  gender: RangeGender;

  @ApiProperty({ description: 'Edad mínima en meses', example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  ageMinMonths?: number;

  @ApiProperty({ description: 'Edad máxima en meses (null = sin límite)', example: null, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  ageMaxMonths?: number;

  @ApiProperty({ description: 'Valor mínimo normal', example: 70.0, required: false })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiProperty({ description: 'Valor máximo normal', example: 110.0, required: false })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiProperty({ description: 'Rango textual de referencia', example: 'Negativo', required: false })
  @IsOptional()
  @IsString()
  textualRange?: string;

  @ApiProperty({ description: 'Interpretación del rango', example: 'Normal', required: false })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiProperty({ description: 'Unidad de medida para este rango', example: 'mg/dL', required: false })
  @IsOptional()
  @IsString()
  unit?: string;
}
