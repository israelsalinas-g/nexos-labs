# Guía: Laboratory Orders y Test Results

Este documento explica el flujo completo de gestión de órdenes de laboratorio y resultados de exámenes para pacientes, incluyendo entidades, DTOs, endpoints y enumeraciones.

## 📑 Tabla de Contenidos

1. [Conceptos Generales](#conceptos-generales)
2. [Entidades (Entities)](#entidades-entities)
3. [Enumeraciones (Enums)](#enumeraciones-enums)
4. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
5. [Endpoints - Laboratory Orders](#endpoints---laboratory-orders)
6. [Endpoints - Test Results](#endpoints---test-results)
7. [Flujo Completo (Workflow)](#flujo-completo-workflow)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎯 Conceptos Generales

### Relación de Entidades

```
Patient (Paciente)
    ↓
LaboratoryOrder (Orden de Laboratorio)
    ↓
OrderTest (Prueba en la Orden) ← TestDefinition o TestProfile
    ↓
TestResult (Resultado de la Prueba)
```

### Flujo de Datos

1. **Crear Orden**: Se crea una `LaboratoryOrder` para un paciente
2. **Agregar Pruebas**: Se añaden `OrderTest` items a la orden
3. **Recolectar Muestras**: Se actualiza información de recolección
4. **Registrar Resultados**: Se crean `TestResult` para cada prueba
5. **Validar Resultados**: Se marcan como críticos o anormales si aplica

---

## 🗂️ Entidades (Entities)

### 1. **LaboratoryOrder** (Orden de Laboratorio)

**Ruta**: `src/entities/laboratory-order.entity.ts`

```typescript
@Entity('laboratory_orders')
export class LaboratoryOrder {
  // Identificadores
  @PrimaryGeneratedColumn('uuid')
  id: string;                                    // UUID único

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;                           // ORD-2025-000001

  // Relaciones
  @Column({ type: 'uuid' })
  patientId: string;                             // Referencia al paciente

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', nullable: true })
  doctorId: string;                              // Doctor que ordena

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  // Detalles de la orden
  @Column({ type: 'text', nullable: true })
  clinicalIndication: string;                    // Motivo/Indicación clínica

  @Column({ type: 'text', nullable: true })
  notes: string;                                 // Notas adicionales

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;                           // Estado actual

  @Column({ type: 'enum', enum: OrderPriority, default: OrderPriority.NORMAL })
  priority: OrderPriority;                       // Prioridad de procesamiento

  // Fechas
  @CreateDateColumn({ name: 'order_date' })
  orderDate: Date;                               // Fecha de creación

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;                             // Fecha de finalización

  // Relación con pruebas
  @OneToMany(() => OrderTest, test => test.order, { cascade: true })
  tests: OrderTest[];
}
```

**Campos Principales**:
- `id`: UUID único de la orden
- `orderNumber`: Identificador legible (ej: ORD-2025-000001)
- `patientId`: Referencia al paciente
- `doctorId`: Médico que solicita el examen
- `status`: Estado actual (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority`: Urgencia del procesamiento
- `tests`: Array de pruebas asociadas

---

### 2. **OrderTest** (Prueba en la Orden)

**Ruta**: `src/entities/order-test.entity.ts`

```typescript
@Entity('order_tests')
export class OrderTest {
  // Identificadores
  @PrimaryGeneratedColumn()
  id: number;                                    // ID secuencial

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;                               // Referencia a LaboratoryOrder

  @Column({ type: 'int', name: 'test_definition_id' })
  testDefinitionId: number;                      // Referencia a TestDefinition

  // Relaciones
  @ManyToOne(() => LaboratoryOrder, order => order.tests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: LaboratoryOrder;

  @ManyToOne(() => TestDefinition, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'test_definition_id' })
  testDefinition: TestDefinition;

  @OneToOne(() => TestResult, result => result.orderTest)
  result: TestResult;

  // Información de la muestra
  @Column({ type: 'varchar', length: 50, nullable: true })
  sampleNumber: string;                          // ej: S-2025-550e8400-001

  @Column({ type: 'timestamp', nullable: true })
  sampleCollectedAt: Date;                       // Cuándo se tomó la muestra

  @Column({ type: 'varchar', length: 100, nullable: true })
  collectedBy: string;                           // Quién tomó la muestra

  // Estado
  @Column({ type: 'enum', enum: TestStatus, default: TestStatus.PENDING })
  status: TestStatus;                            // PENDING, IN_PROGRESS, COMPLETED, FAILED

  // Auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Campos Principales**:
- `id`: Identificador único de la prueba en la orden
- `orderId`: Orden a la que pertenece
- `testDefinitionId`: Tipo de prueba a realizar
- `sampleNumber`: Identificador único de la muestra (ej: S-2025-550e8400-001)
- `status`: Estado del procesamiento de la prueba
- `collectedBy`: Técnico que tomó la muestra

---

### 3. **TestResult** (Resultado de la Prueba)

**Ruta**: `src/entities/test-result.entity.ts`

```typescript
@Entity('test_results')
export class TestResult {
  // Identificadores
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_test_id' })
  orderTestId: number;                           // Referencia a OrderTest

  // Relación
  @OneToOne(() => OrderTest, test => test.result, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_test_id' })
  orderTest: OrderTest;

  // Resultado según tipo
  @Column({ type: 'text', nullable: true })
  resultValue: string;                           // Resultado en texto (TEXT, POSITIVE, etc)

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  resultNumeric: number;                         // Resultado numérico

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceRange: string;                        // Rango de referencia (ej: 4.0-10.0)

  @Column({ type: 'varchar', length: 50, nullable: true })
  sampleNumber: string;                          // Número de muestra asociado

  // Análisis de resultados
  @Column({ type: 'boolean', default: false })
  isAbnormal: boolean;                           // ¿Fuera del rango normal?

  @Column({ type: 'boolean', default: false })
  isCritical: boolean;                           // ¿Resultado crítico?

  @Column({ type: 'text', nullable: true })
  observations: string;                          // Observaciones del laboratorista

  // Auditoría de procesamiento
  @Column({ type: 'timestamp', nullable: true })
  testedAt: Date;                                // Cuándo se realizó la prueba

  @Column({ type: 'varchar', length: 100, nullable: true })
  testedBy: string;                              // Técnico que realizó la prueba

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;                             // Cuándo se validó el resultado

  @Column({ type: 'varchar', length: 100, nullable: true })
  validatedBy: string;                           // Profesional que validó

  // Auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Campos Principales**:
- `orderTestId`: Prueba a la que pertenece el resultado
- `resultValue`: Valor textual del resultado
- `resultNumeric`: Valor numérico del resultado
- `referenceRange`: Rango normal de referencia
- `isAbnormal`: Indicador de valor anormal
- `isCritical`: Indicador de valor crítico (requiere atención inmediata)
- `testedBy`: Personal que realizó la prueba
- `validatedBy`: Profesional que validó el resultado

---

## 📋 Enumeraciones (Enums)

### 1. **OrderStatus** - Estado de la Orden

**Ruta**: `src/common/enums/order-status.enums.ts`

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',              // Orden creada, esperando procesamiento
  IN_PROGRESS = 'IN_PROGRESS',      // Pruebas en procesamiento
  COMPLETED = 'COMPLETED',          // Todos los resultados disponibles
  CANCELLED = 'CANCELLED',          // Orden cancelada
  ON_HOLD = 'ON_HOLD'               // En espera (requiere acción)
}
```

**Transiciones Típicas**:
```
PENDING → IN_PROGRESS → COMPLETED
   ↓                           ↓
   └─────→ ON_HOLD ───────────┘
   
Cualquier estado → CANCELLED (en caso de error)
```

---

### 2. **OrderPriority** - Prioridad de Procesamiento

**Ruta**: `src/common/enums/order-priority.enums.ts`

```typescript
export enum OrderPriority {
  LOW = 'LOW',                      // Resultado dentro de 48-72 horas
  NORMAL = 'NORMAL',               // Resultado dentro de 24 horas (por defecto)
  HIGH = 'HIGH',                   // Resultado dentro de 4-6 horas
  STAT = 'STAT'                    // Resultado dentro de 1 hora (crítico)
}
```

**Afecta**:
- Orden de procesamiento en la cola
- Disponibilidad de recursos
- Notificaciones de urgencia

---

### 3. **TestStatus** - Estado de la Prueba

**Ruta**: `src/common/enums/test-status.enums.ts`

```typescript
export enum TestStatus {
  PENDING = 'PENDING',              // Esperando ser procesada
  IN_PROGRESS = 'IN_PROGRESS',      // En procesamiento en el equipo
  COMPLETED = 'COMPLETED',          // Resultado disponible
  FAILED = 'FAILED',                // Error en el procesamiento
  RETESTING = 'RETESTING'           // Se requiere re-prueba
}
```

---

### 4. **TestResultType** - Tipo de Resultado

**Ruta**: `src/common/enums/test-result-type.enums.ts`

```typescript
export enum TestResultType {
  // Resultados cuantitativos
  NUMERIC = 'NUMERIC',                          // Valor numérico (ej: 8.5)
  
  // Resultados cualitativos
  TEXT = 'TEXT',                                // Texto libre
  POSITIVE_NEGATIVE = 'POSITIVE_NEGATIVE',      // Positivo/Negativo
  POSITIVE_NEGATIVE_3PLUS = 'POSITIVE_NEGATIVE_3PLUS',    // -, +, ++, +++
  POSITIVE_NEGATIVE_4PLUS = 'POSITIVE_NEGATIVE_4PLUS',    // -, +, ++, +++, ++++
  REACTIVE_NON_REACTIVE = 'REACTIVE_NON_REACTIVE',        // Reactivo/No Reactivo
  DETECTED_NOT_DETECTED = 'DETECTED_NOT_DETECTED'         // Detectado/No Detectado
}
```

---

## 📦 DTOs (Data Transfer Objects)

### Laboratory Orders DTOs

#### 1. **CreateLaboratoryOrderDto** - Crear Nueva Orden

**Ruta**: `src/dto/create-laboratory-order.dto.ts`

```typescript
export class CreateLaboratoryOrderDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;                 // UUID del paciente (requerido)

  @IsUUID()
  @IsOptional()
  doctorId?: string;                 // UUID del doctor (opcional)

  @IsString()
  @IsOptional()
  @MaxLength(500)
  clinicalIndication?: string;       // Motivo de la solicitud
  // ej: "Chequeo de rutina", "Sospecha de diabetes"

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;                    // Notas adicionales

  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority = OrderPriority.NORMAL;  // Prioridad
}
```

**Ejemplo**:
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "clinicalIndication": "Evaluación completa de sangre",
  "priority": "HIGH"
}
```

---

#### 2. **UpdateLaboratoryOrderDto** - Actualizar Orden

**Ruta**: `src/dto/update-laboratory-order.dto.ts`

```typescript
export class UpdateLaboratoryOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  clinicalIndication?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
```

---

#### 3. **AddTestsToOrderDto** - Agregar Pruebas a Orden

**Ruta**: `src/dto/add-tests-to-order.dto.ts`

```typescript
export class AddTestItemDto {
  @IsUUID()
  @IsOptional()
  testDefinitionId?: string;         // ID de prueba individual (UUID)

  @IsUUID()
  @IsOptional()
  testProfileId?: string;            // ID de perfil (se expande automáticamente)

  @IsNumber()
  @IsOptional()
  quantity?: number = 1;             // Cantidad de veces a repetir
}

export class AddTestsToOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddTestItemDto)
  tests: AddTestItemDto[];           // Array de pruebas/perfiles

  @IsString()
  @IsOptional()
  sampleNumberBase?: string;         // Prefijo personalizado para muestra

  @IsString()
  @IsOptional()
  @MaxLength(100)
  collectedBy?: string;              // Nombre del técnico

  @IsObject()
  @IsOptional()
  metadata?: any;                    // Datos adicionales
}
```

**Ejemplo - Agregar Pruebas Individuales**:
```json
{
  "tests": [
    { "testDefinitionId": "550e8400-e29b-41d4-a716-446655440002" },
    { "testDefinitionId": "550e8400-e29b-41d4-a716-446655440003", "quantity": 2 }
  ],
  "collectedBy": "Técnico Juan",
  "sampleNumberBase": "LAB"
}
```

**Ejemplo - Agregar Perfil**:
```json
{
  "tests": [
    { "testProfileId": "550e8400-e29b-41d4-a716-446655440004" }
  ],
  "collectedBy": "Técnico María"
}
```

---

### Test Results DTOs

#### 1. **CreateTestResultDto** - Registrar Resultado

**Ruta**: `src/dto/create-test-result.dto.ts`

```typescript
export class CreateTestResultDto {
  @IsNumber()
  @IsNotEmpty()
  orderTestId: number;               // ID de OrderTest (requerido)

  @IsString()
  @IsOptional()
  resultValue?: string;              // Resultado textual

  @IsNumber()
  @IsOptional()
  resultNumeric?: number;            // Resultado numérico

  @IsString()
  @IsOptional()
  referenceRange?: string;           // Rango normal (ej: 4.0-10.0)

  @IsBoolean()
  @IsOptional()
  isAbnormal?: boolean;              // ¿Valor anormal?

  @IsBoolean()
  @IsOptional()
  isCritical?: boolean;              // ¿Valor crítico?

  @IsString()
  @IsOptional()
  observations?: string;             // Notas del laboratorista

  @IsString()
  @IsOptional()
  testedBy?: string;                 // Quién realizó la prueba

  @IsDateString()
  @IsOptional()
  testedAt?: Date;                   // Cuándo se realizó
}
```

**Ejemplo**:
```json
{
  "orderTestId": 42,
  "resultValue": "8.5",
  "resultNumeric": 8.5,
  "referenceRange": "4.0-10.0",
  "isAbnormal": false,
  "testedBy": "Lab Technician José",
  "testedAt": "2025-10-22T14:30:00Z"
}
```

---

#### 2. **UpdateTestResultDto** - Actualizar Resultado

**Ruta**: `src/dto/update-test-result.dto.ts`

```typescript
export class UpdateTestResultDto {
  @IsString()
  @IsOptional()
  resultValue?: string;

  @IsNumber()
  @IsOptional()
  resultNumeric?: number;

  @IsString()
  @IsOptional()
  referenceRange?: string;

  @IsBoolean()
  @IsOptional()
  isAbnormal?: boolean;

  @IsBoolean()
  @IsOptional()
  isCritical?: boolean;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  validatedBy?: string;              // Quien valida el resultado

  @IsDateString()
  @IsOptional()
  validatedAt?: Date;                // Cuándo se validó
}
```

---

## 🔌 Endpoints - Laboratory Orders

**Base URL**: `/laboratory-orders`

### 1. **POST /laboratory-orders** - Crear Nueva Orden

**Descripción**: Crea una nueva orden de laboratorio para un paciente

**Autorización**: Requerida (en futuro)

**Body**:
```typescript
CreateLaboratoryOrderDto
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "orderNumber": "ORD-2025-000001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "clinicalIndication": "Evaluación completa de sangre",
  "status": "PENDING",
  "priority": "HIGH",
  "orderDate": "2025-10-22T14:30:00Z",
  "completedAt": null,
  "tests": []
}
```

**Errores**:
- `404`: Paciente no encontrado
- `400`: Validación de datos fallida

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3000/laboratory-orders \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440001",
    "clinicalIndication": "Chequeo general",
    "priority": "NORMAL"
  }'
```

---

### 2. **GET /laboratory-orders** - Listar Órdenes

**Descripción**: Obtiene lista paginada de órdenes

**Query Parameters**:
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 10 | Registros por página |
| `status` | OrderStatus | - | Filtrar por estado |
| `priority` | OrderPriority | - | Filtrar por prioridad |
| `search` | string | - | Buscar por orden número, paciente o doctor |

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-000001",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "PENDING",
      "priority": "HIGH",
      "orderDate": "2025-10-22T14:30:00Z",
      "tests": []
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Ejemplo cURL**:
```bash
curl "http://localhost:3000/laboratory-orders?page=1&limit=10&status=PENDING"
```

---

### 3. **GET /laboratory-orders/:id** - Obtener Orden por ID

**Descripción**: Obtiene los detalles de una orden específica

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "orderNumber": "ORD-2025-000001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "clinicalIndication": "Evaluación completa de sangre",
  "notes": "Paciente en ayunas",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "orderDate": "2025-10-22T14:30:00Z",
  "updatedAt": "2025-10-22T15:00:00Z",
  "completedAt": null,
  "tests": [
    {
      "id": 1,
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "testDefinitionId": 5,
      "sampleNumber": "S-2025-550e8400-001",
      "status": "COMPLETED",
      "sampleCollectedAt": "2025-10-22T14:35:00Z",
      "collectedBy": "Technician Juan"
    }
  ]
}
```

**Errores**:
- `404`: Orden no encontrada

**Ejemplo cURL**:
```bash
curl http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010
```

---

### 4. **GET /laboratory-orders/number/:orderNumber** - Obtener por Número

**Descripción**: Busca orden por su número identificable

**Response**: Mismo que GET /:id

**Ejemplo cURL**:
```bash
curl http://localhost:3000/laboratory-orders/number/ORD-2025-000001
```

---

### 5. **PATCH /laboratory-orders/:id** - Actualizar Orden

**Descripción**: Actualiza detalles de una orden

**Body**:
```typescript
UpdateLaboratoryOrderDto
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "orderNumber": "ORD-2025-000001",
  "status": "ON_HOLD",
  "priority": "STAT",
  "notes": "Paciente reporta mareos",
  "updatedAt": "2025-10-22T15:10:00Z"
}
```

**Ejemplo cURL**:
```bash
curl -X PATCH http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010 \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "STAT",
    "notes": "Paciente reporta mareos"
  }'
```

---

### 6. **PATCH /laboratory-orders/:id/status** - Cambiar Estado

**Descripción**: Actualiza el estado de una orden

**Query Parameters**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | OrderStatus | Nuevo estado |

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "status": "COMPLETED",
  "completedAt": "2025-10-22T16:00:00Z"
}
```

**Ejemplo cURL**:
```bash
curl -X PATCH "http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010/status?status=COMPLETED"
```

---

### 7. **POST /laboratory-orders/:id/add-tests** - Agregar Pruebas

**Descripción**: Agrega pruebas individuales o perfiles de pruebas a una orden

**Body**:
```typescript
AddTestsToOrderDto
```

**Response** (201 Created):
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440010",
  "totalTestsAdded": 5,
  "tests": [
    {
      "id": 1,
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "testDefinitionId": 12,
      "sampleNumber": "S-2025-550e8400-001",
      "status": "PENDING",
      "collectedBy": "Tech Juan",
      "sampleCollectedAt": null,
      "createdAt": "2025-10-22T14:30:00Z"
    },
    {
      "id": 2,
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "testDefinitionId": 13,
      "sampleNumber": "S-2025-550e8400-002",
      "status": "PENDING",
      "collectedBy": "Tech Juan",
      "sampleCollectedAt": null,
      "createdAt": "2025-10-22T14:30:00Z"
    }
  ],
  "message": "5 pruebas agregadas exitosamente"
}
```

**Características**:
- Soporta pruebas individuales (TestDefinitions)
- Soporta perfiles de pruebas (TestProfiles - se expanden automáticamente)
- Genera automáticamente números de muestra únicos
- Permite personalizar prefijo de muestra
- Registra técnico que toma la muestra

**Ejemplo - Agregar Pruebas Individuales**:
```bash
curl -X POST http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010/add-tests \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [
      {"testDefinitionId": "550e8400-e29b-41d4-a716-446655440002"},
      {"testDefinitionId": "550e8400-e29b-41d4-a716-446655440003", "quantity": 2}
    ],
    "collectedBy": "Tech Juan"
  }'
