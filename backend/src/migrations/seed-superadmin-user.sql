-- Script para crear usuario SUPERADMIN inicial
-- Ejecutar después de insertar los roles con seed-roles.sql
-- La contraseña es: admin123 (hash bcrypt con 10 rondas)

INSERT INTO users (
  id,
  username,
  password,
  name,
  last_name,
  email,
  role_id,
  is_active,
  last_login,
  created_at,
  updated_at
) VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d479',
  'superadmin',
  '$2b$10$fOxrbADRPIBJ9ZMH0SX09uxuAEDI.LQeDsbXzYduL4PNQQi8UoHnq',
  'Super',
  'Admin',
  'superadmin@laboratoryinfo.com',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  true,
  NULL,
  NOW(),
  NOW()
);

-- Verificar que el usuario fue creado
SELECT u.id, u.username, u.email, u.is_active, r.name as role FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = 'superadmin';

-- Nota: Contraseña por defecto: admin123
-- Para cambiar la contraseña después, usa el endpoint POST /auth/change-password con un token JWT válido
