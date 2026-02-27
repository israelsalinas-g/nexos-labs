import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TestResultsService } from './test-results.service';
import { TestResult } from '../../entities/test-result.entity';
import { PaginationResult } from '../../common/interfaces';
import { CreateTestResultDto } from '../../dto';

@ApiTags('Test Results')
@Controller('test-results')
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los resultados de pruebas con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar en valores y observaciones' })
  @ApiQuery({ name: 'isAbnormal', required: false, type: Boolean, description: 'Filtrar por resultados anormales' })
  @ApiQuery({ name: 'isCritical', required: false, type: Boolean, description: 'Filtrar por resultados críticos' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de resultados obtenida exitosamente' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isAbnormal') isAbnormal?: string,
    @Query('isCritical') isCritical?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<PaginationResult<TestResult>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const isAbnormalBool = isAbnormal ? isAbnormal === 'true' : undefined;
    const isCriticalBool = isCritical ? isCritical === 'true' : undefined;
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return this.testResultsService.findAll(
      pageNum,
      limitNum,
      {
        search,
        isAbnormal: isAbnormalBool,
        isCritical: isCriticalBool,
        startDate: startDateObj,
        endDate: endDateObj
      }
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de resultados de pruebas' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.testResultsService.getStats();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo resultado de prueba' })
  @ApiBody({ type: CreateTestResultDto })
  @ApiResponse({ status: 201, description: 'Resultado creado exitosamente', type: TestResult })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createTestResultDto: CreateTestResultDto): Promise<TestResult> {
    return this.testResultsService.create(createTestResultDto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener todos los resultados de un paciente' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiResponse({ status: 200, description: 'Resultados del paciente obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async findByPatient(
    @Param('patientId') patientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<PaginationResult<TestResult>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.testResultsService.findByPatient(patientId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un resultado de prueba por su ID' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado', type: TestResult })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TestResult> {
    return this.testResultsService.findOne(id as any);
  }

  @Get('order-test/:orderTestId')
  @ApiOperation({ summary: 'Obtener un resultado por ID de prueba ordenada' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado', type: TestResult })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado' })
  async findByOrderTest(@Param('orderTestId', ParseIntPipe) orderTestId: number): Promise<TestResult> {
    const result = await this.testResultsService.findByOrderTest(orderTestId as any);
    if (!result) throw new NotFoundException(`Resultado para prueba ordenada ${orderTestId} no encontrado`);
    return result;
  }
}