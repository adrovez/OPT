import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AnamnesisService } from '../../../core/services/anamnesis.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AnamnesisDto } from '../../../core/models/anamnesis.model';
import { AnamnesisFormComponent } from '../anamnesis-form/anamnesis-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-anamnesis-list',
  standalone: true,
  imports: [DatePipe, AnamnesisFormComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-4xl mx-auto">

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-24 gap-3">
          <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      }

      @else {

        <!-- Botón volver -->
        <button
          (click)="volver()"
          class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600
                 transition-colors mb-5 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg px-1"
          aria-label="Volver al cliente"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Volver al cliente
        </button>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Anamnesis</h1>
            <p class="text-sm text-gray-500 mt-0.5">{{ clienteNombre() }}</p>
          </div>
          <button
            (click)="abrirFormulario(null)"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                   text-white text-sm font-medium rounded-xl transition-colors shrink-0
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva anamnesis
          </button>
        </div>

        <!-- Error -->
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
            <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage() }}</p>
          </div>
        }

        <!-- Lista -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          @if (registros().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414
                     a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-sm font-medium text-gray-700">Sin registros de anamnesis</p>
              <p class="text-xs text-gray-400">
                Haga clic en "Nueva anamnesis" para registrar el primer historial de salud.
              </p>
            </div>

          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Condiciones
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Observación
                    </th>
                    <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (r of registros(); track r.anamnesisId) {
                    <tr class="hover:bg-gray-50/50 transition-colors">

                      <!-- Fecha -->
                      <td class="px-5 py-3.5 whitespace-nowrap">
                        <p class="text-sm font-medium text-gray-900">
                          {{ r.fechaRegistro | date:'dd/MM/yyyy' }}
                        </p>
                        <p class="text-xs text-gray-400">
                          {{ r.createdBy || '' }}
                        </p>
                      </td>

                      <!-- Condiciones -->
                      <td class="px-5 py-3.5">
                        <div class="flex flex-wrap gap-1.5">
                          @if (r.hipertension) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                              Hipertensión
                            </span>
                          }
                          @if (r.diabetes) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                              Diabetes
                            </span>
                          }
                          @if (r.alergias) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                              Alergias
                            </span>
                          }
                          @if (r.usaLentes) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                              Usa lentes
                            </span>
                          }
                          @if (!r.hipertension && !r.diabetes && !r.alergias && !r.usaLentes) {
                            <span class="text-xs text-gray-300 italic">Sin condiciones</span>
                          }
                        </div>
                      </td>

                      <!-- Observación -->
                      <td class="px-5 py-3.5 hidden md:table-cell">
                        <p class="text-sm text-gray-600 max-w-xs truncate">
                          {{ r.observacion || '—' }}
                        </p>
                      </td>

                      <!-- Acciones -->
                      <td class="px-5 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button
                            (click)="abrirFormulario(r)"
                            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [attr.aria-label]="'Editar anamnesis del ' + (r.fechaRegistro | date:'dd/MM/yyyy')"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                   m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            (click)="eliminar(r)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-500"
                            [attr.aria-label]="'Eliminar anamnesis del ' + (r.fechaRegistro | date:'dd/MM/yyyy')"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                                   m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

        </div>
      }
    </div>

    <!-- Modal formulario -->
    @if (showForm()) {
      <app-anamnesis-form
        [anamnesis]="seleccionada()"
        [clienteId]="clienteId()"
        (saved)="onFormSaved()"
        (cancelled)="cerrarFormulario()"
      />
    }
  `,
})
export class AnamnesisListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly anamnesisService = inject(AnamnesisService);
  private readonly clienteService = inject(ClienteService);

  readonly registros = signal<AnamnesisDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly clienteNombre = signal('');
  readonly showForm = signal(false);
  readonly seleccionada = signal<AnamnesisDto | null>(null);
  readonly clienteId = signal('');

  private static readonly UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    if (!AnamnesisListComponent.UUID_RE.test(id)) {
      this.errorMessage.set('ID de cliente inválido.');
      this.loading.set(false);
      return;
    }

    this.clienteId.set(id);

    this.clienteService.getCliente(id).subscribe({
      next: (c) => this.clienteNombre.set(c.nombre),
      error: () => this.clienteNombre.set('Cliente'),
    });

    this.cargarAnamnesis(id);
  }

  cargarAnamnesis(clienteId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.anamnesisService.getByCliente(clienteId).subscribe({
      next: (lista) => {
        this.registros.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los registros. Verifique la conexión.');
        this.loading.set(false);
      },
    });
  }

  abrirFormulario(r: AnamnesisDto | null): void {
    this.seleccionada.set(r);
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.seleccionada.set(null);
  }

  onFormSaved(): void {
    this.cerrarFormulario();
    this.anamnesisService.getByCliente(this.clienteId()).subscribe({
      next: (lista) => this.registros.set(lista),
    });
  }

  eliminar(r: AnamnesisDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar anamnesis?',
      html: `¿Está seguro que desea eliminar este registro?<br>
             <span class="text-sm text-gray-500">Esta acción no se puede deshacer.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.anamnesisService.delete(r.anamnesisId).subscribe({
        next: () => {
          this.registros.update((list) => list.filter((a) => a.anamnesisId !== r.anamnesisId));
          Swal.fire({
            icon: 'success',
            title: 'Registro eliminado',
            confirmButtonColor: '#2563eb',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el registro. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          }),
      });
    });
  }

  volver(): void {
    this.router.navigate(['/clientes', this.clienteId()]);
  }
}