```

**Ejemplo - Agregar Perfil**:
```bash
curl -X POST http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010/add-tests \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [
      {"testProfileId": "550e8400-e29b-41d4-a716-446655440100"}
    ],
    "sampleNumberBase": "HEM",
    "collectedBy": "Tech María"
  }'
```

**Errores**:
- `404`: Orden no encontrada
- `400`: Validación de datos fallida
- `404`: TestProfile no encontrado

---

### 8. **GET /laboratory-orders/patient/:patientId** - Órdenes por Paciente

**Descripción**: Obtiene todas las órdenes de un paciente

**Query Parameters**:
| Parámetro | Tipo | Default |
|-----------|------|---------|
| `page` | number | 1 |
| `limit` | number | 10 |
| `status` | OrderStatus | - |

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-000001",
      "status": "COMPLETED",
      "priority": "HIGH",
      "orderDate": "2025-10-22T14:30:00Z",
      "completedAt": "2025-10-22T16:00:00Z",
      "tests": [
        {
          "id": 1,
          "testDefinitionId": 5,
          "status": "COMPLETED"
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Ejemplo cURL**:
```bash
curl "http://localhost:3000/laboratory-orders/patient/550e8400-e29b-41d4-a716-446655440000?page=1&status=COMPLETED"
```

---

### 9. **GET /laboratory-orders/statistics** - Estadísticas

**Descripción**: Obtiene estadísticas de órdenes

**Response** (200 OK):
```json
{
  "total": 150,
  "byStatus": [
    { "status": "PENDING", "count": 25 },
    { "status": "IN_PROGRESS", "count": 50 },
    { "status": "COMPLETED", "count": 70 },
    { "status": "CANCELLED", "count": 5 }
  ],
  "byPriority": [
    { "priority": "LOW", "count": 30 },
    { "priority": "NORMAL", "count": 100 },
    { "priority": "HIGH", "count": 15 },
    { "priority": "STAT", "count": 5 }
  ],
  "byDate": [
    { "date": "2025-10-16", "count": 10 },
    { "date": "2025-10-17", "count": 15 },
    { "date": "2025-10-22", "count": 20 }
  ]
}
```

**Ejemplo cURL**:
```bash
curl http://localhost:3000/laboratory-orders/statistics
```

---

### 10. **DELETE /laboratory-orders/:id** - Eliminar Orden

**Descripción**: Elimina una orden (generalmente solo PENDING)

**Response** (200 OK):
```
Orden eliminada exitosamente
```

**Ejemplo cURL**:
```bash
curl -X DELETE http://localhost:3000/laboratory-orders/550e8400-e29b-41d4-a716-446655440010
```

---

## 🔌 Endpoints - Test Results

**Base URL**: `/test-results`

### 1. **POST /test-results** - Crear Resultado

**Descripción**: Registra el resultado de una prueba

**Body**:
```typescript
CreateTestResultDto
```

**Response** (201 Created):
```json
{
  "id": 1,
  "orderTestId": 42,
  "resultValue": "8.5",
  "resultNumeric": 8.5,
  "referenceRange": "4.0-10.0",
  "sampleNumber": "S-2025-550e8400-001",
  "isAbnormal": false,
  "isCritical": false,
  "observations": "Valor dentro del rango normal",
  "testedBy": "Lab Technician José",
  "testedAt": "2025-10-22T14:30:00Z",
  "validatedBy": null,
  "validatedAt": null,
  "createdAt": "2025-10-22T14:35:00Z"
}
```

**Errores**:
- `404`: OrderTest no encontrada
- `400`: Validación de datos fallida
- `409`: Resultado ya existe para esta prueba

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3000/test-results \
  -H "Content-Type: application/json" \
  -d '{
    "orderTestId": 42,
    "resultValue": "8.5",
    "resultNumeric": 8.5,
    "referenceRange": "4.0-10.0",
    "isAbnormal": false,
    "testedBy": "Lab Tech José",
    "testedAt": "2025-10-22T14:30:00Z"
  }'
```

