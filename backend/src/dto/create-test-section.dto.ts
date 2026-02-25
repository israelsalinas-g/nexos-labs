import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestSectionDto {
  @ApiProperty({
    description: 'Nombre de la sección de examen',
    example: 'Química Sanguínea',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Código corto de la sección',
    example: 'QS',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Descripción de la sección',
    example: 'Exámenes relacionados con la química de la sangre',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Color para identificación visual en formato hexadecimal',
    example: '#4CAF50',
    required: false,
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe estar en formato hexadecimal (#RRGGBB)'
  })
  color?: string;

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
    description: 'Indica si la sección está activa',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
