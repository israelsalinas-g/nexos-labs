import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, DefaultValuePipe, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TestDefinitionsService } from './test-definitions.service';
import { CreateTestDefinitionDto } from '../../dto/create-test-definition.dto';
import { UpdateTestDefinitionDto } from '../../dto/update-test-definition.dto';
import { TestDefinition } from '../../entities/test-definition.entity';

@ApiTags('Test Definitions')
@Controller('test-definitions')
export class TestDefinitionsController {
  constructor(private readonly testDefinitionsService: TestDefinitionsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva definición de prueba' })
  @ApiResponse({ status: 201, description: 'Prueba creada exitosamente', type: TestDefinition })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una prueba con el mismo código' })
  create(@Body() createDto: CreateTestDefinitionDto): Promise<TestDefinition> {
    return this.testDefinitionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las definiciones de pruebas' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, código o descripción' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filtrar por sección' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir pruebas inactivas' })
  @ApiResponse({ status: 200, description: 'Lista paginada de pruebas obtenida exitosamente', type: [TestDefinition] })
  findAll(
    @Query('page', new DefaultValuePipe(1)) page?: number,
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
    @Query('search') search?: string,
    @Query('sectionId') sectionId?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.testDefinitionsService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      { includeInactive: includeInactiveBool, search }
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar pruebas por nombre o código' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda', type: [TestDefinition] })
  search(@Query('q') searchTerm: string): Promise<TestDefinition[]> {
    return this.testDefinitionsService.search(searchTerm);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de pruebas' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filtrar por sección' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats(@Query('sectionId') sectionId?: string) {
    return this.testDefinitionsService.getStats(sectionId);
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Obtener todas las pruebas de una sección' })
  @ApiResponse({ status: 200, description: 'Pruebas de la sección', type: [TestDefinition] })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  findBySection(@Param('sectionId') sectionId: string): Promise<TestDefinition[]> {
    return this.testDefinitionsService.findBySection(sectionId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Obtener una prueba por su código' })
  @ApiResponse({ status: 200, description: 'Prueba encontrada', type: TestDefinition })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  findByCode(@Param('code') code: string): Promise<TestDefinition> {
    return this.testDefinitionsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una prueba por su ID' })
  @ApiResponse({ status: 200, description: 'Prueba encontrada', type: TestDefinition })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  findOne(@Param('id') id: string): Promise<TestDefinition> {
    return this.testDefinitionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una definición de prueba' })
  @ApiResponse({ status: 200, description: 'Prueba actualizada exitosamente', type: TestDefinition })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto con código existente' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestDefinitionDto
  ): Promise<TestDefinition> {
    return this.testDefinitionsService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @Put(':id/toggle')
  @ApiOperation({ summary: 'Activar/Desactivar una prueba' })
  @ApiResponse({ status: 200, description: 'Estado de la prueba actualizado', type: TestDefinition })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  toggleActive(@Param('id') id: string): Promise<TestDefinition> {
    return this.testDefinitionsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una definición de prueba' })
  @ApiResponse({ status: 204, description: 'Prueba eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque está en perfiles' })
  remove(@Param('id') id: string): Promise<void> {
    return this.testDefinitionsService.remove(id);
  }
}
