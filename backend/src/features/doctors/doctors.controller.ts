import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from '../../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../../dto/update-doctor.dto';
import { Doctor } from '../../entities/doctor.entity';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo médico' })
  @ApiResponse({ status: 201, description: 'Médico creado exitosamente', type: Doctor })
  @ApiResponse({ status: 409, description: 'Ya existe un médico con el mismo email o licencia' })
  create(@Body() createDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los médicos (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de registros por página (default: 7)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda (nombre, apellido, especialidad o licencia)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir médicos inactivos' })
  @ApiQuery({ name: 'staffOnly', required: false, type: Boolean, description: 'Solo médicos del staff' })
  @ApiResponse({ status: 200, description: 'Lista paginada de médicos obtenida exitosamente', type: [Doctor] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('staffOnly') staffOnly?: string
  ) {
    return this.doctorsService.findAll(
      page ? +page : 1,
      limit ? +limit : 7,
      {
        includeInactive: includeInactive === 'true',
        staffOnly: staffOnly === 'true',
        search
      }
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar médicos por nombre o especialidad' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda', type: [Doctor] })
  search(@Query('q') searchTerm: string): Promise<Doctor[]> {
    return this.doctorsService.findAll(1, 100, { search: searchTerm }).then(r => r.data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de médicos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.doctorsService.getStats();
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obtener un médico por su email' })
  @ApiResponse({ status: 200, description: 'Médico encontrado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  findByEmail(@Param('email') email: string): Promise<Doctor | null> {
    return this.doctorsService.findByEmail(email);
  }

  @Get('license/:licenseNumber')
  @ApiOperation({ summary: 'Obtener un médico por su número de licencia' })
  @ApiResponse({ status: 200, description: 'Médico encontrado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  findByLicense(@Param('licenseNumber') licenseNumber: string): Promise<Doctor | null> {
    return this.doctorsService.findByLicense(licenseNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un médico por su ID' })
  @ApiResponse({ status: 200, description: 'Médico encontrado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  findOne(@Param('id') id: string): Promise<Doctor> {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un médico' })
  @ApiResponse({ status: 200, description: 'Médico actualizado exitosamente', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto con email o licencia existente' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDoctorDto
  ): Promise<Doctor> {
    return this.doctorsService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar un médico' })
  @ApiResponse({ status: 200, description: 'Estado del médico actualizado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  toggleActive(@Param('id') id: string): Promise<Doctor> {
    return this.doctorsService.toggleActive(id);
  }

  @Patch(':id/toggle-staff')
  @ApiOperation({ summary: 'Cambiar estado de staff del médico' })
  @ApiResponse({ status: 200, description: 'Estado de staff actualizado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  toggleStaff(@Param('id') id: string): Promise<Doctor> {
    return this.doctorsService.toggleStaff(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un médico' })
  @ApiResponse({ status: 204, description: 'Médico eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque tiene órdenes asociadas' })
  remove(@Param('id') id: string): Promise<void> {
    return this.doctorsService.remove(id);
  }
}
