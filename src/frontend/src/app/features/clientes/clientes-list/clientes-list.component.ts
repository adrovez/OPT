import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, ClienteFormComponent],
  template: `
    <div class="p-6 lg:p-8">

      <!-- Header de página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ totalCount() | number }} registros en total
          </p>
        </div>
        <button
          (click)="abrirFormulario(null)"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                 text-white text-sm font-medium rounded-xl transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo cliente
        </button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="relative mb-4 max-w-sm">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="search"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          placeholder="Buscar por nombre o RUT..."
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200
                 rounded-xl hover:border-gray-300 transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Buscar clientes"
        />
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        @if (loading()) {
          <div class="flex items-center justify-center py-16 gap-3">
            <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="text-sm text-gray-500">Cargando clientes...</span>
          </div>
        } @else if (errorMessage()) {
          <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <svg class="w-10 h-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-gray-500">{{ errorMessage() }}</p>
            <button (click)="cargarClientes()" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Reintentar
            </button>
          </div>
        } @else if (clientes().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                   M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                   m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm font-medium text-gray-700">No se encontraron clientes</p>
            <p class="text-xs text-gray-400">Prueba con otro término de búsqueda o crea un nuevo cliente.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50">
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Contacto
                  </th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Previsión
                  </th>
                  <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (c of clientes(); track c.clienteId) {
                  <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                                    text-blue-700 text-xs font-bold shrink-0"
                             aria-hidden="true">
                          {{ initial(c.nombre) }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ c.nombre }}</p>
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium
                                       {{ c.tipoCliente === 'Empresa' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700' }}">
                            {{ c.tipoCliente }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-gray-600 font-mono text-xs">
                      {{ c.numeroDocumento }}
                    </td>
                    <td class="px-5 py-3.5 hidden md:table-cell">
                      <div class="text-gray-600">
                        @if (c.celular) { <p>{{ c.celular }}</p> }
                        @if (c.mail) { <p class="text-gray-400 text-xs truncate max-w-[200px]">{{ c.mail }}</p> }
                        @if (!c.celular && !c.mail) { <span class="text-gray-300">—</span> }
                      </div>
                    </td>
                    <td class="px-5 py-3.5 hidden lg:table-cell text-gray-600">
                      {{ c.tipoPrevision || '—' }}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          (click)="abrirFormulario(c)"
                          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [attr.aria-label]="'Editar ' + c.nombre"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                 m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          (click)="eliminarCliente(c)"
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-red-500"
                          [attr.aria-label]="'Eliminar ' + c.nombre"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p class="text-xs text-gray-500">
                Página {{ currentPage() }} de {{ totalPages() }}
              </p>
              <div class="flex items-center gap-1">
                <button
                  (click)="cambiarPagina(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Página anterior"
                >
                  Anterior
                </button>
                <button
                  (click)="cambiarPagina(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Página siguiente"
                >
                  Siguiente
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal formulario -->
    @if (showForm()) {
      <app-cliente-form
        [cliente]="clienteSeleccionado()"
        (saved)="onFormSaved()"
        (cancelled)="cerrarFormulario()"
      />
    }
  `,
})
export class ClientesListComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly showForm = signal(false);
  readonly clienteSeleccionado = signal<Cliente | null>(null);

  searchQuery = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly pageSize = 20;

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.clienteService
      .getClientes(this.currentPage(), this.pageSize, this.searchQuery || undefined)
      .subscribe({
        next: (response) => {
          this.clientes.set(response.items);
          this.totalCount.set(response.totalCount);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Error al cargar los clientes. Verifique la conexión.');
        },
      });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.cargarClientes();
    }, 350);
  }

  cambiarPagina(page: number): void {
    this.currentPage.set(page);
    this.cargarClientes();
  }

  abrirFormulario(cliente: Cliente | null): void {
    this.clienteSeleccionado.set(cliente);
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.clienteSeleccionado.set(null);
  }

  onFormSaved(): void {
    this.cerrarFormulario();
    this.cargarClientes();
  }

  eliminarCliente(cliente: Cliente): void {
    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar al cliente "${cliente.nombre}"?\nEsta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    this.clienteService.deleteCliente(cliente.clienteId).subscribe({
      next: () => this.cargarClientes(),
      error: () => window.alert('Error al eliminar el cliente. Intente nuevamente.'),
    });
  }

  initial(nombre: string): string {
    return nombre?.charAt(0).toUpperCase() ?? '?';
  }
}
