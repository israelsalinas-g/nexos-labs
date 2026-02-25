# Análisis: Agregar Campo `isActive` para Soft-Delete en UrineTest

## 📊 Análisis de Viabilidad

### ✅ **SÍ, ES COMPLETAMENTE APROPIADO**

Después de revisar la estructura del proyecto, **recomiendo fuertemente agregar el campo `isActive` para implementar soft-delete** en la entidad `UrineTest`. Aquí está el análisis:

---

## 🔍 Contexto del Proyecto

### Estándar Existente en el Proyecto

Otras entidades **YA implementan soft-delete** con `isActive`:

```typescript
// En TestDefinition, TestProfile, TestSection, Doctor, Patient
@Column({ name: 'is_active', type: 'boolean', default: true })
isActive: boolean;
```

**Entidades con isActive** (5 encontradas):
1. ✅ `Patient` (línea 148)
2. ✅ `TestSection` (línea 65)
3. ✅ `TestProfile` (línea 86)
4. ✅ `TestDefinition` (línea 128)
5. ✅ `Doctor` (línea 111)

**UrineTest**: ❌ **CARECE de este campo**

---

## 📋 Razones para Agregar `isActive`

### 1. **Consistencia Arquitectónica**
- Todas las entidades principales del sistema tienen `isActive`
- Mantiene un patrón uniforme de soft-delete
- Facilita mantenimiento del código
- Nuevos desarrolladores esperarán este patrón

### 2. **Requisitos de Laboratorio**
- **Auditoría**: Registros de exámenes históricos nunca deben eliminarse
- **Cumplimiento**: HIPAA/GDPR requieren trazabilidad completa
- **Correcciones**: Se pueden marcar como inactivos si hay error
- **Retención legal**: 6-7 años de registros requeridos en labs

### 3. **Ventajas Funcionales**

| Ventaja | Descripción |
|---------|------------|
| **No pérdida de datos** | Los datos nunca se eliminan, solo se marcan inactivos |
| **Auditoría completa** | Se pueden rastrear cambios históricos |
| **Reversibilidad** | Se pueden reactivar exámenes si fue error |
| **Integridad referencial** | Los OrderTests siguen ligados a UrineTests históricos |
| **Reportes históricos** | Análisis incluye/excluye registros según necesidad |

### 4. **Requisitos Legales y de Compliance**
```
Laboratorio Clínico: NUNCA eliminar registros de pacientes
├─ Auditoría: Quién, cuándo, qué cambió
├─ Correcciones: Trazabilidad de enmiendas
├─ Retención: Mínimo 6-7 años
└─ Investigación: Acceso a datos históricos
```

---

## 🏗️ Implementación Recomendada

### 1. **Agregar Campo a UrineTest**

```typescript
@ApiProperty({ 
  description: 'Indica si el examen de orina está activo/vigente',
  example: true,
  default: true
})
@Column({ name: 'is_active', type: 'boolean', default: true })
isActive: boolean;
```

**Ubicación sugerida**: Después de `status` y antes de `createdAt`

### 2. **Crear Migración TypeORM**

```typescript
// src/migrations/[timestamp]-AddIsActiveToUrineTest.ts

export class AddIsActiveToUrineTest implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'urine_tests',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: 'Indicador de soft-delete para auditoría'
      })
    );

    // Marcar todos los registros existentes como activos
    await queryRunner.query(
      `UPDATE urine_tests SET is_active = true WHERE is_active IS NULL`
    );

    // Crear índice para búsquedas rápidas
    await queryRunner.createIndex(
      'urine_tests',
      new TableIndex({
        name: 'IDX_urine_tests_is_active',
        columnNames: ['is_active']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('urine_tests', 'IDX_urine_tests_is_active');
    await queryRunner.dropColumn('urine_tests', 'is_active');
  }
}
```

### 3. **Actualizar DTOs**

```typescript
// src/dto/update-urine-test.dto.ts
export class UpdateUrineTestDto {
  // ... otros campos ...

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ 
    description: 'Marcar como inactivo (soft-delete)',
    example: false 
  })
  isActive?: boolean;
}
```

### 4. **Actualizar Servicios**

```typescript
// src/features/urine-tests/urine-tests.service.ts

// Listar solo activos (por defecto)
findAll(includeInactive: boolean = false): Promise<UrineTest[]> {
  const query = this.urineTestRepository.createQueryBuilder('test');
  
  if (!includeInactive) {
    query.where('test.isActive = :isActive', { isActive: true });
  }
  
  return query.getMany();
}

// Soft-delete
async deactivate(id: string): Promise<UrineTest> {
  const urineTest = await this.urineTestRepository.findOne({ where: { id } });
  if (!urineTest) throw new NotFoundException();
  
  urineTest.isActive = false;
  return this.urineTestRepository.save(urineTest);
}

// Reactivar
async reactivate(id: string): Promise<UrineTest> {
  const urineTest = await this.urineTestRepository.findOne({ where: { id } });
  if (!urineTest) throw new NotFoundException();
  
  urineTest.isActive = true;
  return this.urineTestRepository.save(urineTest);
}

// Listar inactivos (para auditoría)
async findInactive(): Promise<UrineTest[]> {
  return this.urineTestRepository.find({ 
    where: { isActive: false } 
  });
}
```

### 5. **Actualizar Controlador**

