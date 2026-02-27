import { IsArray, IsIn, ArrayMinSize, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendResultsDto {
  @ApiProperty({
    description: 'Canales por los que enviar los resultados',
    enum: ['email', 'whatsapp'],
    isArray: true,
    example: ['email', 'whatsapp'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['email', 'whatsapp'], { each: true })
  channels: ('email' | 'whatsapp')[];

  @ApiPropertyOptional({
    description: 'PDF del reporte de resultados en base64 (generado en el frontend con jsPDF)',
    example: 'JVBERi0xLjMK...',
  })
  @IsOptional()
  @IsString()
  pdfBase64?: string;

  @ApiPropertyOptional({
    description: 'Número de orden para el nombre del archivo adjunto',
    example: 'ORD-2026-000001',
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;
}
