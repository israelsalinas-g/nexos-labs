# Scripts de Prueba - iChroma II

## 🎯 Archivos de Prueba Creados

### 1. `test-server-ichroma.js`
**Propósito:** Prueba básica con datos reales del iChroma II  
**Test:** Beta HCG (Prueba de embarazo)  
**Paciente:** josselyn caroli (26 años, Femenino)  
**Resultado:** < 5.00 mIU/mL (Negativo)

### 2. `test-server-ichroma-multiple.js`
**Propósito:** Pruebas múltiples con diferentes tipos de tests  
**Tests incluidos:**
- Beta HCG (Embarazo) - Formato directo
- Beta HCG (Embarazo) - Formato mapeado
- PSA (Próstata) - Masculino 55 años
- CRP (Inflamación) - Femenino 42 años

## 🚀 Cómo Ejecutar las Pruebas

### Prerrequisitos:
1. **Servidor NestJS ejecutándose:**
   ```bash
   npm run start:dev
   ```

2. **Base de datos configurada y migraciones ejecutadas:**
   ```bash
   npm run typeorm -- -d src/config/typeorm.config.ts migration:run
   ```

3. **Puerto 3000 disponible**

### Ejecutar Pruebas:

#### Prueba Simple:
```bash
node test-server-ichroma.js
```

#### Pruebas Múltiples:
```bash
node test-server-ichroma-multiple.js
```

## 📊 Formatos de Datos Soportados

### Formato 1: JSON Directo (iChroma II original)
```json
{
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "1",
  "patientName": "ichroma2",
  "testType": "SL033",
  "result": "< 5.00",
  "unit": "mIU/mL",
  "testDate": "2025-09-27T14:41:32.709Z",
  "rawMessage": "MSH|^~\\&|1|ichroma2|SL033||..."
}
```

### Formato 2: JSON Mapeado (Procesado por TcpServerService)
```json
{
  "messageType": "MSH",
  "testType": "OTHER",
  "result": "< 5.00",
  "rawData": {
    "messageType": "MSH",
    "testType": "SL033",
    "result": "< 5.00"
  }
}
```

## 🧪 Tipos de Tests Incluidos

| Código | Test | Descripción | Ejemplo Resultado |
|--------|------|-------------|-------------------|
| SL033 | Beta HCG | Prueba de embarazo | < 5.00 mIU/mL |
| SL001 | PSA | Antígeno prostático | 2.8 ng/mL |
| SL015 | CRP | Proteína C Reactiva | 8.5 mg/L |
| SL002 | Troponina I | Marcador cardíaco | 0.02 ng/mL |
| SL020 | D-Dimer | Coagulación | 0.5 mg/L |

## 📋 Resultados Esperados

### Consola del Script:
```
🧪 Iniciando prueba de procesamiento de datos iChroma II...
📊 Test: Beta HCG (Prueba de embarazo)
👤 Paciente: josselyn caroli (26 años, Femenino)
📋 Resultado esperado: < 5.00 mIU/mL (Negativo)

📤 Enviando datos al endpoint iChroma II:
URL: http://localhost:3000/ichroma-results/data

📥 Respuesta del servidor iChroma II:
Estado: 201

✅ PROCESAMIENTO EXITOSO:
📋 ID del registro: 1
👤 Paciente: josselyn caroli (26 años)
🧪 Test: Beta HCG (SL033)
📊 Resultado: < 5.00 mIU/mL
🔬 Instrumento: ICHROMA_II
📅 Fecha: 2025-09-27T14:41:32.709Z
📦 Cartucho: Serial T, Lote 2.6
```

### Respuesta del Servidor:
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
    "instrumentId": "ICHROMA_II",
    "processingStatus": "processed",
    "createdAt": "2025-09-27T14:45:00.000Z",
    "updatedAt": "2025-09-27T14:45:00.000Z"
  }
}
```

## 🔍 Verificación en Base de Datos

Después de ejecutar las pruebas, verifica que los datos se guardaron:

```sql
-- Ver todos los resultados iChroma
SELECT * FROM ichroma_results ORDER BY created_at DESC;

-- Ver por tipo de test
SELECT test_name, test_type, result, unit, patient_name 
FROM ichroma_results 
WHERE test_type = 'SL033';

-- Estadísticas por test
SELECT test_type, test_name, COUNT(*) as total
FROM ichroma_results 
GROUP BY test_type, test_name;
```

## 🌐 Endpoints para Verificar

Después de las pruebas, puedes usar estos endpoints:

```bash
# Ver todos los resultados
curl http://localhost:3000/ichroma-results

# Ver estadísticas
curl http://localhost:3000/ichroma-results/stats/summary

# Ver por paciente
curl http://localhost:3000/ichroma-results/patient/1

# Ver por tipo de test
curl http://localhost:3000/ichroma-results/test-type/SL033

# Swagger UI
http://localhost:3000/api/docs
```

## ⚠️ Solución de Problemas

### Error: ECONNREFUSED
```
💡 Asegúrate de que el servidor NestJS esté ejecutándose:
npm run start:dev
```

### Error: Base de datos
```
💡 Ejecuta las migraciones:
npm run typeorm -- -d src/config/typeorm.config.ts migration:run
```

### Error: Puerto ocupado
```
💡 Verifica que el puerto 3000 esté libre:
netstat -ano | findstr :3000
```

## 🎯 Próximos Pasos

1. **Ejecutar las pruebas** para verificar el funcionamiento
2. **Revisar los logs** del servidor NestJS
3. **Verificar la base de datos** que se guardaron los registros
4. **Probar los endpoints** REST para consultar los datos
5. **Configurar el iChroma II real** para usar el puerto 5001

¡El sistema está listo para recibir datos reales del iChroma II! 🚀