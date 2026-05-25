export interface StockDto {
  stockId: string;
  varianteId: string;
  varianteNombre: string;
  productoNombre: string;
  sucursalId: string;
  cantidadDisponible: number;
  stockMinimo: number;
  bajoMinimo: boolean;
}

export interface MovimientoStockDto {
  movimientoId: string;
  varianteId: string;
  varianteNombre: string;
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
  varianteId: string;
  tipoMovimiento: string;
  cantidad: number;
  referencia?: string;
  observacion?: string;
}

export const TIPOS_MOVIMIENTO = ['Entrada', 'Salida', 'Ajuste'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];
