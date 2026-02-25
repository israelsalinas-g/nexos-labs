// Script para verificar la estructura de datos actual
const fetch = require('node-fetch');

async function checkDataStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE DATOS EN TODOS LOS ENDPOINTS');
  console.log('=======================================================');

  try {
    // 1. Verificar endpoint principal
    console.log('\n📡 1. Verificando /lab-results (todos los registros)');
    const allResults = await fetch('http://localhost:3000/lab-results?limit=2');
    const allData = await allResults.json();
    
    if (allData.length > 0) {
      console.log(`✅ Encontrados ${allData.length} registros`);
      console.log('📊 Estructura del primer registro:');
      console.log('   - ID:', allData[0].id);
      console.log('   - Sample Number:', allData[0].sampleNumber);
      console.log('   - Parameters Type:', typeof allData[0].parameters);
      console.log('   - Parameters Count:', Array.isArray(allData[0].parameters) ? allData[0].parameters.length : 'No es array');
      
      if (Array.isArray(allData[0].parameters) && allData[0].parameters.length > 0) {
        console.log('   - Primer parámetro:', allData[0].parameters[0]);
        console.log('   - Último parámetro:', allData[0].parameters[allData[0].parameters.length - 1]);
      } else {
        console.log('   - Parameters content:', allData[0].parameters);
      }
    } else {
      console.log('❌ No hay datos en la base de datos');
    }

    // 2. Verificar un registro específico si existe
    if (allData.length > 0) {
      console.log('\n📡 2. Verificando /lab-results/:id (registro específico)');
      const singleResult = await fetch(`http://localhost:3000/lab-results/${allData[0].id}`);
      const singleData = await singleResult.json();
      
      console.log('✅ Registro individual obtenido');
      console.log('📊 Parameters count:', Array.isArray(singleData.parameters) ? singleData.parameters.length : 'No es array');
    }

    // 3. Verificar por sample number si existe
    if (allData.length > 0 && allData[0].sampleNumber) {
      console.log('\n📡 3. Verificando /lab-results/sample/:sampleNumber');
      const sampleResult = await fetch(`http://localhost:3000/lab-results/sample/${allData[0].sampleNumber}`);
      const sampleData = await sampleResult.json();
      
      console.log(`✅ Encontrados ${sampleData.length} registros para sample ${allData[0].sampleNumber}`);
      if (sampleData.length > 0) {
        console.log('📊 Parameters count:', Array.isArray(sampleData[0].parameters) ? sampleData[0].parameters.length : 'No es array');
      }
    }

  } catch (error) {
    console.log('❌ Error verificando estructura:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo en puerto 3000');
  }
}

// Verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/lab-results');
    if (response.ok) {
      console.log('✅ Servidor corriendo correctamente');
      await checkDataStructure();
    } else {
      console.log('❌ Servidor responde pero con error:', response.status);
    }
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    console.log('💡 Ejecuta: npm run start:dev');
  }
}

checkServer();
