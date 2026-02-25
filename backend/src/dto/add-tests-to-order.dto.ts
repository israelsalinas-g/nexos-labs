import { IsUUID, IsArray, IsOptional, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para agregar una prueba individual a una orden
 */
export class AddTestItemDto {
  @ApiProperty({
    description: 'ID de la definición de prueba (para pruebas individuales)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  testDefinitionId?: string;

  @ApiProperty({
    description: 'ID del perfil de pruebas (automáticamente expande a sus pruebas)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false
  })
  @IsOptional()
  @IsUUID()
  testProfileId?: string;

  @ApiProperty({
    description: 'Cantidad de veces que se realiza esta prueba',
    example: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  quantity?: number = 1;
}

/**
 * DTO para agregar múltiples pruebas (individuales y/o perfiles) a una orden
 */
export class AddTestsToOrderDto {
  @ApiProperty({
    description: 'Array de pruebas a agregar (TestDefinitions y/o TestProfiles)',
    type: [AddTestItemDto],
    example: [
      {
        testDefinitionId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 1
      },
      {
        testProfileId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddTestItemDto)
  tests: AddTestItemDto[];

  @ApiProperty({
    description: 'Número de muestra base (se generará un ID único si no se proporciona)',
    example: 'M-2025-001234',
    required: false
  })
  @IsOptional()
  @IsString()
  sampleNumberBase?: string;

  @ApiProperty({
    description: 'Técnico que tomó la muestra',
    example: 'Lic. María González',
    required: false
  })
  @IsOptional()
  @IsString()
  collectedBy?: string;

  @ApiProperty({
    description: 'Metadatos adicionales',
    example: { tubeType: 'EDTA', volume: '5mL' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
