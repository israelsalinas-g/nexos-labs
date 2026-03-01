import { IsArray, IsIn, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
