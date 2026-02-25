# NEXOS Labs Backend

API REST desarrollada con NestJS para funcionar como servidor LIS (Laboratory Information System) que recibe resultados de exámenes del equipo de laboratorio clínico **Dymind DH36**.

## Características

- 🔬 **Servidor LIS TCP**: Recibe datos del equipo Dymind DH36 por puerto 5600
- 🗄️ **Base de datos PostgreSQL**: Almacenamiento persistente con TypeORM
- 📚 **API REST**: Endpoints completos para gestionar resultados
- 📖 **Documentación Swagger**: Interfaz interactiva para la API
- ✅ **Validación de datos**: Validación automática con class-validator
- 🔄 **Procesamiento automático**: Parser para datos del equipo Dymind DH36

## Tecnologías

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Swagger** - Documentación de API
- **Class Validator** - Validación de datos

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno en `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=lis_dymind

# Application Configuration
PORT=3000
NODE_ENV=development

# LIS Server Configuration
LIS_PORT=5600
```

4. Crear la base de datos PostgreSQL:
```sql
CREATE DATABASE nexos_labs_db;
```

## Uso

### Desarrollo

**Opción 1: Script de Windows (Recomendado)**
```cmd
start-dev.bat
```

**Opción 2: NPM (si PowerShell está habilitado)**
```bash
npm run start:dev
```

**Opción 3: Comando directo**
```cmd
node_modules\.bin\nest.cmd start --watch
```

### Producción
```bash
npm run build
npm run start:prod
```

### Prueba del Servidor TCP
Para probar la conexión TCP del servidor LIS:
```cmd
node test-server.js
```

## Endpoints de la API

### Resultados de Laboratorio

- `GET /lab-results` - Obtener todos los resultados
- `GET /lab-results/:id` - Obtener resultado por ID
- `GET /lab-results/sample/:sampleNumber` - Obtener por número de muestra
- `GET /lab-results/patient/:patientId` - Obtener por ID de paciente
- `GET /lab-results/date-range` - Obtener por rango de fechas
- `GET /lab-results/statistics` - Obtener estadísticas
- `POST /lab-results` - Crear nuevo resultado
- `POST /lab-results/process-raw` - Procesar datos raw del equipo

### Exámenes Coprológicos (Stool Tests)

#### Endpoints

- `GET /stool-tests` - Listar exámenes coprológicos (paginado)
- `GET /stool-tests/:id` - Obtener examen por ID
- `GET /stool-tests/patient/:patientId` - Obtener exámenes por paciente
- `GET /stool-tests/statistics` - Obtener estadísticas
- `GET /stool-tests/pending-review` - Obtener exámenes pendientes
- `GET /stool-tests/:id/medical-report` - Generar reporte médico
- `POST /stool-tests` - Crear nuevo examen
- `PATCH /stool-tests/:id` - Actualizar examen
- `PATCH /stool-tests/:id/complete` - Marcar examen como completado
- `DELETE /stool-tests/:id` - Eliminar examen

#### Estructura de Datos

##### Enums
- **StoolColor**: `AMARILLO`, `NEGRO`, `BLANCO`, `CAFE`, `VERDE`, `ROJO`
- **StoolConsistency**: `BLANDA`, `FORMADA`, `PASTOSA`, `LIQUIDA`, `DIARREICA`
- **StoolShape**: `ESCASO`, `MODERADO`, `ABUNDANTE`
- **ParasiteType**: Incluye `ASCARIS_LUMBRICOIDES`, `ENTEROBIUS_VERMICULARIS`, etc.
- **ProtozooType**: Incluye `BLASTOCYSTIS_HOMINIS`, `ENTAMOEBA_COLI`, etc.

##### DTOs
- **CreateStoolTestDto**: 
  - `patientId`: string
  - `color`: StoolColor
  - `consistency`: StoolConsistency
  - `shape`: StoolShape
  - `mucus`: EscasaModeradaAbundanteAusenteQuantity
  - `parasites`: ParasiteResult[]
  - `protozoos`: ProtozooResult[]
  - Otros campos opcionales...

##### Entidad (stool_tests)
- `id`: number (PK)
- `patientId`: string (FK)
- `sampleNumber`: string
- `color`: StoolColor
- `consistency`: StoolConsistency
- `shape`: StoolShape
- `mucus`: EscasaModeradaAbundanteAusenteQuantity
- `parasites`: ParasiteResult[]
- `protozoos`: ProtozooResult[]
- `status`: string
- `testDate`: Date
- `observations`: string
- Campos de auditoría...

### Exámenes de Orina (Urine Tests)

#### Endpoints

