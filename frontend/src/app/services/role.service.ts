import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
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
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/roles`;

  createRole(roleData: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(this.endpoint, roleData)
      .pipe(catchError(err => this.handleError(err)));
  }

  getRoles(page: number = 1, limit: number = 10): Observable<RolePaginatedResponse> {
    const params = this.getParams({ page, limit });
    return this.http.get<RolePaginatedResponse>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.endpoint}/all`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateRole(id: string, roleData: UpdateRoleRequest): Observable<Role> {
    return this.http.patch<Role>(`${this.endpoint}/${id}`, roleData)
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteRole(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.endpoint}/${roleId}/permissions`)
      .pipe(catchError(err => this.handleError(err)));
  }

  addPermissionToRole(roleId: string, permissionData: CreatePermissionRequest): Observable<Permission> {
    return this.http.post<Permission>(`${this.endpoint}/${roleId}/permissions`, permissionData)
      .pipe(catchError(err => this.handleError(err)));
  }

  removePermissionFromRole(roleId: string, permissionId: string): Observable<DeletePermissionResponse> {
    return this.http.delete<DeletePermissionResponse>(`${this.endpoint}/${roleId}/permissions/${permissionId}`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
