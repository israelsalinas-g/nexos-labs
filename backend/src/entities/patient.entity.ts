import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Genres, GenresExample } from '../common/enums/genres.enums';
import { BloodType, BloodTypeExample } from '../common/enums/blood-type.enums';
import { ApiProperty } from '@nestjs/swagger';

@Entity('patients')
@Index(['name'])
@Index(['dni'])
export class Patient {
  @ApiProperty({
    description: 'ID único del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre completo del paciente (Campo obligatorio)',
    example: 'Juan Carlos Martínez López',
    minLength: 2,
    maxLength: 100,
    required: true
  })
  @Column({ nullable: false })
  name: string;

  @ApiProperty({
    description: 'Edad del paciente (calculada automáticamente)',
    example: 35,
    minimum: 0,
    maximum: 150,
    required: false
  })
  @Column({ nullable: true })
  age: number;

  @ApiProperty({
    ...GenresExample,
    required: true
  })
  @Column({
    type: 'enum',
    enum: Genres,
    default: Genres.OTHER,
    nullable: false
  })
  sex: Genres;

  @ApiProperty({
    description: 'Grupo de referencia para valores normales en exámenes',
    example: 'Adulto',
    required: false,
    enum: ['Niño', 'Adolescente', 'Adulto', 'Adulto Mayor', 'Embarazada']
  })
  @Column({ name: 'reference_group', nullable: true })
  referenceGroup: string;

  @ApiProperty({
    description: 'Número de identidad de Honduras (13 dígitos)',
    example: '0801199912345',
    required: false,
    pattern: '^[0-9]{13}$'
  })
  @Column({ type: 'varchar', unique: true, nullable: true })
  dni: string | null;

  @ApiProperty({
    description: 'Número de teléfono (8 dígitos) (Campo obligatorio)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: true
  })
  @Column({ nullable: false })
  phone: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.martinez@email.com',
    required: false,
    format: 'email'
  })
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente (Campo obligatorio)',
    example: '1988-03-15',
    type: 'string',
    format: 'date',
    required: true
  })
  @Column({ name: 'birth_date', type: 'date', nullable: false })
  birthDate: Date;

  @ApiProperty({
    description: 'Dirección del paciente',
    example: 'Colonia Kennedy, Calle Principal, Casa #123',
    required: false
  })
  @Column({ nullable: true })
  address: string;

  @ApiProperty(BloodTypeExample)
  @Column({
    name: 'blood_type',
    type: 'enum',
    enum: BloodType,
    default: BloodType.UNKNOWN,
    nullable: true
  })
  bloodType: BloodType;

  @ApiProperty({
    description: 'Alergias conocidas del paciente',
    example: 'Alérgico a penicilina, sulfas',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  allergies: string;

  @ApiProperty({
    description: 'Historia médica relevante',
    example: 'Hipertensión arterial, Diabetes tipo 2',
    required: false
  })
  @Column({ name: 'medical_history', type: 'text', nullable: true })
  medicalHistory: string;

  @ApiProperty({
    description: 'Medicamentos que toma actualmente',
    example: 'Metformina 850mg c/12h, Enalapril 20mg c/24h',
    required: false
  })
  @Column({ name: 'current_medications', type: 'text', nullable: true })
  currentMedications: string;

  @ApiProperty({
    description: 'Indica si el paciente está activo en el sistema',
    example: true,
    default: true
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'María López',
    required: false,
    maxLength: 100
  })
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @ApiProperty({
    description: 'Relación con el contacto de emergencia',
    example: 'Esposa',
    required: false,
    maxLength: 50
  })
  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia (8 dígitos)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: false
  })
  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2025-10-05T14:48:00Z',
    format: 'date-time'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-10-05T14:48:00Z',
    format: 'date-time'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  calculateAge(): number {
    if (!this.birthDate) return 0;
    const birthDate = new Date(this.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}