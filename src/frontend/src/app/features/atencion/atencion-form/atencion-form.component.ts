import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AtencionService } from '../../../core/services/atencion.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Cliente } from '../../../core/models/cliente.model';
import { UsuarioDto } from '../../../core/models/usuario.model';
import Swal from 'sweetalert2';

function pad(n: number): string { return String(n).padStart(2, '0'); }

@Component({
  selector: 'app-atencion-form',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col h-full bg-gray-50">

      <!-- Header -->
      <div class="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <button
          type="button"
          (click)="volver()"
          class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none
                 focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
          aria-label="Volver"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-lg font-semibold text-gray-900">Nueva atención</h1>
          @if (desdeAgenda()) {
            <p class="text-xs text-blue-600 mt-0.5">Iniciada desde cita agendada</p>
          }
        </div>
      </div>

      <!-- Form -->
      <div class="flex-1 overflow-auto p-6">
        <div class="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

          <!-- Cliente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Cliente <span class="text-red-500">*</span>
            </label>
            @if (desdeAgenda()) {
              <div class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                {{ clienteNombreDisplay() }}
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
              <label for="at-fecha" class="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                id="at-fecha"
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
              <label for="at-hora" class="block text-sm font-medium text-gray-700 mb-1.5">
                Hora <span class="text-red-500">*</span>
              </label>
              <input
                id="at-hora"
                type="time"
                [value]="hora()"
                (input)="hora.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Profesional -->
          <div>
            <label for="at-profesional" class="block text-sm font-medium text-gray-700 mb-1.5">
              Profesional <span class="text-red-500">*</span>
            </label>
            <select
              id="at-profesional"
              [value]="selectedUsuarioId()"
              (change)="selectedUsuarioId.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!usuarioError()"
              [class.border-gray-200]="!usuarioError()"
            >
              <option value="">— Seleccionar profesional —</option>
              @for (u of usuarios(); track u.usuarioId) {
                <option [value]="u.usuarioId">{{ u.nombre }}</option>
              }
            </select>
            @if (usuarioError()) {
              <p class="mt-1 text-xs text-red-600">{{ usuarioError() }}</p>
            }
          </div>

          <!-- Motivo -->
          <div>
            <label for="at-motivo" class="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo <span class="text-red-500">*</span>
            </label>
            <input
              id="at-motivo"
              type="text"
              maxlength="300"
              placeholder="Ej: Control visual, Entrega de lentes, Examen de fondo..."
              [value]="motivo()"
              (input)="motivo.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border hover:border-gray-300 bg-white
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!motivoError()"
              [class.border-gray-200]="!motivoError()"
            />
            @if (motivoError()) {
              <p class="mt-1 text-xs text-red-600">{{ motivoError() }}</p>
            }
          </div>

          <!-- Observaciones -->
          <div>
            <label for="at-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
              Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="at-obs"
              rows="3"
              maxlength="2000"
              placeholder="Notas adicionales..."
              [value]="observaciones()"
              (input)="observaciones.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white
                     transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Acciones -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="volver()"
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
              Registrar atención
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class AtencionFormComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly agendaService = inject(AgendaService);
  private readonly clienteService = inject(ClienteService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // Agenda origin state
  readonly agendaId = signal<string | null>(null);
  readonly desdeAgenda = signal(false);
  readonly clienteNombreDisplay = signal('');
  readonly selectedClienteId = signal('');

  // Walk-in autocomplete
  readonly clienteSearch = signal('');
  readonly clienteResults = signal<Cliente[]>([]);
  readonly showDropdown = signal(false);

  // Form fields
  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly motivo = signal('');
  readonly selectedUsuarioId = signal('');
  readonly observaciones = signal('');
  readonly loading = signal(false);
  readonly formTouched = signal(false);

  // Validation
  readonly clienteError = computed(() =>
    this.formTouched() && !this.desdeAgenda() && !this.selectedClienteId()
      ? 'Seleccione un cliente' : ''
  );
  readonly fechaError = computed(() =>
    this.formTouched() && !this.fecha() ? 'Seleccione una fecha' : ''
  );
  readonly motivoError = computed(() =>
    this.formTouched() && !this.motivo().trim() ? 'El motivo es obligatorio' : ''
  );
  readonly usuarioError = computed(() =>
    this.formTouched() && !this.selectedUsuarioId() ? 'Seleccione un profesional' : ''
  );
  readonly formValid = computed(() => {
    const clienteOk = this.desdeAgenda() || !!this.selectedClienteId();
    return clienteOk && !!this.fecha() && !!this.hora() && !!this.motivo().trim() && !!this.selectedUsuarioId();
  });

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.usuarioService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: us => this.usuarios.set(us) });

    // Default: today + current hour
    const now = new Date();
    this.fecha.set(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    this.hora.set(`${pad(now.getHours())}:00`);

    const agendaId = this.route.snapshot.queryParamMap.get('agendaId');
    if (agendaId) {
      this.agendaId.set(agendaId);
      this.desdeAgenda.set(true);
      this.loadAgendaData(agendaId);
    }
  }

  private loadAgendaData(agendaId: string): void {
    this.loading.set(true);
    this.agendaService.getById(agendaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: agenda => {
          this.selectedClienteId.set(agenda.clienteId);
          this.clienteNombreDisplay.set(agenda.clienteNombre);
          const [datePart, timePart] = agenda.fechaHora.split('T');
          this.fecha.set(datePart);
          this.hora.set(timePart.substring(0, 5));
          this.motivo.set(agenda.motivo);
          if (agenda.usuarioId) this.selectedUsuarioId.set(agenda.usuarioId);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'warning',
            title: 'Cita no encontrada',
            text: 'No se pudieron obtener los datos de la cita. Complete el formulario manualmente.',
            confirmButtonColor: '#2563eb',
          });
          this.desdeAgenda.set(false);
        },
      });
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
      this.clienteService.getClientes(1, 8, term)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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

  onSubmit(): void {
    this.formTouched.set(true);
    if (!this.formValid()) return;

    this.loading.set(true);
    this.atencionService.create({
      agendaId: this.agendaId() ?? undefined,
      clienteId: this.selectedClienteId(),
      usuarioAtencionId: this.selectedUsuarioId(),
      fechaHoraAtencion: `${this.fecha()}T${this.hora()}:00`,
      motivo: this.motivo().trim(),
      observaciones: this.observaciones().trim() || undefined,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Atención registrada',
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => this.router.navigate(['/atenciones']));
      },
      error: (err: { error?: { detail?: string } }) => {
        this.loading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.detail ?? 'No se pudo registrar la atención.',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/atenciones']);
  }
}
