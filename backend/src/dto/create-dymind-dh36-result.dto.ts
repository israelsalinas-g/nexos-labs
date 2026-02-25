import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TestParameter {
  @ApiProperty({ description: 'Nombre del parámetro' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Resultado del parámetro' })
  @IsString()
  result: string;

  @ApiProperty({ description: 'Unidad de medida' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Valor de referencia' })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiProperty({ description: 'Estado del resultado (normal, alto, bajo)' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateDymindDh36ResultDto {
  @ApiProperty({ description: 'Número de muestra', required: true })
  @IsString()
  sampleNumber: string;

  @ApiProperty({ description: 'Modo de análisis', required: true, default: 'Automated Count' })
  @IsString()
  analysisMode: string = 'Automated Count';

  @ApiProperty({ description: 'Fecha del test' })
  @IsDateString()
  @IsOptional()
  testDate?: string;

  @ApiProperty({ description: 'Datos crudos del equipo' })
  @IsString()
  @IsOptional()
  rawData?: string;

  @ApiProperty({ description: 'ID del paciente' })
  @IsString()
  @IsOptional()
  patientIdDymind?: string;

  @IsOptional()
  @IsString()
  patientNameDymind?: string;

  @IsOptional()
  @IsNumber()
  patientAgeDymind?: number;

  @IsOptional()
  @IsString()
  patientSexDymind?: string;

  @IsOptional()
  @IsString()
  referenceGroupDymind?: string;
  
  @ApiProperty({ description: 'ID del equipo', default: 'DYMIND_DH36' })
  @IsString()
  @IsOptional()
  instrumentId?: string;

  @ApiProperty({ description: 'Parámetros del análisis', type: [TestParameter] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestParameter)
  parameters: TestParameter[] = [];

  @ApiProperty({ description: 'Datos de gráficos en base64', required: false })
  @IsOptional()
  @IsArray()
  graphs?: string[];

  @ApiProperty({ description: 'Usuario que realizó el análisis' })
  @IsOptional()
  @IsString()
  operator?: string;
}
