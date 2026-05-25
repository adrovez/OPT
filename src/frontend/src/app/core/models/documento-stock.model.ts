export interface DocumentoStockDto {
  documentoId: string;
  tipoDocumento: TipoDocumentoEntrada;
  numeroDocumento: string;
  fecha: string;          // "2025-05-24"
  proveedorNombre?: string;
  estado: EstadoDocumento;
  observacion?: string;
  createdAt: string;
  lineas: DocumentoStockLineaDto[];
}

export interface DocumentoStockLineaDto {
  lineaId: string;
  varianteId: string;
  varianteNombre: string;
  productoNombre: string;
  cantidad: number;
  precioCosto?: number;
}

export interface CrearDocumentoRequest {
  tipoDocumento: TipoDocumentoEntrada;
  numeroDocumento: string;
  fecha: string;
  proveedorNombre?: string;
  observacion?: string;
  lineas: CrearDocumentoLineaRequest[];
}

export interface CrearDocumentoLineaRequest {
  varianteId: string;
  cantidad: number;
  precioCosto?: number;
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
