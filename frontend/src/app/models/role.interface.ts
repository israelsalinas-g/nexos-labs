/**
 * Interfaces para gestión de roles
 */

import { Permission } from './permission.interface';

/**
 * Rol del sistema
 */
export interface Role {
  id: string;
  name: string;
  level: number;
  description: string;
  users?: UserInRole[];
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Usuario dentro de un rol
 */
export interface UserInRole {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

/**
 * Request para crear rol
 */
export interface CreateRoleRequest {
  name: string;
  level: number;
  description: string;
}

/**
 * Request para actualizar rol
 */
export interface UpdateRoleRequest {
  description?: string;
}

/**
 * Rol en listados simplificados
 */
export interface RoleListItem {
  id: string;
  name: string;
  level: number;
  description: string;
  usersCount: number;
  permissionsCount: number;
  createdAt: string;
}

/**
 * Respuesta paginada de roles
 */
export interface RolePaginatedResponse {
  data: RoleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
