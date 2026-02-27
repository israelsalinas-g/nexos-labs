import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TestProfilesService } from './test-profiles.service';
import { CreateTestProfileDto } from '../../dto/create-test-profile.dto';
import { UpdateTestProfileDto } from '../../dto/update-test-profile.dto';
import { TestProfile } from '../../entities/test-profile.entity';
import { PaginationResult } from '../../common/interfaces';

@ApiTags('Test Profiles')
@Controller('test-profiles')
export class TestProfilesController {
  constructor(private readonly testProfilesService: TestProfilesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo perfil de pruebas' })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente', type: TestProfile })
  @ApiResponse({ status: 404, description: 'Sección o prueba(s) no encontrada(s)' })
  @ApiResponse({ status: 409, description: 'Ya existe un perfil con el mismo código' })
  create(@Body() createDto: CreateTestProfileDto): Promise<TestProfile> {
    return this.testProfilesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los perfiles de pruebas' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filtrar por sección' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir perfiles inactivos' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, código o descripción' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles obtenida exitosamente', type: [TestProfile] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sectionId') sectionId?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('search') search?: string
  ): Promise<PaginationResult<TestProfile>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const includeInactiveBool = includeInactive === 'true';
    return this.testProfilesService.findAll(pageNum, limitNum, { sectionId, includeInactive: includeInactiveBool, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de perfiles' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filtrar por sección' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats(@Query('sectionId') sectionId?: string) {
    return this.testProfilesService.getStats(sectionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un perfil por su ID' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado', type: TestProfile })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  findOne(@Param('id') id: string): Promise<TestProfile> {
    return this.testProfilesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un perfil de pruebas' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente', type: TestProfile })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto con código existente' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestProfileDto
  ): Promise<TestProfile> {
    return this.testProfilesService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar un perfil' })
  @ApiResponse({ status: 200, description: 'Estado del perfil actualizado', type: TestProfile })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  toggleActive(@Param('id') id: string): Promise<TestProfile> {
    return this.testProfilesService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un perfil de pruebas' })
  @ApiResponse({ status: 204, description: 'Perfil eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.testProfilesService.remove(id);
  }
}
