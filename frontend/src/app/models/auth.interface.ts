/**
 * Interfaces para Autenticación y Gestión de Usuarios/Roles/Permisos
 * Basado en la API documentada del backend
 */

/**
 * Datos de login del usuario
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Respuesta del login con token y datos del usuario
 */
export interface LoginResponse {
  accessToken: string;
  user: UserAuth;
}

/**
 * Datos del usuario autenticado
 */
export interface UserAuth {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  roleLevel: number;
  isActive: boolean;
}

/**
 * Payload del JWT decodificado
 */
export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  roleLevel: number;
  iat: number;
  exp: number;
}

/**
 * Request para refrescar token
 */
export interface RefreshTokenRequest {
  token: string;
}

/**
 * Respuesta del refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Request para cambiar contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Respuesta genérica de mensaje
 */
export interface MessageResponse {
  message: string;
}
