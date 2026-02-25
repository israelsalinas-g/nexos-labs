import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsObject } from 'class-validator';

export class CreateIChromaResultDto {
  @ApiProperty({
    description: 'Tipo de mensaje HL7',
    example: 'MSH',
    required: false,
  })
  @IsOptional()
  @IsString()
  messageType?: string;

  @ApiProperty({
    description: 'ID del dispositivo',
    example: '^~\\&',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({
    description: 'ID del paciente del sistema (FK)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({
    description: 'ID del paciente según iChroma II',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientIdIchroma2?: string;

  @ApiProperty({
    description: 'Nombre del paciente según iChroma II',
    example: 'josselyn caroli',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientNameIchroma2?: string;

  @ApiProperty({
    description: 'Edad del paciente según iChroma II',
    example: 26,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  patientAgeIchroma2?: number;

  @ApiProperty({
    description: 'Sexo del paciente según iChroma II',
    example: 'Femenino',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientSexIchroma2?: string;

  @ApiProperty({
    description: 'Código del tipo de test',
    example: 'SL033',
    required: false,
  })
  @IsOptional()
  @IsString()
  testType?: string;

  @ApiProperty({
    description: 'Nombre del test',
    example: 'Beta HCG',
    required: false,
  })
  @IsOptional()
  @IsString()
  testName?: string;

  @ApiProperty({
    description: 'Resultado del test',
    example: '< 5.00',
    required: false,
  })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({
    description: 'Unidad del resultado',
    example: 'mIU/mL',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Valor mínimo de referencia',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  referenceMin?: number;

  @ApiProperty({
    description: 'Valor máximo de referencia',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  referenceMax?: number;

  @ApiProperty({
    description: 'Serial del cartucho',
    example: 'T',
    required: false,
  })
  @IsOptional()
  @IsString()
  cartridgeSerial?: string;

  @ApiProperty({
    description: 'Lote del cartucho',
    example: '2.6',
    required: false,
  })
  @IsOptional()
  @IsString()
  cartridgeLot?: string;

  @ApiProperty({
    description: 'Humedad durante el test',
    example: 65.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  humidity?: number;

  @ApiProperty({
    description: 'Código de barras de la muestra',
    example: 'HCUGG05EX',
    required: false,
  })
  @IsOptional()
  @IsString()
  sampleBarcode?: string;

  @ApiProperty({
    description: 'Fecha y hora del test',
    example: '2025-09-27T14:41:32.709Z',
  })
  @IsDateString()
  testDate: string;

  @ApiProperty({
    description: 'Mensaje HL7 raw completo',
    example: 'MSH|^~\\&|1|ichroma2|SL033||20250207145457||OUL^R24^OUL_R24|1|T|2.6\\rPID||josselyn caroli|||||26|Femenino\\r...',
    required: false,
  })
  @IsOptional()
  @IsString()
  rawMessage?: string;

  @ApiProperty({
    description: 'Datos JSON originales del iChroma',
    example: {
      messageType: 'MSH',
      deviceId: '^~\\&',
      patientIdIchroma2: '1',
      patientNameIchroma2: 'ichroma2',
      testType: 'SL033'
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  rawData?: any;

  @ApiProperty({
    description: 'ID del instrumento',
    example: 'ICHROMA_II',
    required: false,
  })
  @IsOptional()
  @IsString()
  instrumentId?: string;

  @ApiProperty({
    description: 'Estado del procesamiento',
    example: 'processed',
    required: false,
  })
  @IsOptional()
  @IsString()
  processingStatus?: string;

  @ApiProperty({
    description: 'Notas técnicas del laboratorio',
    example: 'Test procesado correctamente',
    required: false,
  })
  @IsOptional()
  @IsString()
  technicalNotes?: string;
}