export interface SucursalResumen {
  sucursalId: string;
  nombre: string;
}

export interface UsuarioDto {
  usuarioId: string;
  tenantId: string;
  rutUsuario: string;
  nombre: string;
  email: string;
  rol: string;
  fechaIngreso: string;
  sucursales: SucursalResumen[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUsuarioRequest {
  rutUsuario: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateUsuarioRequest {
  nombre: string;
  email: string;
  rol: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface AssignSucursalRequest {
  sucursalId: string;
}
