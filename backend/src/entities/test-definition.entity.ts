import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestSection } from './test-section.entity';
import { TestProfile } from './test-profile.entity';
import { TestResultType } from '../common/enums/test-result-type.enums';

/**
 * Entidad para la definición de pruebas individuales de laboratorio
 * Ejemplos: BUN, Creatinina, Amilasa, VDRL, etc.
 */
@Entity('test_definitions')
export class TestDefinition {
  @ApiProperty({ 
    description: 'ID único de la prueba',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Sección a la que pertenece la prueba',
    type: () => TestSection
  })
  @ManyToOne(() => TestSection, section => section.tests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'section_id' })
  section: TestSection;

  @ApiProperty({ 
    description: 'Nombre de la prueba',
    example: 'Creatinina',
    minLength: 2,
    maxLength: 150
  })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ 
    description: 'Código corto de la prueba',
    example: 'CREAT',
    required: false
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  code: string;

  @ApiProperty({ 
    description: 'Descripción de la prueba',
    example: 'Medición de creatinina sérica para evaluación de función renal',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Tipo de resultado que produce esta prueba',
    enum: TestResultType,
    example: TestResultType.NUMERIC
  })
  @Column({ 
    name: 'result_type',
    type: 'enum', 
    enum: TestResultType,
    default: TestResultType.NUMERIC
  })
  resultType: TestResultType;

  @ApiProperty({ 
    description: 'Unidad de medida (solo para resultados numéricos)',
    example: 'mg/dL',
    required: false
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @ApiProperty({ 
    description: 'Rango o valores de referencia como texto libre',
    example: 'Hombres: 0.7-1.3 mg/dL, Mujeres: 0.6-1.1 mg/dL',
    required: false
  })
  @Column({ name: 'reference_range', type: 'text', nullable: true })
  referenceRange: string;

  @ApiProperty({ 
    description: 'Método de análisis utilizado',
    example: 'Espectrofotometría',
    required: false
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  method: string;

  @ApiProperty({ 
    description: 'Tipo de muestra requerida',
    example: 'Suero',
    required: false
  })
  @Column({ name: 'sample_type', type: 'varchar', length: 50, nullable: true })
  sampleType: string;

  @ApiProperty({ 
    description: 'Tiempo de procesamiento estimado en horas',
    example: 2,
    required: false
  })
  @Column({ name: 'processing_time', type: 'int', nullable: true })
  processingTime: number;

  @ApiProperty({ 
    description: 'Costo de la prueba',
    example: 150.00,
    required: false
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ 
    description: 'Orden de visualización dentro de su sección',
    example: 1,
    default: 0
  })
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty({ 
    description: 'Indica si la prueba está activa',
    example: true,
    default: true
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Perfiles a los que pertenece esta prueba',
    type: () => [TestProfile]
  })
  @ManyToMany(() => TestProfile, profile => profile.tests)
  profiles: TestProfile[];

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