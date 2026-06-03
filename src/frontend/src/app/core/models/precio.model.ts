export interface PrecioProductoDto {
  precioId: string;
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  categoriaNombre?: string;
  precioCosto?: number;
  precioVenta?: number;
  vigenciaDesde: string;
  vigenciaHasta?: string;
  createdBy?: string;
}

export interface PreciosPagedResult {
  items: PrecioProductoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SetPrecioRequest {
  precioCosto?: number;
  precioVenta?: number;
}
