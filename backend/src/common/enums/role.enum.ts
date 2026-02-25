export enum RoleEnum {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  OPERADOR = 'OPERADOR',
}

export const ROLE_LEVELS: Record<RoleEnum, number> = {
  [RoleEnum.SUPERADMIN]: 1,
  [RoleEnum.ADMIN]: 2,
  [RoleEnum.TECNICO]: 3,
  [RoleEnum.OPERADOR]: 4,
};
