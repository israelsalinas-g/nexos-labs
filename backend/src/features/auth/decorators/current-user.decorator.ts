import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

/**
 * Decorador para inyectar el usuario actual (del JWT) en un parámetro del controlador
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
