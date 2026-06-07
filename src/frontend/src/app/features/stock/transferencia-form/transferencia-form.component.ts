import { Component, inject, output, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductoDto } from '../../../core/models/producto.model';
import { CrearTransferenciaRequest } from '../../../core/models/transferencia.model';
import { ProductoService } from '../../../core/services/producto.service';
import { TransferenciaService } from '../../../core/services/transferencia.service';
import { SucursalContextService } from '../../../core/services/sucursal-context.service';
import Swal from 'sweetalert2';

interface LineaState {
  id: string;
  productoId: string;
  cantidad: number;
}

@Component({
  selector: 'app-transferencia-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva transferencia de stock"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92vh]"
        (click)="$event.stopPropagation()"
      >

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Nueva transferencia de stock</h2>
            <p class="text-xs text-gray-400 mt-0.5">Mueve productos entre sucursales</p>
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

        <!-- Body: scrollable -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- ── Datos de la transferencia ───────────────────────────── -->
          <div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Datos de la transferencia
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Sucursal origen (readonly) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Sucursal origen
                </label>
                <div class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-100
                            bg-gray-50 text-gray-600 cursor-not-allowed">
                  {{ sucursalOrigenNombre() }}
                </div>
              </div>

              <!-- Sucursal destino -->
              <div>
                <label for="trans-destino" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Sucursal destino <span class="text-red-500">*</span>
                </label>
                <select
                  id="trans-destino"
                  [value]="sucursalDestinoId()"
                  (change)="sucursalDestinoId.set($any($event.target).value); destinoTouched.set(true)"
                  (blur)="destinoTouched.set(true)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class.border-red-300]="destinoTouched() && !sucursalDestinoId()"
                  [class.border-gray-200]="!destinoTouched() || !!sucursalDestinoId()"
                >
                  <option value="">— Seleccionar sucursal —</option>
                  @for (s of sucursalesDestino(); track s.sucursalId) {
                    <option [value]="s.sucursalId">{{ s.nombre }}</option>
                  }
                </select>
                @if (destinoTouched() && !sucursalDestinoId()) {
                  <p class="mt-1 text-xs text-red-600">Selecciona una sucursal de destino.</p>
                }
              </div>

              <!-- Fecha -->
              <div>
                <label for="trans-fecha" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha <span class="text-red-500">*</span>
                </label>
                <input
                  id="trans-fecha"
                  type="date"
                  [value]="fecha()"
                  (change)="fecha.set($any($event.target).value)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                         hover:border-gray-300 bg-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Observaciones (full width) -->
              <div class="sm:col-span-2">
                <label for="trans-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="trans-obs"
                  rows="2"
                  maxlength="500"
                  placeholder="Notas sobre esta transferencia..."
                  [value]="observaciones()"
                  (input)="observaciones.set($any($event.target).value)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                         hover:border-gray-300 bg-white transition-colors resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

            </div>
          </div>

          <!-- ── Líneas ──────────────────────────────────────────────── -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Productos <span class="text-red-500">*</span>
                @if (lineas().length > 0) {
                  <span class="ml-1 normal-case text-gray-500">({{ lineas().length }})</span>
                }
              </h3>
              <button
                type="button"
                (click)="agregarLinea()"
                [disabled]="loadingProductos() || productos().length === 0"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700
                       bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar línea
              </button>
            </div>

            @if (loadingProductos()) {
              <div class="flex items-center gap-2 py-4 text-sm text-gray-400">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Cargando productos...
              </div>
            } @else if (lineas().length === 0) {
              <div class="flex flex-col items-center justify-center py-8 gap-2 text-center
                          rounded-xl bg-gray-50 border border-dashed border-gray-200">
                <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                <p class="text-sm text-gray-500">Sin productos agregados</p>
                <p class="text-xs text-gray-400">Haz clic en "Agregar línea" para comenzar</p>
              </div>
            } @else {
              <div class="border border-gray-100 rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50/80 border-b border-gray-100">
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Producto / Variante
                      </th>
                      <th class="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                        Cantidad
                      </th>
                      <th class="w-10"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (linea of lineas(); track linea.id) {
                      <tr class="hover:bg-gray-50/50 transition-colors">

                        <!-- Producto selector -->
                        <td class="px-4 py-2.5">
                          <select
                            [value]="linea.productoId"
                            (change)="updateLineaProducto(linea.id, $any($event.target).value)"
                            class="w-full px-2.5 py-2 text-sm rounded-lg border bg-white transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            [class.border-red-300]="!linea.productoId"
                            [class.border-gray-200]="!!linea.productoId"
                          >
                            <option value="">— Seleccionar —</option>
                            @for (p of productosSeleccionables(); track p.productoId) {
                              @if (p.hijos.length > 0) {
                                <optgroup [label]="p.nombre">
                                  @for (h of hijosDisponibles(linea.id, p); track h.productoId) {
                                    <option [value]="h.productoId">{{ h.nombre }}</option>
                                  }
                                </optgroup>
                              } @else if (esSeleccionableDirectamente(linea.id, p)) {
                                <option [value]="p.productoId">{{ p.nombre }}{{ p.codigoInterno ? ' (' + p.codigoInterno + ')' : '' }}</option>
                              }
                            }
                          </select>
                        </td>

                        <!-- Cantidad -->
                        <td class="px-3 py-2.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            [value]="linea.cantidad"
                            (input)="updateLineaCantidad(linea.id, +$any($event.target).value)"
                            class="w-full px-2.5 py-2 text-sm text-center rounded-lg border bg-white transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            [class.border-red-300]="linea.cantidad < 1"
                            [class.border-gray-200]="linea.cantidad >= 1"
                          />
                        </td>

                        <!-- Quitar -->
                        <td class="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            (click)="quitarLinea(linea.id)"
                            class="text-gray-300 hover:text-red-500 transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                            aria-label="Eliminar línea"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              @if (lineasTouched() && !lineasValidas()) {
                <p class="mt-1.5 text-xs text-red-600">
                  Todas las líneas deben tener producto seleccionado y cantidad mayor a 0.
                </p>
              }
            }
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                   rounded-lg hover:bg-gray-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                   rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            @if (loading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            }
            Guardar transferencia
          </button>
        </div>

      </div>
    </div>
  `,
})
export class TransferenciaFormComponent {
  private readonly productoService = inject(ProductoService);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  // ── Datos del formulario ──────────────────────────────────────────────────────
  readonly sucursalDestinoId = signal('');
  readonly destinoTouched = signal(false);
  readonly fecha = signal(new Date().toISOString().slice(0, 10));
  readonly observaciones = signal('');

  // ── Líneas ────────────────────────────────────────────────────────────────────
  readonly lineas = signal<LineaState[]>([]);
  readonly lineasTouched = signal(false);

  // ── Estado ───────────────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly loadingProductos = signal(true);
  readonly productos = signal<ProductoDto[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────────
  readonly sucursalOrigenNombre = computed(
    () => this.sucursalContext.sucursalActual()?.nombre ?? ''
  );

  readonly sucursalesDestino = computed(() => {
    const origenId = this.sucursalContext.sucursalActual()?.sucursalId;
    return this.sucursalContext.sucursales().filter(s => s.sucursalId !== origenId);
  });

  readonly productosSeleccionables = computed(() =>
    this.productos().filter(p => p.isActivo && !p.productoPadreId)
  );

  readonly usedProductoIds = computed(() =>
    new Set(this.lineas().map(l => l.productoId).filter(id => !!id))
  );

  readonly lineasValidas = computed(() =>
    this.lineas().length > 0 &&
    this.lineas().every(l => !!l.productoId && l.cantidad >= 1)
  );

  readonly formValid = computed(() =>
    !!this.sucursalDestinoId() &&
    !!this.fecha() &&
    this.lineasValidas()
  );

  constructor() {
    this.productoService.getAll({ pageSize: 500, soloRaices: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.productos.set(res.items);
          this.loadingProductos.set(false);
        },
        error: () => this.loadingProductos.set(false),
      });
  }

  hijosDisponibles(lineaId: string, producto: ProductoDto): ProductoDto[] {
    const currentLinea = this.lineas().find(l => l.id === lineaId);
    const usedIds = this.usedProductoIds();
    return producto.hijos.filter(
      h => h.isActivo && (h.productoId === currentLinea?.productoId || !usedIds.has(h.productoId))
    );
  }

  esSeleccionableDirectamente(lineaId: string, producto: ProductoDto): boolean {
    if (producto.hijos.length > 0) return false;
    const currentLinea = this.lineas().find(l => l.id === lineaId);
    const usedIds = this.usedProductoIds();
    return producto.productoId === currentLinea?.productoId || !usedIds.has(producto.productoId);
  }

  agregarLinea(): void {
    this.lineas.update(ls => [
      ...ls,
      { id: crypto.randomUUID(), productoId: '', cantidad: 1 },
    ]);
  }

  quitarLinea(id: string): void {
    this.lineas.update(ls => ls.filter(l => l.id !== id));
  }

  updateLineaProducto(id: string, productoId: string): void {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, productoId } : l));
  }

  updateLineaCantidad(id: string, cantidad: number): void {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, cantidad } : l));
  }

  onSubmit(): void {
    this.destinoTouched.set(true);
    this.lineasTouched.set(true);
    if (!this.formValid()) return;

    const sucursalOrigenId = this.sucursalContext.sucursalActual()?.sucursalId;
    if (!sucursalOrigenId) return;

    const req: CrearTransferenciaRequest = {
      sucursalOrigenId,
      sucursalDestinoId: this.sucursalDestinoId(),
      fechaTransferencia: this.fecha(),
      observaciones: this.observaciones().trim() || undefined,
      lineas: this.lineas().map(l => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
      })),
    };

    this.loading.set(true);
    this.transferenciaService.crear(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Transferencia creada',
            text: 'La transferencia ha sido registrada en estado Pendiente.',
            confirmButtonColor: '#2563eb',
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => this.saved.emit());
        },
        error: (err: { status?: number; error?: { detail?: string } }) => {
          this.loading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear',
            text: err.error?.detail ?? 'No se pudo crear la transferencia. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          });
        },
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelled.emit();
  }
}
