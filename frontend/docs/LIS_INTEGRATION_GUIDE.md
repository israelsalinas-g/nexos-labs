# Guía de Integración LIS - Frontend

## Resumen de Implementación

Este documento describe todos los archivos generados para la integración del sistema LIS en el frontend Angular.

## Archivos Generados

### 1. Modelos e Interfaces (src/app/models/)

#### exam-category.interface.ts
- `ExamCategory`: Interfaz principal para categorías de exámenes
- `CreateExamCategoryDto`: DTO para crear categorías
- `UpdateExamCategoryDto`: DTO para actualizar categorías

#### laboratory-order.interface.ts
- `LaboratoryOrder`: Interfaz principal para órdenes de laboratorio
- `CreateLaboratoryOrderDto`: DTO para crear órdenes
- `UpdateLaboratoryOrderDto`: DTO para actualizar órdenes
- `OrderStatus`: Tipo para estados de órdenes
- `OrderPriority`: Tipo para prioridades de órdenes

#### test-definition.interface.ts
- `TestDefinition`: Interfaz principal para definiciones de pruebas
- `CreateTestDefinitionDto`: DTO para crear definiciones
- `UpdateTestDefinitionDto`: DTO para actualizar definiciones
- `ReferenceRange`: Interfaz para rangos de referencia
- `Gender`: Tipo para género

#### test-profile.interface.ts
- `TestProfile`: Interfaz principal para perfiles de pruebas
- `CreateTestProfileDto`: DTO para crear perfiles
- `UpdateTestProfileDto`: DTO para actualizar perfiles

#### test-result.interface.ts
- `TestResult`: Interfaz principal para resultados de pruebas
- `CreateTestResultDto`: DTO para crear resultados
- `UpdateTestResultDto`: DTO para actualizar resultados
- `TestResultStatus`: Tipo para estados de resultados

#### paginated-response.interface.ts (actualizado)
- `PaginatedResponse<T>`: Interfaz genérica para respuestas paginadas
- `PaginationQuery`: Interfaz para parámetros de paginación
- `ErrorResponse`: Interfaz para respuestas de error

### 2. Enums (src/app/enums/)

#### laboratory-order.enums.ts
```typescript
export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat'
}
```

#### test-result.enums.ts
```typescript
export enum TestResultStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified'
}
```

### 3. Servicios (src/app/services/)

#### exam-category.service.ts
Métodos disponibles:
- `getExamCategories(query?: PaginationQuery)`: Listar categorías con paginación
- `getExamCategoryById(id: string)`: Obtener categoría por ID
- `createExamCategory(category: CreateExamCategoryDto)`: Crear nueva categoría
- `updateExamCategory(id: string, category: UpdateExamCategoryDto)`: Actualizar categoría
- `deleteExamCategory(id: string)`: Eliminar categoría (soft delete)
- `getActiveExamCategories()`: Obtener categorías activas

#### laboratory-order.service.ts
Métodos disponibles:
- `getLaboratoryOrders(filters?: LaboratoryOrderFilters)`: Listar órdenes con filtros
- `getLaboratoryOrderById(id: string)`: Obtener orden por ID
- `createLaboratoryOrder(order: CreateLaboratoryOrderDto)`: Crear nueva orden
- `updateLaboratoryOrder(id: string, order: UpdateLaboratoryOrderDto)`: Actualizar orden
- `cancelLaboratoryOrder(id: string)`: Cancelar orden
- `updateOrderStatus(id: string, status: OrderStatus)`: Actualizar estado
- `getOrdersByPatient(patientId: string)`: Órdenes por paciente
- `getPendingOrders()`: Obtener órdenes pendientes

#### test-definition.service.ts
Métodos disponibles:
- `getTestDefinitions(filters?: TestDefinitionFilters)`: Listar definiciones con filtros
- `getTestDefinitionById(id: string)`: Obtener definición por ID
- `getTestDefinitionByCode(code: string)`: Obtener por código
- `createTestDefinition(definition: CreateTestDefinitionDto)`: Crear definición
- `updateTestDefinition(id: string, definition: UpdateTestDefinitionDto)`: Actualizar
- `deleteTestDefinition(id: string)`: Eliminar (soft delete)
- `getActiveTestDefinitions()`: Obtener definiciones activas
- `getTestDefinitionsByCategory(categoryId: string)`: Definiciones por categoría

#### test-profile.service.ts
Métodos disponibles:
- `getTestProfiles(filters?: TestProfileFilters)`: Listar perfiles con filtros
- `getTestProfileById(id: string)`: Obtener perfil por ID
- `getTestProfileByCode(code: string)`: Obtener por código
- `createTestProfile(profile: CreateTestProfileDto)`: Crear perfil
- `updateTestProfile(id: string, profile: UpdateTestProfileDto)`: Actualizar perfil
- `deleteTestProfile(id: string)`: Eliminar (soft delete)
- `getActiveTestProfiles()`: Obtener perfiles activos

#### test-result.service.ts
Métodos disponibles:
- `getTestResults(filters?: TestResultFilters)`: Listar resultados con filtros
- `getTestResultById(id: string)`: Obtener resultado por ID
- `createTestResult(result: CreateTestResultDto)`: Crear resultado
- `updateTestResult(id: string, result: UpdateTestResultDto)`: Actualizar resultado
- `deleteTestResult(id: string)`: Eliminar resultado
- `updateResultStatus(id: string, status: TestResultStatus)`: Actualizar estado
- `getResultsByOrder(orderId: string)`: Resultados por orden
- `verifyTestResult(id: string, verifiedBy: string)`: Verificar resultado
- `getPendingResults()`: Obtener resultados pendientes
- `getAbnormalResults()`: Obtener resultados anormales

