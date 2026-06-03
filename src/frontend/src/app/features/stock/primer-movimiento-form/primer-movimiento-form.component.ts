import { Component, inject, input, output, signal, computed } from '@angular/core';
import { ProductoDto } from '../../../core/models/producto.model';
import { TipoMovimiento } from '../../../core/models/stock.model';
import { ProductoService } from '../../../core/services/producto.service';
import { StockService } from '../../../core/services/stock.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-primer-movimiento-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar primer movimiento"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Nuevo movimiento</h2>
            @if (step() === 1) {
              <p class="text-xs text-gray-400 mt-0.5">Paso 1 de 2 — Seleccionar producto</p>
            } @else {
              <p class="text-xs text-gray-400 mt-0.5 truncate max-w-[18rem]">
                {{ selectedProducto()?.displayNombre }}
              </p>
            }
          </div>
          <button type="button" (click)="onCancel()"
            class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
            aria-label="Cerrar">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- PASO 1: Seleccionar producto -->
        @if (step() === 1) {
          <div class="px-6 py-5">
            <label for="prim-producto" class="block text-sm font-medium text-gray-700 mb-1.5">
              Producto <span class="text-red-500">*</span>
            </label>

            @if (loadingProductos()) {
              <div class="flex items-center gap-2 py-3 text-sm text-gray-400">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Cargando productos...
              </div>
            } @else if (nohayDisponibles()) {
              <div class="flex flex-col items-center justify-center py-8 gap-2 text-center rounded-xl bg-gray-50 border border-gray-100">
                <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm font-medium text-gray-600">Todos los productos ya tienen stock</p>
                <p class="text-xs text-gray-400 max-w-[260px]">
                  Usa el botón "Movimiento" en cada fila para registrar salidas o ajustes.
                </p>
              </div>
            } @else {
              <select
                id="prim-producto"
                [value]="selectedProductoId()"
                (change)="selectedProductoId.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Seleccionar —</option>
                @for (grupo of gruposDisponibles(); track grupo.padreNombre) {
                  @if (grupo.esGrupo) {
                    <optgroup [label]="grupo.padreNombre">
                      @for (p of grupo.productos; track p.productoId) {
                        <option [value]="p.productoId">{{ p.nombre }}{{ p.codigoInterno ? ' (' + p.codigoInterno + ')' : '' }}</option>
                      }
                    </optgroup>
                  } @else {
                    @for (p of grupo.productos; track p.productoId) {
                      <option [value]="p.productoId">{{ p.nombre }}{{ p.codigoInterno ? ' (' + p.codigoInterno + ')' : '' }}</option>
                    }
                  }
                }
              </select>
            }
          </div>

          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button type="button" (click)="onCancel()"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                     rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
              Cancelar
            </button>
            <button type="button" (click)="goToStep2()" [disabled]="!selectedProductoId()"
              class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
                     rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Siguiente
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        }

        <!-- PASO 2: Datos del movimiento -->
        @if (step() === 2) {
          <div class="px-6 py-5 space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                @for (tipo of tipos; track tipo) {
                  <button type="button" (click)="tipoMovimiento.set(tipo); cantidadTouched.set(false)"
                    class="py-2.5 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.bg-blue-600]="tipoMovimiento() === tipo"
                    [class.text-white]="tipoMovimiento() === tipo"
                    [class.border-blue-600]="tipoMovimiento() === tipo"
                    [class.bg-white]="tipoMovimiento() !== tipo"
                    [class.text-gray-700]="tipoMovimiento() !== tipo"
                    [class.border-gray-200]="tipoMovimiento() !== tipo">
                    {{ tipo }}
                  </button>
                }
              </div>
              @if (tipoMovimiento() === 'Ajuste') {
                <p class="mt-1.5 text-xs text-gray-400">Positivo suma al stock, negativo resta.</p>
              }
            </div>

            <div>
              <label for="prim-cantidad" class="block text-sm font-medium text-gray-700 mb-1.5">
                Cantidad <span class="text-red-500">*</span>
              </label>
              <input id="prim-cantidad" type="number"
                [attr.min]="tipoMovimiento() !== 'Ajuste' ? 1 : null"
                step="1"
                placeholder="{{ tipoMovimiento() === 'Ajuste' ? 'Ej: 5 o -3' : 'Ej: 10' }}"
                [value]="cantidad()"
                (input)="cantidad.set(+$any($event.target).value); cantidadTouched.set(true)"
                (blur)="cantidadTouched.set(true)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-300]="!!cantidadError()"
                [class.border-gray-200]="!cantidadError()" />
              @if (cantidadError()) {
                <p class="mt-1 text-xs text-red-600">{{ cantidadError() }}</p>
              }
            </div>

            <div>
              <label for="prim-referencia" class="block text-sm font-medium text-gray-700 mb-1.5">
                Referencia <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input id="prim-referencia" type="text" maxlength="100" placeholder="Ej: ORD-001"
                [value]="referencia()" (input)="referencia.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label for="prim-observacion" class="block text-sm font-medium text-gray-700 mb-1.5">
                Observación <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea id="prim-observacion" rows="2" maxlength="500" placeholder="Motivo del movimiento..."
                [value]="observacion()" (input)="observacion.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </textarea>
            </div>

          </div>

          <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button type="button" (click)="step.set(1); cantidadTouched.set(false)"
              class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <button type="button" (click)="onSubmit()" [disabled]="loading()"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              Registrar
            </button>
          </div>
        }

      </div>
    </div>
  `,
})
export class PrimerMovimientoFormComponent {
  private readonly productoService = inject(ProductoService);
  private readonly stockService = inject(StockService);

  readonly existingProductoIds = input<string[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly step = signal<1 | 2>(1);
  readonly loadingProductos = signal(true);
  readonly productos = signal<ProductoDto[]>([]);
  readonly selectedProductoId = signal('');
  readonly loading = signal(false);

  readonly tipos = ['Ajuste'] as TipoMovimiento[];
  readonly tipoMovimiento = signal<TipoMovimiento>('Ajuste');
  readonly cantidad = signal(0);
  readonly cantidadTouched = signal(false);
  readonly referencia = signal('');
  readonly observacion = signal('');

  // Grupos para el select: raíces con hijos → optgroup; raíces sin hijos → opción directa
  readonly gruposDisponibles = computed(() => {
    const existing = new Set(this.existingProductoIds());
    const grupos: { padreNombre: string; esGrupo: boolean; productos: ProductoDto[] }[] = [];
    for (const padre of this.productos()) {
      if (!padre.isActivo) continue;
      if (padre.hijos.length > 0) {
        const hijosDisponibles = padre.hijos.filter(h => h.isActivo && !existing.has(h.productoId));
        if (hijosDisponibles.length > 0) {
          grupos.push({ padreNombre: padre.nombre, esGrupo: true, productos: hijosDisponibles });
        }
      } else {
        if (!existing.has(padre.productoId)) {
          grupos.push({ padreNombre: '', esGrupo: false, productos: [padre] });
        }
      }
    }
    return grupos;
  });

  readonly nohayDisponibles = computed(() => !this.loadingProductos() && this.gruposDisponibles().length === 0);

  readonly selectedProducto = computed(() => {
    const id = this.selectedProductoId();
    if (!id) return null;
    for (const padre of this.productos()) {
      if (padre.productoId === id) return { productoId: id, displayNombre: padre.nombre };
      const hijo = padre.hijos.find(h => h.productoId === id);
      if (hijo) return { productoId: id, displayNombre: `${padre.nombre} — ${hijo.nombre}` };
    }
    return null;
  });

  readonly cantidadError = computed(() => {
    if (!this.cantidadTouched()) return '';
    const cant = this.cantidad();
    return this.tipoMovimiento() === 'Ajuste' ? (cant !== 0 ? '' : 'No puede ser 0.') : (cant > 0 ? '' : 'Debe ser mayor a 0.');
  });

  readonly formValid = computed(() => {
    const cant = this.cantidad();
    return this.tipoMovimiento() === 'Ajuste' ? cant !== 0 : cant > 0;
  });

  constructor() {
    this.productoService.getAll({ pageSize: 1000, soloRaices: true }).subscribe({
      next: res => {
        this.productos.set(res.items);
        this.loadingProductos.set(false);
      },
      error: () => this.loadingProductos.set(false),
    });
  }

  goToStep2(): void {
    if (!this.selectedProductoId()) return;
    this.step.set(2);
  }

  onSubmit(): void {
    this.cantidadTouched.set(true);
    if (!this.formValid()) return;
    const producto = this.selectedProducto();
    if (!producto) return;

    this.loading.set(true);
    this.stockService.registrarMovimiento({
      productoId: producto.productoId,
      tipoMovimiento: this.tipoMovimiento(),
      cantidad: this.cantidad(),
      referencia: this.referencia().trim() || undefined,
      observacion: this.observacion().trim() || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Movimiento registrado',
          confirmButtonColor: '#2563eb',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => this.saved.emit());
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.loading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: err.error?.detail ?? 'No se pudo registrar el movimiento.',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  onCancel(): void { this.cancelled.emit(); }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelled.emit();
  }
}
