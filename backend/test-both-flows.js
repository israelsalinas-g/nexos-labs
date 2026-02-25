// Script para probar ambos flujos de inserción
const http = require('http');
const net = require('net');

// Datos reales del equipo Dymind DH36 en formato HL7
const testData = `OBR|1||1050|01001^Automated Count^99MRC||20250908111536|20250908111601|||||||20250908111536||||||||||HM||||||||OBX|27|NM|34167-7^P-LCC^LN||46|10*9/L|30-90|~N|||FF|FF|F|F`;

// Configuración
const config = {
    http: {
        hostname: 'localhost',
        port: 3000,
        path: '/lab-results/process-raw'
    },
    tcp: {
        hostname: 'localhost',
        port: 5600
    }
};

// 1. Probar inserción vía HTTP API
console.log('\n🧪 Prueba 1: Inserción vía HTTP API');
const postData = JSON.stringify({ rawData: testData });

const httpRequest = http.request({
    ...config.http,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\n📥 Respuesta del API:');
        console.log('Estado:', res.statusCode);
        try {
            const jsonResponse = JSON.parse(data);
            console.log('Datos:', JSON.stringify(jsonResponse, null, 2));
            
            // Una vez completada la prueba HTTP, probamos TCP
            testTcpConnection();
        } catch (e) {
            console.log('Respuesta:', data);
        }
    });
});

httpRequest.on('error', (error) => {
    console.error('\n❌ Error API:', error.message);
});

httpRequest.write(postData);
httpRequest.end();

// 2. Probar inserción vía TCP (LIS Server)
function testTcpConnection() {
    console.log('\n🧪 Prueba 2: Inserción vía LIS Server (TCP)');
    
    const client = new net.Socket();
    
    client.connect(config.tcp.port, config.tcp.hostname, () => {
        console.log(`✅ Conectado al servidor LIS en puerto ${config.tcp.port}`);
        
        // Enviamos los mismos datos que enviamos por HTTP
        console.log('\n📤 Enviando datos al LIS Server:');
        console.log(testData);
        
        // Enviamos con el terminador correcto
        client.write(testData + '\r\n\r\n');
    });

    client.on('data', (data) => {
        console.log('\n📥 Respuesta del LIS Server:', data.toString());
        client.end();
    });

    client.on('close', () => {
        console.log('\n🔌 Conexión TCP cerrada');
        // Esperamos un poco para que los logs se completen
        setTimeout(() => process.exit(0), 1000);
    });

    client.on('error', (error) => {
        console.error('\n❌ Error TCP:', error.message);
        process.exit(1);
    });
}
