import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { CrystalType, CylinderType, UrineAspect, UrineColor, UrineDensity, UrinePH, Urobilinogen} from '../common/enums/urine-test.enums';
import { NegativePositive } from '../common/enums/negative-positive.enums';
import { CrystalResult, CylinderResult } from '../common/interfaces/urine-test.interfaces';
import { NegativePositive3Plus } from '../common/enums/negative-positive-3-plus.enums';
import { NegativePositive4Plus } from '../common/enums/negative-positive-4-plus.enums';
import { EscasaModeradaAbundanteQuantity } from '../common/enums/escasa-moderada-abundante.enums';
import { EscasaModeradaAbundanteAusenteQuantity } from '../common/enums/escasa-moderada-abundante-ausente.enums';
import { Doctor } from './doctor.entity';


@Entity('urine_tests')
export class UrineTest {
  @ApiProperty({ description: 'ID único del examen de orina' })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ApiProperty({ description: 'Número de muestra (único)' })
  @Column({ name: 'sample_number', unique: true })
  sampleNumber: string;
    
  @ApiProperty({ description: 'Fecha del examen' })
  @Column({ name: 'test_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  testDate: Date;

  @ApiProperty({ description: 'ID del paciente' })
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ApiProperty({ description: 'Relación con el paciente' })
  @ManyToOne(() => Patient, patient => patient.id)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({ description: 'ID del doctor' })
  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId: string | null;

  @ApiProperty({ description: 'Relación con el doctor' })
  @ManyToOne(() => Doctor, doctor => doctor.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  // ===================
  // EXAMEN FÍSICO
  // ===================

  @ApiProperty({ description: 'Volumen de la muestra en mL', example: '60 ml' })
  @Column({ name: 'volume', type: 'varchar', length: 50, nullable: true })
  volume: string | null;

  @ApiProperty({ description: 'Color de la orina', enum: UrineColor, example: UrineColor.AMARILLO })
  @Column({ name: 'color', type: 'enum', enum: UrineColor, nullable: true })
  color: UrineColor | null;

  @ApiProperty({ description: 'Aspecto de la orina', enum: UrineAspect, example: UrineAspect.TURBIO })
  @Column({ name: 'aspect', type: 'enum', enum: UrineAspect, nullable: true })
  aspect: UrineAspect | null;

  @ApiProperty({ description: 'Sedimento', enum: EscasaModeradaAbundanteAusenteQuantity, example: EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE })
  @Column({ name: 'sediment', type: 'enum', enum: EscasaModeradaAbundanteAusenteQuantity, nullable: true })
  sediment: EscasaModeradaAbundanteAusenteQuantity | null;

  // ===================
  // EXAMEN QUÍMICO
  // ===================

  @ApiProperty({ description: 'Densidad específica', enum: UrineDensity, example: UrineDensity.D1015 })
  @Column({ name: 'density', type: 'enum', enum: UrineDensity, nullable: true })
  density: UrineDensity | null;

  @ApiProperty({ description: 'pH de la orina', enum: UrinePH, example: UrinePH.PH70 })
  @Column({ name: 'ph', type: 'enum', enum: UrinePH, nullable: true })
  ph: UrinePH | null;

  @ApiProperty({ description: 'Proteína', enum: NegativePositive4Plus, example: NegativePositive4Plus.NEGATIVO })
  @Column({ name: 'protein', type: 'enum', enum: NegativePositive4Plus, nullable: true })
  protein: NegativePositive4Plus | null;

  @ApiProperty({ description: 'Glucosa', enum: NegativePositive4Plus, example: NegativePositive4Plus.NEGATIVO })
  @Column({ name: 'glucose', type: 'enum', enum: NegativePositive4Plus, nullable: true })
  glucose: NegativePositive4Plus | null;

  @ApiProperty({ description: 'Bilirrubinas', enum: NegativePositive3Plus, example: NegativePositive3Plus.NEGATIVO })
  @Column({ name: 'bilirubin', type: 'enum', enum: NegativePositive3Plus, nullable: true })
  bilirubin: NegativePositive3Plus | null;

  @ApiProperty({ description: 'Cetonas', enum: NegativePositive3Plus, example: NegativePositive3Plus.NEGATIVO })
  @Column({ name: 'ketones', type: 'enum', enum: NegativePositive3Plus, nullable: true })
  ketones: NegativePositive3Plus | null;

  @ApiProperty({ description: 'Sangre oculta', enum: NegativePositive3Plus, example: NegativePositive3Plus.NEGATIVO })
  @Column({ name: 'occult_blood', type: 'enum', enum: NegativePositive3Plus, nullable: true })
  occultBlood: NegativePositive3Plus | null;

  @ApiProperty({ description: 'Nitritos', enum: NegativePositive, example: NegativePositive.NEGATIVO })
  @Column({ name: 'nitrites', type: 'enum', enum: NegativePositive, nullable: true })
  nitrites: NegativePositive | null;

  @ApiProperty({ description: 'Urobilinógeno', enum: Urobilinogen, example: Urobilinogen.U01 })
  @Column({ name: 'urobilinogen', type: 'enum', enum: Urobilinogen, nullable: true })
  urobilinogen: Urobilinogen | null;

  @ApiProperty({ description: 'Leucocitos', enum: NegativePositive3Plus, example: NegativePositive3Plus.NEGATIVO })
  @Column({ name: 'leukocytes', type: 'enum', enum: NegativePositive3Plus, nullable: true })
  leukocytes: NegativePositive3Plus | null;

  // ===================
  // EXAMEN MICROSCÓPICO
  // ===================

  @ApiProperty({ description: 'Células epiteliales', enum: EscasaModeradaAbundanteQuantity, example: EscasaModeradaAbundanteQuantity.MODERADA })
  @Column({ name: 'epithelial_cells', type: 'enum', enum: EscasaModeradaAbundanteQuantity, nullable: true })
  epithelialCells: EscasaModeradaAbundanteQuantity | null;

  @ApiProperty({ description: 'Leucocitos por campo', example: '0-2 x campo' })
  @Column({ name: 'leukocytes_field', type: 'varchar', length: 100, nullable: true })
  leukocytesField: string | null;

  @ApiProperty({ description: 'Eritrocitos por campo', example: '0-2 x campo' })
  @Column({ name: 'erythrocytes_field', type: 'varchar', length: 100, nullable: true })
  erythrocytesField: string | null;

  @ApiProperty({ description: 'Bacterias', enum: EscasaModeradaAbundanteAusenteQuantity, example: EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE })
  @Column({ name: 'bacteria', type: 'enum', enum: EscasaModeradaAbundanteAusenteQuantity, nullable: true })
  bacteria: EscasaModeradaAbundanteAusenteQuantity | null;

  @ApiProperty({ description: 'Filamentos mucosos', enum: EscasaModeradaAbundanteAusenteQuantity, example: EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE })
  @Column({ name: 'mucous_filaments', type: 'enum', enum: EscasaModeradaAbundanteAusenteQuantity, nullable: true })
  mucousFilaments: EscasaModeradaAbundanteAusenteQuantity | null;

  @ApiProperty({ description: 'Levaduras', enum: EscasaModeradaAbundanteAusenteQuantity, example: EscasaModeradaAbundanteAusenteQuantity.ESCASA })
  @Column({ name: 'yeasts', type: 'enum', enum: EscasaModeradaAbundanteAusenteQuantity, nullable: true })
  yeasts: EscasaModeradaAbundanteAusenteQuantity | null;

  @ApiProperty({ 
    description: 'Cristales encontrados', 
    type: 'array',
    example: [
      { type: CrystalType.OXALATOS_CALCIO_DIHIDRATADO, quantity: '2-3 por campo' },
      { type: CrystalType.ACIDO_URICO, quantity: 'abundante' }
    ]
  })
  @Column({ name: 'crystals', type: 'jsonb', default: [] })
  crystals: CrystalResult[];

  @ApiProperty({ 
    description: 'Cilindros encontrados',
    type: 'array',
    example: [
      { type: CylinderType.HIALINOS, quantity: 'escasos' },
      { type: CylinderType.GRANULOSO_FINO, quantity: '0-1 por campo' }
    ]
  })
  @Column({ name: 'cylinders', type: 'jsonb', default: [] })
  cylinders: CylinderResult[];

  @ApiProperty({ description: 'Otros hallazgos', example: '-' })
  @Column({ name: 'others', type: 'text', nullable: true })
  others: string | null;

  // ===================
  // METADATOS
  // ===================

  @ApiProperty({ description: 'Observaciones generales del técnico' })
  @Column({ name: 'observations', type: 'text', nullable: true })
  observations: string | null;

  @ApiProperty({ description: 'Estado del examen' })
  @Column({ name: 'status', type: 'varchar', length: 50, default: 'completed' })
  status: string;

  @ApiProperty({ 
    description: 'Indica si el examen de orina está activo/vigente',
    example: true,
    default: true
  })
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
