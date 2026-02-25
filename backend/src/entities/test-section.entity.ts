import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestDefinition } from './test-definition.entity';

/**
 * Entidad para secciones de exámenes de laboratorio
 * Ejemplos: Serología, Inmunología, Química Sanguínea, Microbiología, etc.
 */
@Entity('test_sections')
export class TestSection {
  @ApiProperty({ 
    description: 'ID único de la sección',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Nombre de la sección de examen',
    example: 'Química Sanguínea',
    minLength: 2,
    maxLength: 100
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ 
    description: 'Código corto de la sección',
    example: 'QS',
    required: false
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  code: string;

  @ApiProperty({ 
    description: 'Descripción de la sección',
    example: 'Exámenes relacionados con la química de la sangre',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Color para identificación visual (hex)',
    example: '#4CAF50',
    required: false
  })
  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @ApiProperty({ 
    description: 'Orden de visualización',
    example: 1,
    default: 0
  })
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty({ 
    description: 'Indica si la sección está activa',
    example: true,
    default: true
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Pruebas que pertenecen a esta sección',
    type: () => [TestDefinition]
  })
  @OneToMany(() => TestDefinition, testDefinition => testDefinition.section)
  tests: TestDefinition[];

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
