export interface SucursalResumen {
  sucursalId: string;
  nombre: string;
}

export interface LoginRequest {
  tenantId: string;
  rut: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombre: string;
  rol: string;
  usuarioId: string;
  tenantId: string;
  expiracion: string;
  sucursales: SucursalResumen[];
}
