-- ============================================================================
-- SQL LISTO PARA COPIAR Y PEGAR
-- ============================================================================
-- Copia TODO este contenido y pégalo en tu cliente PostgreSQL
-- ============================================================================

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
('550e8400-e29b-41d4-a716-446655440010', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'users:read', 'Ver usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'users:update', 'Actualizar usuarios', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'roles:read', 'Ver roles', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'lab:write', 'Modificar datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'lab:read', 'Ver datos de laboratorio', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', NOW(), NOW());
