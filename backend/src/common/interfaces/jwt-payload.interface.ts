export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  roleLevel: number;
  iat?: number;
  exp?: number;
}
