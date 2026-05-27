import { Component, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { AgendaDto, CreateAgendaRequest, EstadoAgenda, UpdateAgendaRequest } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Cliente } from '../../../core/models/cliente.model';
import { UsuarioDto } from '../../../core/models/usuario.model';
import Swal from 'sweetalert2';

const DURACIONES = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 h 30 min' },
  { value: 120, label: '2 horas' },
];

const ESTADOS: EstadoAgenda[] = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'NoShow'];

const ESTADO_PILL: Record<EstadoAgenda, string> = {
  Pendiente:  'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100',
  Confirmada: 'bg-green-50 border border-green-300 text-green-700 hover:bg-green-100',
  Atendida:   'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200',
  Cancelada:  'bg-red-50 border border-red-300 text-red-600 hover:bg-red-100',
  NoShow:     'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100',
};

const ESTADO_PILL_ACTIVE: Record<EstadoAgenda, string> = {
  Pendiente:  'bg-blue-600 border border-blue-600 text-white ring-2 ring-blue-500 ring-offset-1',
  Confirmada: 'bg-green-600 border border-green-600 text-white ring-2 ring-green-500 ring-offset-1',
  Atendida:   'bg-gray-500 border border-gray-500 text-white ring-2 ring-gray-400 ring-offset-1',
  Cancelada:  'bg-red-500 border border-red-500 text-white ring-2 ring-red-400 ring-offset-1',
  NoShow:     'bg-amber-500 border border-amber-500 text-white ring-2 ring-amber-400 ring-offset-1',
};

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="isEditing() ? 'Editar cita' : 'Nueva cita'"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isEditing() ? 'Editar cita' : 'Nueva cita' }}
            </h2>
            @if (isEditing()) {
              <p class="text-xs text-gray-400 mt-0.5">{{ agendaParaEditar()!.clienteNombre }}</p>
            }
          </div>
          <button
            type="button"
            (click)="onCancel()"
            class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none
                   focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Estado (solo edición) -->
          @if (isEditing()) {
            <div>
              <p class="text-sm font-medium text-gray-700 mb-2">Estado</p>
              <div class="flex flex-wrap gap-2">
                @for (est of estados; track est) {
                  <button
                    type="button"
                    (click)="cambiarEstado(est)"
                    [disabled]="loading()"
                    class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:cursor-not-allowed"
                    [class]="currentEstado() === est ? estadoPillActive(est) : estadoPill(est)"
                  >
                    {{ est }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Cliente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Cliente <span class="text-red-500">*</span>
            </label>
            @if (isEditing()) {
              <div class="px-3.5 py-2.5 text-sm bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {{ agendaParaEditar()!.clienteNombre }}
              </div>
            } @else {
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  autocomplete="off"
                  [value]="clienteSearch()"
                  (input)="onClienteSearchInput($any($event.target).value)"
                  (blur)="onClienteBlur()"
                  (focus)="showDropdown.set(clienteResults().length > 0)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class.border-red-300]="!!clienteError()"
                  [class.border-gray-200]="!clienteError()"
                />
                @if (showDropdown() && clienteResults().length > 0) {
                  <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200
                              rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    @for (c of clienteResults(); track c.clienteId) {
                      <button
                        type="button"
                        (mousedown)="selectCliente(c)"
                        class="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between
                               hover:bg-blue-50 transition-colors"
                      >
                        <span class="font-medium text-gray-900">{{ c.nombre }}</span>
                        <span class="text-gray-400 text-xs ml-3 shrink-0">{{ c.numeroDocumento }}</span>
                      </button>
                    }
                  </div>
                }
                @if (clienteError()) {
                  <p class="mt-1 text-xs text-red-600">{{ clienteError() }}</p>
                }
              </div>
            }
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="ag-fecha" class="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                id="ag-fecha"
                type="date"
                [value]="fecha()"
                (input)="fecha.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-300]="!!fechaError()"
                [class.border-gray-200]="!fechaError()"
              />
              @if (fechaError()) {
                <p class="mt-1 text-xs text-red-600">{{ fechaError() }}</p>
              }
            </div>
            <div>
              <label for="ag-hora" class="block text-sm font-medium text-gray-700 mb-1.5">
                Hora <span class="text-red-500">*</span>
              </label>
              <input
                id="ag-hora"
                type="time"
                step="900"
                [value]="hora()"
                (input)="hora.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Duración -->
          <div>
            <label for="ag-duracion" class="block text-sm font-medium text-gray-700 mb-1.5">Duración</label>
            <select
              id="ag-duracion"
              [value]="duracion()"
              (change)="duracion.set(+$any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              @for (opt of duraciones; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <!-- Motivo -->
          <div>
            <label for="ag-motivo" class="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo <span class="text-red-500">*</span>
            </label>
            <input
              id="ag-motivo"
              type="text"
              maxlength="200"
              placeholder="Ej: Control visual, Entrega de lentes, Examen de fondo..."
              [value]="motivo()"
              (input)="motivo.set($any($event.target).value)"
              (blur)="motivoTouched.set(true)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!motivoError()"
              [class.border-gray-200]="!motivoError()"
            />
            @if (motivoError()) {
              <p class="mt-1 text-xs text-red-600">{{ motivoError() }}</p>
            }
          </div>

          <!-- Profesional -->
          <div>
            <label for="ag-profesional" class="block text-sm font-medium text-gray-700 mb-1.5">
              Profesional
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              id="ag-profesional"
              [value]="selectedUsuarioId()"
              (change)="selectedUsuarioId.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Sin asignar —</option>
              @for (u of usuarios(); track u.usuarioId) {
                <option [value]="u.usuarioId">{{ u.nombre }}</option>
              }
            </select>
          </div>

          <!-- Observaciones -->
          <div>
            <label for="ag-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
              Observaciones
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="ag-obs"
              rows="3"
              maxlength="500"
              placeholder="Notas adicionales sobre la cita..."
              [value]="observaciones()"
              (input)="observaciones.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

        </div>

        <!-- Footer -->
        <div
          class="flex items-center px-6 py-4 border-t border-gray-100 shrink-0 gap-3"
          [class.justify-between]="isEditing()"
          [class.justify-end]="!isEditing()"
        >
          @if (isEditing()) {
            <button
              type="button"
              (click)="onDelete()"
              [disabled]="loading()"
              class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border
                     border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          }

          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                     rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="loading()"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     disabled:bg-blue-400 disabled:cursor-not-allowed
                     rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              {{ isEditing() ? 'Guardar cambios' : 'Agendar cita' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class AgendaFormComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly clienteService = inject(ClienteService);
  private readonly usuarioService = inject(UsuarioService);

  readonly agendaParaEditar = input<AgendaDto | null>(null);
  readonly fechaHoraInicial = input<string | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly duraciones = DURACIONES;
  readonly estados = ESTADOS;

  // Form state
  readonly clienteSearch = signal('');
  readonly selectedClienteId = signal('');
  readonly clienteResults = signal<Cliente[]>([]);
  readonly showDropdown = signal(false);
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly duracion = signal(30);
  readonly motivo = signal('');
  readonly motivoTouched = signal(false);
  readonly selectedUsuarioId = signal('');
  readonly observaciones = signal('');
  readonly currentEstado = signal<EstadoAgenda>('Pendiente');
  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly loading = signal(false);
  readonly formTouched = signal(false);

  readonly isEditing = computed(() => !!this.agendaParaEditar());

  readonly clienteError = computed(() =>
    this.formTouched() && !this.isEditing() && !this.selectedClienteId()
      ? 'Seleccione un cliente'
      : ''
  );

  readonly fechaError = computed(() =>
    this.formTouched() && !this.fecha() ? 'Seleccione una fecha' : ''
  );

  readonly motivoError = computed(() =>
    (this.formTouched() || this.motivoTouched()) && !this.motivo().trim()
      ? 'El motivo es obligatorio'
      : ''
  );

  readonly formValid = computed(() => {
    const clienteOk = this.isEditing() || !!this.selectedClienteId();
    return clienteOk && !!this.fecha() && !!this.hora() && !!this.motivo().trim();
  });

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.usuarioService.getAll().subscribe({ next: us => this.usuarios.set(us) });

    const editing = this.agendaParaEditar();
    if (editing) {
      const [datePart, timePart] = editing.fechaHora.split('T');
      this.fecha.set(datePart);
      this.hora.set(timePart.substring(0, 5));
      this.duracion.set(editing.duracionMinutos);
      this.motivo.set(editing.motivo);
      this.observaciones.set(editing.observaciones ?? '');
      this.selectedUsuarioId.set(editing.usuarioId ?? '');
      this.currentEstado.set(editing.estado);
      return;
    }

    const initial = this.fechaHoraInicial();
    if (initial) {
      const [datePart, timePart] = initial.split('T');
      this.fecha.set(datePart);
      this.hora.set(timePart.substring(0, 5));
    }
  }

  estadoPill(estado: EstadoAgenda): string {
    return ESTADO_PILL[estado];
  }

  estadoPillActive(estado: EstadoAgenda): string {
    return ESTADO_PILL_ACTIVE[estado];
  }

  onClienteSearchInput(term: string): void {
    this.clienteSearch.set(term);
    this.selectedClienteId.set('');
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (!term.trim()) {
      this.clienteResults.set([]);
      this.showDropdown.set(false);
      return;
    }
    this.searchTimeout = setTimeout(() => {
      this.clienteService.getClientes(1, 8, term).subscribe({
        next: res => {
          this.clienteResults.set(res.items);
          this.showDropdown.set(res.items.length > 0);
        },
        error: () => {
          this.clienteResults.set([]);
          this.showDropdown.set(false);
        },
      });
    }, 300);
  }

  selectCliente(c: Cliente): void {
    this.selectedClienteId.set(c.clienteId);
    this.clienteSearch.set(c.nombre);
    this.clienteResults.set([]);
    this.showDropdown.set(false);
  }

  onClienteBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  cambiarEstado(estado: EstadoAgenda): void {
    const cita = this.agendaParaEditar();
    if (!cita || this.currentEstado() === estado) return;
    this.loading.set(true);
    this.agendaService.cambiarEstado(cita.agendaId, estado).subscribe({
      next: () => {
        this.loading.set(false);
        this.currentEstado.set(estado);
        this.saved.emit();
      },
      error: (err: { error?: { detail?: string } }) => this.handleError(err),
    });
  }

  onSubmit(): void {
    this.formTouched.set(true);
    this.motivoTouched.set(true);
    if (!this.formValid()) return;

    const fechaHoraStr = `${this.fecha()}T${this.hora()}:00`;
    const editing = this.agendaParaEditar();
    this.loading.set(true);

    if (editing) {
      const req: UpdateAgendaRequest = {
        fechaHora: fechaHoraStr,
        duracionMinutos: this.duracion(),
        motivo: this.motivo().trim(),
        observaciones: this.observaciones().trim() || undefined,
        usuarioId: this.selectedUsuarioId() || undefined,
      };
      this.agendaService.update(editing.agendaId, req).subscribe({
        next: () => this.onSuccess('actualizada'),
        error: (err: { error?: { detail?: string } }) => this.handleError(err),
      });
    } else {
      const req: CreateAgendaRequest = {
        clienteId: this.selectedClienteId(),
        fechaHora: fechaHoraStr,
        duracionMinutos: this.duracion(),
        motivo: this.motivo().trim(),
        observaciones: this.observaciones().trim() || undefined,
        usuarioId: this.selectedUsuarioId() || undefined,
      };
      this.agendaService.create(req).subscribe({
        next: () => this.onSuccess('agendada'),
        error: (err: { error?: { detail?: string } }) => this.handleError(err),
      });
    }
  }

  onDelete(): void {
    const cita = this.agendaParaEditar();
    if (!cita) return;
    Swal.fire({
      title: '¿Eliminar cita?',
      text: `Se eliminará la cita de ${cita.clienteNombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.loading.set(true);
      this.agendaService.delete(cita.agendaId).subscribe({
        next: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Cita eliminada',
            timer: 1800,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => this.saved.emit());
        },
        error: (err: { error?: { detail?: string } }) => this.handleError(err),
      });
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelled.emit();
  }

  private onSuccess(accion: string): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'success',
      title: `Cita ${accion}`,
      confirmButtonColor: '#2563eb',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => this.saved.emit());
  }

  private handleError(err: { error?: { detail?: string } }): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.error?.detail ?? 'No se pudo guardar la cita. Intente nuevamente.',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Cerrar',
    });
  }
}
