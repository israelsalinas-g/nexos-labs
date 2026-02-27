import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestResponseType } from './test-response-type.entity';

/**
 * Opciones de respuesta para tipos de respuesta de tipo enum.
 * Ejemplos: 'Negativo', 'Positivo +', 'Positivo ++', 'Escasa cantidad', etc.
 */
@Entity('test_response_options')
export class TestResponseOption {
  @ApiProperty({ description: 'ID único', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Tipo de respuesta al que pertenece esta opción' })
  @ManyToOne(() => TestResponseType, type => type.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'response_type_id' })
  responseType: TestResponseType;

  @ApiProperty({ description: 'Valor almacenado en base de datos', example: 'Negativo' })
  @Column({ type: 'varchar', length: 100 })
  value: string;

  @ApiProperty({ description: 'Etiqueta de visualización (puede diferir del valor)', example: 'Negativo', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;

  @ApiProperty({ description: 'Orden de visualización', example: 1, default: 0 })
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Color hexadecimal para UI', example: '#28a745', required: false })
  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @ApiProperty({ description: 'Si es el valor por defecto', default: false })
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
