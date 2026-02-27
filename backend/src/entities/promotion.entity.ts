import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestDefinition } from './test-definition.entity';
import { TestProfile } from './test-profile.entity';

@Entity('promotions')
export class Promotion {
  @ApiProperty({ description: 'ID único de la promoción', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre de la promoción', example: 'Promoción Día del Padre 2025' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ description: 'Descripción de la promoción', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Precio de la promoción', example: 75.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Fecha de inicio de vigencia (YYYY-MM-DD)', example: '2025-06-01' })
  @Column({ name: 'valid_from', type: 'date' })
  validFrom: string;

  @ApiProperty({ description: 'Fecha de fin de vigencia (YYYY-MM-DD)', example: '2025-06-30' })
  @Column({ name: 'valid_to', type: 'date' })
  validTo: string;

  @ApiProperty({ description: 'Indica si la promoción está activa', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Pruebas individuales incluidas en la promoción', type: () => [TestDefinition] })
  @ManyToMany(() => TestDefinition)
  @JoinTable({
    name: 'promotion_tests',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'test_definition_id', referencedColumnName: 'id' },
  })
  tests: TestDefinition[];

  @ApiProperty({ description: 'Perfiles incluidos en la promoción', type: () => [TestProfile] })
  @ManyToMany(() => TestProfile)
  @JoinTable({
    name: 'promotion_profiles',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profile_id', referencedColumnName: 'id' },
  })
  profiles: TestProfile[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
