import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TestResponseTypesService } from './test-response-types.service';
import { CreateTestResponseTypeDto } from '../../dto/create-test-response-type.dto';
import { UpdateTestResponseTypeDto } from '../../dto/update-test-response-type.dto';
import { TestResponseType } from '../../entities/test-response-type.entity';

@ApiTags('Test Response Types')
@Controller('test-response-types')
export class TestResponseTypesController {
  constructor(private readonly service: TestResponseTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de respuesta' })
  @ApiResponse({ status: 201, description: 'Tipo creado exitosamente', type: TestResponseType })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese slug' })
  create(@Body() createDto: CreateTestResponseTypeDto): Promise<TestResponseType> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de respuesta' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  findAll(
    @Query('page', new DefaultValuePipe(1)) page?: number,
    @Query('limit', new DefaultValuePipe(20)) limit?: number,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.service.findAll(page, limit, search, includeInactive === 'true');
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener todos los tipos de respuesta activos (para selectores)' })
  @ApiResponse({ status: 200, type: [TestResponseType] })
  findAllActive(): Promise<TestResponseType[]> {
    return this.service.findAllActive();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar tipo de respuesta por slug' })
  @ApiResponse({ status: 200, type: TestResponseType })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findBySlug(@Param('slug') slug: string): Promise<TestResponseType> {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de respuesta por ID' })
  @ApiResponse({ status: 200, type: TestResponseType })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id') id: string): Promise<TestResponseType> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de respuesta' })
  @ApiResponse({ status: 200, type: TestResponseType })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestResponseTypeDto,
  ): Promise<TestResponseType> {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar un tipo de respuesta' })
  @ApiResponse({ status: 200, type: TestResponseType })
  toggleActive(@Param('id') id: string): Promise<TestResponseType> {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar tipo de respuesta' })
  @ApiResponse({ status: 204, description: 'Eliminado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar tipo del sistema' })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
