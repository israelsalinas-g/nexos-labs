# Ejemplos Prácticos de Uso - Sistema de Resultados de Pruebas

## Ejemplo 1: Configurar Prueba de Glucosa (Resultado Numérico)

### Paso 1: Crear la Categoría
```bash
curl -X POST http://localhost:3000/api/exam-categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Química Sanguínea",
    "code": "QS",
    "description": "Pruebas de química de la sangre"
  }'
```

Respuesta: `{ id: 1, name: "Química Sanguínea", ... }`

### Paso 2: Crear la Definición de Prueba
```bash
curl -X POST http://localhost:3000/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "name": "Glucosa",
    "code": "GLUC",
    "testResultType": "NUMERIC",
    "unit": "mg/dL",
    "referenceRange": "Ayuno: 70-100 mg/dL, 2 hrs: <140 mg/dL",
    "method": "Glucosa-Oxidasa",
    "sampleType": "Suero",
    "processingTime": 1,
    "price": 25.00
  }'
```

Respuesta: `{ id: 1, name: "Glucosa", ... }`

### Paso 3: Crear Definiciones de Resultados
```bash
# Resultado Normal
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 1,
    "name": "Normal",
    "value": "NORMAL",
    "config": {
      "numericMin": 70,
      "numericMax": 100,
      "interpretation": "Normal",
      "alertLevel": "low",
      "color": "#4CAF50",
      "icon": "check",
      "description": "Nivel de glucosa dentro de los límites normales"
    },
    "displayOrder": 1
  }'
```

```bash
# Resultado Alterado
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 1,
    "name": "Alterado",
    "value": "ALTERED",
    "config": {
      "numericMin": 101,
      "numericMax": 125,
      "interpretation": "Alterado",
      "alertLevel": "medium",
      "color": "#FFC107",
      "icon": "warning",
      "description": "Glucosa ligeramente elevada",
      "recommendation": "Seguimiento nutricional"
    },
    "displayOrder": 2
  }'
```

```bash
# Resultado Crítico
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 1,
    "name": "Crítico",
    "value": "CRITICAL",
    "config": {
      "numericMin": 126,
      "numericMax": 999999,
      "interpretation": "Crítico",
      "alertLevel": "critical",
      "color": "#FF5722",
      "icon": "error",
      "description": "Glucosa muy elevada",
      "recommendation": "Contactar médico inmediatamente"
    },
    "displayOrder": 3
  }'
```

### Paso 4: Ingresar un Resultado
```bash
curl -X POST http://localhost:3000/api/test-results \
  -H "Content-Type: application/json" \
  -d '{
    "orderTestId": 5,
    "resultValue": "85",
    "resultNumeric": 85,
    "isAbnormal": false,
    "abnormalFlag": "N",
    "reference": "Ayuno: 70-100 mg/dL",
    "testedAt": "2025-10-16T10:30:00Z",
    "testedBy": "Lic. María González"
  }'
```

---

## Ejemplo 2: Configurar Prueba VDRL (Resultado Binario)

### Paso 1: Crear la Definición
```bash
curl -X POST http://localhost:3000/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 2,
    "name": "VDRL",
    "code": "VDRL",
    "testResultType": "BINARY",
    "method": "RPR - Reacción de Plasma Rápida",
    "sampleType": "Suero",
    "processingTime": 2,
    "price": 45.00
  }'
```

### Paso 2: Crear Definiciones de Resultados
```bash
# Resultado Negativo
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 5,
    "name": "Negativo",
    "value": "NEG",
    "config": {
      "binaryValue": false,
      "interpretation": "Normal",
      "alertLevel": "low",
      "color": "#4CAF50",
      "icon": "check"
    },
    "displayOrder": 1
  }'
```

```bash
# Resultado Positivo
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 5,
    "name": "Positivo",
    "value": "POS",
    "config": {
      "binaryValue": true,
      "interpretation": "Anormal",
      "alertLevel": "high",
      "color": "#FF5722",
      "icon": "error",
      "recommendation": "Confirmar con FTA-ABS"
    },
    "displayOrder": 2
  }'
```

### Paso 3: Ingresar Resultado
```bash
curl -X POST http://localhost:3000/api/test-results \
  -H "Content-Type: application/json" \
  -d '{
    "orderTestId": 12,
    "resultValue": "NEG",
    "isAbnormal": false,
    "testedAt": "2025-10-16T11:00:00Z",
    "testedBy": "Lic. Juan Pérez"
  }'
```

---

## Ejemplo 3: Configurar Prueba de Proteinuria (Escala)

### Paso 1: Crear la Definición
```bash
curl -X POST http://localhost:3000/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 3,
    "name": "Proteinuria",
    "code": "PROT",
    "testResultType": "SCALE",
    "method": "Dipstick/Tira Reactiva",
    "sampleType": "Orina",
    "processingTime": 1,
    "price": 15.00
  }'
```

### Paso 2: Crear Definiciones de Resultados
```bash
# Negativo
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 8,
    "name": "Negativo",
    "value": "NEG",
    "config": {
      "scaleValue": "Negativo",
      "scaleOrder": 0,
      "interpretation": "Normal",
      "alertLevel": "low",
      "color": "#4CAF50"
    },
    "displayOrder": 1
  }'
```

