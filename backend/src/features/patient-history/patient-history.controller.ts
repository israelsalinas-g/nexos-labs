import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PatientHistoryService } from './patient-history.service';
import { PatientWithExamsHistoryDto } from '../../dto/patient-assignment.dto';

@ApiTags('Patient History')
@Controller('patients-history')
export class PatientHistoryController {
  constructor(private readonly patientHistoryService: PatientHistoryService) {}

  @Get(':patientId/exams-summary')
  @ApiOperation({ 
    summary: 'Obtener información del paciente con historial de exámenes',
    description: 'Retorna los datos del paciente junto con un array de todos sus exámenes realizados, ordenados por fecha (más recientes primero). Incluye solo información meta de exámenes sin detalles de resultados.'
  })
  @ApiParam({
    name: 'patientId',
    description: 'ID único del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Información del paciente con exámenes obtenida exitosamente',
    type: PatientWithExamsHistoryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente no encontrado',
  })
  async getPatientExamsSummary(
    @Param('patientId') patientId: string,
  ): Promise<PatientWithExamsHistoryDto> {
    try {
      return await this.patientHistoryService.getPatientWithExamsHistory(patientId);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo información del paciente: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}