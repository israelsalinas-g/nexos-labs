# 🔍 FILTROS DE BÚSQUEDA POR NOMBRE DE PACIENTE - IMPLEMENTACIÓN

## Resumen de Cambios

Se han agregado filtros opcionales de búsqueda por nombre de paciente en los endpoints `findAll` de los siguientes recursos:

1. **DH36 Hemogramas** - Filtro por `patientNameDymind`
2. **iChroma II** - Filtro por `patientNameIchroma2`

---

## 📋 DETALLES TÉCNICOS

### 1. DH36 HEMOGRAMAS

**Endpoint:** `GET /dymind-dh36-results`

**Parámetros:**
```
GET /dymind-dh36-results?page=1&limit=4&patientName=juan
```

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|------------|
| `page` | number | No | Número de página (default: 1) |
| `limit` | number | No | Registros por página (default: 4) |
| `patientName` | string | No | Filtrar por nombre del paciente (búsqueda parcial) |

**Ejemplos de Uso:**

```bash
# Sin filtro - obtiene todas las hemogramas
curl "http://localhost:3000/dymind-dh36-results?page=1&limit=4"

# Con filtro - obtiene hemogramas del paciente Juan
curl "http://localhost:3000/dymind-dh36-results?page=1&limit=4&patientName=juan"

# Con filtro - búsqueda parcial
curl "http://localhost:3000/dymind-dh36-results?page=1&limit=4&patientName=García"

# Con filtro en página 2
curl "http://localhost:3000/dymind-dh36-results?page=2&limit=4&patientName=pérez"
```

**Características del Filtro:**
- ✅ Case-insensitive (ILIKE en PostgreSQL)
- ✅ Búsqueda parcial (contiene)
- ✅ Compatible con paginación
- ✅ Opcional (si no se proporciona, retorna todos)

---

### 2. ICHROMA II

**Endpoint:** `GET /ichroma-results`

**Parámetros:**
```
GET /ichroma-results?limit=4&offset=0&patientName=maria
```

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|------------|
| `limit` | number | No | Registros por página (default: 4) |
| `offset` | number | No | Desplazamiento (default: 0) |
| `patientName` | string | No | Filtrar por nombre del paciente (búsqueda parcial) |

**Ejemplos de Uso:**

```bash
# Sin filtro - obtiene todos los resultados iChroma
curl "http://localhost:3000/ichroma-results?limit=4&offset=0"

# Con filtro - obtiene resultados de María
curl "http://localhost:3000/ichroma-results?limit=4&offset=0&patientName=maria"

# Con filtro - búsqueda parcial
curl "http://localhost:3000/ichroma-results?limit=4&offset=0&patientName=José"

# Con filtro en siguiente página
curl "http://localhost:3000/ichroma-results?limit=4&offset=4&patientName=garcía"
```

**Características del Filtro:**
- ✅ Case-insensitive (ILIKE en PostgreSQL)
- ✅ Búsqueda parcial (contiene)
- ✅ Compatible con paginación
- ✅ Opcional (si no se proporciona, retorna todos)

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Controller (DH36)

```typescript
@Get()
@ApiOperation({ summary: 'Obtener todos los resultados de laboratorio con filtros opcionales' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'patientName', required: false, type: String, description: 'Filtrar por nombre del paciente' })
async findAll(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('patientName') patientName?: string,
): Promise<PaginationResult<DymindDh36Result>> {
  return await this.dymindDh36ResultsService.findAll(page || 1, limit || 4, patientName);
}
```

### Service (DH36)

```typescript
async findAll(
  page: number = 1,
  limit: number = 4,
  patientName?: string
): Promise<PaginationResult<DymindDh36Result>> {
  const offset = (page - 1) * limit;
  
  const query = this.dymindDh36ResultRepository.createQueryBuilder('dh36');
  
  // Filtro opcional
  if (patientName && patientName.trim().length > 0) {
    query.where('dh36.patientNameDymind ILIKE :patientName', {
      patientName: `%${patientName.trim()}%`
    });
  }
  
  const [data, total] = await query
    .orderBy('dh36.createdAt', 'DESC')
    .take(limit)
    .skip(offset)
    .getManyAndCount();
  
  const totalPages = Math.ceil(total / limit);
  
  return { data, total, page, limit, totalPages };
}
```

---

## 📊 SWAGGER DOCUMENTATION

Después de reiniciar el servidor, los nuevos parámetros deberían aparecer en Swagger:

- **http://localhost:3000/api** (Swagger UI)

**En la sección "Hemogram - DyMind DH36 Results":**
- Endpoint `GET /dymind-dh36-results`
- Aparecerán 3 query params: `page`, `limit`, `patientName`

**En la sección "Special Tests - iChroma II Results":**
- Endpoint `GET /ichroma-results`
- Aparecerán 3 query params: `limit`, `offset`, `patientName`

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

Para completar la funcionalidad en todos los recursos, se podría agregar el mismo filtro a:

- **Orina (UrineTest)** - Búsqueda genérica por nombre (no tienen campo de nombre específico)
- **Heces (StoolTest)** - Búsqueda genérica por nombre (no tienen campo de nombre específico)

---

## 📝 COMMITS ASOCIADOS

```
ae9a007 - feat: add optional patientName filter to DH36 findAll endpoint
d97d445 - feat: add optional patientName filter to iChroma findAll endpoint
```

---

## ✅ VALIDACIÓN

Para validar que los cambios funcionan:

1. **Reiniciar el servidor:** `npm run start:dev`
2. **Acceder a Swagger:** http://localhost:3000/api
3. **Verificar parámetros:** Los 3 query params deberían estar visibles
4. **Probar filtro:**
   ```bash
   curl "http://localhost:3000/dymind-dh36-results?limit=4&patientName=juan"
   ```

---

**Fecha de Implementación:** Noviembre 9, 2025  
**Estado:** ✅ Completado y pusheado

