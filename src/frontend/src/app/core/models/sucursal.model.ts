export interface SucursalDto {
  sucursalId: string;
  tenantId: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  matriz: boolean;
  fechaRegistro: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSucursalRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
  matriz: boolean;
}

export interface UpdateSucursalRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
  matriz: boolean;
}
