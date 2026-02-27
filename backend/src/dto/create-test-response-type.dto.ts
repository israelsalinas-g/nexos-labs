import { IsString, IsOptional, IsBoolean, MaxLength, IsIn, ValidateNested, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTestResponseOptionDto {
  @ApiProperty({ description: 'Valor almacenado', example: 'Negativo' })
  @IsString()
  @MaxLength(100)
  value: string;

  @ApiProperty({ description: 'Etiqueta de visualización', example: 'Negativo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiProperty({ description: 'Orden de visualización', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Color hexadecimal', example: '#dc3545', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiProperty({ description: 'Si es valor por defecto', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateTestResponseTypeDto {
  @ApiProperty({ description: 'Nombre del tipo de respuesta', example: 'Negativo/Positivo' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Slug único (identificador programático)',
    example: 'positive_negative'
  })
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty({
    description: 'Tipo de entrada: numeric, text, enum',
    example: 'enum',
    enum: ['numeric', 'text', 'enum']
  })
  @IsIn(['numeric', 'text', 'enum'])
  inputType: string;

  @ApiProperty({ description: 'Descripción', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Opciones de respuesta (solo para inputType = enum)', type: [CreateTestResponseOptionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestResponseOptionDto)
  options?: CreateTestResponseOptionDto[];
}
