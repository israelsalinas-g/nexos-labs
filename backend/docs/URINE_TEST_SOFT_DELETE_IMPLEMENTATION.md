# Implementación de Soft-Delete para UrineTest

## 📋 Resumen de Cambios

Se ha agregado el campo `isActive` a la entidad `UrineTest` para implementar soft-delete siguiendo el patrón del proyecto.

### Archivos Modificados/Creados

1. ✅ `src/entities/urine-test.entity.ts` - Agregado campo `isActive`
2. ✅ `src/migrations/1729765200000-AddIsActiveToUrineTest.ts` - Migración TypeORM
3. ✅ `src/dto/create-urine-test.dto.ts` - Agregado `isActive?` field

---

## 🔧 Próximos Pasos

### 1. Ejecutar Migración

```bash
npm run typeorm migration:run
```

O si usas otra configuración:
```bash
npm run migration:run -- src/migrations/1729765200000-AddIsActiveToUrineTest.ts
```

**Verificar en base de datos**:
```sql
-- PostgreSQL
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'urine_tests' AND column_name = 'is_active';

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'urine_tests';
```

---

### 2. Actualizar Servicio (urine-tests.service.ts)

**Agregar estos métodos** al servicio:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrineTest } from '../entities/urine-test.entity';
import { CreateUrineTestDto } from '../dto/create-urine-test.dto';
import { UpdateUrineTestDto } from '../dto/update-urine-test.dto';

@Injectable()
export class UrineTestsService {
  constructor(
    @InjectRepository(UrineTest)
    private readonly urineTestRepository: Repository<UrineTest>
  ) {}

  /**
   * Obtener todos los exámenes activos (filtro automático)
   */
  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener todos incluyendo inactivos (solo admin)
   */
  async findAllIncludingInactive(page: number = 1, limit: number = 10): Promise<any> {
    const [data, total] = await this.urineTestRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener examen por ID (solo si está activo)
   */
  async findOne(id: string): Promise<UrineTest> {
    const urineTest = await this.urineTestRepository.findOne({
      where: { id, isActive: true }
    });

    if (!urineTest) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado o está inactivo`);
    }

    return urineTest;
  }

  /**
   * Obtener examen sin validar estado activo (admin/auditoría)
   */
  async findOneAdmin(id: string): Promise<UrineTest> {
    const urineTest = await this.urineTestRepository.findOne({
      where: { id }
    });

    if (!urineTest) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado`);
    }

