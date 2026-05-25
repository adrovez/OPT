import { Component, inject, output, signal, computed } from '@angular/core';
import { ProductoDto } from '../../../core/models/producto.model';
import {
  TIPOS_DOCUMENTO_ENTRADA,
  TipoDocumentoEntrada,
  TIPOS_DOCUMENTO_LABEL,
} from '../../../core/models/documento-stock.model';
import { ProductoService } from '../../../core/services/producto.service';
import { DocumentoStockService } from '../../../core/services/documento-stock.service';
import Swal from 'sweetalert2';

interface LineaState {
  id: string;
  varianteId: string;
  cantidad: number;
  precioCosto: number | null;
}

@Component({
  selector: 'app-documento-entrada-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva entrada de stock"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92vh]"
        (click)="$event.stopPropagation()"
      >

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Nueva entrada de stock</h2>
            <p class="text-xs text-gray-400 mt-0.5">Registra un ingreso de productos al inventario</p>
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

          <!-- ── Datos del documento ──────────────────────────────────── -->
          <div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Datos del documento
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Tipo -->
              <div>
                <label for="doc-tipo" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo <span class="text-red-500">*</span>
                </label>
                <select
                  id="doc-tipo"
                  [value]="tipoDocumento()"
                  (change)="tipoDocumento.set($any($event.target).value)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                         hover:border-gray-300 bg-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  @for (tipo of tipos; track tipo) {
                    <option [value]="tipo">{{ tiposLabel[tipo] }}</option>
                  }
                </select>
              </div>

              <!-- Número de documento -->
              <div>
                <label for="doc-numero" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Número <span class="text-red-500">*</span>
                </label>
                <input
                  id="doc-numero"
                  type="text"
                  maxlength="50"
                  placeholder="Ej: FAC-001, B-12345"
                  [value]="numeroDocumento()"
                  (input)="numeroDocumento.set($any($event.target).value); numeroTouched.set(true)"
                  (blur)="numeroTouched.set(true)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors bg-white
                         hover:border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class.border-red-300]="numeroTouched() && !numeroDocumento().trim()"
                  [class.border-gray-200]="!numeroTouched() || !!numeroDocumento().trim()"
                />
                @if (numeroTouched() && !numeroDocumento().trim()) {
                  <p class="mt-1 text-xs text-red-600">Campo requerido.</p>
                }
              </div>

              <!-- Fecha -->
              <div>
                <label for="doc-fecha" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha <span class="text-red-500">*</span>
                </label>
                <input
                  id="doc-fecha"
                  type="date"
                  [value]="fecha()"
                  (change)="fecha.set($any($event.target).value)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                         hover:border-gray-300 bg-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Proveedor -->
              <div>
                <label for="doc-proveedor" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Proveedor <span class="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="doc-proveedor"
                  type="text"
                  maxlength="200"
                  placeholder="Nombre del proveedor"
                  [value]="proveedorNombre()"
                  (input)="proveedorNombre.set($any($event.target).value)"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                         hover:border-gray-300 bg-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Observación (full width) -->
              <div class="sm:col-span-2">
                <label for="doc-obs" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Observación <span class="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="doc-obs"
                  rows="2"
                  maxlength="500"
                  placeholder="Notas sobre este documento..."
                  [value]="observacion()"
                  (input)="observacion.set($any($event.target).value)"
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
                [disabled]="loadingProductos() || productosActivos().length === 0"
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
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
                      <th class="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                        Precio costo
                      </th>
                      <th class="w-10"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (linea of lineas(); track linea.id) {
                      <tr class="hover:bg-gray-50/50 transition-colors">

                        <!-- Variante selector -->
                        <td class="px-4 py-2.5">
                          <select
                            [value]="linea.varianteId"
                            (change)="updateLineaVariante(linea.id, $any($event.target).value)"
                            class="w-full px-2.5 py-2 text-sm rounded-lg border bg-white transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            [class.border-red-300]="!linea.varianteId"
                            [class.border-gray-200]="!!linea.varianteId"
                          >
                            <option value="">— Seleccionar —</option>
                            @for (p of productosActivos(); track p.productoId) {
                              @if (variantesDisponibles(linea.id, p).length > 0) {
                                <optgroup [label]="p.nombre">
                                  @for (v of variantesDisponibles(linea.id, p); track v.varianteId) {
                                    <option [value]="v.varianteId">{{ v.nombre }}</option>
                                  }
                                </optgroup>
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
                            [class.border-red-300]="linea.cantidad <= 0"
                            [class.border-gray-200]="linea.cantidad > 0"
                          />
                        </td>

                        <!-- Precio costo -->
                        <td class="px-3 py-2.5">
                          <div class="relative">
                            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              [value]="linea.precioCosto ?? ''"
                              (input)="updateLineaPrecio(linea.id, $any($event.target).value === '' ? null : +$any($event.target).value)"
                              class="w-full pl-6 pr-2.5 py-2 text-sm text-right rounded-lg border border-gray-200 bg-white
                                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
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
                  Todas las líneas deben tener variante seleccionada y cantidad mayor a 0.
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
            Confirmar entrada
          </button>
        </div>

      </div>
    </div>
  `,
})
export class DocumentoEntradaFormComponent {
  private readonly productoService = inject(ProductoService);
  private readonly documentoService = inject(DocumentoStockService);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly tipos = TIPOS_DOCUMENTO_ENTRADA;
  readonly tiposLabel = TIPOS_DOCUMENTO_LABEL;

  readonly tipoDocumento = signal<TipoDocumentoEntrada>('FacturaCompra');
  readonly numeroDocumento = signal('');
  readonly numeroTouched = signal(false);
  readonly fecha = signal(new Date().toISOString().split('T')[0]);
  readonly proveedorNombre = signal('');
  readonly observacion = signal('');

  readonly lineas = signal<LineaState[]>([]);
  readonly lineasTouched = signal(false);
  readonly loading = signal(false);
  readonly loadingProductos = signal(true);
  readonly productos = signal<ProductoDto[]>([]);

  readonly productosActivos = computed(() =>
    this.productos().filter(p => p.activo && p.variantes.some(v => v.activo))
  );

  readonly usedVarianteIds = computed(() =>
    new Set(this.lineas().map(l => l.varianteId).filter(id => id))
  );

  readonly lineasValidas = computed(() =>
    this.lineas().length > 0 &&
    this.lineas().every(l => !!l.varianteId && l.cantidad > 0)
  );

  readonly formValid = computed(() =>
    !!this.tipoDocumento() &&
    !!this.numeroDocumento().trim() &&
    !!this.fecha() &&
    this.lineasValidas()
  );

  constructor() {
    this.productoService.getAll({ pageSize: 1000 }).subscribe({
      next: res => {
        this.productos.set(res.items);
        this.loadingProductos.set(false);
      },
      error: () => this.loadingProductos.set(false),
    });
  }

  variantesDisponibles(lineaId: string, producto: ProductoDto) {
    const currentLinea = this.lineas().find(l => l.id === lineaId);
    const usedIds = this.usedVarianteIds();
    return producto.variantes.filter(
      v => v.activo && (v.varianteId === currentLinea?.varianteId || !usedIds.has(v.varianteId))
    );
  }

  agregarLinea(): void {
    this.lineas.update(ls => [
      ...ls,
      { id: crypto.randomUUID(), varianteId: '', cantidad: 1, precioCosto: null },
    ]);
  }

  quitarLinea(id: string): void {
    this.lineas.update(ls => ls.filter(l => l.id !== id));
  }

  updateLineaVariante(id: string, varianteId: string): void {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, varianteId } : l));
  }

  updateLineaCantidad(id: string, cantidad: number): void {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, cantidad } : l));
  }

  updateLineaPrecio(id: string, precioCosto: number | null): void {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, precioCosto } : l));
  }

  onSubmit(): void {
    this.numeroTouched.set(true);
    this.lineasTouched.set(true);
    if (!this.formValid()) return;

    this.loading.set(true);
    this.documentoService.crear({
      tipoDocumento:   this.tipoDocumento(),
      numeroDocumento: this.numeroDocumento().trim(),
      fecha:           this.fecha(),
      proveedorNombre: this.proveedorNombre().trim() || undefined,
      observacion:     this.observacion().trim() || undefined,
      lineas: this.lineas().map(l => ({
        varianteId:  l.varianteId,
        cantidad:    l.cantidad,
        precioCosto: l.precioCosto ?? undefined,
      })),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Entrada registrada',
          text: 'El stock y los precios de costo han sido actualizados.',
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
          title: 'Error al registrar',
          text: err.error?.detail ?? 'No se pudo registrar la entrada. Intente nuevamente.',
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
