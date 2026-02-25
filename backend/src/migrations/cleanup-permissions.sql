-- Script de limpieza: Eliminar permisos duplicados
-- Ejecutar ANTES de insertar los nuevos permisos si ya tienes algunos insertados

-- Opción 1: Eliminar TODOS los permisos (más seguro)
DELETE FROM permissions;

-- Opción 2: Solo eliminar los que tienen códigos duplicados (si no quieres eliminar todos)
-- DELETE FROM permissions 
-- WHERE code IN (
--     'users:read', 'users:update', 'users:create', 'users:delete',
--     'roles:read', 'roles:update', 'roles:create', 'roles:delete',
--     'lab:read', 'lab:write'
-- );

-- Verificar que se eliminaron
SELECT COUNT(*) as permisos_restantes FROM permissions;

-- Mostrar roles (para confirmar que no se eliminaron)
SELECT COUNT(*) as roles_totales FROM roles;
