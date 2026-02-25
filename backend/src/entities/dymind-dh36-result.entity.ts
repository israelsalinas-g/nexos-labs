import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';

export class TestParameter {
  name: string;
  result: string;
  unit: string;
  referenceRange?: string;
  status?: string;
}

@Entity('dymind_dh36_results') // Mantenemos el nombre de la tabla para preservar datos
export class DymindDh36Result {
  @ApiProperty({ description: 'ID único del resultado' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del paciente del sistema (relación opcional)' })
  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId: string | null;

  @ApiProperty({ description: 'Relación con el paciente del sistema', type: () => Patient, required: false })
  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient | null;

  @ApiProperty({ description: 'ID del paciente según equipo Dymind DH36' })
  @Column({ name: 'patient_id_dymind', nullable: true })
  patientIdDymind: string;

  @ApiProperty({ description: 'Nombre del paciente según equipo Dymind DH36' })
  @Column({ name: 'patient_name_dymind', nullable: true })
  patientNameDymind: string;

  @ApiProperty({ description: 'Edad del paciente según equipo Dymind DH36' })
  @Column({ name: 'patient_age_dymind', type: 'integer', nullable: true })
  patientAgeDymind: number | null;

  @ApiProperty({ description: 'Sexo del paciente según equipo Dymind DH36' })
  @Column({ name: 'patient_sex_dymind', nullable: true })
  patientSexDymind: string;

  @ApiProperty({ description: 'Grupo de referencia según equipo Dymind DH36 (Niño, Adulto, etc)' })
  @Column({ name: 'reference_group_dymind', nullable: true })
  referenceGroupDymind: string;

  @ApiProperty({ description: 'Número de muestra (único)' })
  @Column({ name: 'sample_number', unique: true })
  sampleNumber: string;

  @ApiProperty({ description: 'Modo de análisis' })
  @Column({ name: 'analysis_mode', default: 'Automated Count' })
  analysisMode: string;

  @ApiProperty({ description: 'Fecha y hora del examen' })
  @Column({ name: 'test_date', type: 'timestamp' })
  testDate: Date;

  @ApiProperty({ description: 'Parámetros del análisis' })
  @Column({ name: 'parameters', type: 'jsonb' })
  parameters: TestParameter[];

  @ApiProperty({ description: 'ID del equipo que realizó el examen' })
  @Column({ name: 'instrument_id', default: 'DYMIND_DH36' })
  instrumentId: string;

  @ApiProperty({ description: 'Datos raw recibidos del equipo' })
  @Column({ name: 'raw_data', type: 'text', nullable: true })
  rawData: string;

  @ApiProperty({ description: 'Estado del procesamiento' })
  @Column({ name: 'processing_status', default: 'unassigned' })
  processingStatus: string;

  @ApiProperty({ description: 'Notas técnicas del laboratorio' })
  @Column({ name: 'technical_notes', type: 'text', nullable: true })
  technicalNotes: string;

  @ApiProperty({ description: 'Estado de asignación de paciente' })
  @Column({ name: 'assignment_status', type: 'varchar', length: 50, default: 'unassigned' })
  assignmentStatus: string;  // 'unassigned', 'assigned', 'verified'

  @ApiProperty({ description: 'Fecha de asignación del paciente' })
  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @ApiProperty({ description: 'Usuario que realizó la asignación' })
  @Column({ name: 'assigned_by', type: 'varchar', length: 255, nullable: true })
  assignedBy: string | null;

  @ApiProperty({ description: 'Notas sobre la asignación del paciente' })
  @Column({ name: 'assignment_notes', type: 'text', nullable: true })
  assignmentNotes: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
