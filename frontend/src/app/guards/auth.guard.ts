import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verificar si el token está expirado
  if (authService.isTokenExpired()) {
    authService.logout();
    return false;
  }

  // Verificar roles requeridos (si están definidos en la ruta)
  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = authService.hasAnyRole(requiredRoles);
    if (!hasRole) {
      console.error('Acceso denegado: Rol insuficiente');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  // Verificar nivel de rol mínimo (si está definido en la ruta)
  const minRoleLevel = route.data['minRoleLevel'] as number;
  if (minRoleLevel) {
    const hasLevel = authService.hasRoleLevel(minRoleLevel);
    if (!hasLevel) {
      console.error('Acceso denegado: Nivel de rol insuficiente');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};

/**
 * Guard para rutas de login (redirige al dashboard si ya está autenticado)
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
