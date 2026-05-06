export interface Cliente {
  clienteId: number;
  tenantId: number;
  tipoCliente: 'Persona' | 'Empresa';
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
}

export interface CreateClienteDto {
  tenantId: number;
  tipoCliente: string;
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
}

export interface UpdateClienteDto {
  tipoCliente?: string;
  numeroDocumento?: string;
  nombre?: string;
  direccion?: string;
  idComuna?: number;
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
