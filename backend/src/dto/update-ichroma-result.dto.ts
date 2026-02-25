import { PartialType } from '@nestjs/swagger';
import { CreateIChromaResultDto } from './create-ichroma-result.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum IChromaProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ERROR = 'error',
  MANUAL_REVIEW = 'manual_review'
}

export class UpdateIChromaResultDto extends PartialType(CreateIChromaResultDto) {
  @ApiProperty({
    description: 'Estado del procesamiento del resultado iChroma',
    enum: IChromaProcessingStatus,
    example: IChromaProcessingStatus.MANUAL_REVIEW,
    required: false,
  })
  @IsOptional()
  @IsEnum(IChromaProcessingStatus)
  processingStatus?: IChromaProcessingStatus;

  @ApiProperty({
    description: 'Comentarios o notas del técnico de laboratorio sobre el resultado iChroma',
    example: 'Resultado de Beta HCG verificado y confirmado',
    required: false,
  })
  @IsOptional()
  @IsString()
  technicalNotes?: string;
}