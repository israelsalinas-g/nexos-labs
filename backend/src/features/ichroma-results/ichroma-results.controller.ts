import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IChromaResultsService } from './ichroma-results.service';
import { CreateIChromaResultDto } from '../../dto/create-ichroma-result.dto';
import { UpdateIChromaResultDto } from '../../dto/update-ichroma-result.dto';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { AssignPatientDto, UnassignedResultDto } from '../../dto/patient-assignment.dto';
import { PaginationResult } from '../../common/interfaces';

@ApiTags('Special Tests - iChroma II Results')
@Controller('ichroma-results')
export class IChromaResultsController {
  constructor(private readonly ichromaResultsService: IChromaResultsService) {}

  // POST endpoint para recibir datos del iChroma II
  @Post('data')
  @ApiOperation({ 
    summary: 'Recibir datos del analizador iChroma II',
    description: 'Endpoint para recibir datos JSON del equipo iChroma II para química clínica'
  })
  @ApiResponse({
    status: 201,
    description: 'Datos procesados e insertados exitosamente',
    type: IChromaResult,
  })
  async receiveIChromaData(@Body() rawData: any): Promise<{ 
    success: boolean; 
    message: string; 
    result: IChromaResult;
  }> {
    try {
      console.log('\n📡 RECIBIENDO DATOS DEL ICHROMA II');
      console.log('Raw data:', JSON.stringify(rawData, null, 2));
      
      if (!rawData) {
        throw new Error('No se recibieron datos');
      }

      const result = await this.ichromaResultsService.processIChromaData(rawData);
      
      return {
        success: true,
        message: `Test ${result.testName} procesado exitosamente para paciente ${result.patientNameIchroma2}`,
        result
      };
      
    } catch (error) {
      console.error('❌ Error procesando datos iChroma:', error);
      throw new HttpException(
        `Error procesando datos iChroma: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET endpoint para obtener todos los resultados
  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los resultados iChroma con filtros opcionales',
    description: 'Obtiene una lista paginada de todos los resultados del iChroma II con filtro opcional por nombre de paciente'
  })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Límite de resultados' })
  @ApiQuery({ name: 'offset', required: false, type: 'number', description: 'Offset para paginación' })
  @ApiQuery({ name: 'patientName', required: false, type: 'string', description: 'Filtrar por nombre del paciente (búsqueda parcial)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados iChroma',
    type: [IChromaResult],
  })
  async findAll(
    @Query('limit') limit: number = 4,
    @Query('offset') offset: number = 0,
    @Query('patientName') patientName?: string,
  ): Promise<PaginationResult<IChromaResult>> {
    return this.ichromaResultsService.findAll(limit, offset, patientName);
  }

  // GET endpoint para obtener un resultado específico
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener resultado iChroma por ID',
    description: 'Obtiene un resultado específico del iChroma II por su ID'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID único del resultado iChroma',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado iChroma encontrado',
    type: IChromaResult,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<IChromaResult> {
    const result = await this.ichromaResultsService.findOne(id);
    if (!result) {
      throw new NotFoundException(`Resultado iChroma con ID ${id} no encontrado`);
    }
    return result;
  }

  // GET endpoint para buscar por paciente
  @Get('patient/:patientId')
  @ApiOperation({ 
    summary: 'Obtener resultados por ID de paciente',
    description: 'Obtiene todos los resultados iChroma de un paciente específico'
  })
  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'ID del paciente',
    example: '12345'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados del paciente',
    type: [IChromaResult],
  })
  async findByPatient(@Param('patientId') patientId: string): Promise<IChromaResult[]> {
    return this.ichromaResultsService.findByPatientId(patientId);
  }

  // GET endpoint para buscar por tipo de test
  @Get('test-type/:testType')
  @ApiOperation({ 
    summary: 'Obtener resultados por tipo de test',
    description: 'Obtiene todos los resultados de un tipo específico de test (ej: SL033)'
  })
  @ApiParam({
    name: 'testType',
    type: 'string',
    description: 'Código del tipo de test',
    example: 'SL033'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados del tipo de test',
    type: [IChromaResult],
  })
  async findByTestType(@Param('testType') testType: string): Promise<IChromaResult[]> {
    return this.ichromaResultsService.findByTestType(testType);
  }

  // PUT endpoint para actualizar un resultado
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar resultado iChroma',
    description: 'Permite actualizar un resultado iChroma existente'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID único del resultado iChroma',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado actualizado exitosamente',
    type: IChromaResult,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado no encontrado',
  })
  async updateResult(
    @Param('id') id: string,
    @Body() updateIChromaResultDto: UpdateIChromaResultDto,
  ): Promise<{
    success: boolean;
    message: string;
    result: IChromaResult;
  }> {
    try {
      const updatedResult = await this.ichromaResultsService.update(id, updateIChromaResultDto);
      
      if (!updatedResult) {
        throw new NotFoundException(`Resultado iChroma con ID ${id} no encontrado`);
      }

      return {
        success: true,
        message: `Resultado iChroma ID ${id} actualizado exitosamente`,
        result: updatedResult,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        `Error actualizando resultado iChroma: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET endpoint para estadísticas
  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de resultados iChroma',
    description: 'Obtiene un resumen estadístico de todos los resultados iChroma'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de resultados iChroma',
  })
  async getStats(): Promise<{
    total: number;
    byTestType: Array<{ testType: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    return this.ichromaResultsService.getStats();
  }

  // POST endpoint para prueba con datos de ejemplo
  @Post('test/sample')
  @ApiOperation({ 
    summary: 'Probar con datos de ejemplo',
    description: 'Endpoint para probar el sistema con datos de ejemplo del iChroma II'
  })
  @ApiResponse({
    status: 201,
    description: 'Datos de prueba procesados',
    type: IChromaResult,
  })
  async testWithSample(): Promise<{ 
    success: boolean; 
    message: string; 
    result: IChromaResult;
  }> {
    const sampleData = {
      "messageType": "MSH",
      "deviceId": "^~\\&",
      "patientId": "1",
      "patientName": "ichroma2",
      "testType": "SL033",
      "testName": "",
      "result": "< 5.00",
      "unit": "mIU/mL",
      "referenceMin": null,
      "referenceMax": 1,
      "cartridgeSerial": "T",
      "cartridgeLot": "2.6",
      "humidity": null,
      "sampleBarcode": "HCUGG05EX",
      "testDate": "2025-09-27T14:41:32.709Z",
      "rawMessage": "MSH|^~\\&|1|ichroma2|SL033||20250207145457||OUL^R24^OUL_R24|1|T|2.6\rPID||josselyn caroli|||||26|Femenino\rOBR||Beta HCG|0|1|||20250207145457|||-\rORC|OK|||||||||||||||||SL033|1\rSPM|1|HCUGG05EX|||||||||||||||||20260228\rOBX|1|TX|Beta HCG||< 5.00|mIU/mL||0|||R\r\u001c"
    };

    try {
      const result = await this.ichromaResultsService.processIChromaData(sampleData);
      
      return {
        success: true,
        message: `Test de ejemplo procesado: Beta HCG con resultado ${result.result} ${result.unit}`,
        result
      };
      
    } catch (error) {
      throw new HttpException(
        `Error en prueba iChroma: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ===== ENDPOINTS DE ASIGNACIÓN DE PACIENTES =====

  @Get('unassigned')
  @ApiOperation({ 
    summary: 'Obtener resultados iChroma sin paciente asignado',
    description: 'Lista todos los resultados de iChroma II que aún no tienen un paciente asignado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados sin asignar obtenida exitosamente',
    type: [UnassignedResultDto],
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Número máximo de resultados a retornar',
    example: 50 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    description: 'Número de resultados a omitir',
    example: 0 
  })
  async getUnassignedResults(
    @Query('limit') limit: number = 4,
    @Query('offset') offset: number = 0,
  ): Promise<UnassignedResultDto[]> {
    try {
      return await this.ichromaResultsService.getUnassignedResults(limit, offset);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados sin asignar: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/assign-patient')
  @ApiOperation({ 
    summary: 'Asignar paciente a resultado iChroma',
    description: 'Asigna un paciente específico a un resultado de iChroma II'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del resultado de iChroma',
    example: 123
  })
  @ApiResponse({
    status: 200,
    description: 'Paciente asignado exitosamente al resultado',
    type: IChromaResult,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado de iChroma no encontrado',
  })
  async assignPatient(
    @Param('id') id: string,
    @Body() assignPatientDto: AssignPatientDto,
  ): Promise<IChromaResult> {
    try {
      return await this.ichromaResultsService.assignPatient(id, assignPatientDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        `Error asignando paciente: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('by-assignment-status/:status')
  @ApiOperation({ 
    summary: 'Obtener resultados iChroma por estado de asignación',
    description: 'Filtra resultados de iChroma II por su estado de asignación de paciente'
  })
  @ApiParam({
    name: 'status',
    description: 'Estado de asignación: unassigned, assigned, verified',
    enum: ['unassigned', 'assigned', 'verified'],
    example: 'assigned'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados filtrados por estado de asignación',
    type: [IChromaResult],
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Número máximo de resultados a retornar',
    example: 50 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    description: 'Número de resultados a omitir',
    example: 0 
  })
  async getResultsByAssignmentStatus(
    @Param('status') status: string,
    @Query('limit') limit: number = 4,
    @Query('offset') offset: number = 0,
  ): Promise<IChromaResult[]> {
    try {
      return await this.ichromaResultsService.getResultsByAssignmentStatus(status, limit, offset);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados por estado: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/by-patient-name/:name')
  @ApiOperation({ 
    summary: 'Buscar resultados iChroma por nombre de paciente',
    description: 'Busca resultados usando el nombre del paciente que viene del equipo'
  })
  @ApiParam({
    name: 'name',
    description: 'Nombre del paciente a buscar (búsqueda parcial)',
    example: 'maria'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados que coinciden con el nombre',
    type: [IChromaResult],
  })
  async searchByPatientName(
    @Param('name') name: string,
  ): Promise<IChromaResult[]> {
    try {
      return await this.ichromaResultsService.searchByPatientName(name);
    } catch (error) {
      throw new HttpException(
        `Error buscando por nombre: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sample/:sampleId')
  @ApiOperation({ 
    summary: 'Buscar resultado por número de muestra',
    description: 'Busca un resultado específico usando el número de muestra del laboratorio'
  })
  @ApiParam({
    name: 'sampleId',
    description: 'Número de muestra (ej: INVAA12, HCUGG05EX)',
    example: 'INVAA12'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado encontrado por número de muestra',
    type: IChromaResult,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado no encontrado',
  })
  async findBySampleId(
    @Param('sampleId') sampleId: string,
  ): Promise<IChromaResult> {
    try {
      const result = await this.ichromaResultsService.findBySampleId(sampleId);
      if (!result) {
        throw new NotFoundException(`Resultado con número de muestra ${sampleId} no encontrado`);
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        `Error buscando por número de muestra: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}