### 4. Componentes (src/app/components/)

#### exam-categories/exam-category-list.component.ts
Componente standalone para listar categorías de exámenes con:
- Paginación
- Búsqueda
- Acciones CRUD básicas
- Estado activo/inactivo

## Ejemplos de Uso

### 1. Usar el servicio de categorías en un componente

```typescript
import { Component, OnInit } from '@angular/core';
import { ExamCategoryService } from '../../services/exam-category.service';
import { ExamCategory } from '../../models/exam-category.interface';

@Component({
  selector: 'app-my-component',
  template: `...`
})
export class MyComponent implements OnInit {
  categories: ExamCategory[] = [];

  constructor(private categoryService: ExamCategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getExamCategories({ page: 1, limit: 10 })
      .subscribe({
        next: (response) => {
          this.categories = response.data;
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
  }
}
```

### 2. Crear una nueva orden de laboratorio

```typescript
import { LaboratoryOrderService } from '../../services/laboratory-order.service';
import { CreateLaboratoryOrderDto } from '../../models/laboratory-order.interface';

// En tu componente
createOrder(): void {
  const newOrder: CreateLaboratoryOrderDto = {
    patientId: 'patient-id-123',
    orderNumber: 'ORD-2024-001',
    priority: 'routine',
    requestedBy: 'Dr. Smith',
    requestDate: new Date(),
    testProfileIds: ['profile-1', 'profile-2'],
    testDefinitionIds: ['test-1', 'test-2']
  };

  this.orderService.createLaboratoryOrder(newOrder)
    .subscribe({
      next: (order) => {
        console.log('Orden creada:', order);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
}
```

### 3. Filtrar resultados de pruebas

```typescript
import { TestResultService } from '../../services/test-result.service';

// Obtener resultados por orden
this.resultService.getResultsByOrder('order-id-123')
  .subscribe({
    next: (results) => {
      console.log('Resultados:', results);
    }
  });

// Obtener resultados anormales
this.resultService.getAbnormalResults()
  .subscribe({
    next: (abnormalResults) => {
      console.log('Resultados anormales:', abnormalResults);
    }
  });
```

## Configuración de Rutas

Para usar los componentes en tu aplicación, añade las rutas correspondientes en `app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { ExamCategoryListComponent } from './components/exam-categories/exam-category-list.component';

export const routes: Routes = [
  { path: 'exam-categories', component: ExamCategoryListComponent },
  // Añadir más rutas según necesites
];
```

## Próximos Pasos

### Componentes Pendientes por Crear

1. **Componentes de Lista:**
   - `laboratory-order-list.component.ts`
   - `test-definition-list.component.ts`
   - `test-profile-list.component.ts`
   - `test-result-list.component.ts`

2. **Componentes de Formulario:**
   - `exam-category-form.component.ts`
   - `laboratory-order-form.component.ts`
   - `test-definition-form.component.ts`
   - `test-profile-form.component.ts`
   - `test-result-form.component.ts`

3. **Componentes de Detalle:**
   - `laboratory-order-detail.component.ts`
   - `test-result-detail.component.ts`

### Funcionalidades Adicionales Recomendadas

1. **Validaciones:**
   - Implementar validaciones de formularios con Angular Reactive Forms
   - Validar rangos de referencia en test-definitions
   - Validar transiciones de estados

2. **Manejo de Estados:**
   - Implementar guards para proteger rutas
   - Implementar resolvers para pre-cargar datos
   - Considerar usar un estado global (NgRx, Akita, etc.)

3. **UI/UX:**
   - Añadir modales para crear/editar
   - Implementar notificaciones toast
   - Añadir confirmaciones antes de eliminar
   - Implementar drag & drop para ordenar elementos

4. **Reportes:**
   - Componente para generar reportes de resultados
   - Exportar datos a PDF/Excel
   - Gráficos y estadísticas

## Notas Importantes

1. **URL Base del API**: Todos los servicios están configurados para usar `http://localhost:3000/api/`. Actualiza esta URL según tu entorno.

2. **CORS**: Los servicios incluyen headers CORS. Asegúrate de que tu backend esté configurado correctamente para aceptar estas peticiones.

3. **Manejo de Errores**: Todos los servicios incluyen manejo básico de errores. Considera implementar un interceptor global para manejar errores de manera centralizada.

4. **Autenticación**: Los servicios no incluyen tokens de autenticación. Añade un interceptor HTTP si necesitas incluir tokens JWT u otros mecanismos de autenticación.

5. **Validaciones Backend**: Recuerda que las validaciones descritas en la guía original deben implementarse también en el backend.

## Estructura de Carpetas Recomendada

```
src/app/
├── models/           # Interfaces y tipos
├── enums/            # Enumeraciones
├── services/         # Servicios HTTP
├── components/       # Componentes
│   ├── exam-categories/
│   ├── laboratory-orders/
│   ├── test-definitions/
│   ├── test-profiles/
│   └── test-results/
├── shared/           # Componentes compartidos
└── guards/           # Route guards
```

## Soporte y Mantenimiento

Para cualquier duda o mejora:
1. Revisa la documentación del backend
2. Verifica que las interfaces coincidan con los DTOs del backend
3. Prueba los endpoints con herramientas como Postman antes de integrar
4. Mantén los tipos TypeScript estrictos para detectar errores en tiempo de compilación
