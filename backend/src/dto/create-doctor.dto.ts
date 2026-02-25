import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Nombres del médico',
    example: 'Juan Carlos',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del médico',
    example: 'Pérez López',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Especialidad médica',
    example: 'Medicina Interna',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiProperty({
    description: 'Número de licencia o colegiatura médica',
    example: 'CM-12345',
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @ApiProperty({
    description: 'Número de teléfono (8 dígitos)',
    example: '99999999',
    pattern: '^[0-9]{8}$',
    required: false
  })
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'El número de teléfono debe tener exactamente 8 dígitos numéricos'
  })
  phone?: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'dr.perez@hospital.com',
    format: 'email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Dirección del consultorio o clínica',
    example: 'Consultorio 301, Edificio Médico Central',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Institución u hospital donde trabaja',
    example: 'Hospital General San Felipe',
    required: false,
    maxLength: 150
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  institution?: string;

  @ApiProperty({
    description: 'Indica si el médico pertenece al staff de la clínica',
    example: true,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isStaff?: boolean;

  @ApiProperty({
    description: 'Indica si el médico está activo en el sistema',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Notas adicionales sobre el médico',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