- `GET /urine-tests` - Listar exámenes de orina (paginado)
- `GET /urine-tests/:id` - Obtener examen por ID
- `GET /urine-tests/patient/:patientId` - Obtener exámenes por paciente
- `GET /urine-tests/statistics` - Obtener estadísticas
- `GET /urine-tests/pending-review` - Obtener exámenes pendientes
- `POST /urine-tests` - Crear nuevo examen
- `PATCH /urine-tests/:id` - Actualizar examen
- `DELETE /urine-tests/:id` - Eliminar examen

#### Estructura de Datos

##### Enums
- **UrineColor**: `AMARILLO`, `AMBAR`, `CAFE`, `ROJIZO`, `ROJO`, `NARANJA`
- **UrineAspect**: `TRANSPARENTE`, `LIGERAMENTE_TURBIO`, `TURBIO`
- **UrineDensity**: `1.000`, `1.005`, `1.010`, `1.015`, `1.020`, `1.025`, `1.030`
- **UrinePH**: `5.0`, `6.0`, `6.5`, `7.0`, `8.0`, `9.0`
- **CrystalType**: 
  - `URATOS_AMORFOS` = "URATOS AMORFOS"
  - `ACIDO_URICO` = "ACIDO URICO"
  - `OXALATOS_CALCIO_MONOHIDRATADO` = "OXALATOS DE CALCIO, MONOHIDRATADO"
  - `OXALATOS_CALCIO_DIHIDRATADO` = "OXALATOS DE CALCIO, DIHIDRATADO"
  - `CISTINA` = "CISTINA"
  - `COLESTEROL` = "COLESTEROL"
  - `TIROSINA` = "TIROSINA"
  - `ACIDO_HIPURICO` = "ACIDO HIPURICO"
  - `URATO_SODIO` = "URATO DE SODIO"
  - `LEUCINA` = "LEUCINA"
  - `SULFATO_CALCIO` = "SULFATO DE CALCIO"
  - `FOSFATO_TRIPLE` = "FOSFATO TRIPLE"
  - `FOSFATOS_AMORFOS` = "FOSFATOS AMORFOS"
  - `FOSFATO_CALCIO` = "FOSFATO DE CALCIO"
  - `CARBONATO_CALCIO` = "CARBONATO DE CALCIO"
  - `BIURATO_AMONIO` = "BIURATO DE AMONIO"
  - `NO_SE_OBSERVAN` = "NO SE OBSERVAN"

- **CylinderType**:
  - `HIALINOS` = "CILINDRO HIALINOS"
  - `ERITROCITARIO` = "CILINDRO ERITROCITARIO"
  - `LEUCOCITARIO` = "CILINDRO LEUCOCITARIO"
  - `GRANULOSO_FINO` = "CILINDRO GRANULOSO FINO"
  - `GRANULOSO_GRUESO` = "CILINDRO GRANULOSO GRUESO"
  - `CEREO` = "CILINDRO CEREO"
  - `NO_SE_OBSERVAN` = "NO SE OBSERVAN"
- **NegativePositive4Plus**: 
  - `NEGATIVO` = "Negativo"
  - `POSITIVO_1` = "Positivo +"
  - `POSITIVO_2` = "Positivo ++"
  - `POSITIVO_3` = "Positivo +++"
  - `POSITIVO_4` = "Positivo ++++"
- **NegativePositive3Plus**: `NEGATIVO`, `POSITIVO_+`, `POSITIVO_++`, `POSITIVO_+++`
- **NegativePositive**: `NEGATIVO`, `POSITIVO`

##### DTOs
- **CreateUrineTestDto**: 
  ```typescript
  {
    patientId: string;  // UUID del paciente
    testDate: string;   // Fecha ISO (YYYY-MM-DDTHH:mm:ssZ)
    
    // Características físicas
    color: UrineColor;
    aspect: UrineAspect;
    density: UrineDensity;
    ph: UrinePH;
    
    // Análisis químico
    protein: NegativePositive4Plus;     // Negativo a ++++ 
    glucose: NegativePositive4Plus;     // Negativo a ++++
    ketones: NegativePositive3Plus;     // Negativo a +++
    bilirubin: NegativePositive4Plus;   // Negativo a ++++
    occultBlood: NegativePositive3Plus; // Negativo a +++
    nitrites: NegativePositive;         // Negativo/Positivo
    
    // Elementos microscópicos
    crystals: Array<{
      type: CrystalType;    // Tipo de cristal (ver enum)
      quantity: string;      // Ej: "2-3 por campo", "abundante"
    }>;
    
    cylinders: Array<{
      type: CylinderType;   // Tipo de cilindro (ver enum)
      quantity: string;      // Ej: "escasos", "1-2 por campo"
    }>;
    
    // Campos opcionales
    observations?: string;   // Notas adicionales
    technicalNotes?: string; // Notas técnicas
  }
  ```

