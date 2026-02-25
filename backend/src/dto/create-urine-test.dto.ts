import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, IsOptional, IsEnum, IsArray, 
  ValidateNested, IsNotEmpty, IsUUID, IsDateString, IsBoolean, MinLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { CrystalType, CylinderType, UrineAspect, UrineColor, UrineDensity, UrinePH, Urobilinogen } from 'src/common/enums/urine-test.enums';
import { EscasaModeradaAbundanteQuantity } from 'src/common/enums/escasa-moderada-abundante.enums';
import { EscasaModeradaAbundanteAusenteQuantity } from 'src/common/enums/escasa-moderada-abundante-ausente.enums';
import { NegativePositive4Plus } from 'src/common/enums/negative-positive-4-plus.enums';
import { NegativePositive3Plus } from 'src/common/enums/negative-positive-3-plus.enums';
import { NegativePositive } from 'src/common/enums/negative-positive.enums';
import { CrystalResult } from 'src/common/interfaces/urine-test.interfaces';


class CrystalResultDto implements CrystalResult {

  @ApiProperty({ 
    description: 'Tipo de cristal', 
    enum: CrystalType,
    example: CrystalType.OXALATOS_CALCIO_DIHIDRATADO 
  })
  @IsEnum(CrystalType)
  type: CrystalType;

  @ApiProperty({ 
    description: 'Cantidad observada. Puede expresarse como cantidad por campo o descripción cualitativa', 
    examples: {
      'por-campo': { value: '2-3 por campo' },
      'cualitativo': { value: 'escasos' },
      'cruces': { value: '++' }
    }
  })
  @IsString()
  quantity: string;
}

class CylinderResultDto {
  @ApiProperty({ 
    description: 'Tipo de cilindro', 
    enum: CylinderType,
    example: CylinderType.HIALINOS 
  })
  @IsEnum(CylinderType)
  type: CylinderType;

  @ApiProperty({ 
    description: 'Cantidad observada. Puede expresarse como cantidad por campo o descripción cualitativa', 
    examples: {
      'por-campo': { value: '0-1 por campo' },
      'cualitativo': { value: 'escasos' },
      'descriptivo': { value: 'ocasionales' }
    }
  })
  @IsString()
  quantity: string;
}