---

### 2. **GET /test-results** - Listar Resultados

**Descripción**: Obtiene lista paginada de resultados

**Query Parameters**:
| Parámetro | Tipo | Default |
|-----------|------|---------|
| `page` | number | 1 |
| `limit` | number | 10 |
| `isAbnormal` | boolean | - |
| `isCritical` | boolean | - |

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "orderTestId": 42,
      "resultNumeric": 8.5,
      "isAbnormal": false,
      "isCritical": false,
      "testedBy": "Lab Tech José"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

**Ejemplo cURL**:
```bash
curl "http://localhost:3000/test-results?page=1&isCritical=false"
```

---

### 3. **GET /test-results/:id** - Obtener Resultado

**Descripción**: Obtiene un resultado específico

**Response** (200 OK):
```json
{
  "id": 1,
  "orderTestId": 42,
  "resultValue": "8.5",
  "resultNumeric": 8.5,
  "referenceRange": "4.0-10.0",
  "sampleNumber": "S-2025-550e8400-001",
  "isAbnormal": false,
  "isCritical": false,
  "observations": "Valor dentro del rango normal",
  "testedBy": "Lab Technician José",
  "testedAt": "2025-10-22T14:30:00Z",
  "validatedBy": "Dr. María García",
  "validatedAt": "2025-10-22T15:30:00Z",
  "createdAt": "2025-10-22T14:35:00Z",
  "updatedAt": "2025-10-22T15:35:00Z"
}
```

