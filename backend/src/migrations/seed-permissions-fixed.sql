-- Script para insertar permisos ÚNICOS por rol
-- Los códigos deben ser únicos en la tabla
-- Ejecutar después de insertar los roles

-- Permisos para SUPERADMIN (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d479)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'superadmin:users:create', 'Crear usuarios (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'superadmin:users:read', 'Ver usuarios (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'superadmin:users:update', 'Actualizar usuarios (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'superadmin:users:delete', 'Eliminar usuarios (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'superadmin:roles:create', 'Crear roles (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'superadmin:roles:read', 'Ver roles (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'superadmin:roles:update', 'Actualizar roles (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'superadmin:roles:delete', 'Eliminar roles (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'superadmin:lab:read', 'Ver datos de laboratorio (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'superadmin:lab:write', 'Modificar datos de laboratorio (SUPERADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW());

-- Permisos para ADMIN (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d480)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin:users:read', 'Ver usuarios (ADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'admin:users:update', 'Actualizar usuarios (ADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'admin:roles:read', 'Ver roles (ADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'admin:lab:read', 'Ver datos de laboratorio (ADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'admin:lab:write', 'Modificar datos de laboratorio (ADMIN)', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW());

-- Permisos para TECNICO (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d481)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440016', 'tecnico:lab:read', 'Ver datos de laboratorio (TECNICO)', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'tecnico:lab:write', 'Modificar datos de laboratorio (TECNICO)', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW());

-- Permisos para OPERADOR (role_id: f47ac10b-58cc-4372-a567-0e02b2c3d482)
INSERT INTO permissions (id, code, description, role_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'operador:lab:read', 'Ver datos de laboratorio (OPERADOR)', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', NOW(), NOW());

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Mostrar todos los permisos inseridos
SELECT 'Permisos insertados correctamente' as resultado;
SELECT p.id, p.code, p.description, r.name as rol
FROM permissions p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY r.level, p.code;

-- Contar permisos por rol
SELECT r.name as rol, COUNT(p.id) as total_permisos
FROM roles r
LEFT JOIN permissions p ON r.id = p.role_id
GROUP BY r.name
ORDER BY r.level;
