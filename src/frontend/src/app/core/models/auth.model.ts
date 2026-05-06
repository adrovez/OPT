export interface LoginRequest {
  tenantId: number;
  rut: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userId: number;
  userName: string;
  tenantId: number;
}
