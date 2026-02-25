import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TestSectionsService } from './test-sections.service';
import { CreateTestSectionDto } from '../../dto/create-test-section.dto';
import { UpdateTestSectionDto } from '../../dto/update-test-section.dto';
import { TestSection } from '../../entities/test-section.entity';

@ApiTags('Test Sections')
@Controller('test-sections')
export class TestSectionsController {
  constructor(private readonly testSectionsService: TestSectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sección de examen' })
  @ApiResponse({ status: 201, description: 'Sección creada exitosamente', type: TestSection })
  @ApiResponse({ status: 409, description: 'Ya existe una sección con el mismo nombre o código' })
  create(@Body() createDto: CreateTestSectionDto): Promise<TestSection> {
    return this.testSectionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las secciones de examen (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de registros por página (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda (nombre, código o descripción)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir secciones inactivas' })
  @ApiResponse({ status: 200, description: 'Lista paginada de secciones obtenida exitosamente', type: [TestSection] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.testSectionsService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      includeInactiveBool,
      search
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de secciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.testSectionsService.getStats();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Obtener una sección por su código' })
  @ApiResponse({ status: 200, description: 'Sección encontrada', type: TestSection })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  findByCode(@Param('code') code: string): Promise<TestSection> {
    return this.testSectionsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sección por su ID' })
  @ApiResponse({ status: 200, description: 'Sección encontrada', type: TestSection })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  findOne(@Param('id') id: string): Promise<TestSection> {
    return this.testSectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sección' })
  @ApiResponse({ status: 200, description: 'Sección actualizada exitosamente', type: TestSection })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto con nombre o código existente' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestSectionDto
  ): Promise<TestSection> {
    return this.testSectionsService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar una sección' })
  @ApiResponse({ status: 200, description: 'Estado de la sección actualizado', type: TestSection })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  toggleActive(@Param('id') id: string): Promise<TestSection> {
    return this.testSectionsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una sección' })
  @ApiResponse({ status: 204, description: 'Sección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque tiene pruebas asociadas' })
  remove(@Param('id') id: string): Promise<void> {
    return this.testSectionsService.remove(id);
  }
}
