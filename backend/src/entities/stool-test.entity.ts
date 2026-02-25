import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { 
  ParasiteType, 
  ProtozooType,
  StoolColor,
  StoolConsistency,
  StoolShape,
} from '../common/enums/stool-test.enums';
import { ParasiteResult, ProtozooResult } from '../common/interfaces/stool-test.interfaces';
import { EscasaModeradaAbundanteAusenteQuantity } from 'src/common/enums/escasa-moderada-abundante-ausente.enums';
import { User } from './user.entity';
import { Doctor } from './doctor.entity';

@Entity('stool_tests')
export class StoolTest {
  @ApiProperty({ description: 'ID único del examen de heces' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Número de muestra (único)' })
  @Column({ name: 'sample_number', unique: true })
  sampleNumber: string;

  @ApiProperty({ description: 'Fecha del examen' })
  @Column({ name: 'test_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  testDate: Date;

  @ApiProperty({ description: 'ID del paciente - Referencia a la tabla de pacientes' })
  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({ description: 'ID del doctor' })
  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId: string | null;
  
  @ApiProperty({ description: 'Relación con el doctor' })
  @ManyToOne(() => Doctor, doctor => doctor.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  // EXAMEN FÍSICO
  @ApiProperty({ 
    description: 'Color de las heces', 
    enum: StoolColor,
    example: StoolColor.CAFE 
  })
  @Column({
    type: 'enum',
    enum: StoolColor,
    default: StoolColor.CAFE
  })
  color: StoolColor;

  @ApiProperty({ 
    description: 'Consistencia de las heces', 
    enum: StoolConsistency,
    example: StoolConsistency.FORMADA 
  })
  @Column({
    type: 'enum',
    enum: StoolConsistency,
    default: StoolConsistency.FORMADA
  })
  consistency: StoolConsistency;

  @ApiProperty({ 
    description: 'Forma/cantidad de las heces', 
    enum: StoolShape,
    example: StoolShape.MODERADO 
  })
  @Column({
    type: 'enum',
    enum: StoolShape,
    default: StoolShape.MODERADO
  })
  shape: StoolShape;

  @ApiProperty({ 
    description: 'Presencia de moco', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  @Column({
    type: 'enum',
    enum: EscasaModeradaAbundanteAusenteQuantity,
    default: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  mucus: EscasaModeradaAbundanteAusenteQuantity;

  // EXAMEN MICROSCÓPICO
  @ApiProperty({ 
    description: 'Nivel de leucocitos', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  @Column({
    type: 'enum',
    enum: EscasaModeradaAbundanteAusenteQuantity,
    default: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  leukocytes: EscasaModeradaAbundanteAusenteQuantity;

  @ApiProperty({ 
    description: 'Nivel de eritrocitos', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  @Column({
    type: 'enum',
    enum: EscasaModeradaAbundanteAusenteQuantity,
    default: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA
  })
  erythrocytes: EscasaModeradaAbundanteAusenteQuantity;

  @ApiProperty({ 
    description: 'Resultados de parásitos',
    type: 'array',
    example: [
      { type: ParasiteType.ASCARIS_LUMBRICOIDES, quantity: '2-3 por campo' },
      { type: ParasiteType.TRICHURIS_TRICHIURA, quantity: '1 por campo' }
    ]
  })
  @Column({ 
    name: 'parasites', 
    type: 'jsonb', 
    default: []
  })
  parasites: ParasiteResult[];

  @ApiProperty({ 
    description: 'Resultados de protozoos',
    type: 'array',
    example: [
      { type: ProtozooType.BLASTOCYSTIS_HOMINIS, quantity: '4+ por campo' },
      { type: ProtozooType.GIARDIA_DUODENALIS, quantity: 'escasos' }
    ]
  })
  @Column({ 
    name: 'protozoos', 
    type: 'jsonb', 
    default: []
  })
  protozoos: ProtozooResult[];

  // Campos adicionales para el sistema
  
  @ApiProperty({ description: 'Observaciones adicionales' })
  @Column({ name: 'observations', type: 'text', nullable: true })
  observations: string;

  @ApiProperty({ description: 'Estado del examen' })
  @Column({ name: 'status', default: 'pending' })
  status: string; // pending, completed, reviewed

  @ApiProperty({ description: 'Indica si el examen está activo (soft-delete)' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // RELACIONES CON USUARIOS
  @ApiProperty({ 
    description: 'Usuario que creó/realizó el examen',
    type: () => User
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ApiProperty({ description: 'ID del usuario que creó el examen' })
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById: string;

  @ApiProperty({ 
    description: 'Usuario que revisó/aprobó el examen',
    type: () => User
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @ApiProperty({ description: 'ID del usuario que revisó el examen' })
  @Column({ name: 'reviewed_by_id', type: 'uuid', nullable: true })
  reviewedById: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
