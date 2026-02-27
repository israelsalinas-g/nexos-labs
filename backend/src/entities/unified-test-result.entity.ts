import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderTest } from './order-test.entity';
import { TestDefinition } from './test-definition.entity';
import { TestResponseOption } from './test-response-option.entity';
import { User } from './user.entity';

@Entity('unified_test_results')
export class UnifiedTestResult {
  @ApiProperty({ description: 'ID único del resultado', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID de la prueba en la orden', example: 42 })
  @Column({ name: 'order_test_id', type: 'int' })
  orderTestId: number;

  @ApiProperty({ description: 'Prueba en la orden asociada', type: () => OrderTest })
  @ManyToOne(() => OrderTest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_test_id' })
  orderTest: OrderTest;

  @ApiProperty({ description: 'ID de la definición de prueba', example: 10 })
  @Column({ name: 'test_definition_id', type: 'int' })
  testDefinitionId: number;

  @ApiProperty({ description: 'Definición de la prueba', type: () => TestDefinition })
  @ManyToOne(() => TestDefinition, { eager: false })
  @JoinColumn({ name: 'test_definition_id' })
  testDefinition: TestDefinition;

  // ─── Tres tipos mutuamente excluyentes ─────────────────────────────────────

  @ApiProperty({ description: 'Resultado numérico (si aplica)', example: 98.5, required: false })
  @Column({ name: 'numeric_value', type: 'decimal', precision: 15, scale: 6, nullable: true })
  numericValue: number;

  @ApiProperty({ description: 'ID de la opción de respuesta seleccionada (para enum)', required: false })
  @Column({ name: 'response_option_id', type: 'int', nullable: true })
  responseOptionId: number;

  @ApiProperty({ description: 'Opción de respuesta seleccionada', type: () => TestResponseOption, required: false })
  @ManyToOne(() => TestResponseOption, { nullable: true, eager: false })
  @JoinColumn({ name: 'response_option_id' })
  responseOption: TestResponseOption;

  @ApiProperty({ description: 'Resultado textual (si aplica)', required: false })
  @Column({ name: 'text_value', type: 'text', nullable: true })
  textValue: string;

  // ─── Metadatos ─────────────────────────────────────────────────────────────

  @ApiProperty({ description: '¿El resultado está fuera del rango de referencia?', required: false })
  @Column({ name: 'is_abnormal', type: 'boolean', nullable: true })
  isAbnormal: boolean;

  @ApiProperty({ description: 'Notas o comentarios del técnico', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'ID del usuario que registró el resultado', required: false })
  @Column({ name: 'entered_by_id', type: 'uuid', nullable: true })
  enteredById: string;

  @ApiProperty({ description: 'Usuario que registró el resultado', type: () => User, required: false })
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'entered_by_id' })
  enteredBy: User;

  @ApiProperty({ description: 'Fecha y hora de registro del resultado' })
  @CreateDateColumn({ name: 'entered_at' })
  enteredAt: Date;
}
