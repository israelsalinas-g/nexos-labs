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
  ParseIntPipe,
  ParseBoolPipe,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from '../../dto/create-patient.dto';
import { UpdatePatientDto } from '../../dto/update-patient.dto';
import { Patient } from '../../entities/patient.entity';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private readonly patientsService: PatientsService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo paciente',
    description: 'Crea un nuevo registro de paciente en el sistema con toda su información personal y médica.',
  })
  @ApiBody({
    description: 'Datos del paciente a crear',
    type: CreatePatientDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Paciente creado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un paciente con el mismo DNI o email',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos proporcionados',
  })
  async create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    this.logger.log(`POST /patients - Creando paciente: ${createPatientDto.name}`);
    return await this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de pacientes con paginación',
    description: 'Obtiene una lista paginada de pacientes con opciones de búsqueda y filtrado.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (por defecto: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de registros por página (por defecto: 10, máximo: 100)',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o DNI del paciente',
    type: String,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
    example: true,
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pacientes obtenida exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 7,
    @Query('search') search?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
  ): Promise<PaginationResult<Patient>> {
    // Limpiar parámetros vacíos o undefined
    const cleanSearch = search && search.trim() !== '' ? search.trim() : undefined;
    const cleanIsActive = isActive !== undefined ? isActive : undefined;

    this.logger.log(`GET /patients - Página: ${page}, Límite: ${limit}, Búsqueda: ${cleanSearch || 'N/A'}, Activo: ${cleanIsActive}`);

    // Validar límite máximo
    if (limit > 100) {
      limit = 100;
    }

    return await this.patientsService.findAll(page, limit, { search: cleanSearch, isActive: cleanIsActive });
  }

  @Get('debug')
  @ApiOperation({
    summary: 'Debug - Información de la tabla patients',
    description: 'Endpoint temporal para debugging de la tabla patients.',
  })
  async debugPatients() {
    this.logger.log('GET /patients/debug - Debug de tabla patients');
    return await this.patientsService.debugTable();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de pacientes',
    description: 'Obtiene estadísticas generales de los pacientes incluyendo totales, grupos de edad y distribución por sexo.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener estadísticas',
  })
  async getStatistics() {
    this.logger.log('GET /patients/statistics - Obteniendo estadísticas');
    return await this.patientsService.getStatistics();
  }

  @Get('dni/:dni')
  @ApiOperation({
    summary: 'Buscar paciente por DNI (Opcional)',
    description: 'Busca un paciente específico utilizando su número de DNI. Nota: El DNI es opcional al crear pacientes, por lo que no todos los pacientes tendrán DNI.',
  })
  @ApiParam({
    name: 'dni',
    description: 'Documento Nacional de Identidad del paciente',
    example: '12345678901',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paciente encontrado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'DNI es requerido para la búsqueda',
  })
  async findByDni(@Param('dni') dni: string): Promise<Patient> {
    this.logger.log(`GET /patients/dni/${dni} - Buscando paciente por DNI`);
    return await this.patientsService.findByDni(dni);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener paciente por ID',
    description: 'Obtiene la información completa de un paciente específico usando su ID único.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paciente encontrado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido proporcionado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Patient> {
    this.logger.log(`GET /patients/${id} - Obteniendo paciente por ID`);
    return await this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar información de paciente',
    description: 'Actualiza parcial o totalmente la información de un paciente existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Datos del paciente a actualizar (campos opcionales)',
    type: UpdatePatientDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paciente actualizado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'DNI o email ya existe en otro paciente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos proporcionados',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    this.logger.log(`PATCH /patients/${id} - Actualizando paciente`);
    return await this.patientsService.update(id, updatePatientDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desactivar paciente',
    description: 'Desactiva un paciente sin eliminarlo del sistema. El paciente seguirá existiendo pero marcado como inactivo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paciente desactivado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<Patient> {
    this.logger.log(`PATCH /patients/${id}/deactivate - Desactivando paciente`);
    return await this.patientsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activar paciente',
    description: 'Reactiva un paciente previamente desactivado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paciente activado exitosamente',
    type: Patient,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<Patient> {
    this.logger.log(`PATCH /patients/${id}/activate - Activando paciente`);
    return await this.patientsService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar paciente permanentemente',
    description: 'Elimina completamente un paciente del sistema. Esta acción no se puede deshacer. Se recomienda usar desactivación en su lugar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Paciente eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`DELETE /patients/${id} - Eliminando paciente`);
    await this.patientsService.remove(id);
  }
}