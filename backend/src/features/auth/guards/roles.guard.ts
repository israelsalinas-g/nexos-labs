import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { ROLE_LEVELS, RoleEnum } from '../../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.role) {
      this.logger.warn('Usuario sin rol intentando acceder a ruta protegida');
      throw new ForbiddenException('Acceso denegado. Usuario sin rol asignado');
    }

    // Opción 1: Usar jerarquía de niveles (recomendado)
    // Un rol de nivel inferior (más poder) puede acceder a rutas de niveles superiores
    // Ejemplo: SUPERADMIN (nivel 1) puede acceder a rutas que requieren ADMIN (nivel 2)
    const minRequiredLevel = Math.min(
      ...requiredRoles.map(roleName => {
        const level = ROLE_LEVELS[roleName as RoleEnum];
        if (!level) {
          this.logger.warn(`Rol no válido en decorador @Roles: ${roleName}`);
          return Infinity; // Si el rol no es válido, considerar nivel infinito (sin acceso)
        }
        return level;
      })
    );

    // El usuario tiene acceso si su nivel es menor o igual al mínimo requerido
    // (niveles más bajos = más poder: 1=SUPERADMIN, 4=OPERADOR)
    if (user.roleLevel <= minRequiredLevel) {
      return true;
    }

    // Si llegamos aquí, el usuario no tiene suficientes permisos
    this.logger.warn(
      `Acceso denegado para usuario ${user.username} (${user.role}, nivel ${user.roleLevel}). ` +
      `Se requieren roles: ${requiredRoles.join(', ')} (nivel mínimo: ${minRequiredLevel})`
    );

    throw new ForbiddenException(
      `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
    );
  }
}
