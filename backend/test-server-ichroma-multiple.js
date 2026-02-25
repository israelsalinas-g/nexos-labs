// Script para probar diferentes formatos de datos del iChroma II
const http = require('http');

console.log('\n🧪 Pruebas Múltiples del Sistema iChroma II');
console.log('═'.repeat(50));

// Test 1: Formato JSON directo (como viene del iChroma)
const test1_DirectFormat = {
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
};

// Test 2: Formato "mapeado" (como lo procesa el TcpServerService)
const test2_MappedFormat = {
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "1",
  "patientName": "ichroma2",
  "testType": "OTHER",
  "result": "< 5.00",
  "unit": "mIU/mL",
  "referenceMax": 1,
  "cartridgeSerial": "T",
  "cartridgeLot": "2.6",
  "humidity": null,
  "testDate": "2025-09-27T14:41:32.709Z",
  "sampleBarcode": "HCUGG05EX",
  "rawData": {
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
};

// Test 3: Diferentes tipos de tests del iChroma II
const test3_PSA = {
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "2",
  "patientName": "Carlos Rodriguez",
  "testType": "SL001",
  "testName": "PSA",
  "result": "2.8",
  "unit": "ng/mL",
  "referenceMin": 0,
  "referenceMax": 4,
  "cartridgeSerial": "P001",
  "cartridgeLot": "L2024-09",
  "humidity": 45.5,
  "sampleBarcode": "PSA001",
  "testDate": new Date().toISOString(),
  "rawMessage": "MSH|^~\\&|2|ichroma2|SL001||20250927150000||OUL^R24^OUL_R24|2|P001|L2024-09\rPID||Carlos Rodriguez|||||55|Masculino\rOBR||PSA|0|4|||20250927150000|||-\rOBX|1|TX|PSA||2.8|ng/mL||0|||R\r\u001c"
};

const test4_CRP = {
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "3",
  "patientName": "Maria Gonzalez",
  "testType": "SL015",
  "testName": "CRP",
  "result": "8.5",
  "unit": "mg/L",
  "referenceMin": 0,
  "referenceMax": 3,
  "cartridgeSerial": "C015",
  "cartridgeLot": "CRP2024",
  "humidity": 52.0,
  "sampleBarcode": "CRP003",
  "testDate": new Date().toISOString(),
  "rawMessage": "MSH|^~\\&|3|ichroma2|SL015||20250927150500||OUL^R24^OUL_R24|3|C015|CRP2024\rPID||Maria Gonzalez|||||42|Femenino\rOBR||CRP|0|3|||20250927150500|||-\rOBX|1|TX|CRP||8.5|mg/L||0|||R\r\u001c"
};

const tests = [
  { name: 'Beta HCG - Formato Directo', data: test1_DirectFormat, description: 'Prueba de embarazo - Negativo' },
  { name: 'Beta HCG - Formato Mapeado', data: test2_MappedFormat, description: 'Mismo test con formato procesado' },
  { name: 'PSA - Próstata', data: test3_PSA, description: 'Antígeno Prostático - Normal' },
  { name: 'CRP - Inflamación', data: test4_CRP, description: 'Proteína C Reactiva - Elevado' }
];

let currentTest = 0;

function runNextTest() {
  if (currentTest >= tests.length) {
    console.log('\n🎉 Todas las pruebas completadas!');
    console.log('\n📊 Resumen de tests ejecutados:');
    tests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.name} - ${test.description}`);
    });
    console.log('\n🔗 Verificar resultados en:');
    console.log('   - Swagger UI: http://localhost:3000/api/docs');
    console.log('   - Estadísticas: GET /ichroma-results/stats/summary');
    console.log('   - Todos los resultados: GET /ichroma-results');
    process.exit(0);
  }

  const test = tests[currentTest];
  console.log(`\n🧪 Test ${currentTest + 1}/${tests.length}: ${test.name}`);
  console.log(`📋 Descripción: ${test.description}`);

  const postData = JSON.stringify(test.data);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/ichroma-results/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log(`📥 Estado: ${res.statusCode}`);
      
      try {
        const jsonResponse = JSON.parse(responseData);
        if (jsonResponse.success && jsonResponse.result) {
          console.log(`✅ ÉXITO: ID ${jsonResponse.result.id} - ${jsonResponse.result.testName || jsonResponse.result.testType}: ${jsonResponse.result.result} ${jsonResponse.result.unit}`);
          console.log(`👤 Paciente: ${jsonResponse.result.patientName} (${jsonResponse.result.patientAge || 'N/A'} años)`);
        } else {
          console.log('❌ Error en la respuesta:', jsonResponse.message || 'Error desconocido');
        }
      } catch (e) {
        console.log('❌ Error parseando respuesta:', responseData);
      }

      // Esperar un poco antes del siguiente test
      setTimeout(() => {
        currentTest++;
        runNextTest();
      }, 1000);
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Error en test ${currentTest + 1}:`, error.message);
    console.log('💡 Asegúrate de que el servidor NestJS esté ejecutándose');
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

// Iniciar las pruebas
console.log('🚀 Iniciando secuencia de pruebas del iChroma II...');
console.log('⏳ Esto tomará unos segundos...');

setTimeout(runNextTest, 500);