```bash
# Trazas
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 8,
    "name": "Trazas",
    "value": "TRACE",
    "config": {
      "scaleValue": "Trazas",
      "scaleOrder": 1,
      "interpretation": "Dudoso",
      "alertLevel": "medium",
      "color": "#FFC107"
    },
    "displayOrder": 2
  }'
```

```bash
# Positivo (+)
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 8,
    "name": "Positivo (+)",
    "value": "1PLUS",
    "config": {
      "scaleValue": "+",
      "scaleOrder": 2,
      "interpretation": "Anormal",
      "alertLevel": "medium",
      "color": "#FFC107"
    },
    "displayOrder": 3
  }'
```

```bash
# Positivo (++)
curl -X POST http://localhost:3000/api/test-result-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "testDefinitionId": 8,
    "name": "Positivo (++)",
    "value": "2PLUS",
    "config": {
      "scaleValue": "++",
      "scaleOrder": 3,
      "interpretation": "Anormal",
      "alertLevel": "high",
      "color": "#FF5722"
    },
    "displayOrder": 4
  }'
```

---

## Ejemplo 4: Validar un Resultado Antes de Ingresar

### Validar si un valor es válido para una prueba
```bash
# Validar valor para glucosa
curl -X GET "http://localhost:3000/api/test-result-definitions/validate/1?value=85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Respuesta Exitosa:
```json
{
  "isValid": true,
  "definition": {
    "id": 1,
    "name": "Normal",
    "value": "NORMAL",
    "config": {
      "numericMin": 70,
      "numericMax": 100,
      "interpretation": "Normal",
      "alertLevel": "low",
      "color": "#4CAF50"
    }
  }
}
```

Respuesta con Valor Inválido:
```json
{
  "isValid": false,
  "definition": null
}
```

---

## Ejemplo 5: Obtener Definiciones de Resultados

### Obtener todas las definiciones de una prueba
```bash
curl -X GET "http://localhost:3000/api/test-result-definitions/test/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Respuesta:
```json
[
  {
    "id": 1,
    "testDefinitionId": 1,
    "name": "Normal",
    "value": "NORMAL",
    "config": { ... },
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-10-16T10:00:00Z"
  },
  {
    "id": 2,
    "testDefinitionId": 1,
    "name": "Alterado",
    "value": "ALTERED",
    "config": { ... },
    "displayOrder": 2,
    "isActive": true
  }
]
```

---

## Ejemplo 6: Listar con Filtros

```bash
# Listar definiciones de un test específico
curl -X GET "http://localhost:3000/api/test-result-definitions?testDefinitionId=1&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar
curl -X GET "http://localhost:3000/api/test-result-definitions?search=positivo" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Flujo de Trabajo en el Frontend (Angular)

### 1. Obtener Definiciones de Resultado
```typescript
// test-result.service.ts
getResultDefinitions(testDefinitionId: number) {
  return this.http.get(
    `/api/test-result-definitions/test/${testDefinitionId}`
  );
}
```

### 2. Renderizar Formulario Dinámico
```typescript
// test-result-form.component.ts
ngOnInit() {
  this.testService.getResultDefinitions(this.testId).subscribe(definitions => {
    this.resultOptions = definitions;
    
    // Renderizar según el tipo
    const testDef = definitions[0];
    if (testDef.config.scaleValue) {
      this.renderScale(definitions);
    } else if (testDef.config.binaryValue !== undefined) {
      this.renderBinary(definitions);
    }
  });
}
```

### 3. Validar Antes de Enviar
```typescript
submitResult() {
  const value = this.form.get('resultValue').value;
  this.service.validateResult(this.testId, value).subscribe(result => {
    if (result.isValid) {
      this.submitTestResult();
    } else {
      this.showError('Valor no válido para esta prueba');
    }
  });
}
```

---

## Caso de Uso Real: Laboratorio de Química Sanguínea

### Pruebas a configurar:
1. ✅ Glucosa (Numérico)
2. ✅ Creatinina (Numérico)
3. ✅ Urea (Numérico)
4. ✅ Colesterol Total (Numérico)
5. ✅ HDL (Numérico)
6. ✅ LDL (Numérico)
7. ✅ Triglicéridos (Numérico)

### Cada una tendría definiciones de resultados:
- **Normal**: Rango verde
- **Borderline**: Rango amarillo
- **Anormal**: Rango rojo
- **Crítico**: Rango rojo oscuro con alerta

---

## Integración con Sistema Automático

Si tienes equipos que envían resultados automáticamente (Dymind, iChroma):

```typescript
// ichroma.service.ts
async processAutomaticResult(equipmentResult: any) {
  const definition = await this.resultDefService.findOne(equipmentResult.testDefId);
  
  // Validar que el resultado viene correctamente
  const validation = await this.resultDefService.validateResultValue(
    equipmentResult.testDefId,
    equipmentResult.value
  );
  
  if (validation.isValid) {
    // Crear el TestResult
    return this.testResultService.create({
      orderTestId: equipmentResult.orderTestId,
      resultValue: equipmentResult.value,
      isAbnormal: validation.definition.config.alertLevel !== 'low',
      testedAt: new Date(),
      testedBy: 'Sistema Automático - ' + equipmentResult.equipment
    });
  } else {
    // Registrar error
    this.logger.error(`Valor inválido recibido: ${equipmentResult.value}`);
  }
}
```
