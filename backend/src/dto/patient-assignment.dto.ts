import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignPatientDto {
  @ApiProperty({
    description: 'ID del paciente a asignar al resultado',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  patientId: string;

  @ApiProperty({
    description: 'Notas opcionales del técnico sobre la asignación',
    example: 'Nombre verificado con documento de identidad',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notes?: string;
}

export class UnifiedTestHistoryDto {
  @ApiProperty({
    description: 'ID único del examen (varía según la tabla de origen)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'ID del paciente asignado',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true
  })
  patientId: string | null;

  @ApiProperty({
    description: 'Nombre del paciente como aparece en el resultado',
    example: 'fanny ayuno'
  })
  patientName: string;

  @ApiProperty({
    description: 'Fecha y hora en que se realizó el examen',
    example: '2025-02-08T11:20:05.000Z'
  })
  testDate: Date;

  @ApiProperty({
    description: 'Número o código de la muestra',
    example: 'INVAA12',
    nullable: true
  })
  sampleNumber: string | null;

  @ApiProperty({
    description: 'Nombre del tipo de examen realizado',
    example: 'Insulin'
  })
  testName: string;

  @ApiProperty({
    description: 'Tipo de sistema que generó el resultado',
    enum: ['DH36', 'ICHROMA', 'URINE', 'HECES'],
    example: 'ICHROMA'
  })
  testType: 'DH36' | 'ICHROMA' | 'URINE' | 'HECES';

  @ApiProperty({
    description: 'Estado actual del resultado',
    example: 'assigned'
  })
  status: string;

  @ApiProperty({
    description: 'Tabla de origen del resultado',
    enum: ['dymind_dh36_results', 'ichroma_results', 'urine_tests', 'stool_tests'],
    example: 'ichroma_results'
  })
  sourceTable: 'dymind_dh36_results' | 'ichroma_results' | 'urine_tests' | 'stool_tests';

  @ApiProperty({
    description: 'Resultado del examen (si está disponible)',
    example: '41.88 uIU/ml',
    nullable: true
  })
  result?: string | null;

  @ApiProperty({
    description: 'Fecha de asignación del paciente',
    example: '2025-02-08T15:30:00.000Z',
    nullable: true
  })
  assignedAt?: Date | null;

  @ApiProperty({
    description: 'Usuario que realizó la asignación',
    example: 'tecnico01',
    nullable: true
  })
  assignedBy?: string | null;
}

export class UnassignedResultDto {
  @ApiProperty({
    description: 'ID único del resultado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del paciente como aparece en el resultado del equipo',
    example: 'fanny ayuno'
  })
  patientName: string;

  @ApiProperty({
    description: 'Fecha del examen',
    example: '2025-02-08T11:20:05.000Z'
  })
  testDate: Date;

  @ApiProperty({
    description: 'Nombre del examen',
    example: 'Insulin'
  })
  testName: string;

  @ApiProperty({
    description: 'Número de muestra (si está disponible)',
    example: 'INVAA12',
    nullable: true
  })
  sampleNumber: string | null;

  @ApiProperty({
    description: 'Tipo de sistema',
    enum: ['DH36', 'ICHROMA', 'URINE'],
    example: 'ICHROMA'
  })
  testType: 'DH36' | 'ICHROMA' | 'URINE';

  @ApiProperty({
    description: 'Resultado del examen',
    example: '41.88 uIU/ml',
    nullable: true
  })
  result?: string | null;

  @ApiProperty({
    description: 'Edad del paciente (si está disponible)',
    example: 44,
    nullable: true
  })
  patientAge?: number | null;

  @ApiProperty({
    description: 'Sexo del paciente (si está disponible)',
    example: 'femenino',
    nullable: true
  })
  patientSex?: string | null;
}

export class PatientHistoryStatsDto {
  @ApiProperty({
    description: 'Total de exámenes del paciente',
    example: 15
  })
  totalExams: number;

  @ApiProperty({
    description: 'Exámenes por tipo de sistema',
    example: {
      ICHROMA: 8,
      DH36: 5,
      URINE: 2
    }
  })
  examsByType: {
    ICHROMA: number;
    DH36: number;
    URINE: number;
    HECES: number;
  };

  @ApiProperty({
    description: 'Fecha del primer examen',
    example: '2024-10-15T09:30:00.000Z'
  })
  firstExamDate: Date;

  @ApiProperty({
    description: 'Fecha del último examen',
    example: '2025-02-08T11:20:05.000Z'
  })
  lastExamDate: Date;

  @ApiProperty({
    description: 'Exámenes más frecuentes',
    example: ['Insulin', 'Beta HCG', 'TSH']
  })
  mostFrequentTests: string[];
}



/**
 * DTO simplificado para listar exámenes de un paciente (timeline/historial)
 * Contiene solo la información meta necesaria para mostrar un listado
 * El frontend puede hacer drill-down con el id si necesita más detalles
 */
export class ExamSummaryDto {
  @ApiProperty({ description: 'ID único del examen', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'ID del paciente', nullable: true })
  patientId: string | null;

  @ApiProperty({ description: 'Fecha y hora del examen', example: '2025-02-08T11:20:05.000Z' })
  testDate: Date;

  @ApiProperty({ description: 'Tipo de fuente', enum: ['DH36', 'ICHROMA', 'URINE', 'HECES', 'LAB'] })
  testType: 'DH36' | 'ICHROMA' | 'URINE' | 'HECES' | 'LAB';

  @ApiProperty({ description: 'Nombre descriptivo del examen' })
  testName: string;

  @ApiProperty({ description: 'Número de muestra', nullable: true })
  sampleNumber: string | null;

  @ApiProperty({ description: 'Estado del examen' })
  status: string;

  @ApiProperty({
    description: 'Tabla de origen',
    enum: ['dymind_dh36_results', 'ichroma_results', 'urine_tests', 'stool_tests', 'unified_test_results'],
  })
  sourceTable: 'dymind_dh36_results' | 'ichroma_results' | 'urine_tests' | 'stool_tests' | 'unified_test_results';

  // Campos adicionales solo presentes en resultados LAB (unified_test_results)
  numericValue?: number;
  isAbnormal?: boolean;
  testDefinitionId?: number;
}

export class TestTrendPointDto {
  date: Date;
  value: number;
  isAbnormal: boolean | null;
  sampleNumber: string | null;
}

export class PatientBasicInfoDto {
  @ApiProperty({
    description: 'ID único del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del paciente',
    example: 'Juan Pérez García'
  })
  name: string;

  @ApiProperty({
    description: 'Sexo del paciente',
    enum: ['M', 'F', 'O'],
    example: 'M'
  })
  sex: string;

  @ApiProperty({
    description: 'Número de teléfono del paciente',
    example: '+503 2234-5678'
  })
  phone: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    example: '1990-05-15',
    type: 'string',
    format: 'date'
  })
  birthDate: Date;
}

export class PatientWithExamsHistoryDto {
  @ApiProperty({
    description: 'Información básica del paciente',
    type: PatientBasicInfoDto
  })
  patient: PatientBasicInfoDto;

  @ApiProperty({
    description: 'Array de exámenes realizados ordenados por fecha (más recientes primero)',
    type: [ExamSummaryDto],
    isArray: true
  })
  exams: ExamSummaryDto[];
}