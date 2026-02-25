import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo resultado de prueba
 */
export class CreateTestResultDto {
  @ApiProperty({
    description: 'ID de la prueba ordenada (order_test)',
    example: 1,
  })
  @IsNumber()
  orderTestId: number;

  @ApiProperty({
    description: 'Valor del resultado (puede ser texto, número, etc.)',
    example: '1.2',
  })
  @IsString()
  resultValue: string;

  @ApiProperty({
    description: 'Valor numérico del resultado (si aplica)',
    example: 1.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  resultNumeric?: number;

  @ApiProperty({
    description: 'Rango de referencia para este paciente',
    example: '0.6-1.1 mg/dL',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiProperty({
    description: 'Indica si el resultado está fuera del rango normal',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;

  @ApiProperty({
    description: 'Indica si el resultado es crítico',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiProperty({
    description: 'Indicador de anormalidad (H=High, L=Low, N=Normal)',
    example: 'N',
    required: false,
  })
  @IsOptional()
  @IsString()
  abnormalFlag?: string;

  @ApiProperty({
    description: 'Fecha y hora en que se realizó la prueba',
    example: '2025-10-05T14:48:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  testedAt?: string;

  @ApiProperty({
    description: 'Técnico que realizó la prueba',
    example: 'Lic. María González',
    required: false,
  })
  @IsOptional()
  @IsString()
  testedBy?: string;

  @ApiProperty({
    description: 'Equipo o instrumento usado',
    example: 'Analizador Cobas 6000',
    required: false,
  })
  @IsOptional()
  @IsString()
  instrument?: string;

  @ApiProperty({
    description: 'Observaciones o notas',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    description: 'Datos adicionales en formato JSON',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
