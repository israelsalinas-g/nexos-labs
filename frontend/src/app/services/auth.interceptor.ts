import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Interceptor HTTP para agregar el token JWT a las peticiones
 * y manejar errores de autenticación
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token
  const token = authService.getToken();

  // Clonar la petición y agregar el header de autorización si existe token
  let authReq = req;
  if (token && !authService.isTokenExpired()) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Enviar la petición y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si hay un error 401 (No autorizado), redirigir al login
      if (error.status === 401) {
        authService.logout();
      }

      // Si hay un error 403 (Prohibido), mostrar mensaje
      if (error.status === 403) {
        console.error('Acceso denegado:', error.error?.message);
        // Puedes agregar una notificación aquí
      }

      return throwError(() => error);
    })
  );
};
