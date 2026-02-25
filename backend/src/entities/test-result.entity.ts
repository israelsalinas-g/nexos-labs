import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderTest } from './order-test.entity';

/**
 * Entidad para almacenar los resultados de las pruebas de laboratorio
 * Diseñada de forma flexible para manejar cualquier tipo de resultado
 */
@Entity('test_results')
export class TestResult {
  @ApiProperty({ 
    description: 'ID único del resultado',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    description: 'ID de la prueba ordenada',
    example: 1
  })
  @Column({ name: 'order_test_id', type: 'int', unique: true })
  orderTestId: number;

  @ApiProperty({ 
    description: 'Prueba ordenada asociada',
    type: () => OrderTest
  })
  @OneToOne(() => OrderTest, orderTest => orderTest.result, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_test_id' })
  orderTest: OrderTest;

  @ApiProperty({ 
    description: 'Valor del resultado como string (almacena cualquier tipo)',
    example: '1.2'
  })
  @Column({ name: 'result_value', type: 'varchar', length: 500 })
  resultValue: string;

  @ApiProperty({ 
    description: 'Valor numérico del resultado (para facilitar búsquedas y comparaciones)',
    example: 1.2,
    required: false
  })
  @Column({ name: 'result_numeric', type: 'decimal', precision: 15, scale: 4, nullable: true })
  resultNumeric: number;

  @ApiProperty({ 
    description: 'Rango de referencia calculado para este paciente',
    example: '0.6-1.1 mg/dL',
    required: false
  })
  @Column({ name: 'reference_range', type: 'varchar', length: 200, nullable: true })
  referenceRange: string;

  @ApiProperty({ 
    description: 'Número de muestra asociado',
    example: 'M-2025-001234',
    required: false
  })
  @Column({ name: 'sample_number', type: 'varchar', length: 50, nullable: true })
  sampleNumber: string;

  @ApiProperty({ 
    description: 'Indica si el resultado está fuera del rango normal',
    example: false,
    default: false
  })
  @Column({ name: 'is_abnormal', type: 'boolean', default: false })
  isAbnormal: boolean;

  @ApiProperty({ 
    description: 'Indica si el resultado es crítico (requiere atención inmediata)',
    example: false,
    default: false
  })
  @Column({ name: 'is_critical', type: 'boolean', default: false })
  isCritical: boolean;

  @ApiProperty({ 
    description: 'Indicador visual de anormalidad (H=High, L=Low, N=Normal)',
    example: 'N',
    required: false
  })
  @Column({ name: 'abnormal_flag', type: 'varchar', length: 10, nullable: true })
  abnormalFlag: string;

  @ApiProperty({ 
    description: 'Fecha y hora en que se realizó la prueba',
    example: '2025-10-05T14:48:00Z'
  })
  @Column({ name: 'tested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  testedAt: Date;

  @ApiProperty({ 
    description: 'Técnico que realizó la prueba',
    example: 'Lic. María González',
    required: false
  })
  @Column({ name: 'tested_by', type: 'varchar', length: 150, nullable: true })
  testedBy: string;

  @ApiProperty({ 
    description: 'Fecha y hora de validación del resultado',
    required: false
  })
  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt: Date;

  @ApiProperty({ 
    description: 'Médico o profesional que validó el resultado',
    example: 'Dr. Carlos Ramírez',
    required: false
  })
  @Column({ name: 'validated_by', type: 'varchar', length: 150, nullable: true })
  validatedBy: string;

  @ApiProperty({ 
    description: 'Método o equipo utilizado para la prueba',
    example: 'Analizador automático Cobas 6000',
    required: false
  })
  @Column({ name: 'instrument', type: 'varchar', length: 100, nullable: true })
  instrument: string;

  @ApiProperty({ 
    description: 'Observaciones o notas sobre el resultado',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  observations: string;

  @ApiProperty({ 
    description: 'Datos adicionales en formato JSON (para información extra específica)',
    required: false
  })
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: any;

  @ApiProperty({ 
    description: 'Fecha de creación',
    example: '2025-10-05T14:48:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de actualización',
    example: '2025-10-05T14:48:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
