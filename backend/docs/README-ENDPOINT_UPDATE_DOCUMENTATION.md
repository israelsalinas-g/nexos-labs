# Endpoint de Actualización para Resultados de Laboratorio

## 📋 Resumen
Se ha implementado un endpoint PUT para permitir a los técnicos del laboratorio clínico modificar los registros que se han recibido del equipo DH36.

## 🎯 Endpoint Creado

### PUT /lab-results/:id
**Descripción:** Actualizar resultado de laboratorio por ID  
**Método:** PUT  
**URL:** `http://localhost:3000/lab-results/{id}`

### 📝 Parámetros
- **id** (path parameter): ID único del resultado de laboratorio

### 📊 Body de Solicitud (UpdateLabResultDto)
```json
{
  "patientId": "string (opcional)",
  "patientName": "string (opcional)", 
  "patientAge": "number (opcional)",
  "patientSex": "string (opcional)",
  "referenceGroup": "string (opcional)",
  "sampleNumber": "string (opcional)",
  "analysisMode": "string (opcional)",
  "testDate": "string (opcional) - formato ISO date",
  "parameters": [
    {
      "name": "string",
      "result": "string", 
      "unit": "string",
      "referenceRange": "string (opcional)",
      "status": "string (opcional)"
    }
  ],
  "instrumentId": "string (opcional)",
  "rawData": "string (opcional)",
  "processingStatus": "pending | processed | error | manual_review (opcional)",
  "technicalNotes": "string (opcional) - Comentarios del técnico"
}
```

### 📤 Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Resultado de laboratorio ID 1 actualizado exitosamente",
  "result": {
    "id": 1,
    "patientId": "12345",
    "patientName": "Juan Pérez",
    "sampleNumber": "S001",
    "testDate": "2025-09-26T10:30:00.000Z",
    "parameters": [...],
    "processingStatus": "manual_review",
    "technicalNotes": "Valores revisados y corregidos por técnico especialista",
    "createdAt": "2025-09-26T08:00:00.000Z",
    "updatedAt": "2025-09-26T10:35:00.000Z"
  }
}
```

### ❌ Respuestas de Error
- **404:** Resultado no encontrado
- **400:** Error en los datos de entrada

## 🔧 Archivos Modificados/Creados

1. **src/dto/update-lab-result.dto.ts** - DTO para actualización
2. **src/entities/lab-result.entity.ts** - Agregado campo `technicalNotes`
3. **src/lab-results/lab-results.service.ts** - Método `update()`
4. **src/lab-results/lab-results.controller.ts** - Endpoint PUT
5. **src/migrations/1727316000000-AddTechnicalNotesToLabResults.ts** - Migración DB

## 🚀 Casos de Uso para Técnicos

### 1. Corregir Valores de Parámetros
```json
PUT /lab-results/123
{
  "parameters": [
    {
      "name": "WBC",
      "result": "7.2", 
      "unit": "10*3/uL",
      "referenceRange": "4.0-10.0",
      "status": "Normal"
    }
  ],
  "processingStatus": "manual_review",
  "technicalNotes": "Valor corregido después de recalibración del equipo"
}
```

### 2. Agregar Notas Técnicas
```json
PUT /lab-results/124
{
  "technicalNotes": "Muestra hemolizada, se solicita nueva toma",
  "processingStatus": "manual_review"
}
```

### 3. Corregir Datos del Paciente
```json
PUT /lab-results/125
{
  "patientName": "María González",
  "patientAge": 45,
  "technicalNotes": "Datos del paciente corregidos según historia clínica"
}
```

## 📋 Estados de Procesamiento Disponibles
- `pending`: Pendiente de procesamiento
- `processed`: Procesado automáticamente
- `error`: Error en el procesamiento
- `manual_review`: Revisión manual por técnico

## 🔒 Características de Seguridad
- Validación de tipos de entrada
- Manejo de errores robusto
- Log de todas las operaciones
- Conversión automática de tipos (ej: string a Date)
- Solo actualiza campos proporcionados (actualización parcial)

## 🎯 Swagger Documentation
El endpoint está completamente documentado en Swagger UI en:
`http://localhost:3000/api/docs`