import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

import { OrdenTrabajoService } from '../../../core/services/orden-trabajo.service';
import {
  OrdenTrabajoDto,
  ETAPAS_OT,
  ESTADOS_PAGO_OT,
  ETAPA_COLORS,
  EtapaOT,
  EstadoPagoOT,
} from '../../../core/models/orden-trabajo.model';

@Component({
  selector: 'app-ordenes-trabajo-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="p-6" style="background: #F3F6FA; min-height: 100%">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: #0D1B3D">Órdenes de Trabajo</h1>
          <p class="text-sm text-gray-500 mt-0.5">Gestión de órdenes de trabajo de la sucursal</p>
        </div>
        <a
          routerLink="/ordenes-trabajo/nueva"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
                 transition-colors hover:opacity-90"
          style="background: #2563EB"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva OT
        </a>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div class="flex flex-wrap gap-3 items-end">
          <!-- Número OT -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">N° OT</label>
            <input
              type="text"
              placeholder="Buscar por número..."
              [value]="filtroNumeroOT()"
              (input)="filtroNumeroOT.set(getInputValue($event))"
              class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <!-- Etapa -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">Etapa</label>
            <select
              [value]="filtroEtapa()"
              (change)="filtroEtapa.set(getInputValue($event))"
              class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todas</option>
              @for (etapa of etapas; track etapa) {
                <option [value]="etapa">{{ etapa }}</option>
              }
            </select>
          </div>

          <!-- Estado de pago -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">Estado Pago</label>
            <select
              [value]="filtroEstadoPago()"
              (change)="filtroEstadoPago.set(getInputValue($event))"
              class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todos</option>
              @for (ep of estadosPago; track ep) {
                <option [value]="ep">{{ ep }}</option>
              }
            </select>
          </div>

          <!-- Botón buscar -->
          <button
            type="button"
            (click)="buscar()"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
            style="background: #2563EB"
          >
            Buscar
          </button>

          <!-- Limpiar -->
          <button
            type="button"
            (click)="limpiarFiltros()"
            class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200
                   hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span class="ml-3 text-sm text-gray-500">Cargando órdenes...</span>
          </div>
        } @else if (ordenes().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-sm font-medium">No hay órdenes de trabajo</p>
            <p class="text-xs mt-1">Crea la primera OT con el botón "Nueva OT"</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100" style="background: #F3F6FA">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">N° OT</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">F. Entrega</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapa</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Est. Pago</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Saldo</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (ot of ordenes(); track ot.otId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-blue-700">{{ ot.numeroOT }}</td>
                    <td class="px-4 py-3 text-gray-900">{{ ot.clienteNombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ ot.fechaEntrega | date:'dd/MM/yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ etapaClass(ot.etapaOT) }}">
                        {{ ot.etapaOT }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ estadoPagoClass(ot.estadoPago) }}">
                        {{ ot.estadoPago }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-900 font-medium">
                      {{ ot.montoTotal | currency:'CLP':'symbol-narrow':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-right font-semibold"
                        [class.text-red-600]="ot.saldo > 0"
                        [class.text-green-600]="ot.saldo === 0">
                      {{ ot.saldo | currency:'CLP':'symbol-narrow':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-center gap-1">
                        <!-- Ver detalle -->
                        <a
                          [routerLink]="['/ordenes-trabajo', ot.otId]"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Ver detalle"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                                 -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <!-- Editar -->
                        <a
                          [routerLink]="['/ordenes-trabajo', ot.otId, 'editar']"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                 m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <!-- Eliminar -->
                        <button
                          type="button"
                          (click)="eliminar(ot)"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
                                 m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
            <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">
                Página {{ page() }} de {{ totalPages() }} — {{ totalCount() }} registros
              </span>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="irPagina(page() - 1)"
                  [disabled]="page() === 1"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200
                         disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  (click)="irPagina(page() + 1)"
                  [disabled]="page() === totalPages()"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200
                         disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          }
        }
      </div>

    </div>
  `,
})
export class OrdenesTrabajoListComponent implements OnInit {
  private readonly service   = inject(OrdenTrabajoService);
  private readonly router    = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly etapas      = ETAPAS_OT;
  readonly estadosPago = ESTADOS_PAGO_OT;

  // Estado
  readonly loading      = signal(false);
  readonly ordenes      = signal<OrdenTrabajoDto[]>([]);
  readonly totalCount   = signal(0);
  readonly totalPages   = signal(1);
  readonly page         = signal(1);
  readonly pageSize     = signal(20);

  // Filtros
  readonly filtroNumeroOT   = signal('');
  readonly filtroEtapa      = signal('');
  readonly filtroEstadoPago = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.service
      .getAll({
        page: this.page(),
        pageSize: this.pageSize(),
        numeroOT:   this.filtroNumeroOT() || undefined,
        etapaOT:    (this.filtroEtapa() as EtapaOT) || undefined,
        estadoPago: (this.filtroEstadoPago() as EstadoPagoOT) || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.ordenes.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtroNumeroOT.set('');
    this.filtroEtapa.set('');
    this.filtroEstadoPago.set('');
    this.page.set(1);
    this.cargar();
  }

  irPagina(p: number): void {
    this.page.set(p);
    this.cargar();
  }

  etapaClass(etapa: EtapaOT): string {
    return ETAPA_COLORS[etapa] ?? 'bg-gray-100 text-gray-700';
  }

  estadoPagoClass(estado: EstadoPagoOT): string {
    return estado === 'Pagado'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }

  eliminar(ot: OrdenTrabajoDto): void {
    Swal.fire({
      title: '¿Eliminar orden?',
      text: `Se eliminará la OT ${ot.numeroOT} del cliente ${ot.clienteNombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service
        .remove(ot.otId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.cargar(),
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la orden de trabajo.', 'error');
          },
        });
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
