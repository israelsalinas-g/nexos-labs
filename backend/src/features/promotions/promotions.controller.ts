import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  Query, HttpCode, HttpStatus, ParseIntPipe, DefaultValuePipe, ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from '../../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../../dto/update-promotion.dto';
import { Promotion } from '../../entities/promotion.entity';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Get('active')
  @ApiOperation({ summary: 'Obtener promociones vigentes (fecha actual dentro del rango)' })
  @ApiResponse({ status: 200, description: 'Promociones vigentes', type: [Promotion] })
  findActive(): Promise<Promotion[]> {
    return this.promotionsService.findActive();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las promociones con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista paginada de promociones', type: [Promotion] })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.promotionsService.findAll(page, limit, {
      includeInactive: includeInactive === 'true',
      search
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una promoción por ID' })
  @ApiResponse({ status: 200, description: 'Promoción encontrada', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva promoción' })
  @ApiResponse({ status: 201, description: 'Promoción creada', type: Promotion })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  create(@Body() dto: CreatePromotionDto): Promise<Promotion> {
    return this.promotionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una promoción' })
  @ApiResponse({ status: 200, description: 'Promoción actualizada', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionsService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar una promoción' })
  @ApiResponse({ status: 200, description: 'Estado actualizado', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  toggleActive(@Param('id') id: string): Promise<Promotion> {
    return this.promotionsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una promoción' })
  @ApiResponse({ status: 204, description: 'Promoción eliminada' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.promotionsService.remove(id);
  }
}
