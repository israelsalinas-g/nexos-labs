import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseEnumPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { LaboratoryOrdersService } from './laboratory-orders.service';
import { CreateLaboratoryOrderDto } from '../../dto/create-laboratory-order.dto';
import { UpdateLaboratoryOrderDto } from '../../dto/update-laboratory-order.dto';
import { AddTestsToOrderDto } from '../../dto/add-tests-to-order.dto';
import { LaboratoryOrder } from '../../entities/laboratory-order.entity';
import { OrderStatus } from '../../common/enums/order-status.enums';
import { OrderPriority } from '../../common/enums/order-priority.enums';
import { PaginationResult } from '../../common/interfaces';

@ApiTags('Laboratory Orders')
@Controller('laboratory-orders')
export class LaboratoryOrdersController {
  constructor(private readonly laboratoryOrdersService: LaboratoryOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden de laboratorio' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente', type: LaboratoryOrder })
  @ApiResponse({ status: 404, description: 'Paciente o doctor no encontrado' })
  create(@Body() createDto: CreateLaboratoryOrderDto): Promise<LaboratoryOrder> {
    return this.laboratoryOrdersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes de laboratorio con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'priority', required: false, enum: OrderPriority, description: 'Filtrar por prioridad' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por número de orden, paciente o doctor' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de órdenes obtenida exitosamente' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status', new ParseEnumPipe(OrderStatus, { optional: true })) status?: OrderStatus,
    @Query('priority', new ParseEnumPipe(OrderPriority, { optional: true })) priority?: OrderPriority,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<PaginationResult<LaboratoryOrder>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return this.laboratoryOrdersService.findAll(
      pageNum,
      limitNum,
      status,
      priority,
      search,
      startDateObj,
      endDateObj
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de órdenes' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.laboratoryOrdersService.getStats();
  }

  @Get(':id/pending-capture')
  @ApiOperation({ summary: 'Pruebas de la orden con tipos de respuesta y resultados previos (para captura)' })
  @ApiParam({ name: 'id', description: 'ID de la orden de laboratorio' })
  @ApiResponse({ status: 200, description: 'Datos de captura con responseType, opciones y resultado previo por prueba' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  getPendingCapture(@Param('id') id: string): Promise<any> {
    return this.laboratoryOrdersService.getPendingCapture(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden por su ID' })
  @ApiResponse({ status: 200, description: 'Orden encontrada', type: LaboratoryOrder })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  findOne(@Param('id') id: string): Promise<LaboratoryOrder> {
    return this.laboratoryOrdersService.findOne(id);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Obtener una orden por su número' })
  @ApiResponse({ status: 200, description: 'Orden encontrada', type: LaboratoryOrder })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<LaboratoryOrder> {
    return this.laboratoryOrdersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden' })
  @ApiResponse({ status: 200, description: 'Orden actualizada exitosamente', type: LaboratoryOrder })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLaboratoryOrderDto
  ): Promise<LaboratoryOrder> {
    return this.laboratoryOrdersService.update(id, updateDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una orden' })
  @ApiQuery({ name: 'status', enum: OrderStatus, description: 'Nuevo estado de la orden' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente', type: LaboratoryOrder })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  updateStatus(
    @Param('id') id: string,
    @Query('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus
  ): Promise<LaboratoryOrder> {
    return this.laboratoryOrdersService.updateStatus(id, status);
  }

  @Post(':id/add-tests')
  @ApiOperation({ summary: 'Agregar pruebas a una orden existente' })
  @ApiParam({ name: 'id', description: 'ID de la orden de laboratorio' })
  @ApiBody({ type: AddTestsToOrderDto, description: 'Pruebas a agregar' })
  @ApiResponse({
    status: 201,
    description: 'Pruebas agregadas exitosamente',
    schema: {
      example: {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        totalTestsAdded: 5,
        tests: [
          {
            id: 1,
            orderId: '550e8400-e29b-41d4-a716-446655440000',
            testDefinitionId: '550e8400-e29b-41d4-a716-446655440001',
            status: 'PENDING',
            sampleNumber: 'S-2025-001-001',
            sampleCollectedAt: null,
            collectedBy: 'Tech1'
          }
        ],
        message: '5 pruebas agregadas exitosamente a la orden'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  async addTests(
    @Param('id') id: string,
    @Body() addTestsDto: AddTestsToOrderDto
  ): Promise<any> {
    return this.laboratoryOrdersService.addTests(id, addTestsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden' })
  @ApiResponse({ status: 200, description: 'Orden eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.laboratoryOrdersService.remove(id);
  }
}