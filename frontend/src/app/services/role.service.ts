import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePaginatedResponse
} from '../models/role.interface';
import {
  Permission,
  CreatePermissionRequest,
  DeletePermissionResponse
} from '../models/permission.interface';
import { MessageResponse } from '../models/auth.interface';

/**
 * Servicio para gestión de roles
 * Requiere roles: ADMIN (lectura), SUPERADMIN (escritura)
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = 'http://localhost:3000/roles';
  private http = inject(HttpClient);

  /**
   * Crear nuevo rol
   * Roles requeridos: SUPERADMIN
   */
  createRole(roleData: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(this.API_URL, roleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar roles con paginación
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getRoles(page: number = 1, limit: number = 10): Observable<RolePaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<RolePaginatedResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todos los roles sin paginación (útil para selects)
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.API_URL}/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener rol por ID
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar rol
   * Roles requeridos: SUPERADMIN
   */
  updateRole(id: string, roleData: UpdateRoleRequest): Observable<Role> {
    return this.http.patch<Role>(`${this.API_URL}/${id}`, roleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar rol
   * Roles requeridos: SUPERADMIN
   * Restricciones: No se pueden eliminar roles predefinidos o con usuarios asignados
   */
  deleteRole(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener permisos de un rol
   * Roles requeridos: ADMIN, SUPERADMIN
   */
  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.API_URL}/${roleId}/permissions`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Agregar permiso a rol
   * Roles requeridos: SUPERADMIN
   */
  addPermissionToRole(roleId: string, permissionData: CreatePermissionRequest): Observable<Permission> {
    return this.http.post<Permission>(`${this.API_URL}/${roleId}/permissions`, permissionData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Remover permiso de rol
   * Roles requeridos: SUPERADMIN
   */
  removePermissionFromRole(roleId: string, permissionId: string): Observable<DeletePermissionResponse> {
    return this.http.delete<DeletePermissionResponse>(`${this.API_URL}/${roleId}/permissions/${permissionId}`)
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
    
    console.error('RoleService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
