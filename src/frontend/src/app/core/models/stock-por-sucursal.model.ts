export interface StockPorSucursalDto {
  sucursalId: string;
  sucursalNombre: string;
  cantidadDisponible: number;
  stockMinimo: number;
  bajoMinimo: boolean;
}
