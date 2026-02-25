import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StoolTestsService } from './stool-tests.service';
import { CreateStoolTestDto } from '../../dto/create-stool-test.dto';
import { UpdateStoolTestDto } from '../../dto/update-stool-test.dto';
import { StoolTest } from '../../entities/stool-test.entity';

@ApiTags('Stool Tests - (Coprológicos)')
@Controller('stool-tests')
export class StoolTestsController {
  constructor(private readonly stoolTestsService: StoolTestsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo examen coprológico',
    description: 'Crea un nuevo examen de heces. Requiere un patientId válido para vincular con la tabla de pacientes. La información del paciente (nombre y sexo) se obtiene automáticamente.'
  })
  @ApiResponse({
    status: 201,
    description: 'Examen coprológico creado exitosamente',
    type: StoolTest,
  })
  @ApiBody({ 
    type: CreateStoolTestDto,
    description: 'Datos del examen coprológico',
    examples: {
      'examen-normal': {
        value: {
          patientId: "P12345",
          sampleNumber: "STOOL-2025-001",
          color: "Cafe",
          consistency: "Formada",
          shape: "Moderado",
          parasites: [
            { type: "ASCARIS LUMBRICOIDES", quantity: "2-3 por campo" }
          ],
          protozoos: [
            { type: "BLASTOCYSTIS HOMINIS", quantity: "4+ por campo" },
            { type: "GIARDIA DUODENALIS", quantity: "escasos" }
          ]
        }
      },
      'sin-hallazgos': {
        value: {
          patientId: "P12346",
          sampleNumber: "STOOL-2025-002",
          color: "Cafe",
          consistency: "Formada",
          shape: "Moderado",
          parasites: [
            { type: "NO SE OBSERVAN EN ESTA MUESTRA", quantity: "" }
          ],
          protozoos: [
            { type: "NO SE OBSERVA EN ESTA MUESTRA", quantity: "" }
          ]
        }
      }
    }
  })
  async create(@Body() createStoolTestDto: CreateStoolTestDto): Promise<StoolTest> {
    try {
      return await this.stoolTestsService.create(createStoolTestDto);
    } catch (error) {
      throw new HttpException(
        `Error al crear examen de heces: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar exámenes coprológicos',
    description: 'Obtiene una lista paginada de exámenes de heces con filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre de paciente o número de muestra' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'ID del paciente' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Estado del examen (pending, completed, cancelled)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Fecha desde (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Fecha hasta (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de exámenes coprológicos obtenida exitosamente',
    type: [StoolTest],
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
    try {
      return await this.stoolTestsService.findAll({
        page,
        limit,
        search,
        patientId,
        status,
        dateFrom,
        dateTo,
      });
    } catch (error) {
      throw new HttpException(
        `Error al obtener exámenes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Estadísticas de exámenes coprológicos',
    description: 'Obtiene estadísticas generales de los exámenes de heces'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStatistics() {
    try {
      return await this.stoolTestsService.getStatistics();
    } catch (error) {
      throw new HttpException(
        `Error al obtener estadísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pending-review')
  @ApiOperation({ 
    summary: 'Exámenes pendientes de revisión',
    description: 'Obtiene exámenes que están pendientes de revisión médica'
  })
  @ApiResponse({
    status: 200,
    description: 'Exámenes pendientes obtenidos exitosamente',
    type: [StoolTest],
  })
  async getPendingReview(): Promise<StoolTest[]> {
    try {
      return await this.stoolTestsService.findByStatus('completed');
    } catch (error) {
      throw new HttpException(
        `Error al obtener exámenes pendientes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('patient/:patientId')
  @ApiOperation({ 
    summary: 'Exámenes por paciente',
    description: 'Obtiene todos los exámenes coprológicos de un paciente específico, incluyendo información básica del paciente (nombre, edad y sexo)'
  })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Exámenes del paciente obtenidos exitosamente. Incluye datos del paciente relacionado.',
    type: [StoolTest],
  })
  async findByPatient(@Param('patientId') patientId: string): Promise<StoolTest[]> {
    try {
      return await this.stoolTestsService.findByPatient(patientId);
    } catch (error) {
      throw new HttpException(
        `Error al obtener exámenes del paciente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener examen por ID',
    description: 'Obtiene un examen coprológico específico por su ID, incluyendo información básica del paciente (nombre, edad y sexo)'
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({
    status: 200,
    description: 'Examen obtenido exitosamente. Incluye los datos completos del examen junto con la información básica del paciente relacionado (nombre, edad y sexo).',
    type: StoolTest,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StoolTest> {
    try {
      const stoolTest = await this.stoolTestsService.findOne(id);
      if (!stoolTest) {
        throw new NotFoundException(`Examen coprológico con ID ${id} no encontrado`);
      }
      return stoolTest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Error al obtener examen: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/medical-report')
  @ApiOperation({ 
    summary: 'Generar reporte médico',
    description: 'Genera un reporte médico formateado del examen coprológico, incluyendo la información completa del paciente obtenida de la base de datos.'
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({
    status: 200,
    description: 'Reporte médico generado exitosamente',
  })
  async getMedicalReport(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.stoolTestsService.generateMedicalReport(id);
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar examen coprológico',
    description: 'Actualiza los datos de un examen coprológico existente'
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiBody({ type: UpdateStoolTestDto })
  @ApiResponse({
    status: 200,
    description: 'Examen actualizado exitosamente',
    type: StoolTest,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoolTestDto: UpdateStoolTestDto,
  ): Promise<StoolTest> {
    try {
      return await this.stoolTestsService.update(id, updateStoolTestDto);
    } catch (error) {
      throw new HttpException(
        `Error al actualizar examen: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/complete')
  @ApiOperation({ 
    summary: 'Completar examen',
    description: 'Marca un examen como completado y listo para revisión'
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({
    status: 200,
    description: 'Examen completado exitosamente',
    type: StoolTest,
  })
  async completeTest(@Param('id', ParseIntPipe) id: number): Promise<StoolTest> {
    try {
      return await this.stoolTestsService.completeTest(id);
    } catch (error) {
      throw new HttpException(
        `Error al completar examen: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }



  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar examen coprológico',
    description: 'Elimina un examen coprológico del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({
    status: 200,
    description: 'Examen eliminado exitosamente',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      await this.stoolTestsService.remove(id);
      return { message: `Examen coprológico con ID ${id} eliminado exitosamente` };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar examen: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============================================================
  // SOFT-DELETE ENDPOINTS
  // ============================================================

  @Get('active/list')
  @ApiOperation({ 
    summary: 'Listar exámenes coprológicos activos',
    description: 'Obtiene una lista paginada de todos los exámenes coprológicos activos (isActive = true). Útil para vistas normales del sistema.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Cantidad de registros por página (por defecto: 10)',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exámenes coprológicos activos',
    type: StoolTest,
    isArray: true,
  })
  async findAllActive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.stoolTestsService.findAllActive(page, limit);
  }

  @Get('admin/all')
  @ApiOperation({ 
    summary: 'Listar todos los exámenes coprológicos (Administrador)',
    description: 'Obtiene una lista paginada de TODOS los exámenes coprológicos, incluyendo los desactivados. Solo para administradores. Útil para auditorías y administración.'
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
    description: 'Cantidad de registros por página (por defecto: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de todos los exámenes coprológicos',
    type: StoolTest,
    isArray: true,
  })
  async findAllIncludingInactive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.stoolTestsService.findAllIncludingInactive(page, limit);
  }

  @Get('admin/inactive')
  @ApiOperation({ 
    summary: 'Listar exámenes coprológicos inactivos (Administrador)',
    description: 'Obtiene una lista paginada de todos los exámenes coprológicos desactivados (isActive = false). Útil para auditoría y recuperación.'
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
    description: 'Cantidad de registros por página (por defecto: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exámenes coprológicos inactivos',
    type: StoolTest,
    isArray: true,
  })
  async findInactive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.stoolTestsService.findInactive(page, limit);
  }

  @Get('patient/:patientId/active')
  @ApiOperation({ 
    summary: 'Listar exámenes coprológicos activos por paciente',
    description: 'Obtiene todos los exámenes coprológicos activos para un paciente específico'
  })
  @ApiParam({ 
    name: 'patientId', 
    description: 'ID del paciente',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000'
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
    description: 'Cantidad de registros por página (por defecto: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Exámenes coprológicos activos del paciente',
    type: StoolTest,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente no encontrado',
  })
  async findByPatientActive(
    @Param('patientId', new ParseUUIDPipe()) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.stoolTestsService.findByPatientActive(patientId, page, limit);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Desactivar examen coprológico (Soft Delete)',
    description: 'Desactiva un examen coprológico marcándolo como inactivo (isActive = false). No elimina datos, permite recuperación.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del examen a desactivar',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Examen coprológico desactivado exitosamente',
    type: StoolTest,
  })
  @ApiResponse({
    status: 404,
    description: 'Examen coprológico no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El examen ya está desactivado o no se puede desactivar',
  })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.stoolTestsService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ 
    summary: 'Reactivar examen coprológico',
    description: 'Reactiva un examen coprológico desactivado, marcándolo como activo nuevamente (isActive = true)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del examen a reactivar',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Examen coprológico reactivado exitosamente',
    type: StoolTest,
  })
  @ApiResponse({
    status: 404,
    description: 'Examen coprológico no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El examen ya está activo o no se puede reactivar',
  })
  async reactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.stoolTestsService.reactivate(id);
  }
}