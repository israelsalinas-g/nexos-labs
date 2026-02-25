import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @ApiProperty({ 
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre de usuario único',
    minLength: 3,
    maxLength: 50,
    example: 'tecnico01'
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({
    description: 'Contraseña (hasheada con bcrypt)',
    example: '$2b$10$...'
  })
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    minLength: 2,
    maxLength: 100,
    example: 'Juan'
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    minLength: 2,
    maxLength: 100,
    example: 'Pérez'
  })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico único',
    format: 'email',
    example: 'tecnico@lab.com'
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    type: () => Role
  })
  @ManyToOne(() => Role, role => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha del último inicio de sesión',
    example: '2025-10-28T15:30:00Z',
    nullable: true
  })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ApiProperty({
    description: 'URL del avatar del usuario',
    example: '/avatars/550e8400-e29b-41d4-a716-446655440000.jpg',
    nullable: true
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @ApiProperty({
    description: 'Usuario que creó este registro',
    type: () => User,
    nullable: true
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ApiProperty({
    description: 'Usuario que actualizó este registro',
    type: () => User,
    nullable: true
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
