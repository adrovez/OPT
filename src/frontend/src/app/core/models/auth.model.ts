export interface LoginRequest {
  tenantId: string;  // UUID — UNIQUEIDENTIFIER en SQL Server
  rut: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userId: string;    // UUID
  userName: string;
  tenantId: string;  // UUID
}
