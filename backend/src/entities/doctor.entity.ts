import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LaboratoryOrder } from './laboratory-order.entity';

/**
 * Entidad para médicos que ordenan exámenes de laboratorio
 */
@Entity('doctors')
export class Doctor {
  @ApiProperty({
    description: 'ID único del médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombres del médico (Campo obligatorio)',
    example: 'Juan Carlos',
    minLength: 2,
    maxLength: 100,
    required: true
  })
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del médico (Campo obligatorio)',
    example: 'Pérez López',
    minLength: 2,
    maxLength: 100,
    required: true
  })
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @ApiProperty({
    description: 'Especialidad médica',
    example: 'Medicina Interna',
    maxLength: 100,
    required: false
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty: string;

  @ApiProperty({
    description: 'Colegiatura médica',
    example: 'CM-12345',
    maxLength: 50,
    required: false
  })
  @Column({ name: 'license_number', type: 'varchar', length: 50, unique: true, nullable: true })
  licenseNumber: string;

  @ApiProperty({
    description: 'Número de teléfono (8 dígitos)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: false
  })
  @Column({ type: 'varchar', length: 8, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'dr.perez@hospital.com',
    format: 'email',
    required: false
  })
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @ApiProperty({
    description: 'Dirección del consultorio o clínica',
    example: 'Consultorio 301, Edificio Médico Central',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    description: 'Institución u hospital donde trabaja',
    example: 'Clínica Ogyne',
    required: false
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  institution: string;

  @ApiProperty({
    description: 'Indica si el médico pertenece al staff de la clínica',
    example: true,
    default: false
  })
  @Column({ name: 'is_staff', type: 'boolean', default: false })
  isStaff: boolean;

  @ApiProperty({
    description: 'Indica si el médico está activo en el sistema',
    example: true,
    default: true
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Notas adicionales sobre el médico',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Órdenes de laboratorio realizadas por este médico',
    type: () => [LaboratoryOrder]
  })
  @OneToMany(() => LaboratoryOrder, order => order.doctor)
  orders: LaboratoryOrder[];

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2025-10-05T14:48:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-10-05T14:48:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed property para obtener el nombre completo
  get fullName(): string {
    return `Dr. ${this.firstName} ${this.lastName}`;
  }
}
