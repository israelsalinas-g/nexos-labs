# Sistema iChroma II - LIS Integration

## 🧪 Resumen
Sistema completo para integrar el analizador iChroma II de química clínica con el LIS (Laboratory Information System). El iChroma II procesa un parámetro por test (ej: Beta HCG, PSA, etc.) a diferencia del DH36 que procesa múltiples parámetros de hematología.

## 🎯 Arquitectura Implementada

```
┌─────────────────┐    Puerto 5001    ┌──────────────────┐
│   iChroma II    │ ──────────────────→│                  │
│ (Qca. Clínica)  │   JSON + HL7      │  Servidor LIS    │
└─────────────────┘                    │  (NestJS)        │
                                       └──────────────────┘
                                               │
                                               ▼
                    ┌─────────────────────────────────────┐
                    │         Base de Datos               │
                    │  ┌─────────────┐  ┌───────────────┐ │
                    │  │lab_results  │  │ichroma_results│ │
                    │  │(DH36)       │  │(iChroma II)   │ │
                    │  └─────────────┘  └───────────────┘ │
                    └─────────────────────────────────────┘
```

## 📊 Endpoints REST API

### POST /ichroma-results/data
**Descripción:** Recibir datos del analizador iChroma II  
**Puerto TCP:** 5001 (automático)  
**Formato de entrada:** JSON con datos ya parseados del iChroma

#### Ejemplo de datos recibidos:
```json
{
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "1",
  "patientName": "ichroma2",
  "testType": "SL033",
  "testName": "",
  "result": "< 5.00",
  "unit": "mIU/mL",
  "referenceMin": null,
  "referenceMax": 1,
  "cartridgeSerial": "T",
  "cartridgeLot": "2.6",
  "humidity": null,
  "sampleBarcode": "HCUGG05EX",
  "testDate": "2025-09-27T14:41:32.709Z",
  "rawMessage": "MSH|^~\\&|1|ichroma2|SL033||20250207145457||OUL^R24^OUL_R24|1|T|2.6\rPID||josselyn caroli|||||26|Femenino\rOBR||Beta HCG|0|1|||20250207145457|||-\rORC|OK|||||||||||||||||SL033|1\rSPM|1|HCUGG05EX|||||||||||||||||20260228\rOBX|1|TX|Beta HCG||< 5.00|mIU/mL||0|||R\r\u001c"
}
```

#### Respuesta exitosa (201):
```json
{
  "success": true,
  "message": "Test Beta HCG procesado exitosamente para paciente josselyn caroli",
  "result": {
    "id": 1,
    "patientId": "1",
    "patientName": "josselyn caroli",
    "patientAge": 26,
    "patientSex": "Femenino",
    "testType": "SL033",
    "testName": "Beta HCG",
    "result": "< 5.00",
    "unit": "mIU/mL",
    "referenceMax": 1,
    "cartridgeSerial": "T",
    "cartridgeLot": "2.6",
    "sampleBarcode": "HCUGG05EX",
    "testDate": "2025-09-27T14:41:32.709Z",
    "instrumentId": "ICHROMA_II",
    "processingStatus": "processed",
    "createdAt": "2025-09-27T14:45:00.000Z",
    "updatedAt": "2025-09-27T14:45:00.000Z"
  }
}
```

### GET /ichroma-results
**Descripción:** Obtener todos los resultados iChroma (paginado)
**Query params:** 
- `limit` (opcional): Límite de resultados (default: 100)
- `offset` (opcional): Offset para paginación (default: 0)

### GET /ichroma-results/:id
**Descripción:** Obtener resultado específico por ID

### GET /ichroma-results/patient/:patientId  
**Descripción:** Obtener todos los resultados de un paciente

### GET /ichroma-results/test-type/:testType
**Descripción:** Obtener resultados por tipo de test (ej: SL033)

### PUT /ichroma-results/:id
**Descripción:** Actualizar resultado iChroma (para técnicos)

#### Ejemplo de actualización:
```json
{
  "result": "< 2.50",
  "processingStatus": "manual_review",
  "technicalNotes": "Valor corregido después de segunda lectura del cartucho"
}
```

