import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, MinLength, IsBoolean, IsUUID, IsIn } from 'class-validator';
import { 
  StoolColor, 
  StoolConsistency, 
  StoolShape,
  ParasiteType,
  ProtozooType
} from '../common/enums/stool-test.enums';
import { ParasiteResult, ProtozooResult } from 'src/common/interfaces/stool-test.interfaces';
import { EscasaModeradaAbundanteAusenteQuantity } from 'src/common/enums/escasa-moderada-abundante-ausente.enums';

export class CreateStoolTestDto {

  @ApiProperty({ description: 'ID del paciente', required: true })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'ID del doctor', required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ 
    description: 'Número de muestra (se genera automáticamente si no se proporciona)', 
    example: 'ST251003001',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  sampleNumber?: string;

  @ApiProperty({ 
    description: 'Fecha del examen', 
    example: '2025-09-29T14:30:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  testDate?: string;

  // EXAMEN FÍSICO
  @ApiProperty({ 
    description: 'Color de las heces', 
    enum: StoolColor,
    example: StoolColor.CAFE,
    required: false
  })
  @IsOptional()
  @IsEnum(StoolColor)
  color?: StoolColor;

  @ApiProperty({ 
    description: 'Consistencia de las heces', 
    enum: StoolConsistency,
    example: StoolConsistency.FORMADA,
    required: false
  })
  @IsOptional()
  @IsEnum(StoolConsistency)
  consistency?: StoolConsistency;

  @ApiProperty({ 
    description: 'Forma/cantidad de las heces', 
    enum: StoolShape,
    example: StoolShape.MODERADO,
    required: false
  })
  @IsOptional()
  @IsEnum(StoolShape)
  shape?: StoolShape;

  @ApiProperty({ 
    description: 'Presencia de moco', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA,
    required: false
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteAusenteQuantity)
  mucus?: EscasaModeradaAbundanteAusenteQuantity;

  // EXAMEN MICROSCÓPICO
  @ApiProperty({ 
    description: 'Nivel de leucocitos', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.ESCASA,
    required: false
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteAusenteQuantity)
  leukocytes?: EscasaModeradaAbundanteAusenteQuantity;

  @ApiProperty({ 
    description: 'Nivel de eritrocitos', 
    enum: EscasaModeradaAbundanteAusenteQuantity,
    example: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA,
    required: false
  })
  @IsOptional()
  @IsEnum(EscasaModeradaAbundanteAusenteQuantity)
  erythrocytes?: EscasaModeradaAbundanteAusenteQuantity;

  @ApiProperty({ 
    description: `Resultados de parásitos. 
    Opciones para type: ${Object.values(ParasiteType).join(', ')}, o 'NO SE OBSERVAN EN ESTA MUESTRA'
    La cantidad es un texto libre que describe la cantidad observada`,
    isArray: true,
    example: [
      { type: ParasiteType.ASCARIS_LUMBRICOIDES, quantity: '2-3 por campo' },
      { type: ParasiteType.TRICHURIS_TRICHIURA, quantity: '1 por campo' }
    ],
    required: false
  })
  @IsOptional()
  parasites?: ParasiteResult[];

  @ApiProperty({
    description: `Resultados de protozoos.
    Opciones para type: ${Object.values(ProtozooType).join(', ')}, o 'NO SE OBSERVA EN ESTA MUESTRA'
    La cantidad es un texto libre que describe la cantidad observada`,
    isArray: true,
    example: [
      { type: ProtozooType.BLASTOCYSTIS_HOMINIS, quantity: '4+ por campo' },
      { type: ProtozooType.GIARDIA_DUODENALIS, quantity: 'escasos' }
    ],
    required: false
  })
  @IsOptional()
  protozoos?: ProtozooResult[];

  // Campos del sistema
  @ApiProperty({ 
    description: 'Observaciones adicionales del técnico',
    required: false,
    example: 'Muestra procesada correctamente. Resultados normales.',
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ 
    description: 'Estado del examen',
    enum: ['pending', 'completed', 'reviewed'],
    required: false,
    example: 'completed',
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'reviewed'])
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
    description: 'Indica si el examen está activo (soft-delete)', 
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}