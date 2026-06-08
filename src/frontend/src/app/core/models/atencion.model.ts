export type EstadoAtencion = 'Abierta' | 'Terminada' | 'Pagada' | 'DerivoOT';

export interface CobroServicioDto {
  cobroServicioId: string;
  atencionId: string;
  formaPagoId: number;
  formaPagoDescripcion: string;
  monto: number;
  fechaCobro: string;
  observaciones: string | null;
  createdAt: string;
}

export interface AtencionDto {
  atencionId: string;
  sucursalId: string;
  sucursalNombre: string;
  agendaId: string | null;
  clienteId: string;
  clienteNombre: string;
  usuarioAtencionId: string;
  usuarioAtencionNombre: string;
  anamnesisId: string | null;
  recetaCristalesId: string | null;
  fechaHoraAtencion: string; // ISO local datetime: "2026-05-26T10:00:00"
  motivo: string;
  observaciones: string | null;
  estado: EstadoAtencion;
  createdAt: string;
  updatedAt: string | null;
  cobroServicio: CobroServicioDto | null;
}

export interface CreateAtencionRequest {
  agendaId?: string;
  clienteId: string;
  usuarioAtencionId: string;
  fechaHoraAtencion: string;
  motivo: string;
  observaciones?: string;
}

export interface RegistrarCobroRequest {
  formaPagoId: number;
  monto: number;
  observaciones?: string;
}

export interface IniciarAtencionRequest {
  // Atención
  agendaId?: string;
  clienteId: string;
  usuarioAtencionId: string;
  fechaHoraAtencion: string;
  motivo: string;
  observaciones?: string;
  // Anamnesis
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  anamnesisObservacion?: string;
  // RecetaCristales — Lejos
  lejosODEsferico?: string;
  lejosODCilindro?: string;
  lejosODEje?: string;
  lejosODObservacion?: string;
  lejosOIEsferico?: string;
  lejosOICilindro?: string;
  lejosOIEje?: string;
  lejosOIObservacion?: string;
  lejosDPEsferico?: string;
  lejosDPObservacion?: string;
  // RecetaCristales — Cerca
  cercaODEsferico?: string;
  cercaODCilindro?: string;
  cercaODEje?: string;
  cercaODObservacion?: string;
  cercaOIEsferico?: string;
  cercaOICilindro?: string;
  cercaOIEje?: string;
  cercaOIObservacion?: string;
  cercaDPEsferico?: string;
  cercaDPObservacion?: string;
  // RecetaCristales — ADD y Flags
  lejosADDEsfera?: string;
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;
}

export interface IniciarAtencionResult {
  atencionId: string;
  anamnesisId: string;
  recetaCristalesId: string;
}