**Errores**:
- `404`: Resultado no encontrado

**Ejemplo cURL**:
```bash
curl http://localhost:3000/test-results/1
```

---

### 4. **PATCH /test-results/:id** - Actualizar Resultado

**Descripción**: Actualiza un resultado (típicamente para validación)

**Body**:
```typescript
UpdateTestResultDto
```

**Response** (200 OK):
```json
{
  "id": 1,
  "orderTestId": 42,
  "resultNumeric": 8.5,
  "isAbnormal": false,
  "isCritical": false,
  "validatedBy": "Dr. María García",
  "validatedAt": "2025-10-22T15:30:00Z",
  "updatedAt": "2025-10-22T15:35:00Z"
}
```

**Ejemplo - Validar Resultado**:
```bash
curl -X PATCH http://localhost:3000/test-results/1 \
  -H "Content-Type: application/json" \
  -d '{
    "validatedBy": "Dr. María García",
    "validatedAt": "2025-10-22T15:30:00Z"
  }'
```

**Ejemplo - Marcar como Crítico**:
```bash
curl -X PATCH http://localhost:3000/test-results/1 \
  -H "Content-Type: application/json" \
  -d '{
    "isCritical": true,
    "observations": "Valor crítico - requiere atención inmediata"
  }'
```

---

