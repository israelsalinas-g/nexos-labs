-- Insertar roles predefinidos en la tabla roles
-- Ejecutar este script después de ejecutar la migración: 1729780000000-CreateRoleUserPermissionTables

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

-- Verificar que los roles fueron insertados correctamente
SELECT * FROM roles ORDER BY level;
