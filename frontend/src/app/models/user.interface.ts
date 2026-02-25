/**
 * Interfaces para gestión de usuarios
 */

import { Role } from './role.interface';

/**
 * Usuario completo del sistema
 */
export interface User {
  id: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear usuario
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  lastName: string;
  email: string;
  roleId: string;
  isActive: boolean;
}

/**
 * Request para actualizar usuario
 */
export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
}

/**
 * Respuesta para toggle de estado activo
 */
export interface ToggleActiveResponse {
  id: string;
  username: string;
  isActive: boolean;
  message: string;
}

/**
 * Usuario en listados simplificados
 */
export interface UserListItem {
  id: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
    level: number;
  };
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

/**
 * Respuesta paginada de usuarios
 */
export interface UserPaginatedResponse {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Request para cambiar avatar
 */
export interface ChangeAvatarRequest {
  avatar: string;
}
