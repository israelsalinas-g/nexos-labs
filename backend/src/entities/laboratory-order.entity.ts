import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { OrderTest } from './order-test.entity';
import { OrderStatus } from '../common/enums/order-status.enums';
import { OrderPriority } from '../common/enums/order-priority.enums';

/**
 * Entidad para órdenes de laboratorio
 * Agrupa todas las pruebas solicitadas para un paciente en una fecha específica
 */
@Entity('laboratory_orders')
export class LaboratoryOrder {
  @ApiProperty({ 
    description: 'ID único de la orden',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ApiProperty({ 
    description: 'Paciente asociado a la orden',
    type: () => Patient
  })
  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({ 
    description: 'Número único de la orden',
    example: 'ORD-2025-001234'
  })
  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @ApiProperty({ 
    description: 'Fecha y hora de la orden',
    example: '2025-10-05T14:48:00Z'
  })
  @Column({ name: 'order_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @ApiProperty({ 
    description: 'Estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  @Column({ 
    type: 'enum', 
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({ 
    description: 'Prioridad de la orden',
    enum: OrderPriority,
    example: OrderPriority.NORMAL
  })
  @Column({ 
    type: 'enum', 
    enum: OrderPriority,
    default: OrderPriority.NORMAL
  })
  priority: OrderPriority;

  @ApiProperty({ 
    description: 'ID del médico que ordena los exámenes',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId: string;

  @ApiProperty({ 
    description: 'Médico que ordena los exámenes',
    type: () => Doctor,
    required: false
  })
  @ManyToOne(() => Doctor, doctor => doctor.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ApiProperty({ 
    description: 'Diagnóstico o razón de los exámenes',
    example: 'Control de diabetes mellitus',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @ApiProperty({ 
    description: 'Observaciones generales de la orden',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  observations: string;

  @ApiProperty({ 
    description: 'Fecha estimada de entrega de resultados',
    required: false
  })
  @Column({ name: 'estimated_delivery', type: 'timestamp', nullable: true })
  estimatedDelivery: Date;

  @ApiProperty({ 
    description: 'Fecha real de entrega de resultados',
    required: false
  })
  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @ApiProperty({ 
    description: 'Costo total de la orden',
    example: 750.00,
    required: false
  })
  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @ApiProperty({ 
    description: 'Pruebas incluidas en esta orden',
    type: () => [OrderTest]
  })
  @OneToMany(() => OrderTest, orderTest => orderTest.order)
  tests: OrderTest[];

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
