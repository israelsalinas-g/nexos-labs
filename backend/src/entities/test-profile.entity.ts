import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestSection } from './test-section.entity';
import { TestDefinition } from './test-definition.entity';

/**
 * Entidad para perfiles o paquetes de pruebas
 * Ejemplos: Curva de tolerancia a la glucosa, Perfil lipídico, Perfil hepático, etc.
 */
@Entity('test_profiles')
export class TestProfile {
  @ApiProperty({ 
    description: 'ID único del perfil',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Sección a la que pertenece el perfil',
    type: () => TestSection
  })
  @ManyToOne(() => TestSection, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'section_id' })
  section: TestSection;

  @ApiProperty({ 
    description: 'Nombre del perfil',
    example: 'Curva de tolerancia a la glucosa',
    minLength: 2,
    maxLength: 150
  })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ 
    description: 'Código corto del perfil',
    example: 'CTG',
    required: false
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  code: string;

  @ApiProperty({ 
    description: 'Descripción del perfil',
    example: 'Perfil que incluye mediciones de glucosa en diferentes tiempos',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Pruebas que incluye este perfil',
    type: () => [TestDefinition]
  })
  @ManyToMany(() => TestDefinition, test => test.profiles)
  @JoinTable({
    name: 'profile_tests',
    joinColumn: { name: 'profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'test_id', referencedColumnName: 'id' }
  })
  tests: TestDefinition[];

  @ApiProperty({ 
    description: 'Costo del perfil (puede ser menor que la suma de las pruebas individuales)',
    example: 450.00,
    required: false
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ 
    description: 'Orden de visualización',
    example: 1,
    default: 0
  })
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty({ 
    description: 'Indica si el perfil está activo',
    example: true,
    default: true
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
