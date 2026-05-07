import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClienteService } from '../../../core/services/cliente.service';
import { RegionService } from '../../../core/services/region.service';
import { Cliente } from '../../../core/models/cliente.model';
import { RegionWithComunas } from '../../../core/models/region.model';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6 lg:p-8 max-w-3xl mx-auto">

      <!-- ── Loading ───────────────────────────────────────────────────────── -->
      @if (loading()) {
        <div class="flex items-center justify-center py-24 gap-3">
          <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-500">Cargando cliente...</span>
        </div>
      }

      <!-- ── Error ─────────────────────────────────────────────────────────── -->
      @else if (error()) {
        <div class="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <svg class="w-12 h-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm font-medium text-gray-700">{{ error() }}</p>
          <button (click)="volver()" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Volver al listado
          </button>
        </div>
      }

      <!-- ── Contenido ──────────────────────────────────────────────────────── -->
      @else if (cliente()) {

        <!-- Header -->
        <div class="mb-6">

          <!-- Botón volver -->
          <button (click)="volver()"
            class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600
                   transition-colors mb-5 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg px-1"
            aria-label="Volver al listado">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>

          <!-- Card de identidad -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center gap-5">

              <!-- Avatar con inicial -->
              <div class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                          text-xl font-bold select-none
                          {{ cliente()!.tipoCliente === 'Empresa'
                             ? 'bg-purple-100 text-purple-700'
                             : 'bg-blue-100 text-blue-700' }}"
                   aria-hidden="true">
                {{ inicial() }}
              </div>

              <!-- Nombre, tipo y RUT -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 class="text-lg font-bold text-gray-900 leading-tight">{{ cliente()!.nombre }}</h1>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                               {{ cliente()!.tipoCliente === 'Empresa'
                                  ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                                  : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' }}">
                    {{ cliente()!.tipoCliente }}
                  </span>
                </div>
                <p class="text-sm text-gray-400 font-mono tracking-wide">
                  {{ cliente()!.numeroDocumento }}
                </p>
              </div>

            </div>
          </div>

        </div>

        <div class="space-y-4">

          <!-- ════════════════════ EMPRESA ════════════════════ -->
          @if (cliente()!.tipoCliente === 'Empresa') {

            <!-- Sección Información -->
            <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Información
              </h2>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Dirección</dt>
                  <dd class="text-sm text-gray-900">{{ cliente()!.direccion || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Comuna</dt>
                  <dd class="text-sm text-gray-900">{{ nombreComuna() }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-xs text-gray-400 mb-0.5">Giro comercial</dt>
                  <dd class="text-sm text-gray-900">{{ cliente()!.giro || '—' }}</dd>
                </div>
              </dl>
            </section>

            <!-- Sección Contactos -->
            <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Contactos
                <span class="ml-1.5 font-normal normal-case">
                  ({{ cliente()!.contactos?.length ?? 0 }})
                </span>
              </h2>

              @if (!cliente()!.contactos?.length) {
                <p class="text-sm text-gray-400 italic">Sin contactos registrados.</p>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-sm" aria-label="Contactos">
                    <thead>
                      <tr class="border-b border-gray-100">
                        <th class="text-left py-2 pr-4 text-xs font-semibold text-gray-500
                                   uppercase tracking-wider whitespace-nowrap">Nombre</th>
                        <th class="text-left py-2 pr-4 text-xs font-semibold text-gray-500
                                   uppercase tracking-wider whitespace-nowrap">Cargo</th>
                        <th class="text-left py-2 pr-4 text-xs font-semibold text-gray-500
                                   uppercase tracking-wider whitespace-nowrap">Mail</th>
                        <th class="text-left py-2 text-xs font-semibold text-gray-500
                                   uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (ct of cliente()!.contactos; track $index) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="py-2.5 pr-4 font-medium text-gray-900 whitespace-nowrap">
                            {{ ct.nombre }}
                          </td>
                          <td class="py-2.5 pr-4 text-gray-500">{{ ct.cargo || '—' }}</td>
                          <td class="py-2.5 pr-4 text-gray-500 break-all">{{ ct.email || '—' }}</td>
                          <td class="py-2.5 text-gray-500">{{ ct.telefono || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>

          }

          <!-- ════════════════════ PERSONA ════════════════════ -->
          @if (cliente()!.tipoCliente === 'Persona') {

            <!-- Sección Información -->
            <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Información
              </h2>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Fecha de nacimiento</dt>
                  <dd class="text-sm text-gray-900">
                    {{ cliente()!.fechaNacimiento
                       ? (cliente()!.fechaNacimiento | date:'dd/MM/yyyy')
                       : '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Previsión</dt>
                  <dd class="text-sm text-gray-900">{{ cliente()!.tipoPrevision || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Teléfono</dt>
                  <dd class="text-sm text-gray-900">{{ cliente()!.celular || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Mail</dt>
                  <dd class="text-sm text-gray-900 break-all">{{ cliente()!.mail || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Dirección</dt>
                  <dd class="text-sm text-gray-900">{{ cliente()!.direccion || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400 mb-0.5">Comuna</dt>
                  <dd class="text-sm text-gray-900">{{ nombreComuna() }}</dd>
                </div>
              </dl>
            </section>

          }

          <!-- ════════ Sección Auditoría (común a ambos tipos) ════════ -->
          <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Auditoría
            </h2>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt class="text-xs text-gray-400 mb-0.5">Fecha de creación</dt>
                <dd class="text-sm text-gray-900">
                  {{ cliente()!.createdAt
                     ? (cliente()!.createdAt | date:'dd/MM/yyyy HH:mm')
                     : '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400 mb-0.5">Creado por</dt>
                <dd class="text-sm text-gray-900">{{ cliente()!.createdBy || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400 mb-0.5">Fecha de edición</dt>
                <dd class="text-sm text-gray-900">
                  {{ cliente()!.updatedAt
                     ? (cliente()!.updatedAt | date:'dd/MM/yyyy HH:mm')
                     : '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400 mb-0.5">Editado por</dt>
                <dd class="text-sm text-gray-900">{{ cliente()!.updatedBy || '—' }}</dd>
              </div>
            </dl>
          </section>

        </div>
      }
    </div>
  `,
})
export class ClienteDetailComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly router   = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly regionService  = inject(RegionService);

  readonly cliente  = signal<Cliente | null>(null);
  readonly loading  = signal(true);
  readonly error    = signal('');

  private regiones: RegionWithComunas[] = [];

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.error.set('ID de cliente inválido.');
      this.loading.set(false);
      return;
    }

    // Cargar regiones (para resolver nombre de comuna) y cliente en paralelo
    this.regionService.getRegionesWithComunas().subscribe(r => (this.regiones = r));

    this.clienteService.getCliente(id).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se encontró el cliente o no tiene permisos para verlo.');
        this.loading.set(false);
      },
    });
  }

  // ── Helpers de vista ──────────────────────────────────────────────────────
  inicial(): string {
    return this.cliente()?.nombre?.charAt(0).toUpperCase() ?? '?';
  }

  nombreComuna(): string {
    const idComuna = this.cliente()?.idComuna;
    if (!idComuna) return '—';
    for (const region of this.regiones) {
      const c = region.comunas.find(c => c.idComuna === idComuna);
      if (c) return `${c.nombre} (${region.nombre})`;
    }
    return String(idComuna);
  }

  // ── Navegación ────────────────────────────────────────────────────────────
  volver(): void {
    this.router.navigate(['/clientes']);
  }

}

