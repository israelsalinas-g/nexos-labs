// Script para verificar el procesamiento de datos vía API REST
const http = require('http');

// El mismo formato de datos que recibe el LIS Server
const rawData = `OBR|1||1050|01001^Automated Count^99MRC||20250908111536|20250908111601|||||||20250908111536||||||||||HM||||||||OBX|27|NM|34167-7^P-LCC^LN||46|10*9/L|30-90|~N|||FF|FF|F|F`;

// Configuración del request
const postData = JSON.stringify({ rawData });
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/lab-results/process-raw',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('\n🧪 Verificando procesamiento de datos vía API REST');
console.log('\n📤 Datos a enviar:');
console.log(rawData);

// Realizar la petición
const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n📥 Respuesta del servidor:');
        console.log('Estado:', res.statusCode);
        
        try {
            const result = JSON.parse(data);
            console.log('\n✅ Datos procesados correctamente:');
            console.log('- ID:', result.id);
            console.log('- Muestra:', result.sampleNumber);
            console.log('- Fecha:', result.testDate);
            console.log('\n📊 Parámetros:');
            result.parameters.forEach(param => {
                console.log(`- ${param.name}: ${param.result} ${param.unit} (${param.status})`);
            });
        } catch (e) {
            console.log('Error parseando respuesta:', e.message);
            console.log('Datos recibidos:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ Error:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en el puerto 3000');
});

// Enviar los datos
req.write(postData);
req.end();
