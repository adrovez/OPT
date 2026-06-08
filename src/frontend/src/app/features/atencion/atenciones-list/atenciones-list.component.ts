import { Component, inject, signal, DestroyRef, effect, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AtencionDto, EstadoAtencion, RegistrarCobroRequest } from '../../../core/models/atencion.model';
import { AgendaDto } from '../../../core/models/agenda.model';
import { FormaPagoDto } from '../../../core/models/forma-pago.model';
import { AtencionService } from '../../../core/services/atencion.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { FormaPagoService } from '../../../core/services/forma-pago.service';
import { SucursalContextService } from '../../../core/services/sucursal-context.service';
import Swal from 'sweetalert2';

type Tab = 'sala' | 'historial';

const ESTADO_BADGE: Record<EstadoAtencion, string> = {
  Abierta:   'bg-blue-50 text-blue-700 border border-blue-200',
  Terminada: 'bg-amber-50 text-amber-700 border border-amber-200',
  Pagada:    'bg-green-50 text-green-700 border border-green-200',
  DerivoOT:  'bg-purple-50 text-purple-700 border border-purple-200',
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
              <p class="text-sm">No hay citas ingresadas para hoy</p>
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
            <option value="Terminada">Terminada</option>
            <option value="Pagada">Pagada</option>
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
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (at of historial(); track at.atencionId) {
                  <tr class="hover:bg-gray-50 transition-colors">
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
                    <td class="px-6 py-3.5">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- Ver -->
                        <button
                          type="button"
                          (click)="verDetalle(at.atencionId)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                                 text-gray-600 bg-white border border-gray-200 rounded-lg
                                 hover:bg-gray-50 hover:text-gray-800 transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          title="Ver detalle"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                                 -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          Ver
                        </button>

                        <!-- Pagar: Abierta o Terminada (sin cobro por definición) -->
                        @if (at.estado === 'Abierta' || at.estado === 'Terminada') {
                          <button
                            type="button"
                            (click)="abrirModalCobro(at)"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                                   text-white bg-blue-600 rounded-lg hover:bg-blue-700
                                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Registrar cobro"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            Pagar
                          </button>
                        }

                        <!-- Derivar OT: solo Abierta -->
                        @if (at.estado === 'Abierta') {
                          <button
                            type="button"
                            (click)="derivarOT(at)"
                            [disabled]="derivandoId() === at.atencionId"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                                   text-white bg-purple-600 rounded-lg hover:bg-purple-700
                                   disabled:bg-purple-400 disabled:cursor-not-allowed
                                   transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                            title="Derivar a Orden de Trabajo"
                          >
                            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                            OT
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

    </div>

    <!-- Modal: Registrar Cobro -->
    @if (modalCobroAbierto() && modalAtencion()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background: rgba(0,0,0,0.45)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">

          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-base font-semibold text-gray-900">Registrar cobro</h2>
              <p class="text-xs text-gray-500 mt-0.5">{{ modalAtencion()!.clienteNombre }}</p>
            </div>
            <button type="button" (click)="cerrarModalCobro()"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          @if (modalAtencion()!.estado === 'Abierta') {
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-xs text-amber-700">La atención se terminará y se registrará el cobro.</p>
            </div>
          }

          <div>
            <label for="cobro-fp" class="block text-sm font-medium text-gray-700 mb-1.5">
              Forma de pago <span class="text-red-500">*</span>
            </label>
            <select
              id="cobro-fp"
              [value]="cobroFormaPagoId()"
              (change)="cobroFormaPagoId.set(+$any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="cobroTouched() && !cobroFormaPagoId()"
              [class.border-gray-200]="!(cobroTouched() && !cobroFormaPagoId())"
            >
              <option [value]="0">— Seleccionar —</option>
              @for (fp of formasPago(); track fp.formaPagoId) {
                <option [value]="fp.formaPagoId">{{ fp.descripcion }}</option>
              }
            </select>
            @if (cobroTouched() && !cobroFormaPagoId()) {
              <p class="mt-1 text-xs text-red-600">Seleccione una forma de pago</p>
            }
          </div>

          <div>
            <label for="cobro-monto" class="block text-sm font-medium text-gray-700 mb-1.5">
              Monto <span class="text-red-500">*</span>
            </label>
            <input
              id="cobro-monto"
              type="number"
              min="1"
              placeholder="0"
              [value]="cobroMonto()"
              (input)="cobroMonto.set(+$any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="cobroTouched() && cobroMonto() <= 0"
              [class.border-gray-200]="!(cobroTouched() && cobroMonto() <= 0)"
            />
            @if (cobroTouched() && cobroMonto() <= 0) {
              <p class="mt-1 text-xs text-red-600">Ingrese un monto mayor a 0</p>
            }
          </div>

          <div class="flex gap-3 pt-1">
            <button type="button" (click)="cerrarModalCobro()"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                     rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
              Cancelar
            </button>
            <button type="button" (click)="confirmarCobro()" [disabled]="cobroLoading()"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                     text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                     rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              @if (cobroLoading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              Confirmar cobro
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class AtencionesListComponent {
  private readonly atencionService  = inject(AtencionService);
  private readonly agendaService    = inject(AgendaService);
  private readonly formaPagoService = inject(FormaPagoService);
  private readonly sucursalContext  = inject(SucursalContextService);
  private readonly router           = inject(Router);
  private readonly destroyRef       = inject(DestroyRef);

  readonly activeTab = signal<Tab>('sala');
  readonly sala = signal<AgendaDto[]>([]);
  readonly historial = signal<AtencionDto[]>([]);
  readonly loading = signal(false);

  readonly today = new Date();
  readonly filtroDesde = signal(formatDate(new Date()));
  readonly filtroHasta = signal(formatDate(new Date()));
  readonly filtroEstado = signal('');

  // Modal cobro
  readonly modalCobroAbierto = signal(false);
  readonly modalAtencion = signal<AtencionDto | null>(null);
  readonly formasPago = signal<FormaPagoDto[]>([]);
  readonly cobroFormaPagoId = signal(0);
  readonly cobroMonto = signal(0);
  readonly cobroTouched = signal(false);
  readonly cobroLoading = signal(false);

  // Derivar OT
  readonly derivandoId = signal<string | null>(null);

  readonly formatFecha = formatFecha;
  readonly formatHora = formatHora;

  constructor() {
    effect(() => {
      const sucursal = this.sucursalContext.sucursalActual();
      if (!sucursal) return;
      untracked(() => {
        this.historial.set([]);
        this.cargarSala();
      });
    });
    this.formaPagoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: fps => this.formasPago.set(fps) });
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
      estado: 'Ingresado',
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

  // ─── Cobro modal ─────────────────────────────────────────────────────────────

  abrirModalCobro(at: AtencionDto): void {
    this.modalAtencion.set(at);
    this.cobroFormaPagoId.set(0);
    this.cobroMonto.set(0);
    this.cobroTouched.set(false);
    this.modalCobroAbierto.set(true);
  }

  cerrarModalCobro(): void {
    if (this.cobroLoading()) return;
    this.modalCobroAbierto.set(false);
    this.modalAtencion.set(null);
  }

  confirmarCobro(): void {
    this.cobroTouched.set(true);
    if (!this.cobroFormaPagoId() || this.cobroMonto() <= 0) return;

    const at = this.modalAtencion()!;
    this.cobroLoading.set(true);

    const registrar = () => {
      const req: RegistrarCobroRequest = {
        formaPagoId: this.cobroFormaPagoId(),
        monto: this.cobroMonto(),
      };
      this.atencionService.registrarCobro(at.atencionId, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.cobroLoading.set(false);
            this.cerrarModalCobro();
            this.buscarHistorial();
            Swal.fire({ icon: 'success', title: 'Cobro registrado',
              timer: 1800, timerProgressBar: true, showConfirmButton: false });
          },
          error: (err: { error?: { detail?: string } }) => {
            this.cobroLoading.set(false);
            Swal.fire({ icon: 'error', title: 'Error',
              text: err.error?.detail ?? 'No se pudo registrar el cobro.', confirmButtonColor: '#2563eb' });
          },
        });
    };

    if (at.estado === 'Abierta') {
      this.atencionService.terminar(at.atencionId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => registrar(),
          error: (err: { error?: { detail?: string } }) => {
            this.cobroLoading.set(false);
            Swal.fire({ icon: 'error', title: 'Error',
              text: err.error?.detail ?? 'No se pudo terminar la atención.', confirmButtonColor: '#2563eb' });
          },
        });
    } else {
      registrar();
    }
  }

  // ─── Derivar OT ──────────────────────────────────────────────────────────────

  derivarOT(at: AtencionDto): void {
    Swal.fire({
      title: '¿Derivar a Orden de Trabajo?',
      text: 'La atención pasará a "Derivó a OT". Esta acción no se puede revertir.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#7c3aed', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, derivar',
    }).then(res => {
      if (!res.isConfirmed) return;
      this.derivandoId.set(at.atencionId);
      this.atencionService.derivarAOT(at.atencionId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.derivandoId.set(null);
            this.router.navigate(['/ordenes-trabajo/nueva'], {
              state: {
                clienteId: at.clienteId,
                clienteNombre: at.clienteNombre,
                recetaCristalesId: at.recetaCristalesId,
              },
            });
          },
          error: (err: { error?: { detail?: string } }) => {
            this.derivandoId.set(null);
            Swal.fire({ icon: 'error', title: 'Error',
              text: err.error?.detail ?? 'No se pudo derivar la atención.', confirmButtonColor: '#2563eb' });
          },
        });
    });
  }

  estadoBadge(estado: EstadoAtencion): string { return ESTADO_BADGE[estado]; }

  estadoLabel(estado: EstadoAtencion): string {
    const labels: Record<EstadoAtencion, string> = {
      Abierta: 'Abierta', Terminada: 'Terminada', Pagada: 'Pagada', DerivoOT: 'Derivó a OT',
    };
    return labels[estado];
  }
}
