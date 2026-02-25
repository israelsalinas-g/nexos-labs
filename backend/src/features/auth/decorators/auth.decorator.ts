import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorador combinado que aplica autenticación JWT y validación de roles
 * 
 * @param roles - Lista de roles permitidos. Si no se especifican roles, solo requiere autenticación JWT
 * 
 * @example
 * // Solo requiere autenticación (cualquier usuario autenticado)
 * @Auth()
 * @Get('profile')
 * getProfile() { ... }
 * 
 * @example
 * // Requiere autenticación y rol ADMIN o superior (SUPERADMIN)
 * @Auth('ADMIN')
 * @Delete('users/:id')
 * deleteUser() { ... }
 * 
 * @example
 * // Requiere autenticación y uno de los roles especificados
 * @Auth('ADMIN', 'TECNICO')
 * @Post('test-results')
 * createTestResult() { ... }
 */
export function Auth(...roles: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'No autorizado - Token inválido o expirado' }),
  ];

  // Si se especifican roles, agregar el decorador @Roles y la respuesta 403
  if (roles.length > 0) {
    decorators.push(
      Roles(...roles),
      ApiForbiddenResponse({ 
        description: `Acceso denegado - Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      }),
    );
  }

  return applyDecorators(...decorators);
}
