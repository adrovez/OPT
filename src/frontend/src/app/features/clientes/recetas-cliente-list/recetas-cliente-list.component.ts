import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RecetaCristalesService } from '../../../core/services/receta-cristales.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { RecetaCristalesDto } from '../../../core/models/receta-cristales.model';

@Component({
  selector: 'app-recetas-cliente-list',
  standalone: true,
  imports: [DatePipe],
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
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Recetas de cristales</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ clienteNombre() }}</p>
        </div>

        <!-- Error -->
        @if (errorMessage()) {
          <div class="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {{ errorMessage() }}
          </div>
        }

        <!-- Sin registros -->
        @else if (!recetas().length) {
          <div class="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293
                   l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm text-gray-500">Sin recetas registradas para este cliente.</p>
          </div>
        }

        <!-- Tabla -->
        @else {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-sm" aria-label="Recetas de cristales">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Distancia
                  </th>
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Indicadores
                  </th>
                  <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (r of recetas(); track r.recetaCristalesId) {
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {{ r.fechaIngreso | date:'dd/MM/yyyy' }}
                    </td>
                    <td class="px-5 py-3.5">
                      <div class="flex gap-1.5 flex-wrap">
                        @if (r.checkLejos) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                            Lejos
                          </span>
                        }
                        @if (r.checkCerca) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200">
                            Cerca
                          </span>
                        }
                        @if (!r.checkLejos && !r.checkCerca) {
                          <span class="text-xs text-gray-400">—</span>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-3.5 hidden sm:table-cell">
                      <div class="flex gap-1.5 flex-wrap">
                        @if (r.checkCristalesLaboratorio) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200">
                            Lab.
                          </span>
                        }
                        @if (r.checkUrgente) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                            Urgente
                          </span>
                        }
                        @if (!r.checkCristalesLaboratorio && !r.checkUrgente) {
                          <span class="text-xs text-gray-400">—</span>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <button
                        (click)="verReceta(r)"
                        class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Ver receta"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                               -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

      }
    </div>

    <!-- Modal detalle receta -->
    @if (recetaDetalle()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle receta de cristales"
        (click)="cerrarDetalle()"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Header modal -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Receta de cristales</h2>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ recetaDetalle()!.fechaIngreso | date:'dd/MM/yyyy' }}
              </p>
            </div>
            <button
              type="button"
              (click)="cerrarDetalle()"
              class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none
                     focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Cuerpo modal -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
              @if (recetaDetalle()!.checkLejos) {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                             bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">Lejos</span>
              }
              @if (recetaDetalle()!.checkCerca) {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                             bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200">Cerca</span>
              }
              @if (recetaDetalle()!.checkCristalesLaboratorio) {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                             bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200">Cristales Lab.</span>
              }
              @if (recetaDetalle()!.checkUrgente) {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                             bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">Urgente</span>
              }
            </div>

            <!-- Tabla Lejos -->
            @if (recetaDetalle()!.checkLejos) {
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lejos</p>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse" aria-label="Prescripción lejos">
                    <thead>
                      <tr class="border-b border-gray-100">
                        <th class="py-2 pr-4 text-left text-xs font-medium text-gray-500 w-12"></th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Esférico</th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Cilindro</th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Eje</th>
                        <th class="py-2 text-center text-xs font-medium text-gray-500">Obs.</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">OD</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosODEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosODCilindro || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosODEje || '—' }}</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.lejosODObservacion || '—' }}</td>
                      </tr>
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">OI</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosOIEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosOICilindro || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosOIEje || '—' }}</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.lejosOIObservacion || '—' }}</td>
                      </tr>
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">DP</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.lejosDPEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-400 text-xs" colspan="2">—</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.lejosDPObservacion || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                @if (recetaDetalle()!.lejosADDEsfera) {
                  <p class="mt-2 text-xs text-gray-500">
                    <span class="font-medium text-gray-700">ADD:</span> {{ recetaDetalle()!.lejosADDEsfera }}
                  </p>
                }
              </div>
            }

            <!-- Tabla Cerca -->
            @if (recetaDetalle()!.checkCerca) {
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cerca</p>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse" aria-label="Prescripción cerca">
                    <thead>
                      <tr class="border-b border-gray-100">
                        <th class="py-2 pr-4 text-left text-xs font-medium text-gray-500 w-12"></th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Esférico</th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Cilindro</th>
                        <th class="py-2 pr-4 text-center text-xs font-medium text-gray-500">Eje</th>
                        <th class="py-2 text-center text-xs font-medium text-gray-500">Obs.</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">OD</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaODEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaODCilindro || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaODEje || '—' }}</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.cercaODObservacion || '—' }}</td>
                      </tr>
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">OI</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaOIEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaOICilindro || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaOIEje || '—' }}</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.cercaOIObservacion || '—' }}</td>
                      </tr>
                      <tr>
                        <td class="py-2.5 pr-4 font-semibold text-gray-700">DP</td>
                        <td class="py-2.5 pr-4 text-center text-gray-900">{{ recetaDetalle()!.cercaDPEsferico || '—' }}</td>
                        <td class="py-2.5 pr-4 text-center text-gray-400 text-xs" colspan="2">—</td>
                        <td class="py-2.5 text-center text-gray-500 text-xs">{{ recetaDetalle()!.cercaDPObservacion || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Si no hay lejos ni cerca -->
            @if (!recetaDetalle()!.checkLejos && !recetaDetalle()!.checkCerca) {
              <p class="text-sm text-gray-400 italic">Sin datos de prescripción registrados.</p>
            }

            <!-- Auditoría -->
            <div class="pt-2 border-t border-gray-100">
              <dl class="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div>
                  <dt class="text-gray-400">Creado por</dt>
                  <dd class="text-gray-700 mt-0.5">{{ recetaDetalle()!.createdBy || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-gray-400">Fecha creación</dt>
                  <dd class="text-gray-700 mt-0.5">{{ recetaDetalle()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd>
                </div>
              </dl>
            </div>

          </div>

          <!-- Footer modal -->
          <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              (click)="cerrarDetalle()"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                     rounded-lg hover:bg-gray-50 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RecetasClienteListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recetaService = inject(RecetaCristalesService);
  private readonly clienteService = inject(ClienteService);

  readonly recetas = signal<RecetaCristalesDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly clienteNombre = signal('');
  readonly recetaDetalle = signal<RecetaCristalesDto | null>(null);
  readonly clienteId = signal('');

  private static readonly UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!RecetasClienteListComponent.UUID_RE.test(id)) {
      this.errorMessage.set('ID de cliente inválido.');
      this.loading.set(false);
      return;
    }
    this.clienteId.set(id);
    this.clienteService.getCliente(id).subscribe({
      next: (c) => this.clienteNombre.set(c.nombre),
      error: () => this.clienteNombre.set('Cliente'),
    });
    this.recetaService.getByCliente(id).subscribe({
      next: (lista) => {
        this.recetas.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar las recetas. Verifique la conexión.');
        this.loading.set(false);
      },
    });
  }

  verReceta(r: RecetaCristalesDto): void {
    this.recetaDetalle.set(r);
  }

  cerrarDetalle(): void {
    this.recetaDetalle.set(null);
  }

  volver(): void {
    this.router.navigate(['/clientes', this.clienteId()]);
  }
}
