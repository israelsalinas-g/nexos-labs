import { IsUUID, IsOptional, IsString, IsEnum, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderPriority } from '../common/enums/order-priority.enums';

export class CreateLaboratoryOrderDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'ID del médico que ordena los exámenes',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({
    description: 'Diagnóstico o razón de los exámenes',
    example: 'Control de diabetes mellitus',
    required: false
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({
    description: 'Observaciones generales de la orden',
    required: false
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    description: 'Prioridad de la orden',
    enum: OrderPriority,
    default: OrderPriority.NORMAL,
    required: false
  })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiProperty({
    description: 'Fecha estimada de entrega de resultados',
    required: false
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: Date;

  @ApiProperty({
    description: 'Costo total de la orden',
    example: 750.00,
    required: false
  })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({
    description: 'IDs de las pruebas a incluir en la orden',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  testIds: number[];
}