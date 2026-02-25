-- ============================================================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN: ROLES, PERMISOS Y USUARIO SUPERADMIN
-- ============================================================================
-- Ejecutar después de ejecutar: npm run migration:run
-- Con: psql -U usuario -d base_datos -f src/migrations/seed-all.sql
-- ============================================================================

-- Paso 1: Insertar Roles
-- ============================================================================
INSERT INTO roles (id, name, level, description, created_at, updated_at) VALUES
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'SUPERADMIN',
  1,
  'Administrador supremo del sistema con acceso total',
  NOW(),
  NOW()
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'ADMIN',
  2,
  'Administrador del sistema con permisos amplios',
  NOW(),
  NOW()
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  'TECNICO',
  3,
  'Técnico de laboratorio con permisos limitados',
  NOW(),
  NOW()
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  'OPERADOR',
  4,
  'Operador del sistema con permisos mínimos',
  NOW(),
  NOW()
);

-- Paso 2: Insertar Usuario SUPERADMIN
-- ============================================================================
-- Contraseña: admin123 (hash bcrypt con 10 rondas)
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
  '$2b$10$6.3CRzDm8pu8m1JWtK8/wuOqQEYf7j3fmZlC3g5.5pZ2Zx6c6RHbS',
  'Super',
  'Admin',
  'superadmin@laboratoryinfo.com',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  true,
  NULL,
  NOW(),
  NOW()
);

-- Paso 3: Insertar Permisos
-- ============================================================================

-- Permisos para SUPERADMIN (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d479)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'users:create', 'Crear usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'users:read', 'Ver usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'users:update', 'Actualizar usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'users:delete', 'Eliminar usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'roles:create', 'Crear roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'roles:read', 'Ver roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'roles:update', 'Actualizar roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'roles:delete', 'Eliminar roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW());

-- Permisos para ADMIN (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d480)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'users:read', 'Ver usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'users:update', 'Actualizar usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'roles:read', 'Ver roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW());

-- Permisos para TECNICO (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d481)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440016', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW());

-- Permisos para OPERADOR (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d482)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', NOW(), NOW());

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Mostrar roles creados
SELECT '=== ROLES CREADOS ===' as info;
SELECT id, name, level, description FROM roles ORDER BY level;

-- Mostrar usuario creado
SELECT '=== USUARIO CREADO ===' as info;
SELECT u.id, u.username, u.email, r.name as role, u.is_active 
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- Mostrar permisos por rol
SELECT '=== PERMISOS POR ROL ===' as info;
SELECT r.name as rol, p.code, p.description 
FROM permissions p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY r.level, p.code;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Credenciales iniciales:
-- Username: superadmin
-- Password: admin123
-- Email: superadmin@laboratoryinfo.com
-- 
-- ¡IMPORTANTE! Cambiar la contraseña después del primer login.
-- ============================================================================
