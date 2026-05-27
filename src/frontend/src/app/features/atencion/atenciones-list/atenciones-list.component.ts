import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AtencionDto, EstadoAtencion } from '../../../core/models/atencion.model';
import { AgendaDto } from '../../../core/models/agenda.model';
import { AtencionService } from '../../../core/services/atencion.service';
import { AgendaService } from '../../../core/services/agenda.service';

type Tab = 'sala' | 'historial';

const ESTADO_BADGE: Record<EstadoAtencion, string> = {
  Abierta:           'bg-blue-50 text-blue-700 border border-blue-200',
  TerminadaServicio: 'bg-green-50 text-green-700 border border-green-200',
  DerivoOT:          'bg-purple-50 text-purple-700 border border-purple-200',
};

function pad(n: number): string { return String(n).padStart(2, '0'); }
function formatFecha(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatHora(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-atenciones-list',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col h-full bg-white">

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h1 class="text-lg font-semibold text-gray-900">Atenciones</h1>
        <div class="flex items-center gap-3">
          @if (loading()) {
            <svg class="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          }
          @if (activeTab() === 'historial') {
            <button
              type="button"
              (click)="nuevaAtencion()"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600
                     hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nueva atención
            </button>
          }
          @if (activeTab() === 'sala') {
            <button
              type="button"
              (click)="cargarSala()"
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600
                     bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Actualizar"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Actualizar
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 px-6 bg-white shrink-0">
        <button
          type="button"
          (click)="switchTab('sala')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none -mb-px"
          [class.border-blue-600]="activeTab() === 'sala'"
          [class.text-blue-700]="activeTab() === 'sala'"
          [class.font-semibold]="activeTab() === 'sala'"
          [class.border-transparent]="activeTab() !== 'sala'"
          [class.text-gray-500]="activeTab() !== 'sala'"
        >
          Sala de espera
          @if (sala().length > 0) {
            <span class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full
                         text-[10px] font-bold bg-blue-600 text-white">
              {{ sala().length }}
            </span>
          }
        </button>
        <button
          type="button"
          (click)="switchTab('historial')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none -mb-px"
          [class.border-blue-600]="activeTab() === 'historial'"
          [class.text-blue-700]="activeTab() === 'historial'"
          [class.font-semibold]="activeTab() === 'historial'"
          [class.border-transparent]="activeTab() !== 'historial'"
          [class.text-gray-500]="activeTab() !== 'historial'"
        >
          Historial
        </button>
      </div>

      <!-- TAB: Sala de espera -->
      @if (activeTab() === 'sala') {
        <div class="flex-1 overflow-auto">
          @if (sala().length === 0 && !loading()) {
            <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm">No hay citas confirmadas para hoy</p>
            </div>
          } @else {
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hora</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Paciente</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Profesional</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (cita of sala(); track cita.agendaId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {{ formatHora(cita.fechaHora) }}
                    </td>
                    <td class="px-6 py-3.5 text-gray-900 font-medium">{{ cita.clienteNombre }}</td>
                    <td class="px-6 py-3.5 text-gray-500 max-w-xs truncate">{{ cita.motivo }}</td>
                    <td class="px-6 py-3.5 text-gray-500">{{ cita.usuarioNombre ?? '—' }}</td>
                    <td class="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        (click)="iniciarAtencion(cita)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                               text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Atender
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      <!-- TAB: Historial -->
      @if (activeTab() === 'historial') {
        <div class="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0 flex-wrap">
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500" for="at-desde">Desde</label>
            <input
              id="at-desde" type="date"
              [value]="filtroDesde()"
              (input)="filtroDesde.set($any($event.target).value)"
              class="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500" for="at-hasta">Hasta</label>
            <input
              id="at-hasta" type="date"
              [value]="filtroHasta()"
              (input)="filtroHasta.set($any($event.target).value)"
              class="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            [value]="filtroEstado()"
            (change)="filtroEstado.set($any($event.target).value)"
            class="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="Abierta">Abierta</option>
            <option value="TerminadaServicio">Terminada Servicio</option>
            <option value="DerivoOT">Derivó a OT</option>
          </select>
          <button
            type="button"
            (click)="buscarHistorial()"
            class="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800
                   rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Buscar
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          @if (historial().length === 0 && !loading()) {
            <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                     M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-sm">No hay atenciones para los filtros seleccionados</p>
            </div>
          } @else {
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha y hora</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Profesional</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (at of historial(); track at.atencionId) {
                  <tr
                    class="hover:bg-gray-50 cursor-pointer transition-colors"
                    (click)="verDetalle(at.atencionId)"
                  >
                    <td class="px-6 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {{ formatFecha(at.fechaHoraAtencion) }}
                    </td>
                    <td class="px-6 py-3.5 text-gray-700">{{ at.clienteNombre }}</td>
                    <td class="px-6 py-3.5 text-gray-500 max-w-xs truncate">{{ at.motivo }}</td>
                    <td class="px-6 py-3.5 text-gray-500">{{ at.usuarioAtencionNombre }}</td>
                    <td class="px-6 py-3.5">
                      <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold
                                   {{ estadoBadge(at.estado) }}">
                        {{ estadoLabel(at.estado) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

    </div>
  `,
})
export class AtencionesListComponent {
  private readonly atencionService = inject(AtencionService);
  private readonly agendaService = inject(AgendaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = signal<Tab>('sala');
  readonly sala = signal<AgendaDto[]>([]);
  readonly historial = signal<AtencionDto[]>([]);
  readonly loading = signal(false);

  readonly today = new Date();
  readonly filtroDesde = signal(formatDate(new Date()));
  readonly filtroHasta = signal(formatDate(new Date()));
  readonly filtroEstado = signal('');

  readonly formatFecha = formatFecha;
  readonly formatHora = formatHora;

  constructor() {
    this.cargarSala();
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'historial' && this.historial().length === 0) {
      this.buscarHistorial();
    }
  }

  cargarSala(): void {
    const today = formatDate(new Date());
    this.loading.set(true);
    this.agendaService.getAll({
      estado: 'Confirmada',
      desde: `${today}T00:00:00`,
      hasta: `${today}T23:59:59`,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { this.sala.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  buscarHistorial(): void {
    this.loading.set(true);
    this.atencionService.getAll({
      desde: this.filtroDesde() ? this.filtroDesde() + 'T00:00:00' : undefined,
      hasta: this.filtroHasta() ? this.filtroHasta() + 'T23:59:59' : undefined,
      estado: this.filtroEstado() || undefined,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { this.historial.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  iniciarAtencion(cita: AgendaDto): void {
    this.router.navigate(['/atenciones/iniciar'], { queryParams: { agendaId: cita.agendaId } });
  }

  nuevaAtencion(): void {
    this.router.navigate(['/atenciones/nueva']);
  }

  verDetalle(id: string): void {
    this.router.navigate(['/atenciones', id]);
  }

  estadoBadge(estado: EstadoAtencion): string { return ESTADO_BADGE[estado]; }

  estadoLabel(estado: EstadoAtencion): string {
    const labels: Record<EstadoAtencion, string> = {
      Abierta: 'Abierta', TerminadaServicio: 'Terminada', DerivoOT: 'Derivó a OT',
    };
    return labels[estado];
  }
}
