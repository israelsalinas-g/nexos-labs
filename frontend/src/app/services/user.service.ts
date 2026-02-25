import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserPaginatedResponse,
  ToggleActiveResponse,
  ChangeAvatarRequest
} from '../models/user.interface';
import { MessageResponse } from '../models/auth.interface';

/**
 * Servicio para gestión de usuarios
 * Requiere roles: ADMIN, SUPERADMIN
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  /**
   * Crear nuevo usuario
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar usuarios con paginación
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getUsers(page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<UserPaginatedResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener usuario por ID
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar usuario
   * Roles requeridos: Usuario puede actualizar sus propios datos, ADMIN y SUPERADMIN pueden actualizar a otros
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Alternar estado activo/inactivo de usuario
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  toggleActive(id: string): Observable<ToggleActiveResponse> {
    return this.http.patch<ToggleActiveResponse>(`${this.API_URL}/${id}/toggle-active`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar usuario
   * Roles requeridos: SUPERADMIN (solo SUPERADMIN puede eliminar)
   */
  deleteUser(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar usuarios por rol
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getUsersByRole(roleId: string, page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<UserPaginatedResponse>(`${this.API_URL}/role/${roleId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener avatares disponibles
   * Obtiene la lista de avatares almacenados en el backend
   */
  getAvailableAvatars(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/avatars/available`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cambiar avatar del usuario
   * El usuario puede cambiar su propio avatar
   * @param id - ID del usuario
   * @param avatarData - Objeto con la URL del avatar seleccionado
   */
  changeAvatar(id: string, avatarData: ChangeAvatarRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/${id}/avatar`, avatarData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }
    
    console.error('UserService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
