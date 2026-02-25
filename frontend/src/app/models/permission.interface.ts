/**
 * Interfaces para gestión de permisos
 */

/**
 * Permiso del sistema
 */
export interface Permission {
  id: string;
  code: string;
  description: string;
  roleId: string;
  createdAt?: string;
}

/**
 * Request para crear permiso
 */
export interface CreatePermissionRequest {
  code: string;
  description: string;
}

/**
 * Respuesta al eliminar permiso
 */
export interface DeletePermissionResponse {
  message: string;
}
