import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LisServerService } from './lis-server.service';

@ApiTags('LIS Server')
@Controller('lis-server')
export class LisServerController {
  constructor(private readonly lisServerService: LisServerService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener el estado del servidor LIS' })
  @ApiResponse({
    status: 200,
    description: 'Estado del servidor obtenido exitosamente',
  })
  getServerStatus() {
    return this.lisServerService.getServerStatus();
  }
}
