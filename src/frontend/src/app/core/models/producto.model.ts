export interface CategoriaDto {
  categoriaId: string;
  tenantId: string;
  nombre: string;
  descripcion?: string;
  isActivo: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductoDto {
  productoId: string;
  tenantId: string;
  productoPadreId?: string;
  categoriaId?: string;
  categoriaNombre?: string;
  codigoInterno: string;
  nombre: string;
  descripcion?: string;
  tipo: string;            // 'Producto' | 'Servicio'
  unidadMedida?: string;
  isActivo: boolean;
  precioCosto?: number;
  precioVenta?: number;
  hijos: ProductoDto[];
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
  codigoInterno: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  unidadMedida?: string;
  categoriaId?: string;
  productoPadreId?: string;
}

export interface UpdateProductoRequest {
  codigoInterno: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  unidadMedida?: string;
  categoriaId?: string;
  productoPadreId?: string;
  isActivo: boolean;
}

export const TIPOS_PRODUCTO = ['Producto', 'Servicio'] as const;
export type TipoProducto = (typeof TIPOS_PRODUCTO)[number];
