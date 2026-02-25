import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles')
export class Role {
  @ApiProperty({ 
    description: 'ID único del rol',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    enum: ['SUPERADMIN', 'ADMIN', 'TECNICO', 'OPERADOR'],
    example: 'SUPERADMIN'
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({
    description: 'Nivel del rol para jerarquía de permisos (1=máximo, 4=mínimo)',
    example: 1
  })
  @Column({ type: 'int' })
  level: number;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario con acceso total al sistema'
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Usuarios que tienen este rol',
    type: () => 'User'
  })
  @OneToMany('User', 'role', { onDelete: 'RESTRICT' })
  users: any[];

  @ApiProperty({
    description: 'Permisos asociados a este rol',
    type: () => 'Permission'
  })
  @OneToMany('Permission', 'role', { onDelete: 'CASCADE' })
  permissions: any[];

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