### 5. **GET /test-results/patient/:patientId** - Resultados por Paciente

**Descripción**: Obtiene todos los resultados de un paciente

**Query Parameters**:
| Parámetro | Tipo | Default |
|-----------|------|---------|
| `page` | number | 1 |
| `limit` | number | 10 |
| `isCritical` | boolean | - |

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "orderTestId": 42,
      "sampleNumber": "S-2025-550e8400-001",
      "resultNumeric": 8.5,
      "isAbnormal": false,
      "isCritical": false,
      "testedAt": "2025-10-22T14:30:00Z",
      "validatedAt": "2025-10-22T15:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

**Ejemplo cURL**:
```bash
curl "http://localhost:3000/test-results/patient/550e8400-e29b-41d4-a716-446655440000?page=1"
```

---

### 6. **DELETE /test-results/:id** - Eliminar Resultado

**Descripción**: Elimina un resultado (sin validar generalmente)

**Response** (200 OK):
```
Resultado eliminado exitosamente
```

**Ejemplo cURL**:
```bash
curl -X DELETE http://localhost:3000/test-results/1
```

---

## 📊 Flujo Completo (Workflow)

### Scenario: Paciente solicitando exámenes de sangre

```
1. CREAR ORDEN
   ├─ POST /laboratory-orders
   └─ Respuesta: Order { id, status: PENDING, tests: [] }

2. AGREGAR PRUEBAS
   ├─ POST /laboratory-orders/:id/add-tests
   ├─ Body: { tests: [...], collectedBy: "Tech Juan" }
   └─ Respuesta: { totalTestsAdded: 5, tests: [...] }
     └─ Se generan sampleNumbers automáticamente

3. ACTUALIZAR ESTADO A IN_PROGRESS
   ├─ PATCH /laboratory-orders/:id/status?status=IN_PROGRESS
   └─ Respuesta: Order { status: IN_PROGRESS }

4. PROCESAR EN EQUIPO
   └─ Sistema interno procesa las muestras

5. REGISTRAR RESULTADOS
   ├─ POST /test-results (para cada prueba)
   ├─ Body: { orderTestId: 1, resultNumeric: 8.5, testedBy: "Lab Tech" }
   └─ Respuesta: TestResult { id, resultNumeric, isAbnormal, isCritical }

6. VALIDAR RESULTADOS (Médico/Supervisor)
   ├─ PATCH /test-results/:id
   ├─ Body: { validatedBy: "Dr. García", validatedAt: "...", isCritical: false }
   └─ Respuesta: TestResult { validatedBy, validatedAt }

7. MARCAR ORDEN COMO COMPLETADA
   ├─ PATCH /laboratory-orders/:id/status?status=COMPLETED
   └─ Respuesta: Order { status: COMPLETED, completedAt: "..." }

8. RECUPERAR RESULTADOS COMPLETOS
   ├─ GET /test-results/patient/:patientId
   └─ Respuesta: Array de todos los resultados del paciente
```

