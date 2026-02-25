# Sistema Flexible de Exámenes de Laboratorio

## Descripción General

Este documento describe el sistema flexible implementado para manejar múltiples tipos de exámenes de laboratorio clínico (Serología, Inmunología, Química Sanguínea, Microbiología, etc.) con pruebas opcionales y diferentes tipos de resultados.

## Arquitectura del Sistema

El sistema está diseñado con una arquitectura de catálogos que permite:

- ✅ **Escalabilidad**: Agregar nuevos tipos de exámenes solo requiere insertar en catálogos
- ✅ **Flexibilidad**: Maneja cualquier tipo de resultado (texto, numérico, escalas cualitativas)
- ✅ **Perfiles/Paquetes**: Agrupa pruebas relacionadas (ej: Curva de tolerancia a la glucosa)
- ✅ **Referencias Dinámicas**: Rangos de referencia se calculan según sexo, edad, u otros criterios
- ✅ **Sin duplicación**: Definición única de cada prueba

## Modelo de Datos

### 1. exam_categories (Categorías de Exámenes)

Tabla maestra de categorías o tipos de exámenes.

**Campos principales:**
- `id`: ID único
- `name`: Nombre de la categoría (ej: "Química Sanguínea", "Serología")
- `code`: Código corto opcional (ej: "QS", "SERO")
- `description`: Descripción de la categoría
- `color`: Color hexadecimal para UI
- `displayOrder`: Orden de visualización
- `isActive`: Si está activa o no

**Ejemplos:**
- Química Sanguínea
- Serología
- Inmunología
- Microbiología
- Hormonas
- Marcadores Tumorales

### 2. test_definitions (Definiciones de Pruebas)

Define cada prueba individual con sus características.

**Campos principales:**
- `id`: ID único
- `categoryId`: Categoría a la que pertenece
- `name`: Nombre de la prueba (ej: "Creatinina", "BUN", "VDRL")
- `code`: Código corto opcional
- `resultType`: Tipo de resultado (NUMERIC, POSITIVE_NEGATIVE, etc.)
- `unit`: Unidad de medida (ej: "mg/dL", "U/L")
- `referenceRange`: Rango de referencia como texto libre
- `method`: Método de análisis
- `sampleType`: Tipo de muestra requerida
- `processingTime`: Tiempo de procesamiento en horas
- `price`: Costo de la prueba
- `isActive`: Si está activa

**Tipos de Resultados (ResultType):**
- `NUMERIC`: Resultado numérico (ej: 120, 5.5)
- `TEXT`: Texto libre
- `POSITIVE_NEGATIVE`: Negativo/Positivo
- `POSITIVE_NEGATIVE_3PLUS`: Negativo/Positivo con escala de 3 cruces (+, ++, +++)
- `POSITIVE_NEGATIVE_4PLUS`: Negativo/Positivo con escala de 4 cruces (+, ++, +++, ++++)
- `ESCASA_MODERADA_ABUNDANTE`: Escasa/Moderada/Abundante cantidad
- `ESCASA_MODERADA_ABUNDANTE_AUSENTE`: Incluye "No se observa"
- `REACTIVE_NON_REACTIVE`: Reactivo/No reactivo (común en serología)
- `DETECTED_NOT_DETECTED`: Detectado/No detectado

**Valores de Referencia:**
- Campo de texto libre que permite cualquier formato
- Ejemplos:
  - "Hombres: 0.7-1.3 mg/dL, Mujeres: 0.6-1.1 mg/dL"
  - "70-110 mg/dL"
  - "Negativo"
  - "< 200 mg/dL"
  - "Adultos: 70-110 mg/dL, Niños: 50-100 mg/dL"

### 3. test_profiles (Perfiles/Paquetes de Pruebas)

Agrupa varias pruebas relacionadas en un paquete.

**Campos principales:**
- `id`: ID único
- `categoryId`: Categoría a la que pertenece
- `name`: Nombre del perfil (ej: "Curva de tolerancia a la glucosa")
- `code`: Código corto opcional
- `tests`: Array de pruebas incluidas (relación many-to-many)
- `price`: Costo del perfil (puede ser menor que la suma individual)
- `isActive`: Si está activo

**Ejemplos de Perfiles:**
- Curva de tolerancia a la glucosa (4 pruebas de glucosa en diferentes tiempos)
- Perfil lipídico (Colesterol total, HDL, LDL, Triglicéridos)
- Perfil hepático (Bilirrubinas, transaminasas, fosfatasa alcalina)
- Perfil renal (BUN, Creatinina, Ácido úrico)

