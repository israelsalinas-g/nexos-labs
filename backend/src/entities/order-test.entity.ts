import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LaboratoryOrder } from './laboratory-order.entity';
import { TestDefinition } from './test-definition.entity';
import { TestResult } from './test-result.entity';
import { TestStatus } from 'src/common/enums/test-status.enums';

/**
 * Entidad que conecta órdenes con pruebas específicas
 * Tabla intermedia entre laboratory_orders y test_definitions
 */
@Entity('order_tests')
export class OrderTest {
  @ApiProperty({ 
    description: 'ID único del registro',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    description: 'ID de la orden de laboratorio',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ApiProperty({ 
    description: 'Orden de laboratorio asociada',
    type: () => LaboratoryOrder
  })
  @ManyToOne(() => LaboratoryOrder, order => order.tests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: LaboratoryOrder;

  @ApiProperty({ 
    description: 'ID de la definición de la prueba',
    example: 1
  })
  @Column({ name: 'test_definition_id', type: 'int' })
  testDefinitionId: number;

  @ApiProperty({ 
    description: 'Definición de la prueba solicitada',
    type: () => TestDefinition
  })
  @ManyToOne(() => TestDefinition, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'test_definition_id' })
  testDefinition: TestDefinition;

  @ApiProperty({ 
    description: 'Estado de la prueba',
    enum: TestStatus,
    example: TestStatus.PENDING
  })
  @Column({ 
    type: 'enum', 
    enum: TestStatus,
    default: TestStatus.PENDING
  })
  status: TestStatus;

  @ApiProperty({ 
    description: 'Número de muestra asociado',
    example: 'M-2025-001234',
    required: false
  })
  @Column({ name: 'sample_number', type: 'varchar', length: 50, nullable: true })
  sampleNumber: string;

  @ApiProperty({ 
    description: 'Fecha y hora de toma de muestra',
    required: false
  })
  @Column({ name: 'sample_collected_at', type: 'timestamp', nullable: true })
  sampleCollectedAt: Date;

  @ApiProperty({ 
    description: 'Técnico que tomó la muestra',
    required: false
  })
  @Column({ name: 'collected_by', type: 'varchar', length: 100, nullable: true })
  collectedBy: string;

  @ApiProperty({ 
    description: 'Resultado de la prueba',
    type: () => TestResult,
    required: false
  })
  @OneToOne(() => TestResult, result => result.orderTest)
  result: TestResult;

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
