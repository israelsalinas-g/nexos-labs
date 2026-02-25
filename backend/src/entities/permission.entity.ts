import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({ 
    description: 'ID único del permiso',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Código único del permiso',
    example: 'CREATE_USER',
    maxLength: 100
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevos usuarios',
    maxLength: 200
  })
  @Column({ type: 'varchar', length: 200 })
  description: string;

  @ApiProperty({
    description: 'Rol asociado a este permiso',
    type: () => Role
  })
  @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

   @ApiProperty({ description: 'Fecha de actualización' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