### 4. doctors (Médicos)

Tabla normalizada de médicos que ordenan exámenes de laboratorio.

**Campos principales:**
- `id`: UUID único
- `firstName`: Nombres del médico
- `lastName`: Apellidos del médico
- `specialty`: Especialidad médica
- `licenseNumber`: Número de licencia o colegiatura (único)
- `phone`: Teléfono
- `email`: Correo electrónico (único)
- `address`: Dirección del consultorio
- `institution`: Hospital o clínica donde trabaja
- `isStaff`: Si pertenece al staff de la clínica (boolean)
- `isActive`: Si está activo en el sistema

**Ventajas de normalización:**
- ✅ Evita duplicación de datos de médicos
- ✅ Facilita actualización centralizada de información
- ✅ Permite filtrar por médicos del staff vs externos
- ✅ Mantiene histórico de órdenes por médico
- ✅ Base para futuras integraciones con sistema de citas

### 5. laboratory_orders (Órdenes de Laboratorio)

*Nota: Implementación opcional - actualmente las órdenes se manejan manualmente*

Agrupa todas las pruebas solicitadas para un paciente.

**Campos principales:**
- `id`: UUID único
- `patientId`: Paciente asociado
- `doctorId`: Médico que ordena (relación con tabla doctors)
- `orderNumber`: Número único de orden
- `orderDate`: Fecha y hora de la orden
- `status`: Estado (pending, in_progress, completed, delivered, cancelled)
- `priority`: Prioridad (normal, urgent, stat)
- `diagnosis`: Diagnóstico o razón
- `totalCost`: Costo total

### 6. order_tests (Pruebas por Orden)

*Nota: Implementación opcional*

Tabla intermedia entre órdenes y pruebas.

### 7. test_results (Resultados de Pruebas)

*Nota: Implementación opcional*

Almacena los resultados de forma flexible.

## Endpoints API

### Exam Categories (Categorías)

```
GET    /exam-categories              - Listar todas las categorías
GET    /exam-categories/stats        - Estadísticas de categorías
GET    /exam-categories/:id          - Obtener una categoría
GET    /exam-categories/code/:code   - Obtener por código
POST   /exam-categories              - Crear nueva categoría
PATCH  /exam-categories/:id          - Actualizar categoría
PATCH  /exam-categories/:id/toggle-active - Activar/Desactivar
DELETE /exam-categories/:id          - Eliminar categoría
```

### Test Definitions (Definiciones de Pruebas)

```
GET    /test-definitions                    - Listar todas las pruebas
GET    /test-definitions/search?q=term      - Buscar pruebas
GET    /test-definitions/stats              - Estadísticas
GET    /test-definitions/category/:id       - Pruebas por categoría
GET    /test-definitions/:id                - Obtener una prueba
GET    /test-definitions/code/:code         - Obtener por código
POST   /test-definitions                    - Crear nueva prueba
PATCH  /test-definitions/:id                - Actualizar prueba
PATCH  /test-definitions/:id/toggle-active  - Activar/Desactivar
DELETE /test-definitions/:id                - Eliminar prueba
```

### Test Profiles (Perfiles)

```
GET    /test-profiles              - Listar todos los perfiles
GET    /test-profiles/stats        - Estadísticas
GET    /test-profiles/:id          - Obtener un perfil
POST   /test-profiles              - Crear nuevo perfil
PATCH  /test-profiles/:id          - Actualizar perfil
PATCH  /test-profiles/:id/toggle-active - Activar/Desactivar
DELETE /test-profiles/:id          - Eliminar perfil
```

### Doctors (Médicos)

```
GET    /doctors                      - Listar todos los médicos
GET    /doctors/search?q=term        - Buscar médicos
GET    /doctors/stats                - Estadísticas
GET    /doctors/:id                  - Obtener un médico
GET    /doctors/email/:email         - Obtener por email
GET    /doctors/license/:license     - Obtener por licencia
POST   /doctors                      - Crear nuevo médico
PATCH  /doctors/:id                  - Actualizar médico
PATCH  /doctors/:id/toggle-active    - Activar/Desactivar
PATCH  /doctors/:id/toggle-staff     - Cambiar estado de staff
DELETE /doctors/:id                  - Eliminar médico
```

## Ejemplos de Uso

### 1. Crear una Categoría

```json
POST /exam-categories
{
  "name": "Química Sanguínea",
  "code": "QS",
  "description": "Exámenes relacionados con la química de la sangre",
  "color": "#4CAF50",
  "displayOrder": 1
}
```

### 2. Crear una Prueba con Referencia por Sexo

