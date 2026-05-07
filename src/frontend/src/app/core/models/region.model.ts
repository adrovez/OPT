/** DTO compacto de Comuna, devuelto dentro de RegionWithComunas. */
export interface ComunaItem {
  idComuna: number;
  nombre: string;
}

/** DTO de Región con sus Comunas anidadas. Refleja GET /api/Regiones/WithComunas */
export interface RegionWithComunas {
  idRegion: number;
  nombre: string;
  codigo: string | null;
  comunas: ComunaItem[];
}
