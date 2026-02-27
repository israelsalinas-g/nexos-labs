import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad para configuración dinámica del laboratorio.
 * Tabla clave-valor tipada que permite editar nombre, logo, contacto y colores PDF desde la UI.
 * Las credenciales sensibles (SMTP, Twilio) permanecen en .env.
 */
@Entity('lab_settings')
export class LabSetting {
  @ApiProperty({ description: 'ID único', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Clave única del setting', example: 'lab_name' })
  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @ApiProperty({ description: 'Valor del setting', nullable: true })
  @Column({ type: 'text', nullable: true })
  value: string | null;

  @ApiProperty({ description: 'Etiqueta amigable para la UI', example: 'Nombre del laboratorio' })
  @Column({ type: 'varchar', length: 150, nullable: true })
  label: string | null;

  @ApiProperty({
    description: 'Tipo de input en la UI: text | textarea | image | color',
    example: 'text',
  })
  @Column({ type: 'varchar', length: 20, default: 'text' })
  type: string;

  @ApiProperty({
    description: 'Grupo/sección de la UI: general | contact | pdf',
    example: 'general',
  })
  @Column({ name: 'group_name', type: 'varchar', length: 50, nullable: true })
  groupName: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
