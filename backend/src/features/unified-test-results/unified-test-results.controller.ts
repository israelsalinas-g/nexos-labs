import {
  Controller, Get, Post, Patch, Body, Param,
  ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UnifiedTestResultsService } from './unified-test-results.service';
import { CreateUnifiedTestResultDto, UpdateUnifiedTestResultDto } from '../../dto/create-unified-test-result.dto';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';

@ApiTags('Unified Test Results')
@Controller('unified-test-results')
export class UnifiedTestResultsController {
  constructor(private readonly service: UnifiedTestResultsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar o actualizar el resultado de una prueba (upsert por orderTestId)' })
  @ApiResponse({ status: 201, description: 'Resultado registrado', type: UnifiedTestResult })
  @ApiQuery({ name: 'gender', required: false, description: 'Sexo del paciente (M/F) para cálculo de anormalidad' })
  @ApiQuery({ name: 'ageMonths', required: false, type: Number, description: 'Edad en meses del paciente' })
  upsert(
    @Body() dto: CreateUnifiedTestResultDto,
    @Query('gender') gender?: 'M' | 'F',
    @Query('ageMonths') ageMonths?: string,
  ): Promise<UnifiedTestResult> {
    const ageInMonths = ageMonths ? parseInt(ageMonths) : undefined;
    return this.service.upsert(dto, gender, ageInMonths);
  }

  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Obtener todos los resultados de una orden' })
  @ApiResponse({ status: 200, description: 'Lista de resultados', type: [UnifiedTestResult] })
  findByOrder(@Param('orderId') orderId: string): Promise<UnifiedTestResult[]> {
    return this.service.findByOrder(orderId);
  }

  @Get('by-order-test/:orderTestId')
  @ApiOperation({ summary: 'Obtener el resultado de una prueba específica en la orden' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado', type: UnifiedTestResult })
  findByOrderTest(@Param('orderTestId', ParseIntPipe) orderTestId: number): Promise<UnifiedTestResult | null> {
    return this.service.findByOrderTest(orderTestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un resultado existente' })
  @ApiResponse({ status: 200, description: 'Resultado actualizado', type: UnifiedTestResult })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnifiedTestResultDto,
  ): Promise<UnifiedTestResult> {
    return this.service.update(id, dto);
  }
}