### Diagram de Estados

```
LaboratoryOrder:
PENDING ──→ IN_PROGRESS ──→ COMPLETED
  ↓              ↓              ↓
  └─→ ON_HOLD ───┘              │
  └─→ CANCELLED ─────────────────┘

OrderTest:
PENDING ──→ IN_PROGRESS ──→ COMPLETED
  ├─→ FAILED ──→ RETESTING ──→ COMPLETED
  └─→ CANCELLED (if order cancelled)

TestResult:
Created ──→ Reviewed ──→ Validated
            (Update)      (Final)
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Orden Completa de Análisis de Sangre

```bash
#!/bin/bash

# 1. Crear orden
ORDER_ID=$(curl -s -X POST http://localhost:3000/laboratory-orders \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440001",
    "clinicalIndication": "Análisis completo de sangre",
    "priority": "NORMAL"
  }' | jq -r '.id')

echo "Orden creada: $ORDER_ID"

# 2. Agregar pruebas (perfil hematológico)
curl -s -X POST "http://localhost:3000/laboratory-orders/$ORDER_ID/add-tests" \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [
      {"testProfileId": "550e8400-e29b-41d4-a716-446655440100"}
    ],
    "collectedBy": "Tech Juan Pérez"
  }' | jq '.'

# 3. Cambiar estado a IN_PROGRESS
curl -s -X PATCH "http://localhost:3000/laboratory-orders/$ORDER_ID/status?status=IN_PROGRESS" | jq '.'