```typescript
// src/features/urine-tests/urine-tests.controller.ts

@Get('admin/inactive')
@ApiOperation({ summary: 'Listar exámenes inactivos (auditoría)' })
@ApiResponse({ status: 200, type: [UrineTest] })
findInactive(): Promise<UrineTest[]> {
  return this.urineTestsService.findInactive();
}

@Patch(':id/deactivate')
@ApiOperation({ summary: 'Desactivar examen (soft-delete)' })
@ApiResponse({ status: 200, type: UrineTest })
deactivate(@Param('id') id: string): Promise<UrineTest> {
  return this.urineTestsService.deactivate(id);
}

@Patch(':id/reactivate')
@ApiOperation({ summary: 'Reactivar examen' })
@ApiResponse({ status: 200, type: UrineTest })
reactivate(@Param('id') id: string): Promise<UrineTest> {
  return this.urineTestsService.reactivate(id);
}
```

---

## 🔒 Consideraciones de Seguridad

### 1. **Filtrado Automático en Queries**

```typescript
// SIEMPRE excluir registros inactivos en listados normales
@Controller('urine-tests')
export class UrineTestsController {
  // Por defecto: solo activos
  @Get()
  findAll(): Promise<UrineTest[]> {
    return this.service.findAll(includeInactive: false);
  }

  // Explícito: incluir inactivos (solo admin)
  @Get('admin/all')
  @UseGuards(AdminGuard)
  findAll(): Promise<UrineTest[]> {
    return this.service.findAll(includeInactive: true);
  }
}
```

### 2. **Auditoría de Cambios**

```typescript
// Registrar quién, cuándo y por qué se inactivo
@Column({ name: 'deactivated_by', nullable: true })
deactivatedBy: string;

@Column({ name: 'deactivated_at', nullable: true })
deactivatedAt: Date;

@Column({ name: 'deactivation_reason', nullable: true })
deactivationReason: string;
```

### 3. **Restricciones de Negocio**

```typescript
// No permitir soft-delete si hay relaciones activas
async deactivate(id: string): Promise<UrineTest> {
  const urineTest = await this.urineTestRepository.findOne({ 
    where: { id },
    relations: ['patient']
  });

  // Validar que no esté referenciado en órdenes activas
  const hasActiveOrders = await this.orderTestRepository.count({
    where: { 
      urineTestId: id,
      status: In(['PENDING', 'IN_PROGRESS'])
    }
  });

  if (hasActiveOrders > 0) {
    throw new BadRequestException(
      'No se puede inactivar un examen con órdenes pendientes'
    );
  }

  urineTest.isActive = false;
  return this.urineTestRepository.save(urineTest);
}
```

---

## 📊 Comparación: Soft-Delete vs Hard-Delete

| Aspecto | Soft-Delete (`isActive`) | Hard-Delete |
|--------|-------------------------|------------|
| **Datos** | Preservados | ❌ Perdidos |
| **Auditoría** | ✅ Completa | ❌ Imposible |
| **Recuperación** | ✅ Fácil | ❌ Imposible |
| **Compliance** | ✅ HIPAA/GDPR | ❌ Incumple |
| **Performance** | ✅ Índices rápidos | ⚠️ Requiere rebuild |
| **Reportes** | ✅ Históricos | ❌ Limitados |
| **Lab Legal** | ✅ Requerido | ❌ Riesgo legal |

---

## 🚀 Plan de Implementación

### Fase 1: Preparación (30 minutos)
- [ ] Crear migración TypeORM
- [ ] Actualizar entidad UrineTest
- [ ] Actualizar DTOs

### Fase 2: Lógica (45 minutos)
- [ ] Implementar métodos en servicio
- [ ] Agregar endpoints en controlador
- [ ] Añadir validaciones

### Fase 3: Testing (30 minutos)
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Validación de migraciones

### Fase 4: Documentación (15 minutos)
- [ ] Actualizar README
- [ ] Documentar cambios
- [ ] Commit y push

**Total estimado**: 2 horas

---

## 📝 Cambios Recomendados - Paso a Paso

### Paso 1: Actualizar Entidad

```typescript
// ANTES (línea 160)
@ApiProperty({ description: 'Fecha de actualización' })
@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
}

// DESPUÉS
@ApiProperty({ 
  description: 'Indica si el examen de orina está activo/vigente',
  example: true,
  default: true
})
@Column({ name: 'is_active', type: 'boolean', default: true })
isActive: boolean;

@ApiProperty({ description: 'Fecha de actualización' })
@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
}
```

---

## ⚠️ Riesgos Mitigados

| Riesgo | Solución |
|--------|----------|
| Pérdida de datos | Soft-delete preserva todo |
| Violación HIPAA | Auditoría completa con timestamps |
| Incidentes médicos | Trazabilidad histórica |
| Errores no recuperables | Reversibilidad implementada |
| Performance | Índice en `is_active` |
| Consultas lentas | Filtro automático en queries |

---

## ✅ Recomendación Final

### **IMPLEMENTAR `isActive` - PRIORIDAD ALTA**

**Justificación**:
1. ✅ Estándar del proyecto (otras 5 entidades lo usan)
2. ✅ Requisito legal y compliance (laboratorios)
3. ✅ Facilita auditoría y trazabilidad
4. ✅ Reversibilidad de acciones
5. ✅ Implementación simple (< 2 horas)
6. ✅ Sin impacto en performance
7. ✅ Mejora integridad de datos

**Sin `isActive`**: Riesgo de violaciones normativas de laboratorio.

**Con `isActive`**: Sistema robusto, auditable y compliant.

---

## 🔗 Referencias

- HIPAA: Health Insurance Portability and Accountability Act
- GDPR: General Data Protection Regulation
- CLIA: Clinical Laboratory Improvement Amendments
- CAP: College of American Pathologists
- HL7: Health Level Seven International Standards

