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
import { DymindDh36ResultsService } from './dymind-dh36-results.service';
import { CreateDymindDh36ResultDto } from '../../dto/create-dymind-dh36-result.dto';
import { UpdateDymindDh36ResultDto } from '../../dto/update-dymind-dh36-result.dto';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { AssignPatientDto, UnassignedResultDto } from '../../dto/patient-assignment.dto';
import { PaginationResult } from '../../common/interfaces';

@ApiTags('Hemogram - DyMind DH36 Results')
@Controller('dymind-dh36-results')
export class DymindDh36ResultsController {
  constructor(private readonly dymindDh36ResultsService: DymindDh36ResultsService) {}

  // POST endpoint para recibir datos del DH36
  @Post('dh36')
  @ApiOperation({ 
    summary: 'Recibir datos del analizador DH36',
    description: 'Endpoint para recibir uno o varios registros HL7 del equipo Dymind DH36'
  })
  @ApiResponse({
    status: 201,
    description: 'Datos procesados e insertados exitosamente',
    type: [DymindDh36Result],
  })
  async receiveDH36Data(@Body('data') rawData: string): Promise<{ 
    success: boolean; 
    message: string; 
    count: number; 
    results: DymindDh36Result[] 
  }> {
    try {
      console.log('\n📡 RECIBIENDO DATOS DEL DH36');
      console.log('Raw data:', rawData);
      
      if (!rawData) {
        throw new Error('No se recibieron datos');
      }
      
      const results = await this.dymindDh36ResultsService.processHL7Data(rawData);
      
      return {
        success: true,
        message: `${results.length} registros procesados exitosamente`,
        count: results.length,
        results
      };
      
    } catch (error) {
      console.error('❌ Error en el endpoint DH36:', error.message);
      throw new HttpException(
        `Error procesando datos del DH36: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET endpoints para el frontend
  @Get()
  @ApiOperation({ summary: 'Obtener todos los resultados de laboratorio con filtros opcionales' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados por página' })
  @ApiQuery({ name: 'patientName', required: false, type: String, description: 'Filtrar por nombre del paciente (búsqueda parcial)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados obtenida exitosamente con paginación',
    type: [DymindDh36Result],
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientName') patientName?: string,
  ): Promise<PaginationResult<DymindDh36Result>> {
    try {
      return await this.dymindDh36ResultsService.findAll(page || 1, limit || 4, patientName);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un resultado específico por ID' })
  @ApiParam({ name: 'id', description: 'ID del resultado' })
  @ApiResponse({
    status: 200,
    description: 'Resultado encontrado',
    type: DymindDh36Result,
  })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado' })
  async findOne(@Param('id') id: string): Promise<DymindDh36Result> {
    try {
      const result = await this.dymindDh36ResultsService.findOne(id);
      if (!result) {
        throw new HttpException('Resultado no encontrado', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error obteniendo resultado: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sample/:sampleNumber')
  @ApiOperation({ summary: 'Obtener resultados por número de muestra' })
  @ApiParam({ name: 'sampleNumber', description: 'Número de muestra' })
  @ApiResponse({
    status: 200,
    description: 'Resultados encontrados para la muestra',
    type: [DymindDh36Result],
  })
  async findBySample(@Param('sampleNumber') sampleNumber: string): Promise<DymindDh36Result[]> {
    try {
      return await this.dymindDh36ResultsService.findBySampleNumber(sampleNumber);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados por muestra: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener resultados por ID de paciente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Resultados encontrados para el paciente',
    type: [DymindDh36Result],
  })
  async findByPatient(@Param('patientId') patientId: string): Promise<DymindDh36Result[]> {
    try {
      return await this.dymindDh36ResultsService.findByPatientId(patientId);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados por paciente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint de prueba
  @Post('test')
  @ApiOperation({ 
    summary: 'Endpoint de prueba con datos de ejemplo del hemograma completo',
    description: 'Simula un mensaje HL7 completo con los 21 parámetros del hemograma del DH36'
  })
  async testWithSampleData(): Promise<{ 
    success: boolean; 
    message: string; 
    count: number; 
    results: DymindDh36Result[] 
  }> {
    // Simulando un mensaje HL7 completo con múltiples parámetros como en la pantalla del DH36
    const sampleData = `OBR|1||1045|01001^Automated Count^99MRC||20250909145729|20250909145729|||||||20250909145729||||||||||HM
OBX|1|NM|WBC^Leucocitos^LN||7.35|10*3/uL|4.0-10.0|N|||F
OBX|2|NM|LYM%^Linfocitos %^LN||43.1|%|20.0-40.0|H|||F
OBX|3|NM|GRA%^Granulocitos %^LN||50.2|%|50.0-70.0|N|||F
OBX|4|NM|MID%^Monocitos %^LN||6.7|%|2.0-10.0|N|||F
OBX|5|NM|LYM#^Linfocitos^LN||3.17|10*3/uL|1.0-4.0|N|||F
OBX|6|NM|GRA#^Granulocitos^LN||3.69|10*3/uL|2.0-7.0|N|||F
OBX|7|NM|MID#^Monocitos^LN||0.49|10*3/uL|0.2-1.0|N|||F
OBX|8|NM|RBC^Eritrocitos^LN||3.68|10*6/uL|4.0-5.5|L|||F
OBX|9|NM|HGB^Hemoglobina^LN||110.9|g/dL|120-160|L|||F
OBX|10|NM|HCT^Hematocrito^LN||33.4|%|37.0-47.0|L|||F
OBX|11|NM|MCV^VCM^LN||91.4|fL|82.0-92.0|N|||F
OBX|12|NM|MCH^HCM^LN||30.1|pg|27.0-32.0|N|||F
OBX|13|NM|MCHC^CHCM^LN||32.5|g/dL|320-360|N|||F
OBX|14|NM|RDW-CV^RDW-CV^LN||114.9|%|11.5-14.5|H|||F
OBX|15|NM|RDW-SD^RDW-SD^LN||46.8|fL|39.0-46.0|H|||F
OBX|16|NM|PLT^Plaquetas^LN||335|10*3/uL|100-300|H|||F
OBX|17|NM|MPV^VPM^LN||8.5|fL|7.0-11.0|N|||F
OBX|18|NM|PDW^PDW^LN||10.0|fL|9.0-17.0|N|||F
OBX|19|NM|PCT^PCT^LN||0.280|%|0.150-0.350|N|||F
OBX|20|NM|P-LCR^P-LCR^LN||16.2|%|13.0-43.0|N|||F
OBX|21|NM|P-LCC^P-LCC^LN||54|10*9/L|30-90|N|||F`;

    try {
      const results = await this.dymindDh36ResultsService.processHL7Data(sampleData);
      
      return {
        success: true,
        message: `Hemograma completo procesado: ${results.length} muestra(s) con ${results.reduce((total, sample) => total + (sample.parameters?.length || 0), 0)} parámetros totales`,
        count: results.length,
        results
      };
      
    } catch (error) {
      throw new HttpException(
        `Error en prueba: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // PUT endpoint para actualizar un resultado de laboratorio
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar resultado de laboratorio',
    description: 'Permite a los técnicos del laboratorio modificar los registros recibidos del equipo DH36'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID único del resultado de laboratorio',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado actualizado exitosamente',
    type: DymindDh36Result,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado de laboratorio no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de actualización',
  })
  async updateDymindDh36Result(
    @Param('id') id: string,
    @Body() updateDymindDh36ResultDto: UpdateDymindDh36ResultDto,
  ): Promise<{
    success: boolean;
    message: string;
    result: DymindDh36Result;
  }> {
    try {
      const updatedResult = await this.dymindDh36ResultsService.update(id, updateDymindDh36ResultDto);
      
      if (!updatedResult) {
        throw new NotFoundException(`Resultado de laboratorio con ID ${id} no encontrado`);
      }

      return {
        success: true,
        message: `Resultado de laboratorio ID ${id} actualizado exitosamente`,
        result: updatedResult,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        `Error actualizando resultado de laboratorio: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ===== ENDPOINTS DE ASIGNACIÓN DE PACIENTES =====

  @Get('unassigned')
  @ApiOperation({ 
    summary: 'Obtener resultados DH36 sin paciente asignado',
    description: 'Lista todos los resultados de DH36 que aún no tienen un paciente asignado'
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
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<UnassignedResultDto[]> {
    try {
      return await this.dymindDh36ResultsService.getUnassignedResults(limit, offset);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados sin asignar: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/assign-patient')
  @ApiOperation({ 
    summary: 'Asignar paciente a resultado DH36',
    description: 'Asigna un paciente específico a un resultado de laboratorio DH36'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del resultado de laboratorio',
    example: 123
  })
  @ApiResponse({
    status: 200,
    description: 'Paciente asignado exitosamente al resultado',
    type: DymindDh36Result,
  })
  @ApiResponse({
    status: 404,
    description: 'Resultado de laboratorio no encontrado',
  })
  async assignPatient(
    @Param('id') id: string,
    @Body() assignPatientDto: AssignPatientDto,
  ): Promise<DymindDh36Result> {
    try {
      return await this.dymindDh36ResultsService.assignPatient(id, assignPatientDto);
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
    summary: 'Obtener resultados DH36 por estado de asignación',
    description: 'Filtra resultados de DH36 por su estado de asignación de paciente'
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
    type: [DymindDh36Result],
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
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<DymindDh36Result[]> {
    try {
      return await this.dymindDh36ResultsService.getResultsByAssignmentStatus(status, limit, offset);
    } catch (error) {
      throw new HttpException(
        `Error obteniendo resultados por estado: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/by-patient-name/:name')
  @ApiOperation({ 
    summary: 'Buscar resultados DH36 por nombre de paciente',
    description: 'Busca resultados usando el nombre del paciente que viene del equipo'
  })
  @ApiParam({
    name: 'name',
    description: 'Nombre del paciente a buscar (búsqueda parcial)',
    example: 'juan'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de resultados que coinciden con el nombre',
    type: [DymindDh36Result],
  })
  async searchByPatientName(
    @Param('name') name: string,
  ): Promise<DymindDh36Result[]> {
    try {
      return await this.dymindDh36ResultsService.searchByPatientName(name);
    } catch (error) {
      throw new HttpException(
        `Error buscando por nombre: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
