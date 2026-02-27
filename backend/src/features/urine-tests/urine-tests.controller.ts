import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UrineTestsService } from './urine-tests.service';
import { CreateUrineTestDto } from '../../dto/create-urine-test.dto';
import { UpdateUrineTestDto } from '../../dto/update-urine-test.dto';
import { UrineTest } from '../../entities/urine-test.entity';

@ApiTags('Urine Tests')
@Controller('urine-tests')
export class UrineTestsController {
  constructor(private readonly urineTestService: UrineTestsService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo examen de orina',
    description: 'Registra un nuevo examen general de orina para un paciente específico. Los cristales y cilindros ahora son arrays que permiten registrar múltiples hallazgos con sus cantidades específicas.'
  })
  @ApiBody({
    type: CreateUrineTestDto,
    examples: {
      'examen-normal': {
        value: {
          patientId: "550e8400-e29b-41d4-a716-446655440000",
          testDate: "2025-10-02T14:30:00Z",
          volume: "60 ml",
          color: "Amarillo",
          aspect: "Transparente",
          sediment: "Escaso",
          density: "1.015",
          ph: "6.0",
          protein: "Negativo",
          glucose: "Negativo",
          bilirubin: "Negativo",
          ketones: "Negativo",
          occultBlood: "Negativo",
          nitrites: "Negativo",
          urobilinogen: "0.1 mg/dl",
          leukocytes: "Negativo",
          epithelialCells: "Escasa",
          leukocytesField: "0-2 x campo",
          erythrocytesField: "0-2 x campo",
          bacteria: "Escasa",
          mucousFilaments: "Escasa",
          crystals: [
            {
              type: "OXALATOS DE CALCIO, DIHIDRATADO",
              quantity: "2-3 por campo"
            }
          ],
          cylinders: [
            {
              type: "CILINDRO HIALINOS",
              quantity: "0-1 por campo"
            }
          ],
          others: "-",
          observations: "Examen de rutina sin hallazgos significativos"
        }
      },
      'multiples-hallazgos': {
        value: {
          patientId: "550e8400-e29b-41d4-a716-446655440000",
          testDate: "2025-10-02T14:30:00Z",
          volume: "50 ml",
          color: "Amarillo",
          aspect: "Turbio",
          sediment: "Moderado",
          density: "1.020",
          ph: "5.0",
          protein: "Positivo +",
          glucose: "Negativo",
          bilirubin: "Negativo",
          ketones: "Negativo",
          occultBlood: "Positivo +",
          nitrites: "Positivo",
          urobilinogen: "0.1 mg/dl",
          leukocytes: "Positivo ++",
          epithelialCells: "Moderada",
          leukocytesField: "10-12 x campo",
          erythrocytesField: "8-10 x campo",
          bacteria: "Abundante",
          mucousFilaments: "Moderada",
          crystals: [
            {
              type: "ACIDO URICO",
              quantity: "abundante"
            },
            {
              type: "FOSFATOS AMORFOS",
              quantity: "2+ por campo"
            },
            {
              type: "OXALATOS DE CALCIO, DIHIDRATADO",
              quantity: "escasos"
            }
          ],
          cylinders: [
            {
              type: "CILINDRO GRANULOSO FINO",
              quantity: "escasos"
            },
            {
              type: "CILINDRO LEUCOCITARIO",
              quantity: "1-2 por campo"
            },
            {
              type: "CILINDRO HIALINOS",
              quantity: "0-1 por campo"
            }
          ],
          others: "Presencia de moco ++",
          observations: "Hallazgos sugestivos de infección urinaria"
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Examen de orina creado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async create(@Body() createUrineTestDto: CreateUrineTestDto): Promise<UrineTest> {
    return await this.urineTestService.create(createUrineTestDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de exámenes de orina',
    description: 'Obtiene todos los exámenes de orina con opciones de filtrado, búsqueda y paginación'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (default: 7)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre de paciente, color u observaciones' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'ID del paciente' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Estado del examen (pending, completed, cancelled)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Fecha desde (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Fecha hasta (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de exámenes de orina obtenida exitosamente',
    type: [UrineTest],
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(7), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return await this.urineTestService.findAll(page, limit, {
      search,
      patientId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de exámenes de orina',
    description: 'Obtiene estadísticas generales de los exámenes de orina'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStatistics() {
    return await this.urineTestService.getStatistics();
  }

  @Get('pending-review')
  @ApiOperation({
    summary: 'Obtener exámenes pendientes de revisión',
    description: 'Obtiene todos los exámenes que están pendientes o en progreso'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exámenes pendientes obtenidos exitosamente',
    type: [UrineTest],
  })
  async getPendingReview(): Promise<UrineTest[]> {
    return await this.urineTestService.getPendingReview();
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Obtener exámenes de orina por paciente',
    description: 'Obtiene todos los exámenes de orina de un paciente específico'
  })
  @ApiParam({ name: 'patientId', type: String, description: 'ID del paciente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exámenes del paciente obtenidos exitosamente',
    type: [UrineTest],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ): Promise<any> {
    return await this.urineTestService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener examen de orina por ID',
    description: 'Obtiene un examen de orina específico por su ID'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Examen de orina encontrado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UrineTest> {
    return await this.urineTestService.findOne(id);
  }

  @Get(':id/medical-report')
  @ApiOperation({
    summary: 'Obtener reporte médico del examen',
    description: 'Obtiene un reporte médico interpretado del examen de orina, incluyendo análisis detallado de cristales y cilindros encontrados. El reporte incluye la clasificación específica de cada tipo de cristal y cilindro junto con su cantidad observada.'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte médico generado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  async getMedicalReport(@Param('id', ParseUUIDPipe) id: string) {
    return await this.urineTestService.getMedicalReport(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar examen de orina',
    description: 'Actualiza los datos de un examen de orina existente. Para actualizar cristales o cilindros, proporcione los arrays completos con todos los hallazgos que desea mantener.'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiBody({ type: UpdateUrineTestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Examen de orina actualizado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUrineTestDto: UpdateUrineTestDto,
  ): Promise<UrineTest> {
    return await this.urineTestService.update(id, updateUrineTestDto);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Marcar examen como completado',
    description: 'Marca un examen de orina como completado y opcionalmente registra quien lo revisó'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiQuery({ name: 'reviewedBy', required: false, type: String, description: 'Nombre del revisor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Examen marcado como completado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  async markAsCompleted(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reviewedBy') reviewedBy?: string,
  ): Promise<UrineTest> {
    return await this.urineTestService.markAsCompleted(id, reviewedBy);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar examen de orina',
    description: 'Elimina (soft delete) un examen de orina del sistema'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Examen de orina eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.urineTestService.remove(id);
  }

  @Get('active/list')
  @ApiOperation({
    summary: 'Obtener exámenes activos con paginación',
    description: 'Retorna solo los exámenes marcados como activos (no eliminados con soft-delete)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página (por defecto: 10)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exámenes activos obtenidos exitosamente',
  })
  async findAllActive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.urineTestService.findAllActive(page, limit);
  }

  @Get('admin/all')
  @ApiOperation({
    summary: 'Obtener todos los exámenes incluyendo inactivos (ADMIN)',
    description: 'Retorna todos los exámenes incluyendo los marcados como inactivos. Solo para administradores.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todos los exámenes obtenidos',
  })
  async findAllIncludingInactive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.urineTestService.findAllIncludingInactive(page, limit);
  }

  @Get('admin/inactive')
  @ApiOperation({
    summary: 'Obtener exámenes inactivos (auditoría)',
    description: 'Retorna solo los exámenes marcados como inactivos para auditoría y compliance'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exámenes inactivos obtenidos',
  })
  async findInactive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.urineTestService.findInactive(page, limit);
  }

  @Get('patient/:patientId/active')
  @ApiOperation({
    summary: 'Obtener exámenes activos de un paciente',
    description: 'Retorna solo los exámenes activos de un paciente específico'
  })
  @ApiParam({ name: 'patientId', type: String, description: 'UUID del paciente' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exámenes del paciente obtenidos',
    type: [UrineTest],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async findByPatientActive(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.urineTestService.findByPatientActive(patientId, page, limit);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desactivar examen (soft-delete)',
    description: 'Marca un examen como inactivo sin eliminarlo de la base de datos. Se mantiene para auditoría.'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Examen desactivado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El examen ya está desactivado',
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<UrineTest> {
    return await this.urineTestService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivar examen',
    description: 'Marca un examen inactivo como activo nuevamente'
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del examen' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Examen reactivado exitosamente',
    type: UrineTest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Examen de orina no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El examen ya está activo',
  })
  async reactivate(@Param('id', ParseUUIDPipe) id: string): Promise<UrineTest> {
    return await this.urineTestService.reactivate(id);
  }
}