##### Entidad (urine_tests)
- `id`: number (PK)
- `patientId`: string (FK)
- `sampleNumber`: string
- `color`: UrineColor
- `aspect`: UrineAspect
- `density`: UrineDensity
- `ph`: UrinePH
- `protein`, `glucose`, etc: Varios campos de resultados
- `crystals`: Array<{ type: CrystalType, quantity: string }>
- `cylinders`: Array<{ type: CylinderType, quantity: string }>
- `status`: string
- `testDate`: Date
- `observations`: string
- Campos de auditoría...

##### Formatos de Cantidad
Para crystals y cylinders, la cantidad puede expresarse usando los siguientes formatos:

- **Conteo por campo**: 
  - Ej: "1-2 por campo", "2-3 por campo", "3-5 por campo"
  
- **Descripción cualitativa**:
  - "escaso(s)"
  - "moderado(s)"
  - "abundante(s)"
  
- **Sistema de cruces**:
  - "+" (escasos)
  - "++" (moderados)
  - "+++" (abundantes)
  
- **Descriptores específicos**:
  - "ocasional(es)"
  - "presente(s)"
  - "aislado(s)"
  - "numeroso(s)"

### Servidor LIS

- `GET /lis-server/status` - Estado del servidor TCP

## Documentación

La documentación completa de la API está disponible en:
```
http://localhost:3000/api
```

## Estructura del Proyecto

```
src/
├── common/                # Componentes comunes
│   ├── enums/            # Enumeraciones
│   │   ├── stool-test.enums.ts
│   │   └── escasa-moderada-abundante-ausente.enums.ts
│   └── interfaces/       # Interfaces
│       └── stool-test.interfaces.ts
├── dto/                  # Data Transfer Objects
│   ├── create-lab-result.dto.ts
│   ├── create-stool-test.dto.ts
│   └── update-stool-test.dto.ts
├── entities/             # Entidades de base de datos
│   ├── lab-result.entity.ts
│   └── stool-test.entity.ts
├── lab-results/          # Módulo de resultados de laboratorio
│   ├── lab-results.controller.ts
│   ├── lab-results.service.ts
│   └── lab-results.module.ts
├── stool-tests/         # Módulo de exámenes coprológicos
│   ├── stool-tests.controller.ts
│   ├── stool-tests.service.ts
│   └── stool-tests.module.ts
├── lis-server/          # Módulo servidor LIS
│   ├── lis-server.controller.ts
│   ├── lis-server.service.ts
│   └── lis-server.module.ts
├── app.module.ts        # Módulo principal
└── main.ts             # Punto de entrada
```

## Protocolo Dymind DH36

El servidor LIS escucha en el puerto 5600 y procesa mensajes del equipo Dymind DH36. El formato esperado incluye:

```
SAMPLE:12345
PATIENT_ID:P001
PATIENT_NAME:Juan Pérez
TEST:GLU|Glucosa
RESULT:95|mg/dL|70-100|NORMAL
DATE:2025-01-23T10:30:00Z
```

### Tipos de Mensaje

- **RESULT**: Resultados de exámenes
- **QUERY**: Consultas del equipo
- **HEARTBEAT**: Verificación de conexión

### Respuestas del Servidor

- `ACK:SUCCESS` - Confirmación positiva
- `NACK:ERROR:mensaje` - Error en procesamiento
- `LIS_SERVER_READY` - Servidor listo

## Base de Datos

### Tabla: lab_results

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| patient_id | VARCHAR | ID del paciente |
| patient_name | VARCHAR | Nombre del paciente |
| sample_number | VARCHAR | Número de muestra |
| test_type | VARCHAR | Tipo de examen |
| test_code | VARCHAR | Código del examen |
| test_result | TEXT | Resultado |
| unit | VARCHAR | Unidad de medida |
| reference_range | VARCHAR | Rango de referencia |
| result_status | VARCHAR | Estado (normal/alto/bajo) |
| test_date | TIMESTAMP | Fecha del examen |
| instrument_id | VARCHAR | ID del equipo |
| raw_data | TEXT | Datos raw recibidos |
| processing_status | VARCHAR | Estado de procesamiento |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

## Configuración del Equipo

Para configurar el equipo Dymind DH36:

1. Configurar IP del servidor LIS
2. Configurar puerto: 5600
3. Protocolo: TCP
4. Formato de datos: Texto plano

## Monitoreo

### Logs
Los logs incluyen:
- Conexiones TCP
- Procesamiento de mensajes
- Errores de parsing
- Estadísticas de procesamiento

### Estadísticas
- Total de resultados procesados
- Resultados del día actual
- Tasa de éxito
- Errores de procesamiento

## Desarrollo

### Agregar Nuevos Tipos de Examen

1. Actualizar el parser en `LabResultsService.parseDymindData()`
2. Agregar validaciones en los DTOs
3. Actualizar la documentación

### Personalizar Protocolo

Modificar los métodos en `LisServerService`:
- `identifyMessageType()` - Identificar tipos de mensaje
- `parseDymindData()` - Parser de datos
- `generateQueryResponse()` - Respuestas a consultas

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
