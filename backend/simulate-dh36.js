const net = require('net');

// Simular el equipo DH36 enviando datos por TCP
function simulateDH36Equipment() {
  console.log('🔧 Simulando equipo DH36 conectándose al servidor LIS...');
  
  const client = new net.Socket();
  
  client.connect(3001, 'localhost', () => {
    console.log('✅ Conectado al servidor LIS en puerto 3001');
    
    // Simular datos reales del DH36 (hemograma completo)
    const hl7Message = `OBR|1||1050|01001^Automated Count^99MRC||20250912180000|20250912180100|||||||20250912180000||||||||||HM
OBX|1|NM|WBC^Leucocitos^LN||8.52|10*3/uL|4.0-10.0|N|||F
OBX|2|NM|LYM%^Linfocitos %^LN||35.2|%|20.0-40.0|N|||F
OBX|3|NM|GRA%^Granulocitos %^LN||58.1|%|50.0-70.0|N|||F
OBX|4|NM|MID%^Monocitos %^LN||6.7|%|2.0-10.0|N|||F
OBX|5|NM|LYM#^Linfocitos^LN||3.00|10*3/uL|1.0-4.0|N|||F
OBX|6|NM|GRA#^Granulocitos^LN||4.95|10*3/uL|2.0-7.0|N|||F
OBX|7|NM|MID#^Monocitos^LN||0.57|10*3/uL|0.2-1.0|N|||F
OBX|8|NM|RBC^Eritrocitos^LN||4.52|10*6/uL|4.0-5.5|N|||F
OBX|9|NM|HGB^Hemoglobina^LN||145.2|g/dL|120-160|N|||F
OBX|10|NM|HCT^Hematocrito^LN||42.1|%|37.0-47.0|N|||F
OBX|11|NM|MCV^VCM^LN||93.1|fL|82.0-92.0|H|||F
OBX|12|NM|MCH^HCM^LN||32.1|pg|27.0-32.0|H|||F
OBX|13|NM|MCHC^CHCM^LN||345|g/dL|320-360|N|||F
OBX|14|NM|RDW-CV^RDW-CV^LN||13.2|%|11.5-14.5|N|||F
OBX|15|NM|RDW-SD^RDW-SD^LN||43.8|fL|39.0-46.0|N|||F
OBX|16|NM|PLT^Plaquetas^LN||280|10*3/uL|100-300|N|||F
OBX|17|NM|MPV^VPM^LN||9.2|fL|7.0-11.0|N|||F
OBX|18|NM|PDW^PDW^LN||12.5|fL|9.0-17.0|N|||F
OBX|19|NM|PCT^PCT^LN||0.258|%|0.150-0.350|N|||F
OBX|20|NM|P-LCR^P-LCR^LN||22.4|%|13.0-43.0|N|||F
OBX|21|NM|P-LCC^P-LCC^LN||62|10*9/L|30-90|N|||F`;
    
    console.log('\n📤 Enviando datos HL7 simulados del DH36...');
    console.log('Muestra: 1050 - Hemograma completo con 21 parámetros');
    
    client.write(hl7Message);
    
    setTimeout(() => {
      console.log('\n🔚 Cerrando conexión simulada...');
      client.end();
    }, 2000);
  });
  
  client.on('data', (data) => {
    console.log('\n📨 Respuesta del servidor LIS:');
    console.log(data.toString());
  });
  
  client.on('close', () => {
    console.log('✅ Conexión cerrada');
  });
  
  client.on('error', (err) => {
    console.error('❌ Error de conexión:', err.message);
  });
}

// Ejecutar simulación
simulateDH36Equipment();
