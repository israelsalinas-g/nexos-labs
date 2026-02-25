const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function resetSuperAdminPassword() {
  // Configuración de conexión a PostgreSQL
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'your_database',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Hash de la nueva contraseña
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario superadmin
    const updateQuery = `
      UPDATE users 
      SET password = $1 
      WHERE username = 'superadmin'
      RETURNING id, username, email;
    `;

    const result = await client.query(updateQuery, [hashedPassword]);

    if (result.rows.length > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 CREDENCIALES ACTUALIZADAS:');
      console.log('   Usuario: superadmin');
      console.log('   Contraseña: Admin@123');
      console.log('   Email:', result.rows[0].email);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('⚠️  No se encontró el usuario "superadmin"');
      console.log('💡 Intenta con el usuario "admin" en su lugar');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

// Ejecutar el script
resetSuperAdminPassword();
