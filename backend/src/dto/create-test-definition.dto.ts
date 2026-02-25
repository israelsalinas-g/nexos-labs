import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsNumber, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TestResultType } from '../common/enums/test-result-type.enums';

export class CreateTestDefinitionDto {
  @ApiProperty({
    description: 'ID de la sección a la que pertenece',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  sectionId: string;

  @ApiProperty({
    description: 'Nombre de la prueba',
    example: 'Creatinina',
    minLength: 2,
    maxLength: 150
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Código corto de la prueba',
    example: 'CREAT',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Descripción de la prueba',
    example: 'Medición de creatinina sérica para evaluación de función renal',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo de resultado que produce esta prueba',
    enum: TestResultType,
    example: TestResultType.NUMERIC
  })
  @IsEnum(TestResultType)
  resultType: TestResultType;

  @ApiProperty({
    description: 'Unidad de medida (solo para resultados numéricos)',
    example: 'mg/dL',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({
    description: 'Rango o valores de referencia como texto libre',
    example: 'Hombres: 0.7-1.3 mg/dL, Mujeres: 0.6-1.1 mg/dL',
    required: false
  })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiProperty({
    description: 'Método de análisis utilizado',
    example: 'Espectrofotometría',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  method?: string;

  @ApiProperty({
    description: 'Tipo de muestra requerida',
    example: 'Suero',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sampleType?: string;

  @ApiProperty({
    description: 'Tiempo de procesamiento estimado en horas',
    example: 2,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  processingTime?: number;

  @ApiProperty({
    description: 'Costo de la prueba',
    example: 150.00,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Orden de visualización dentro de su sección',
    example: 1,
    required: false,
    default: 0
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiProperty({
    description: 'Indica si la prueba está activa',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
