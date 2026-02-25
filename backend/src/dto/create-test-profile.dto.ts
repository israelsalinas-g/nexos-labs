import { IsString, IsOptional, IsBoolean, IsInt, IsArray, MinLength, MaxLength, Min, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestProfileDto {
  @ApiProperty({
    description: 'ID de la sección a la que pertenece',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  sectionId: string;

  @ApiProperty({
    description: 'Nombre del perfil',
    example: 'Curva de tolerancia a la glucosa',
    minLength: 2,
    maxLength: 150
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Código corto del perfil',
    example: 'CTG',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Descripción del perfil',
    example: 'Perfil que incluye mediciones de glucosa en diferentes tiempos',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'IDs de las pruebas que incluye este perfil',
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  testIds: string[];

  @ApiProperty({
    description: 'Costo del perfil (puede ser menor que la suma de las pruebas individuales)',
    example: 450.00,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 1,
    required: false,
    default: 0
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiProperty({
    description: 'Indica si el perfil está activo',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
