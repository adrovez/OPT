export interface DocumentoStockDto {
  documentoId: string;
  tipoDocumento: TipoDocumentoEntrada;
  numeroDocumento?: string;
  fechaDocumento: string;      // "2025-05-24"
  proveedorNombre?: string;
  proveedorRut?: string;
  estado: EstadoDocumento;
  observaciones?: string;
  createdAt: string;
  lineas: DocumentoStockLineaDto[];
}

export interface DocumentoStockLineaDto {
  lineaId: string;
  productoId: string;
  productoNombre: string;
  codigoInterno: string;
  cantidad: number;
  precioCosto?: number;
  observaciones?: string;
}

export interface CrearDocumentoRequest {
  tipoDocumento: TipoDocumentoEntrada;
  numeroDocumento?: string;
  fechaDocumento: string;
  proveedorNombre?: string;
  proveedorRut?: string;
  observaciones?: string;
  lineas: CrearDocumentoLineaRequest[];
}

export interface CrearDocumentoLineaRequest {
  productoId: string;
  cantidad: number;
  precioCosto?: number;
  observaciones?: string;
}

export interface DocumentosPagedResult {
  items: DocumentoStockDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const TIPOS_DOCUMENTO_ENTRADA = ['FacturaCompra', 'BoletaCompra', 'OtroIngreso'] as const;
export type TipoDocumentoEntrada = (typeof TIPOS_DOCUMENTO_ENTRADA)[number];

export const ESTADOS_DOCUMENTO = ['Confirmado', 'Anulado'] as const;
export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

export const TIPOS_DOCUMENTO_LABEL: Record<TipoDocumentoEntrada, string> = {
  FacturaCompra: 'Factura de Compra',
  BoletaCompra:  'Boleta de Compra',
  OtroIngreso:   'Otro Ingreso',
};
