import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TestReferenceRangesService } from './test-reference-ranges.service';
import { CreateTestReferenceRangeDto } from '../../dto/create-test-reference-range.dto';
import { UpdateTestReferenceRangeDto } from '../../dto/update-test-reference-range.dto';
import { TestReferenceRange } from '../../entities/test-reference-range.entity';

@ApiTags('Test Reference Ranges')
@Controller('test-reference-ranges')
export class TestReferenceRangesController {
  constructor(private readonly service: TestReferenceRangesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear rango de referencia' })
  @ApiResponse({ status: 201, type: TestReferenceRange })
  @ApiResponse({ status: 409, description: 'Rango se solapa con uno existente' })
  create(@Body() createDto: CreateTestReferenceRangeDto): Promise<TestReferenceRange> {
    return this.service.create(createDto);
  }

  @Get('by-test/:testDefinitionId')
  @ApiOperation({ summary: 'Obtener rangos de referencia de una prueba' })
  @ApiResponse({ status: 200, type: [TestReferenceRange] })
  findByTest(@Param('testDefinitionId') testDefinitionId: string): Promise<TestReferenceRange[]> {
    return this.service.findByTestDefinition(testDefinitionId);
  }

  @Get('applicable')
  @ApiOperation({ summary: 'Buscar el rango aplicable para un paciente' })
  @ApiQuery({ name: 'testDefinitionId', required: true, type: String })
  @ApiQuery({ name: 'gender', required: true, type: String, description: 'M o F' })
  @ApiQuery({ name: 'ageInMonths', required: true, type: Number })
  async findApplicable(
    @Query('testDefinitionId') testDefinitionId: string,
    @Query('gender') gender: string,
    @Query('ageInMonths') ageInMonths: number,
  ) {
    return this.service.findApplicableRange(testDefinitionId, gender, Number(ageInMonths));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rango de referencia por ID' })
  @ApiResponse({ status: 200, type: TestReferenceRange })
  findOne(@Param('id') id: string): Promise<TestReferenceRange> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rango de referencia' })
  @ApiResponse({ status: 200, type: TestReferenceRange })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestReferenceRangeDto,
  ): Promise<TestReferenceRange> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rango de referencia' })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
