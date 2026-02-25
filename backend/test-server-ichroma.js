// Script para probar el procesamiento de datos del iChroma II
const http = require('http');

// Datos reales del equipo iChroma II en formato JSON
const ichromaData = {
  "messageType": "MSH",
  "deviceId": "^~\\&",
  "patientId": "1",
  "patientName": "ichroma2",
  "testType": "SL033",
  "testName": "",
  "result": "< 5.00", // Corregido: el resultado real es "< 5.00", no el timestamp
  "unit": "mIU/mL", // Corregido: la unidad real es "mIU/mL"
  "referenceMin": null,
  "referenceMax": 1,
  "cartridgeSerial": "T",
  "cartridgeLot": "2.6", // Limpiado: removido el \rPID
  "humidity": null,
  "sampleBarcode": "HCUGG05EX", // Extraído del rawMessage
  "testDate": "2025-09-27T14:41:32.709Z",
  "rawMessage": "MSH|^~\\&|1|ichroma2|SL033||20250207145457||OUL^R24^OUL_R24|1|T|2.6\rPID||josselyn caroli|||||26|Femenino\rOBR||Beta HCG|0|1|||20250207145457|||-\rORC|OK|||||||||||||||||SL033|1\rSPM|1|HCUGG05EX|||||||||||||||||20260228\rOBX|1|TX|Beta HCG||< 5.00|mIU/mL||0|||R\r\u001c"
};

console.log('\n🧪 Iniciando prueba de procesamiento de datos iChroma II...');
console.log('📊 Test: Beta HCG (Prueba de embarazo)');
console.log('👤 Paciente: josselyn caroli (26 años, Femenino)');
console.log('📋 Resultado esperado: < 5.00 mIU/mL (Negativo)');

// Crear el objeto para el endpoint /ichroma-results/data
const postData = JSON.stringify(ichromaData);

// Opciones para la petición HTTP
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/ichroma-results/data',  // Endpoint específico para iChroma II
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('\n📤 Enviando datos al endpoint iChroma II:');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Datos:', JSON.stringify(ichromaData, null, 2));

// Realizar la petición HTTP
const req = http.request(options, (res) => {
    let responseData = '';

    // Recolectar los datos de la respuesta
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    // Cuando termina la respuesta
    res.on('end', () => {
        console.log('\n📥 Respuesta del servidor iChroma II:');
        console.log('Estado:', res.statusCode);
        try {
            const jsonResponse = JSON.parse(responseData);
            console.log('Respuesta:', JSON.stringify(jsonResponse, null, 2));
            
            if (jsonResponse.success && jsonResponse.result) {
                console.log('\n✅ PROCESAMIENTO EXITOSO:');
                console.log(`📋 ID del registro: ${jsonResponse.result.id}`);
                console.log(`👤 Paciente: ${jsonResponse.result.patientName} (${jsonResponse.result.patientAge} años)`);
                console.log(`🧪 Test: ${jsonResponse.result.testName} (${jsonResponse.result.testType})`);
                console.log(`📊 Resultado: ${jsonResponse.result.result} ${jsonResponse.result.unit}`);
                console.log(`🔬 Instrumento: ${jsonResponse.result.instrumentId}`);
                console.log(`📅 Fecha: ${jsonResponse.result.testDate}`);
                console.log(`📦 Cartucho: Serial ${jsonResponse.result.cartridgeSerial}, Lote ${jsonResponse.result.cartridgeLot}`);
            }
        } catch (e) {
            console.log('Respuesta raw:', responseData);
        }
        
        console.log('\n🎯 Prueba completada. Verifica la base de datos para confirmar que se guardó el registro.');
        process.exit(0);
    });
});

// Manejar errores de la petición
req.on('error', (error) => {
    console.error('\n❌ Error:', error.message);
    console.log('💡 Asegúrate de que:');
    console.log('   - El servidor NestJS esté ejecutándose en el puerto 3000');
    console.log('   - La base de datos esté conectada');
    console.log('   - La migración de ichroma_results se haya ejecutado');
    console.log('\n🔧 Para ejecutar migraciones:');
    console.log('   npm run typeorm -- -d src/config/typeorm.config.ts migration:run');
    process.exit(1);
});

// Enviar los datos
req.write(postData);
req.end();

// Información adicional para el usuario
setTimeout(() => {
    console.log('\n📋 INFORMACIÓN ADICIONAL:');
    console.log('🔗 Swagger UI: http://localhost:3000/api/docs');
    console.log('📊 Endpoint de estadísticas: GET /ichroma-results/stats/summary');
    console.log('🔍 Ver resultados por paciente: GET /ichroma-results/patient/1');
    console.log('🧪 Ver por tipo de test: GET /ichroma-results/test-type/SL033');
    console.log('\n💡 Otros tests iChroma II soportados:');
    console.log('   - SL033: Beta HCG (Embarazo)');
    console.log('   - SL001: PSA (Próstata)');
    console.log('   - SL002: Troponina I (Cardíaco)');
    console.log('   - SL015: CRP (Proteína C Reactiva)');
    console.log('   - SL020: D-Dimer (Coagulación)');
}, 100);