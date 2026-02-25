import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Genres, GenresExample } from '../common/enums/genres.enums';
import { BloodType, BloodTypeExample } from '../common/enums/blood-type.enums';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nombre completo del paciente (Campo obligatorio)',
    example: 'María Alejandra González López',
    minLength: 2,
    maxLength: 100,
    required: true
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente (Campo obligatorio)',
    example: '1988-03-15',
    type: 'string',
    format: 'date',
    required: true
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: 'Sexo del paciente (Campo obligatorio)',
    enum: Genres,
    example: Genres.FEMALE,
    required: true
  })
  @IsEnum(Genres)
  sex: Genres;

  @ApiProperty({
    description: 'Número de teléfono (8 dígitos) (Campo obligatorio)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: true
  })
  @Matches(/^[0-9]{8}$/, {
    message: 'El número de teléfono debe tener exactamente 8 dígitos numéricos'
  })
  phone: string;

  // CAMPOS OPCIONALES
  
  @ApiProperty({
    description: 'Edad del paciente en años (Opcional - se calcula automáticamente desde fecha de nacimiento)',
    example: 35,
    minimum: 0,
    maximum: 150,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiProperty({
    description: 'Grupo de referencia para los exámenes (Opcional)',
    example: 'Adulto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceGroup?: string;

  @ApiProperty({
    description: 'Número de Identidad de Honduras (13 dígitos)',
    example: '0801199912345',
    pattern: '^[0-9]{13}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{13}$/, {
    message: 'El número de identidad debe tener exactamente 13 dígitos numéricos'
  })
  dni?: string;

  @ApiProperty({
    description: 'Correo electrónico (Opcional)',
    example: 'maria.gonzalez@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Dirección del paciente',
    example: 'Colonia Los Pinos, Casa #123',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty(BloodTypeExample)
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiProperty({
    description: 'Alergias conocidas del paciente',
    example: 'Alérgico a la penicilina y mariscos',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    description: 'Historia médica del paciente',
    example: 'Hipertensión arterial controlada',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({
    description: 'Medicamentos actuales',
    example: 'Losartán 50mg diario',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiProperty({
    description: 'Estado activo del paciente',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'Juan Carlos González',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiProperty({
    description: 'Relación con el contacto de emergencia',
    example: 'Esposo',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactRelationship?: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia (8 dígitos)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: false,
  })
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'El número de teléfono debe tener exactamente 8 dígitos numéricos'
  })
  emergencyContactPhone?: string;
}