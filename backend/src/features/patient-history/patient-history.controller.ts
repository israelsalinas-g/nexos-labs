import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PatientHistoryService } from './patient-history.service';
import { PatientWithExamsHistoryDto, TestTrendPointDto } from '../../dto/patient-assignment.dto';

@ApiTags('Patient History')
@Controller('patients-history')
export class PatientHistoryController {
  constructor(private readonly patientHistoryService: PatientHistoryService) {}

  @Get(':patientId/exams-summary')
  @ApiOperation({ summary: 'Historial unificado de exámenes del paciente (5 fuentes)' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Fecha inicio (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Fecha fin (ISO 8601)' })
  @ApiQuery({ name: 'testType', required: false, enum: ['DH36', 'ICHROMA', 'URINE', 'HECES', 'LAB'] })
  @ApiResponse({ status: 200, type: PatientWithExamsHistoryDto })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async getPatientExamsSummary(
    @Param('patientId') patientId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('testType') testType?: string,
  ): Promise<PatientWithExamsHistoryDto> {
    try {
      return await this.patientHistoryService.getPatientWithExamsHistory(patientId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        testType,
      });
    } catch (error) {
      throw new HttpException(
        `Error obteniendo historial del paciente: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':patientId/test-trend/:testDefinitionId')
  @ApiOperation({ summary: 'Serie temporal de valores numéricos de una prueba (para gráfica de tendencia)' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiParam({ name: 'testDefinitionId', description: 'ID de la definición de prueba' })
  @ApiResponse({ status: 200, description: 'Array de puntos de tendencia ordenados cronológicamente' })
  async getTestTrend(
    @Param('patientId') patientId: string,
    @Param('testDefinitionId', ParseIntPipe) testDefinitionId: number,
  ): Promise<TestTrendPointDto[]> {
    try {
      return await this.patientHistoryService.getTestTrend(patientId, testDefinitionId);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo tendencia: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
