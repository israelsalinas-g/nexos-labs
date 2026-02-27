import { IsInt, IsOptional, IsNumber, IsBoolean, IsString, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnifiedTestResultDto {
  @ApiProperty({ description: 'ID de la prueba en la orden (order_tests.id)', example: 42 })
  @IsInt()
  orderTestId: number;

  @ApiProperty({ description: 'ID de la definición de prueba', example: 10 })
  @IsInt()
  testDefinitionId: number;

  @ApiProperty({ description: 'Valor numérico (para pruebas numéricas)', example: 98.5, required: false })
  @IsOptional()
  @IsNumber()
  numericValue?: number;

  @ApiProperty({ description: 'ID de la opción de respuesta (para pruebas enum)', example: 3, required: false })
  @IsOptional()
  @IsInt()
  responseOptionId?: number;

  @ApiProperty({ description: 'Resultado textual (para pruebas de texto libre)', required: false })
  @IsOptional()
  @IsString()
  textValue?: string;

  @ApiProperty({ description: 'Marcar manualmente como anormal (opcional, se calcula automáticamente si es numérico)', required: false })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;

  @ApiProperty({ description: 'Notas adicionales del técnico', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'ID del usuario que registra el resultado (UUID)', required: false })
  @IsOptional()
  @IsUUID()
  enteredById?: string;
}

export class UpdateUnifiedTestResultDto {
  @IsOptional() @IsNumber() numericValue?: number;
  @IsOptional() @IsInt() responseOptionId?: number;
  @IsOptional() @IsString() textValue?: string;
  @IsOptional() @IsBoolean() isAbnormal?: boolean;
  @IsOptional() @IsString() notes?: string;
}
