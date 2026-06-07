export const ETAPAS_OT = [
  'Ingresado',
  'EnProceso',
  'Montaje',
  'Laboratorio',
  'Calidad',
  'Despacho',
  'Entregado',
] as const;
export type EtapaOT = (typeof ETAPAS_OT)[number];

export const ESTADOS_PAGO_OT = ['Pendiente', 'Pagado'] as const;
export type EstadoPagoOT = (typeof ESTADOS_PAGO_OT)[number];

export const TIPOS_FACTURACION = ['Particular', 'Empresa'] as const;
export type TipoFacturacion = (typeof TIPOS_FACTURACION)[number];

/** Colores Tailwind para badge de etapa */
export const ETAPA_COLORS: Record<EtapaOT, string> = {
  Ingresado:   'bg-gray-100 text-gray-700',
  EnProceso:   'bg-blue-100 text-blue-700',
  Montaje:     'bg-orange-100 text-orange-700',
  Laboratorio: 'bg-violet-100 text-violet-700',
  Calidad:     'bg-yellow-100 text-yellow-700',
  Despacho:    'bg-cyan-100 text-cyan-700',
  Entregado:   'bg-green-100 text-green-700',
};

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── DTOs de lista / detalle ──────────────────────────────────────────────────

export interface OrdenTrabajoDto {
  otId: string;
  numeroOT: string;
  clienteId: string;
  clienteNombre: string;
  sucursalId: string;
  sucursalNombre: string;
  fechaIngreso: string;
  fechaEntrega: string;
  horaEntrega: string | null;
  subTotal: number;
  descuento: number;
  montoTotal: number;
  totalAbonado: number;
  saldo: number;
  estadoPago: EstadoPagoOT;
  etapaOT: EtapaOT;
  createdAt: string;
}

export interface OrdenTrabajoLineaDto {
  lineaId: string;
  otId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  valorUnitario: number;
  comentario: string | null;
}

export interface OrdenTrabajoPagoDto {
  pagoId: string;
  otId: string;
  formaPagoId: number;
  formaPagoDescripcion: string;
  monto: number;
  fechaPago: string;
  esAbono: boolean;
  observacion: string | null;
  createdAt: string;
}

export interface OrdenTrabajoCuotaDto {
  cuotaId: string;
  numero: number;
  valorCuota: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: 'Pendiente' | 'Pagada';
}

export interface OrdenTrabajoBitacoraDto {
  bitacoraId: string;
  etapa: string;
  fecha: string;
  responsable: string;
  observacion: string | null;
}

export interface OrdenTrabajoDetalleDto extends OrdenTrabajoDto {
  beneficiario: string | null;
  tipoFacturacion: TipoFacturacion;
  empresaClienteId: string | null;
  atencionId: string | null;
  recetaCristalesId: string | null;
  numeroCuotas: number;
  fechaInicioCuotas: string | null;
  lineas: OrdenTrabajoLineaDto[];
  pagos: OrdenTrabajoPagoDto[];
  cuotas: OrdenTrabajoCuotaDto[];
  bitacora: OrdenTrabajoBitacoraDto[];
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface LineaRequest {
  productoId: string;
  cantidad: number;
  valorUnitario: number;
  comentario?: string;
}

export interface AbonoRequest {
  formaPagoId: number;
  monto: number;
  fechaPago: string;
  observacion?: string;
}

export interface CreateOrdenTrabajoRequest {
  numeroOT: string;
  clienteId: string;
  beneficiario?: string;
  tipoFacturacion: TipoFacturacion;
  empresaClienteId?: string;
  recetaCristalesId?: string;
  fechaEntrega: string;
  horaEntrega?: string;
  descuento: number;
  numeroCuotas: number;
  fechaInicioCuotas?: string;
  observacion?: string;
  lineas: LineaRequest[];
  abonos: AbonoRequest[];
}

export interface UpdateOrdenTrabajoRequest {
  numeroOT: string;
  clienteId: string;
  beneficiario?: string;
  tipoFacturacion: TipoFacturacion;
  empresaClienteId?: string;
  recetaCristalesId?: string;
  fechaEntrega: string;
  horaEntrega?: string;
  descuento: number;
  numeroCuotas: number;
  fechaInicioCuotas?: string;
  observacion?: string;
  lineas: LineaRequest[];
}

export interface CambiarEtapaRequest {
  nuevaEtapa: EtapaOT;
  responsable: string;
  observacion?: string;
}

export interface RegistrarPagoOTRequest {
  formaPagoId: number;
  monto: number;
  fechaPago: string;
  observacion?: string;
}

// ─── Filtros de lista ─────────────────────────────────────────────────────────

export interface OrdenTrabajoFiltros {
  numeroOT?: string;
  clienteId?: string;
  estadoPago?: EstadoPagoOT | '';
  etapaOT?: EtapaOT | '';
  page: number;
  pageSize: number;
}
