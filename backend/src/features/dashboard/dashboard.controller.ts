import { 
  Controller, 
  Get, 
  HttpCode, 
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardCardDto } from '../../dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtener cards del dashboard - Endpoint principal y único
   * Retorna un array de cards con métricas resumidas para mostrar en el frontend
   */
  @Get('cards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener cards del dashboard',
    description: 'Retorna un array de cards con todas las métricas resumidas del sistema. Formato simplificado ideal para tableros con layout de cards.'
  })
  @ApiResponse({
    status: 200,
    description: 'Cards del dashboard obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Médicos' },
          value: { type: 'number', example: 15 },
          icon: { type: 'string', example: 'fa-stethoscope' },
          color: { type: 'string', example: 'primary' },
          description: { type: 'string', example: 'Profesionales activos' },
          trend: { type: 'string', enum: ['up', 'down', 'stable'], example: 'up' },
          trendPercent: { type: 'number', example: 5.2 }
        }
      }
    }
  })
  async getDashboardCards(): Promise<any[]> {
    return this.dashboardService.getDashboardCards();
  }
}