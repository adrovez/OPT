export interface TransferenciaDto {
  transferenciaId: string;
  sucursalOrigenId: string;
  sucursalOrigenNombre?: string;
  sucursalDestinoId: string;
  sucursalDestinoNombre?: string;
  fechaTransferencia: string;   // DateOnly → 'YYYY-MM-DD'
  estado: 'Pendiente' | 'Confirmada' | 'Anulada';
  observaciones?: string;
  createdAt: string;
  lineas: TransferenciaLineaDto[];
}

export interface TransferenciaLineaDto {
  lineaId: string;
  productoId: string;
  productoNombre: string;
  codigoInterno: string;
  cantidad: number;
}

export interface TransferenciaPagedResult {
  items: TransferenciaDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CrearTransferenciaRequest {
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  fechaTransferencia: string;   // 'YYYY-MM-DD'
  observaciones?: string;
  lineas: { productoId: string; cantidad: number }[];
}
