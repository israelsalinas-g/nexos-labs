import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para especificar los roles requeridos en una ruta
 * Se usa junto con RolesGuard
 *
 * @example
 * @Roles('ADMIN', 'SUPERADMIN')
 * @Get('users')
 * findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
