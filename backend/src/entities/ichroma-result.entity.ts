import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';

@Entity('ichroma_results')
export class IChromaResult {
  @ApiProperty({ description: 'ID único del resultado iChroma' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tipo de mensaje HL7 (MSH)' })
  @Column({ name: 'message_type', nullable: true })
  messageType: string;

  @ApiProperty({ description: 'ID del dispositivo' })
  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @ApiProperty({ description: 'ID del paciente del sistema (relación opcional)' })
  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId: string | null;

  @ApiProperty({ description: 'Relación con el paciente del sistema', type: () => Patient, required: false })
  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient | null;

  @ApiProperty({ description: 'ID del paciente según iChroma II' })
  @Column({ name: 'patient_id_ichroma2', nullable: true })
  patientIdIchroma2: string;

  @ApiProperty({ description: 'Nombre del paciente según iChroma II' })
  @Column({ name: 'patient_name_ichroma2', nullable: true })
  patientNameIchroma2: string;

  @ApiProperty({ description: 'Edad del paciente según iChroma II' })
  @Column({ name: 'patient_age_ichroma2', type: 'integer', nullable: true })
  patientAgeIchroma2: number | null;

  @ApiProperty({ description: 'Sexo del paciente según iChroma II' })
  @Column({ name: 'patient_sex_ichroma2', nullable: true })
  patientSexIchroma2: string;

  @ApiProperty({ description: 'Código del tipo de test (ej: SL033)' })
  @Column({ name: 'test_type', nullable: true })
  testType: string;

  @ApiProperty({ description: 'Nombre del test (ej: Beta HCG)' })
  @Column({ name: 'test_name', nullable: true })
  testName: string;

  @ApiProperty({ description: 'Resultado del test' })
  @Column({ name: 'result', nullable: true })
  result: string;

  @ApiProperty({ description: 'Unidad del resultado (ej: mIU/mL)' })
  @Column({ name: 'unit', nullable: true })
  unit: string;

  @ApiProperty({ description: 'Valor mínimo de referencia' })
  @Column({ name: 'reference_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  referenceMin: number | null;

  @ApiProperty({ description: 'Valor máximo de referencia' })
  @Column({ name: 'reference_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  referenceMax: number | null;

  @ApiProperty({ description: 'Serial del cartucho' })
  @Column({ name: 'cartridge_serial', nullable: true })
  cartridgeSerial: string;

  @ApiProperty({ description: 'Lote del cartucho' })
  @Column({ name: 'cartridge_lot', nullable: true })
  cartridgeLot: string;

  @ApiProperty({ description: 'Humedad durante el test' })
  @Column({ name: 'humidity', type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity: number | null;

  @ApiProperty({ description: 'Código de barras de la muestra' })
  @Column({ name: 'sample_barcode', nullable: true })
  sampleBarcode: string;

  @ApiProperty({ description: 'Fecha y hora del test' })
  @Column({ name: 'test_date', type: 'timestamp' })
  testDate: Date;

  @ApiProperty({ description: 'Mensaje HL7 raw completo' })
  @Column({ name: 'raw_message', type: 'text', nullable: true })
  rawMessage: string;

  @ApiProperty({ description: 'Datos JSON originales del iChroma' })
  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: any;

  @ApiProperty({ description: 'ID del instrumento' })
  @Column({ name: 'instrument_id', default: 'ICHROMA_II' })
  instrumentId: string;

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