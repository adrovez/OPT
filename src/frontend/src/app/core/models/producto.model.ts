export interface ProductoCategoriaDto {
  categoriaId: string;
  tenantId: string;
  nombre: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductoVarianteDto {
  varianteId: string;
  productoId: string;
  tenantId: string;
  nombre: string;
  codigoBarras?: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductoDto {
  productoId: string;
  tenantId: string;
  categoriaId?: string;
  categoriaNombre?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: string;
  codigoInterno?: string;
  activo: boolean;
  variantes: ProductoVarianteDto[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductosPagedResult {
  items: ProductoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateProductoRequest {
  categoriaId?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: string;
  codigoInterno?: string;
}

export interface UpdateProductoRequest {
  categoriaId?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: string;
  codigoInterno?: string;
  activo: boolean;
}

export interface CreateProductoVarianteRequest {
  nombre: string;
  codigoBarras?: string;
}

export interface UpdateProductoVarianteRequest {
  nombre: string;
  codigoBarras?: string;
  activo: boolean;
}

export interface CreateProductoCategoriaRequest {
  nombre: string;
}

export interface UpdateProductoCategoriaRequest {
  nombre: string;
}

export const TIPOS_PRODUCTO = ['Almacenable', 'Consumible', 'Servicio'] as const;
export type TipoProducto = (typeof TIPOS_PRODUCTO)[number];
