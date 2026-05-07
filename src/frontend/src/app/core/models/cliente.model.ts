export interface Contacto {
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
}

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
  contactos?: Contacto[];
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
  contactos?: Contacto[];
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
  contactos?: Contacto[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
