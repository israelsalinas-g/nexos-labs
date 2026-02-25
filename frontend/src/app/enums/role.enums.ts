/**
 * Enums para roles del sistema
 */

/**
 * Roles disponibles en el sistema
 */
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  OPERADOR = 'OPERADOR'
}

/**
 * Niveles de roles
 */
export enum RoleLevel {
  SUPERADMIN = 1,
  ADMIN = 2,
  TECNICO = 3,
  OPERADOR = 4
}

/**
 * Descripción de roles
 */
export const RoleDescriptions: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'Acceso total al sistema',
  [UserRole.ADMIN]: 'Administrador del sistema',
  [UserRole.TECNICO]: 'Técnico de laboratorio',
  [UserRole.OPERADOR]: 'Operador con acceso de lectura'
};

/**
 * Mapeo de roles a niveles
 */
export const RoleLevelMap: Record<UserRole, RoleLevel> = {
  [UserRole.SUPERADMIN]: RoleLevel.SUPERADMIN,
  [UserRole.ADMIN]: RoleLevel.ADMIN,
  [UserRole.TECNICO]: RoleLevel.TECNICO,
  [UserRole.OPERADOR]: RoleLevel.OPERADOR
};
