export interface Contacto {
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
}

export interface Cliente {
  clienteId: string;   // UUID — UNIQUEIDENTIFIER en SQL Server
  tenantId: string;    // UUID — UNIQUEIDENTIFIER en SQL Server
  tipoCliente: 'Persona' | 'Empresa';
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;   // INT — catálogo compartido (no es GUID)
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
  contactos?: Contacto[];
  // Auditoría
  fechaIngreso?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateClienteDto {
  tenantId: string;    // UUID
  tipoCliente: string;
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;   // INT — catálogo
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