### GET /ichroma-results/stats/summary
**Descripción:** Estadísticas de resultados iChroma

### POST /ichroma-results/test/sample
**Descripción:** Probar con datos de ejemplo

## 🔧 Procesamiento Inteligente de Datos

El servicio extrae automáticamente:

### 📋 **Del mensaje HL7 incluido:**
- **Nombre del paciente:** Del segmento PID
- **Edad del paciente:** Del segmento PID  
- **Sexo del paciente:** Del segmento PID
- **Nombre del test:** Del segmento OBX

### 📊 **Del JSON directo:**
- Resultado del test
- Unidades
- Valores de referencia
- Información del cartucho
- Metadatos del equipo

## 🔄 Servidor TCP Automático

### **Puerto 5001** - Escucha automáticamente
- Acepta conexiones del iChroma II
- Procesa datos JSON o HL7
- Envía ACK/NACK de confirmación
- Log completo de todas las operaciones

### **Formato soportado:**
- **JSON puro:** Datos ya parseados del iChroma
- **HL7 en rawMessage:** Se parsea automáticamente
- **Híbrido:** JSON + HL7 (formato actual del iChroma)

## 📋 Base de Datos - Tabla `ichroma_results`

### Campos principales:
- **id:** Primary key autoincremental
- **patient_id, patient_name, patient_age, patient_sex:** Datos del paciente
- **test_type, test_name:** Información del test (ej: SL033, Beta HCG)
- **result, unit:** Resultado y unidad (ej: "< 5.00", "mIU/mL")
- **reference_min, reference_max:** Valores de referencia
- **cartridge_serial, cartridge_lot:** Información del cartucho
- **sample_barcode:** Código de barras de la muestra
- **test_date:** Fecha y hora del test
- **raw_message:** Mensaje HL7 completo original
- **raw_data:** Datos JSON originales
- **instrument_id:** "ICHROMA_II"
- **processing_status:** Estado (processed, manual_review, etc.)
- **technical_notes:** Notas de los técnicos
- **created_at, updated_at:** Timestamps

### Índices optimizados para:
- Búsquedas por paciente
- Filtros por tipo de test
- Rangos de fechas
- Estado de procesamiento

## 🎯 Tipos de Tests Soportados

El sistema está preparado para cualquier test del iChroma II:
- **SL033:** Beta HCG (Embarazo)
- **SL001:** PSA (Próstata) 
- **SL002:** Troponina I (Cardíaco)
- **SL015:** CRP (Proteína C Reactiva)
- **SL020:** D-Dimer (Coagulación)
- **Y muchos más...**

## 🚀 Ventajas vs Sistema DH36

### **DH36 (Hematología):**
- ❌ Parsing complejo de HL7 crudo
- ❌ 20+ parámetros por muestra
- ❌ Datos del paciente embebidos en HL7

### **iChroma II (Química):**
- ✅ Datos ya parseados en JSON
- ✅ Un parámetro por test (más simple)
- ✅ Información del paciente clara
- ✅ Metadatos del cartucho disponibles

## 🔒 Estados de Procesamiento

- `pending`: Pendiente de procesamiento
- `processed`: Procesado automáticamente ✅
- `error`: Error en el procesamiento ❌
- `manual_review`: Revisión manual por técnico 🔍

## 📱 Swagger Documentation

Toda la API está documentada en:
**http://localhost:3000/api/docs**

### Tags organizadas:
- **iChroma Results - LIS Server:** Endpoints específicos del iChroma II
- **Lab Results - DH36 LIS Server:** Endpoints del DH36 (sin modificar)

## 🎉 **Sistema Completo y Separado**

✅ **Entidad independiente:** `IChromaResult`  
✅ **Tabla separada:** `ichroma_results`  
✅ **Servicio dedicado:** `IChromaResultsService`  
✅ **Controlador específico:** `IChromaResultsController`  
✅ **Servidor TCP independiente:** Puerto 5001  
✅ **DTOs específicos:** Validaciones para química clínica  
✅ **Sin interferencia:** Código DH36 intacto  

El sistema iChroma II está **listo para producción** y completamente separado del sistema DH36 existente. 🚀