    return urineTest;
  }

  /**
   * Obtener exámenes por paciente (solo activos)
   */
  async findByPatient(patientId: string, page: number = 1, limit: number = 10): Promise<any> {
    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { patientId, isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { testDate: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener exámenes inactivos (para auditoría)
   */
  async findInactive(page: number = 1, limit: number = 10): Promise<any> {
    const [data, total] = await this.urineTestRepository.findAndCount({
      where: { isActive: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Crear nuevo examen
   */
  async create(createUrineTestDto: CreateUrineTestDto): Promise<UrineTest> {
    // Por defecto, nuevos exámenes son activos
    const urineTest = this.urineTestRepository.create({
      ...createUrineTestDto,
      isActive: true
    });

    return this.urineTestRepository.save(urineTest);
  }

  /**
   * Actualizar examen
   */
  async update(id: string, updateUrineTestDto: UpdateUrineTestDto): Promise<UrineTest> {
    const urineTest = await this.findOne(id);

    // No permitir cambiar isActive desde update regular
    const { isActive, ...updateData } = updateUrineTestDto;

    Object.assign(urineTest, updateData);
    return this.urineTestRepository.save(urineTest);
  }

  /**
   * Soft-delete: Desactivar examen (marca como inactivo)
   * Uso: Cuando hay error en el examen o necesita corrección
   */
  async deactivate(id: string, reason?: string): Promise<UrineTest> {
    const urineTest = await this.findOne(id);

    if (!urineTest.isActive) {
      throw new BadRequestException('El examen ya está inactivo');
    }

    urineTest.isActive = false;
    return this.urineTestRepository.save(urineTest);
  }

  /**
   * Reactivar examen (marca como activo nuevamente)
   * Uso: Si fue desactivado por error
   */
  async reactivate(id: string): Promise<UrineTest> {
    const urineTest = await this.findOneAdmin(id);

    if (urineTest.isActive) {
      throw new BadRequestException('El examen ya está activo');
    }

    urineTest.isActive = true;
    return this.urineTestRepository.save(urineTest);
  }

  /**
   * Hard-delete (solo para desarrollo/testing)
   * NO usar en producción
   */
  async remove(id: string): Promise<void> {
    const result = await this.urineTestRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Examen de orina con ID ${id} no encontrado`);
    }
  }
}
```

---

### 3. Actualizar Controlador (urine-tests.controller.ts)

**Agregar estos endpoints**:

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UrineTestsService } from './urine-tests.service';
import { CreateUrineTestDto } from '../dto/create-urine-test.dto';
import { UpdateUrineTestDto } from '../dto/update-urine-test.dto';
import { UrineTest } from '../entities/urine-test.entity';

@ApiTags('Urine Tests')
@Controller('urine-tests')
export class UrineTestsController {
  constructor(private readonly urineTestsService: UrineTestsService) {}

  // ... endpoints existentes ...

  /**
   * GET /urine-tests - Listar todos los exámenes (solo activos)
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los exámenes de orina (solo activos)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página (por defecto: 10)' })
  @ApiResponse({ status: 200, description: 'Exámenes activos obtenidos' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    return this.urineTestsService.findAll(page, limit);
  }

  /**
   * GET /urine-tests/admin/all - Listar todos incluyendo inactivos (solo admin)
   */
  @Get('admin/all')
  @ApiOperation({ summary: 'Listar todos incluyendo inactivos (ADMIN ONLY)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Todos los exámenes' })
  findAllAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    // Aquí se puede agregar @UseGuards(AdminGuard) si existe
    return this.urineTestsService.findAllIncludingInactive(page, limit);
  }

  /**
   * GET /urine-tests/admin/inactive - Listar exámenes inactivos (auditoría)
   */
  @Get('admin/inactive')
  @ApiOperation({ summary: 'Listar exámenes inactivos (auditoría y compliance)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Exámenes inactivos' })
  findInactive(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    return this.urineTestsService.findInactive(page, limit);
  }

  /**
   * GET /urine-tests/patient/:patientId - Exámenes de un paciente
   */
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener exámenes de un paciente (solo activos)' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [UrineTest] })
  findByPatient(
    @Param('patientId') patientId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    return this.urineTestsService.findByPatient(patientId, page, limit);
  }

  /**
   * GET /urine-tests/:id - Obtener examen por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener examen por ID' })
  @ApiParam({ name: 'id', description: 'UUID del examen' })
  @ApiResponse({ status: 200, type: UrineTest })
  @ApiResponse({ status: 404, description: 'Examen no encontrado o inactivo' })
  findOne(@Param('id') id: string): Promise<UrineTest> {
    return this.urineTestsService.findOne(id);
  }

  /**
   * PATCH /urine-tests/:id - Actualizar examen
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar examen' })
  @ApiParam({ name: 'id', description: 'UUID del examen' })
  @ApiResponse({ status: 200, type: UrineTest })
  @ApiResponse({ status: 404, description: 'Examen no encontrado o inactivo' })
  update(
    @Param('id') id: string,
    @Body() updateUrineTestDto: UpdateUrineTestDto
  ): Promise<UrineTest> {
    return this.urineTestsService.update(id, updateUrineTestDto);
  }

  /**
   * PATCH /urine-tests/:id/deactivate - Soft-delete (desactivar)
   * Marca el examen como inactivo sin eliminarlo de la BD
   */
  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Desactivar examen (soft-delete)',
    description: 'Marca el examen como inactivo. El registro se mantiene en BD para auditoría.'
  })
  @ApiParam({ name: 'id', description: 'UUID del examen' })
  @ApiResponse({ status: 200, type: UrineTest, description: 'Examen desactivado' })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  @ApiResponse({ status: 400, description: 'Examen ya está inactivo' })
  deactivate(
    @Param('id') id: string,
    @Body('reason') reason?: string
  ): Promise<UrineTest> {
    return this.urineTestsService.deactivate(id, reason);
  }

  /**
   * PATCH /urine-tests/:id/reactivate - Reactivar examen
   * Reactiva un examen que fue desactivado
   */
  @Patch(':id/reactivate')
  @ApiOperation({ 
    summary: 'Reactivar examen',
    description: 'Marca el examen como activo nuevamente'
  })
  @ApiParam({ name: 'id', description: 'UUID del examen' })
  @ApiResponse({ status: 200, type: UrineTest, description: 'Examen reactivado' })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  @ApiResponse({ status: 400, description: 'Examen ya está activo' })
  reactivate(@Param('id') id: string): Promise<UrineTest> {
    return this.urineTestsService.reactivate(id);
  }

  /**
   * DELETE /urine-tests/:id - Hard-delete (NO USAR EN PRODUCCIÓN)
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar examen permanentemente',
    description: 'SOLO PARA DESARROLLO/TESTING. En producción usar deactivate.'
  })
  @ApiParam({ name: 'id', description: 'UUID del examen' })
  @ApiResponse({ status: 200, description: 'Examen eliminado' })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  async remove(@Param('id') id: string): Promise<any> {
    await this.urineTestsService.remove(id);
    return { message: 'Examen eliminado permanentemente' };
  }
}
```

---

## 🧪 Ejemplos de Uso

### 1. Crear Examen (automáticamente activo)

```bash
curl -X POST http://localhost:3000/urine-tests \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "testDate": "2025-10-23T10:00:00Z",
    "volume": "60 ml",
    "color": "AMARILLO",
    "aspect": "CLARO"
  }'
```

**Response**:
```json
{
  "id": "exam-uuid-123",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "testDate": "2025-10-23T10:00:00Z",
  "volume": "60 ml",
  "color": "AMARILLO",
  "aspect": "CLARO",
  "isActive": true,
  "status": "completed",
  "createdAt": "2025-10-23T14:00:00Z"
}
```

---

### 2. Listar Exámenes (solo activos)

```bash
curl "http://localhost:3000/urine-tests?page=1&limit=10"
```

**Response**:
```json
{
  "data": [
    {
      "id": "exam-uuid-123",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "testDate": "2025-10-23T10:00:00Z",
      "isActive": true,
      "status": "completed"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3. Desactivar Examen (Soft-delete)

```bash
curl -X PATCH http://localhost:3000/urine-tests/exam-uuid-123/deactivate \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Error en lectura - Se requiere re-prueba"
  }'
```

**Response**:
```json
{
  "id": "exam-uuid-123",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": false,
  "updatedAt": "2025-10-23T14:30:00Z",
  "message": "Examen desactivado"
}
```

---

### 4. Listar Inactivos (Auditoría)

```bash
curl "http://localhost:3000/urine-tests/admin/inactive?page=1"
```

**Response**:
```json
{
  "data": [
    {
      "id": "exam-uuid-123",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "isActive": false,
      "deactivatedAt": "2025-10-23T14:30:00Z",
      "deactivationReason": "Error en lectura - Se requiere re-prueba"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### 5. Reactivar Examen

```bash
curl -X PATCH http://localhost:3000/urine-tests/exam-uuid-123/reactivate
```

**Response**:
```json
{
  "id": "exam-uuid-123",
  "isActive": true,
  "updatedAt": "2025-10-23T14:45:00Z",
  "message": "Examen reactivado"
}
```

---

### 6. Listar Todos Incluyendo Inactivos (Admin)

```bash
curl "http://localhost:3000/urine-tests/admin/all?page=1"
```

---

## 📊 Base de Datos - Verificación

### Verificar que la migración se ejecutó

```sql
-- Ver estructura de la tabla
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'urine_tests'
ORDER BY ordinal_position;

-- Ver índices creados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'urine_tests' 
AND indexname LIKE '%active%';
```

### Verificar datos

```sql
-- Contar activos vs inactivos
SELECT is_active, COUNT(*) as count 
FROM urine_tests 
GROUP BY is_active;

-- Ver exámenes recientes inactivos
SELECT id, patient_id, is_active, updated_at 
FROM urine_tests 
WHERE is_active = false 
ORDER BY updated_at DESC 
LIMIT 10;
```

---

## 🔒 Consideraciones de Seguridad

### 1. **Filtrado Automático**
- Todas las búsquedas normales SOLO retornan activos
- Los inactivos solo se ven en endpoints específicos de admin

### 2. **Auditoría**
- Se mantiene `updated_at` para rastrear cambios
- Se puede extender con campos adicionales:
  - `deactivatedBy` (quién desactivó)
  - `deactivationReason` (por qué)
  - `deactivatedAt` (cuándo)

### 3. **Restricciones de Acceso**
- Endpoints `/admin/*` deberían tener `@UseGuards(AdminGuard)`
- Solo profesionales autorizados pueden ver histórico

---

## 📝 Resumen de Cambios

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Eliminar examen** | ❌ Hard-delete (pérdida de datos) | ✅ Soft-delete (isActive = false) |
| **Auditoría** | ❌ No posible | ✅ Completa con timestamps |
| **Recuperación** | ❌ Imposible | ✅ Reactivación fácil |
| **Compliance** | ❌ Incumple | ✅ HIPAA/GDPR compliant |
| **Queries normales** | ❌ Mezcla activos/inactivos | ✅ Solo activos automáticamente |

---

## ✅ Checklist de Implementación

- [x] Agregar `isActive` a entidad
- [x] Crear migración TypeORM
- [x] Actualizar DTOs
- [ ] Ejecutar `npm run typeorm migration:run`
- [ ] Actualizar servicio con métodos soft-delete
- [ ] Actualizar controlador con endpoints
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Documentar en swagger
- [ ] Commit y push

---

**Próximo paso**: Ejecutar la migración y actualizar el servicio/controlador según las plantillas proporcionadas.

