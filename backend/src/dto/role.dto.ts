import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, MinLength, MaxLength, Min, Max, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre único del rol',
    enum: ['SUPERADMIN', 'ADMIN', 'TECNICO', 'OPERADOR'],
    example: 'TECNICO'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Nivel del rol (1=máximo, 4=mínimo)',
    example: 3,
    minimum: 1,
    maximum: 4
  })
  @IsInt()
  @Min(1)
  @Max(4)
  level: number;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario técnico con permisos de laboratorio',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario técnico con permisos de laboratorio',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Código único del permiso',
    example: 'CREATE_USER',
    maxLength: 100
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevos usuarios',
    maxLength: 200
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  description: string;
}