# 4. Simular resultados (después del procesamiento en equipo)
# Obtener el ID del primer OrderTest
ORDER_TEST_ID=1

# Registrar resultado
RESULT_ID=$(curl -s -X POST http://localhost:3000/test-results \
  -H "Content-Type: application/json" \
  -d "{
    \"orderTestId\": $ORDER_TEST_ID,
    \"resultNumeric\": 8.5,
    \"referenceRange\": \"4.0-10.0\",
    \"isAbnormal\": false,
    \"testedBy\": \"Lab Tech María\"
  }" | jq -r '.id')

echo "Resultado registrado: $RESULT_ID"

# 5. Validar resultado
curl -s -X PATCH "http://localhost:3000/test-results/$RESULT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "validatedBy": "Dr. García",
    "validatedAt": "'$(date -Iseconds)'"
  }' | jq '.'

# 6. Marcar orden como completada
curl -s -X PATCH "http://localhost:3000/laboratory-orders/$ORDER_ID/status?status=COMPLETED" | jq '.'

# 7. Obtener resumen
echo "\n=== RESUMEN FINAL ==="
curl -s "http://localhost:3000/laboratory-orders/$ORDER_ID" | jq '.'
curl -s "http://localhost:3000/test-results/patient/550e8400-e29b-41d4-a716-446655440000" | jq '.'
```

---

### Ejemplo 2: Manejo de Resultado Crítico

```bash
# Registrar resultado crítico
RESULT_ID=$(curl -s -X POST http://localhost:3000/test-results \
  -H "Content-Type: application/json" \
  -d '{
    "orderTestId": 5,
    "resultNumeric": 250,
    "referenceRange": "70-100",
    "isAbnormal": true,
    "isCritical": true,
    "observations": "Glucosa crítica - contactar al paciente inmediatamente",
    "testedBy": "Lab Tech"
  }' | jq -r '.id')

