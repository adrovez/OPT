import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SucursalService } from '../../../core/services/sucursal.service';
import { SucursalDto } from '../../../core/models/sucursal.model';
import { SucursalFormComponent } from '../sucursal-form/sucursal-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sucursales-list',
  standalone: true,
  imports: [DatePipe, SucursalFormComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-5xl mx-auto">

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

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Sucursales</h1>
            <p class="text-sm text-gray-500 mt-0.5">Gestión de sucursales de la óptica</p>
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
            Nueva sucursal
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

          @if (sucursales().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                     M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <p class="text-sm font-medium text-gray-700">Sin sucursales registradas</p>
              <p class="text-xs text-gray-400">
                Haga clic en "Nueva sucursal" para registrar la primera.
              </p>
            </div>

          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Dirección
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Teléfono
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (s of sucursales(); track s.sucursalId) {
                    <tr class="hover:bg-gray-50/50 transition-colors">

                      <!-- Nombre -->
                      <td class="px-5 py-3.5">
                        <p class="text-sm font-medium text-gray-900">{{ s.nombre }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">
                          Desde {{ s.fechaRegistro | date:'dd/MM/yyyy' }}
                        </p>
                      </td>

                      <!-- Dirección -->
                      <td class="px-5 py-3.5 hidden md:table-cell">
                        <p class="text-sm text-gray-600 max-w-xs truncate">
                          {{ s.direccion || '—' }}
                        </p>
                      </td>

                      <!-- Teléfono -->
                      <td class="px-5 py-3.5 hidden lg:table-cell">
                        <p class="text-sm text-gray-600">
                          {{ s.telefono || '—' }}
                        </p>
                      </td>

                      <!-- Tipo -->
                      <td class="px-5 py-3.5">
                        @if (s.matriz) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                            Matriz
                          </span>
                        } @else {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200">
                            Sucursal
                          </span>
                        }
                      </td>

                      <!-- Acciones -->
                      <td class="px-5 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button
                            (click)="abrirFormulario(s)"
                            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [attr.aria-label]="'Editar ' + s.nombre"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                   m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            (click)="eliminar(s)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-500"
                            [attr.aria-label]="'Eliminar ' + s.nombre"
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
      <app-sucursal-form
        [sucursal]="seleccionada()"
        (saved)="onFormSaved()"
        (cancelled)="cerrarFormulario()"
      />
    }
  `,
})
export class SucursalesListComponent implements OnInit {
  private readonly sucursalService = inject(SucursalService);

  readonly sucursales = signal<SucursalDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly showForm = signal(false);
  readonly seleccionada = signal<SucursalDto | null>(null);

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.sucursalService.getAll().subscribe({
      next: (lista) => {
        this.sucursales.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar las sucursales. Verifique la conexión.');
        this.loading.set(false);
      },
    });
  }

  abrirFormulario(s: SucursalDto | null): void {
    this.seleccionada.set(s);
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.seleccionada.set(null);
  }

  onFormSaved(): void {
    this.cerrarFormulario();
    this.cargarSucursales();
  }

  eliminar(s: SucursalDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar sucursal?',
      html: `¿Está seguro que desea eliminar <strong>${s.nombre}</strong>?<br>
             <span class="text-sm text-gray-500">Esta acción no se puede deshacer.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.sucursalService.delete(s.sucursalId).subscribe({
        next: () => {
          this.sucursales.update((list) => list.filter((x) => x.sucursalId !== s.sucursalId));
          Swal.fire({
            icon: 'success',
            title: 'Sucursal eliminada',
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
            text: 'No se pudo eliminar la sucursal. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          }),
      });
    });
  }
}