export class CreateUrineTestDto {
  @ApiProperty({ 
    description: 'ID del paciente (UUID)', 
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' 
  })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'ID del doctor', required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ 
    description: 'Fecha del examen', 
    example: '2025-09-27T10:00:00.000Z' 
  })
  @IsDateString()
  testDate: string;

  @ApiProperty({ 
      description: 'Número de muestra (se genera automáticamente si no se proporciona)', 
      example: 'UR251003001',
      required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  sampleNumber?: string;

  // ===================
  // EXAMEN FÍSICO (Campos Opcionales)
  // ===================
  @ApiProperty({ 
    description: 'Volumen de la muestra en mL', 
    example: '60 ml',
    required: false
  })
  @IsOptional()
  @IsString()
  volume?: string;

  @ApiProperty({ 
    description: 'Color de la orina', 
    enum: UrineColor, 
    example: UrineColor.AMARILLO,
    required: false,
    enumName: 'UrineColor'
  })
  @IsOptional()
  @IsEnum(UrineColor)
  color?: UrineColor;

  @ApiProperty({ 
    description: 'Aspecto de la orina', 
    enum: UrineAspect, 
    example: UrineAspect.TURBIO,
    required: false 
  })
  @IsOptional()
  @IsEnum(UrineAspect)
  aspect?: UrineAspect;

  @ApiProperty({ 
    description: 'Sedimento', 
    enum: EscasaModeradaAbundanteAusenteQuantity, 
    example: EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE,
    required: false 
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteAusenteQuantity)
  sediment?: EscasaModeradaAbundanteAusenteQuantity;

  @ApiProperty({ 
    description: 'Densidad específica', 
    enum: UrineDensity,
    example: UrineDensity.D1025,
    required: false,
    enumName: 'UrineDensity'
  })
  @IsOptional()
  @IsEnum(UrineDensity)
  density?: UrineDensity;

  @ApiProperty({ 
    description: 'pH de la orina', 
    enum: UrinePH,
    example: UrinePH.PH70,
    required: false,
  })
  @IsOptional()
  @IsEnum(UrinePH)
  ph?: UrinePH;
  
  // ===================
  // EXAMEN QUÍMICO (Campos Opcionales)
  // ===================
  
  @ApiProperty({ 
    description: 'Proteína en orina - resultado cualitativo', 
    enum: NegativePositive4Plus,
    example: NegativePositive4Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive4Plus)
  protein?: NegativePositive4Plus;
  
  @ApiProperty({ 
    description: 'Glucosa en orina - resultado cualitativo', 
    enum: NegativePositive4Plus,
    example: NegativePositive4Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive4Plus)
  glucose?: NegativePositive4Plus;
  
  @ApiProperty({ 
    description: 'Bilirrubinas', 
    enum: NegativePositive3Plus, 
    example: NegativePositive3Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive3Plus)
  bilirubin?: NegativePositive3Plus;

  @ApiProperty({ 
    description: 'Cetonas', 
    enum: NegativePositive3Plus,
    example: NegativePositive3Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive3Plus)
  ketones?: NegativePositive3Plus;

  @ApiProperty({ 
    description: 'Sangre oculta', 
    enum: NegativePositive3Plus, 
    example: NegativePositive3Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive3Plus)
  occultBlood?: NegativePositive3Plus;

  @ApiProperty({ 
    description: 'Nitritos', 
    enum: NegativePositive, 
    example: NegativePositive.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive)
  nitrites?: NegativePositive;

  @ApiProperty({ 
    description: 'Urobilinógeno', 
    enum: Urobilinogen, 
    example: Urobilinogen.U01,
    required: false,
    enumName: 'Urobilinogen'
  })
  @IsOptional()
  @IsEnum(Urobilinogen)
  urobilinogen?: Urobilinogen;

  @ApiProperty({ 
    description: 'Leucocitos en orina', 
    enum: NegativePositive3Plus,
    example: NegativePositive3Plus.NEGATIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(NegativePositive3Plus)
  leukocytes?: NegativePositive3Plus;

  // ===================
  // EXAMEN MICROSCÓPICO (Campos Opcionales)
  // ===================

  @ApiProperty({ 
    description: 'Células epiteliales', 
    enum: EscasaModeradaAbundanteQuantity,
    example: EscasaModeradaAbundanteQuantity.MODERADA,
    required: false 
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteQuantity)
  epithelialCells?: EscasaModeradaAbundanteQuantity;

  @ApiProperty({ 
    description: 'Leucocitos por campo (formato libre)', 
    example: '0-2 x campo',
    required: false 
  })
  @IsOptional()
  @IsString()
  leukocytesField?: string;

  @ApiProperty({ 
    description: 'Eritrocitos por campo (formato libre)', 
    example: '0-2 x campo',
    required: false 
  })
  @IsOptional()
  @IsString()
  erythrocytesField?: string;

  @ApiProperty({ 
    description: 'Bacterias', 
    enum: EscasaModeradaAbundanteQuantity,
    example: EscasaModeradaAbundanteQuantity.ABUNDANTE,
    required: false 
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteQuantity)
  bacteria?: EscasaModeradaAbundanteQuantity;

  @ApiProperty({ 
    description: 'Filamentos mucosos', 
    enum: EscasaModeradaAbundanteQuantity,
    example: EscasaModeradaAbundanteQuantity.ABUNDANTE,
    required: false 
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteQuantity)
  mucousFilaments?: EscasaModeradaAbundanteQuantity;

  @ApiProperty({ 
    description: 'Levaduras', 
    enum: EscasaModeradaAbundanteQuantity,
    example: EscasaModeradaAbundanteQuantity.ESCASA,
    required: false 
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteQuantity)
  yeasts?: EscasaModeradaAbundanteQuantity;

  @ApiProperty({ 
    description: 'Cristales encontrados', 
    type: 'array',
    example: [
      { type: CrystalType.OXALATOS_CALCIO_DIHIDRATADO, quantity: '2-3 por campo' },
      { type: CrystalType.ACIDO_URICO, quantity: 'abundante' }
    ],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrystalResultDto)
  crystals?: CrystalResultDto[];

  @ApiProperty({ 
    description: 'Cilindros encontrados', 
    type: 'array',
    example: [
      { type: CylinderType.HIALINOS, quantity: 'escasos' },
      { type: CylinderType.GRANULOSO_FINO, quantity: '0-1 por campo' }
    ],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CylinderResultDto)
  cylinders?: CylinderResultDto[];

  // ===================
  // OTROS CAMPOS (Opcionales)
  // ===================

  @ApiProperty({ 
    description: 'Otros hallazgos', 
    example: 'Sin observaciones adicionales',
    required: false 
  })
  @IsOptional()
  @IsString()
  others?: string;

  @ApiProperty({ 
    description: 'Observaciones adicionales del técnico',
    example: 'Muestra procesada correctamente',
    required: false 
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ 
    description: 'Estado del examen',
    example: 'completed',
    required: false 
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ 
    description: 'ID del usuario que creó el examen', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @ApiProperty({ 
    description: 'Indica si el examen de orina está activo/vigente',
    example: true,
    default: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}