# Validación inmediata por supervisor
curl -s -X PATCH "http://localhost:3000/test-results/$RESULT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "validatedBy": "Dr. García",
    "observations": "Confirmado crítico - paciente contactado",
    "validatedAt": "'$(date -Iseconds)'"
  }' | jq '.'
```

---

### Ejemplo 3: Múltiples Pruebas con Cantidades

```bash
curl -X POST "http://localhost:3000/laboratory-orders/550e8400-..../add-tests" \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [
      {
        "testDefinitionId": "550e8400-e29b-41d4-a716-446655440050",
        "quantity": 1
      },
      {
        "testDefinitionId": "550e8400-e29b-41d4-a716-446655440051",
        "quantity": 2
      },
      {
        "testProfileId": "550e8400-e29b-41d4-a716-446655440100"
      }
    ],
    "sampleNumberBase": "LAB-2025",
    "collectedBy": "Tech Supervisor Carlos"
  }'
```

**Resultado**:
- 1 prueba individual (TEST-050)
- 2 repeticiones de prueba individual (TEST-051)
- 5 pruebas de perfil (si el perfil tiene 5 pruebas)
- **Total: 8 OrderTest creados**
- Números de muestra: LAB-2025-001 a LAB-2025-008

---

## 🔗 Relaciones de Datos

```
Patient (1) ──→ (N) LaboratoryOrder
  │
  └─→ (N) TestResult (a través de OrderTest)

LaboratoryOrder (1) ──→ (N) OrderTest
  │
  ├─→ Doctor (1)
  ├─→ TestSection (referencia)
  └─→ OrderTest (1) ──→ (1) TestResult

OrderTest:
  ├─→ LaboratoryOrder (N)
  ├─→ TestDefinition (N)
  └─→ TestResult (1)

TestDefinition (1) ──→ (N) OrderTest
  │
  └─→ TestSection (N)

TestProfile (1) ──→ (N) TestDefinition
  │
  └─→ TestSection (N)

TestResult (1) ──→ (1) OrderTest
```

---

## 🛡️ Validaciones y Reglas de Negocio

### Laboratory Orders

1. **Creación**:
   - Paciente debe existir
   - Doctor (si se especifica) debe existir
   - clinicalIndication es texto descriptivo

2. **Agregar Pruebas**:
   - Orden debe existir
   - Al menos un testDefinitionId o testProfileId requerido
   - Las pruebas individuales y perfiles pueden combinarse
   - Quantity mínimo 1

3. **Cambio de Estado**:
   - PENDING → cualquier estado
   - IN_PROGRESS → COMPLETED, ON_HOLD, CANCELLED
   - COMPLETED → no cambia (solo lectura)
   - CANCELLED → no cambia (final)

### Test Results

1. **Creación**:
   - OrderTest debe existir
   - Solo un resultado por OrderTest
   - resultValue O resultNumeric (al menos uno)

2. **Validación**:
   - isAbnormal indica fuera de rango
   - isCritical requiere validatedBy inmediato
   - Observaciones obligatorias si isCritical

3. **Auditoría**:
   - testedBy: Técnico que ejecuta
   - validatedBy: Profesional que valida
   - Ambos registran timestamps

---

## 📚 Referencias

- **NestJS Documentation**: https://docs.nestjs.com
- **TypeORM Documentation**: https://typeorm.io
- **API RESTful Standards**: https://restfulapi.net
- **Lab Standards**: https://www.clsi.org (Clinical and Laboratory Standards Institute)

---

**Última actualización**: 23 de Octubre, 2025  
**Versión**: 1.0  
**Autor**: Lab Integration Backend Team
