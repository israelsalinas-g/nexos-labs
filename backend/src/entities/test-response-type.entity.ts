import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestResponseOption } from './test-response-option.entity';

/**
 * Entidad para tipos de respuesta configurables dinámicamente.
 * Reemplaza al enum estático TestResultType.
 * Ejemplos: Numérico, Texto libre, Negativo/Positivo, Reactivo/No reactivo, etc.
 */
@Entity('test_response_types')
export class TestResponseType {
  @ApiProperty({ description: 'ID único', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Nombre del tipo de respuesta', example: 'Negativo/Positivo' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Slug único para identificación programática (equivale al valor del enum anterior)',
    example: 'positive_negative'
  })
  @Column({ type: 'varchar', length: 80, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Categoría de entrada: numeric, text, enum',
    example: 'enum'
  })
  @Column({ name: 'input_type', type: 'varchar', length: 20, default: 'enum' })
  inputType: string; // 'numeric' | 'text' | 'enum'

  @ApiProperty({ description: 'Descripción del tipo', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Indica si el tipo puede ser eliminado/editado por el usuario', default: false })
  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @ApiProperty({ description: 'Indica si está activo', default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Opciones disponibles para este tipo (solo si inputType = enum)', type: () => [TestResponseOption] })
  @OneToMany(() => TestResponseOption, option => option.responseType, { cascade: true, eager: true })
  options: TestResponseOption[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
