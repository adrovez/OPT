export interface StockDto {
  stockId: string;
  productoId: string;
  productoNombre: string;
  codigoInterno: string;
  sucursalId: string;
  cantidadDisponible: number;
  stockMinimo: number;
  bajoMinimo: boolean;
}

export interface MovimientoStockDto {
  movimientoId: string;
  productoId: string;
  productoNombre: string;
  tipoMovimiento: string;
  cantidad: number;
  cantidadAntes: number;
  cantidadDespues: number;
  referencia?: string;
  observacion?: string;
  fechaMovimiento: string;
  usuarioNombre?: string;
}

export interface RegistrarMovimientoRequest {
  productoId: string;
  tipoMovimiento: string;
  cantidad: number;
  referencia?: string;
  observacion?: string;
}

export const TIPOS_MOVIMIENTO = ['Entrada', 'Salida', 'Ajuste', 'Merma', 'DevolucionProveedor'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];
