import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestDefinition } from './test-definition.entity';

export enum RangeGender {
  MALE = 'M',
  FEMALE = 'F',
  ANY = 'ANY',
}

/**
 * Rangos de referencia para pruebas numéricas y cualitativas.
 * Soporta segmentación por edad (en meses) y sexo del paciente.
 */
@Entity('test_reference_ranges')
export class TestReferenceRange {
  @ApiProperty({ description: 'ID único', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Prueba a la que aplica este rango', type: () => TestDefinition })
  @ManyToOne(() => TestDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_definition_id' })
  testDefinition: TestDefinition;

  @ApiProperty({ description: 'Sexo aplicable (M, F, ANY)', enum: RangeGender, example: RangeGender.ANY })
  @Column({
    type: 'enum',
    enum: RangeGender,
    default: RangeGender.ANY,
  })
  gender: RangeGender;

  @ApiProperty({ description: 'Edad mínima en meses (0 = recién nacido)', example: 0 })
  @Column({ name: 'age_min_months', type: 'int', default: 0 })
  ageMinMonths: number;

  @ApiProperty({ description: 'Edad máxima en meses (null = sin límite)', example: null, required: false })
  @Column({ name: 'age_max_months', type: 'int', nullable: true })
  ageMaxMonths: number;

  @ApiProperty({ description: 'Valor mínimo normal (para numéricos)', example: 70, required: false })
  @Column({ name: 'min_value', type: 'decimal', precision: 12, scale: 4, nullable: true })
  minValue: number;

  @ApiProperty({ description: 'Valor máximo normal (para numéricos)', example: 110, required: false })
  @Column({ name: 'max_value', type: 'decimal', precision: 12, scale: 4, nullable: true })
  maxValue: number;

  @ApiProperty({
    description: 'Valor de referencia textual (para tipos cualitativos o texto libre)',
    example: 'Negativo',
    required: false
  })
  @Column({ name: 'textual_range', type: 'varchar', length: 200, nullable: true })
  textualRange: string;

  @ApiProperty({ description: 'Interpretación del rango', example: 'Normal', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  interpretation: string;

  @ApiProperty({ description: 'Unidad de medida para este rango', example: 'mg/dL', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