```json
POST /test-definitions
{
  "categoryId": 1,
  "name": "Creatinina",
  "code": "CREAT",
  "description": "Medición de creatinina sérica para evaluación de función renal",
  "resultType": "numeric",
  "unit": "mg/dL",
  "referenceRange": "Hombres: 0.7-1.3 mg/dL, Mujeres: 0.6-1.1 mg/dL",
  "method": "Espectrofotometría",
  "sampleType": "Suero",
  "processingTime": 2,
  "price": 150.00
}
```

### 3. Crear una Prueba Cualitativa (Serología)

```json
POST /test-definitions
{
  "categoryId": 2,
  "name": "VDRL",
  "code": "VDRL",
  "description": "Prueba para detección de sífilis",
  "resultType": "reactive_non_reactive",
  "referenceRange": "No reactivo",
  "method": "Aglutinación",
  "sampleType": "Suero",
  "processingTime": 1,
  "price": 100.00
}
```

### 4. Crear un Médico

```json
POST /doctors
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "specialty": "Medicina Interna",
  "licenseNumber": "CM-12345",
  "phone": "+50499999999",
  "email": "dr.perez@hospital.com",
  "address": "Consultorio 301, Edificio Médico Central",
  "institution": "Hospital General San Felipe",
  "isStaff": true,
  "isActive": true
}
```

### 5. Crear un Perfil de Pruebas

```json
POST /test-profiles
{
  "categoryId": 1,
  "name": "Curva de tolerancia a la glucosa",
  "code": "CTG",
  "description": "Perfil que incluye mediciones de glucosa en diferentes tiempos",
  "testIds": [1, 2, 3, 4],
  "price": 450.00
}
```

### 6. Más Ejemplos de Referencias

```json
// Prueba con rango simple
{
  "name": "Glucosa",
  "referenceRange": "70-110 mg/dL"
}

// Prueba con múltiples rangos por edad
{
  "name": "Hemoglobina",
  "referenceRange": "Niños: 11-13 g/dL, Adultos: 13-17 g/dL (H), 12-15 g/dL (M)"
}

// Prueba cualitativa
{
  "name": "Proteínas en orina",
  "referenceRange": "Negativo o trazas"
}
```

## Flujo de Trabajo Recomendado

### Configuración Inicial

1. **Crear Categorías**: Definir las categorías de exámenes que manejará el laboratorio
2. **Crear Pruebas**: Agregar las pruebas individuales con sus características
3. **Crear Perfiles**: Agrupar pruebas relacionadas en perfiles/paquetes (opcional)

### Uso Diario

1. El médico solicita exámenes (manual por ahora)
2. El técnico ingresa los resultados para cada prueba
3. El sistema calcula automáticamente si están dentro de rangos normales
4. Se genera el reporte final

## Ventajas del Sistema

### Para el Laboratorio
- ✅ Fácil agregar nuevos tipos de exámenes
- ✅ Mantenimiento centralizado de rangos de referencia
- ✅ Precios y tiempos de procesamiento configurables
- ✅ Agrupación de pruebas en perfiles promocionales

### Para el Desarrollo
- ✅ Sin necesidad de migraciones para cada nuevo examen
- ✅ Código reutilizable y mantenible
- ✅ Validaciones automáticas
- ✅ Documentación con Swagger

### Para el Negocio
- ✅ Escalable a cualquier tipo de examen
- ✅ Fácil actualización de precios
- ✅ Control de pruebas activas/inactivas
- ✅ Estadísticas y reportes

## Migraciones

Para crear las tablas en la base de datos, ejecutar:

```bash
npm run migration:generate -- src/migrations/CreateFlexibleLabTestsSchema
npm run migration:run
```

## Consideración Futura: Sistema de Órdenes

Las entidades `laboratory_orders`, `order_tests` y `test_results` están implementadas pero no tienen módulos activos aún, ya que mencionaste que las órdenes se manejan manualmente. Cuando estés listo para automatizar el proceso de órdenes, estas entidades ya están disponibles.

## Notas Técnicas

- Las entidades usan TypeORM con decoradores de Swagger
- Validaciones con class-validator en los DTOs
- Manejo de errores con excepciones de NestJS
- Relaciones configuradas con eager/lazy loading según sea necesario
- Soporte para soft delete (desactivación en lugar de eliminación física)

## Soporte

Para más información sobre el sistema existente de laboratorio, consultar:
- `README-URINE-TESTS.md`
- `README-STOOL-TESTS-API-GUIDE.md`
- `README-ICHROMA_SYSTEM_DOCUMENTATION.md`
