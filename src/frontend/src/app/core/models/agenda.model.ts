export type EstadoAgenda = 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada' | 'NoShow';

export interface AgendaDto {
  agendaId: string;
  sucursalId: string;
  sucursalNombre: string;
  clienteId: string;
  clienteNombre: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  fechaHora: string; // ISO local datetime: "2026-05-26T09:00:00"
  duracionMinutos: number;
  motivo: string;
  estado: EstadoAgenda;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAgendaRequest {
  clienteId: string;
  usuarioId?: string;
  fechaHora: string;
  duracionMinutos: number;
  motivo: string;
  observaciones?: string;
}

export interface UpdateAgendaRequest {
  usuarioId?: string;
  fechaHora: string;
  duracionMinutos: number;
  motivo: string;
  observaciones?: string;
}
