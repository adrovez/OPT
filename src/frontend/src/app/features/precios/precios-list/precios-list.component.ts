import {
  Component, inject, signal, computed, OnInit, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PrecioService } from '../../../core/services/precio.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoCategoriaService } from '../../../core/services/producto-categoria.service';
import { PrecioProductoDto, SetPrecioRequest } from '../../../core/models/precio.model';
import { ProductoDto, CategoriaDto } from '../../../core/models/producto.model';
import Swal from 'sweetalert2';

interface PrecioRow {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  categoriaNombre?: string;
  precioCosto?: number;
  precioVenta?: number;
  vigenciaDesde?: string;
  tienePrecio: boolean;
}

@Component({
  selector: 'app-precios-list',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Precios de Productos</h1>
          <p class="text-sm text-gray-500 mt-0.5">Gestión de precios costo y venta</p>
        </div>
      </div>

      <!-- Stats -->
      @if (!loading()) {
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Total productos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ rows().length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p class="text-xs text-green-500 font-medium uppercase tracking-wide">Con precio</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ conPrecioCount() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p class="text-xs text-amber-500 font-medium uppercase tracking-wide">Sin precio</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ sinPrecioCount() }}</p>
          </div>
        </div>
      }

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <!-- Búsqueda -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            [value]="search()"
            (input)="onSearch($any($event.target).value)"
            class="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
                   hover:border-gray-300 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Categoría -->
        <select
          [value]="categoriaFiltro()"
          (change)="categoriaFiltro.set($any($event.target).value); page.set(1)"
          class="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
                 hover:border-gray-300 transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          @for (c of categorias(); track c.categoriaId) {
            <option [value]="c.nombre" [selected]="c.nombre === categoriaFiltro()">{{ c.nombre }}</option>
          }
        </select>

        <!-- Toggle sin precio -->
        <label class="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-gray-700
                      bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300
                      transition-colors select-none shrink-0">
          <input
            type="checkbox"
            [checked]="soloSinPrecio()"
            (change)="soloSinPrecio.set($any($event.target).checked); page.set(1)"
            class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          Solo sin precio
        </label>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-24">
            <svg class="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        } @else if (filteredRows().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <svg class="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm font-medium text-gray-900">Sin resultados</p>
            <p class="text-xs text-gray-400 mt-0.5">Prueba con otros filtros de búsqueda</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Código
                  </th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Producto
                  </th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Precio Costo
                  </th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Precio Venta
                  </th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actualizado
                  </th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (row of pagedRows(); track row.productoId) {
                  <tr class="hover:bg-gray-50/60 transition-colors group">
                    <td class="px-4 py-3 font-mono text-xs text-gray-500">
                      {{ row.productoCodigo }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-gray-900">{{ row.productoNombre }}</span>
                      @if (row.categoriaNombre) {
                        <span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
                                     bg-blue-50 text-blue-700">
                          {{ row.categoriaNombre }}
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      @if (row.precioCosto != null) {
                        <span class="font-semibold text-gray-900">
                          \${{ row.precioCosto | number:'1.0-0' }}
                        </span>
                      } @else {
                        <span class="text-gray-300 text-xs">—</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      @if (row.precioVenta != null) {
                        <span class="font-semibold text-gray-900">
                          \${{ row.precioVenta | number:'1.0-0' }}
                        </span>
                      } @else {
                        <span class="text-gray-300 text-xs">—</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-400">
                      @if (row.tienePrecio && row.vigenciaDesde) {
                        {{ row.vigenciaDesde | date:'dd/MM/yyyy' }}
                      } @else {
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
                                     bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                          Sin precio
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button
                        type="button"
                        (click)="abrirModal(row)"
                        class="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5
                               px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100
                               rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:opacity-100"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Editar precio
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p class="text-xs text-gray-500">
                {{ (page() - 1) * PAGE_SIZE + 1 }}–{{ min(page() * PAGE_SIZE, filteredRows().length) }}
                de {{ filteredRows().length }} productos
              </p>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  (click)="page.update(p => p - 1)"
                  [disabled]="page() === 1"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span class="px-3 py-1 text-xs font-medium text-gray-700">
                  {{ page() }} / {{ totalPages() }}
                </span>
                <button
                  type="button"
                  (click)="page.update(p => p + 1)"
                  [disabled]="page() === totalPages()"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal editar precio -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Editar precio"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Header modal -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-900 truncate">
                {{ selectedRow()?.productoNombre }}
              </h2>
              <p class="text-xs text-gray-400 font-mono mt-0.5">{{ selectedRow()?.productoCodigo }}</p>
            </div>
            <button
              type="button"
              (click)="cerrarModal()"
              class="ml-4 shrink-0 text-gray-400 hover:text-gray-600 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg p-1"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body modal scrollable -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            <!-- Formulario de precios -->
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Precio vigente
              </p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio Costo
                    <span class="text-gray-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      [value]="formCosto()"
                      (input)="formCosto.set($any($event.target).value)"
                      class="w-full pl-7 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                             hover:border-gray-300 bg-white transition-colors
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio Venta
                    <span class="text-gray-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      [value]="formVenta()"
                      (input)="formVenta.set($any($event.target).value)"
                      class="w-full pl-7 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                             hover:border-gray-300 bg-white transition-colors
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Historial -->
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Historial de precios
              </p>
              @if (loadingHistorial()) {
                <div class="flex items-center justify-center py-6">
                  <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              } @else if (historial().length === 0) {
                <p class="text-xs text-gray-400 text-center py-4">Sin registros de precios anteriores.</p>
              } @else {
                <div class="rounded-xl border border-gray-100 overflow-hidden">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-3 py-2 font-semibold text-gray-500">Desde</th>
                        <th class="text-left px-3 py-2 font-semibold text-gray-500">Hasta</th>
                        <th class="text-right px-3 py-2 font-semibold text-gray-500">Costo</th>
                        <th class="text-right px-3 py-2 font-semibold text-gray-500">Venta</th>
                        <th class="text-left px-3 py-2 font-semibold text-gray-500">Usuario</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (h of historial(); track h.precioId) {
                        <tr [class.bg-green-50]="!h.vigenciaHasta">
                          <td class="px-3 py-2 text-gray-600">
                            {{ h.vigenciaDesde | date:'dd/MM/yyyy HH:mm' }}
                          </td>
                          <td class="px-3 py-2 text-gray-600">
                            @if (!h.vigenciaHasta) {
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold
                                           bg-green-100 text-green-700">Vigente</span>
                            } @else {
                              {{ h.vigenciaHasta | date:'dd/MM/yyyy HH:mm' }}
                            }
                          </td>
                          <td class="px-3 py-2 text-right font-medium text-gray-900">
                            @if (h.precioCosto != null) {
                              \${{ h.precioCosto | number:'1.0-0' }}
                            } @else {
                              <span class="text-gray-300">—</span>
                            }
                          </td>
                          <td class="px-3 py-2 text-right font-medium text-gray-900">
                            @if (h.precioVenta != null) {
                              \${{ h.precioVenta | number:'1.0-0' }}
                            } @else {
                              <span class="text-gray-300">—</span>
                            }
                          </td>
                          <td class="px-3 py-2 text-gray-400 truncate max-w-24">
                            {{ h.createdBy ?? '—' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

          </div>

          <!-- Footer modal -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              (click)="cerrarModal()"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                     rounded-lg hover:bg-gray-50 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="guardarPrecio()"
              [disabled]="loadingGuardar()"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     disabled:bg-blue-400 disabled:cursor-not-allowed
                     rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              @if (loadingGuardar()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              Guardar precio
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PreciosListComponent implements OnInit {
  private readonly precioService = inject(PrecioService);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(ProductoCategoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly PAGE_SIZE = 20;

  // ── Estado de carga ───────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly rows = signal<PrecioRow[]>([]);
  readonly categorias = signal<CategoriaDto[]>([]);

  // ── Filtros ───────────────────────────────────────────────────────────────────
  readonly search = signal('');
  readonly categoriaFiltro = signal('');
  readonly soloSinPrecio = signal(false);
  readonly page = signal(1);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  readonly conPrecioCount = computed(() => this.rows().filter(r => r.tienePrecio).length);
  readonly sinPrecioCount = computed(() => this.rows().filter(r => !r.tienePrecio).length);

  // ── Filtrado y paginación ─────────────────────────────────────────────────────
  readonly filteredRows = computed(() => {
    const q = this.search().toLowerCase().trim();
    const cat = this.categoriaFiltro();
    const sinPrecio = this.soloSinPrecio();
    return this.rows().filter(r => {
      if (sinPrecio && r.tienePrecio) return false;
      if (cat && r.categoriaNombre !== cat) return false;
      if (q && !r.productoNombre.toLowerCase().includes(q) && !r.productoCodigo.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRows().length / this.PAGE_SIZE)),
  );

  readonly pagedRows = computed(() => {
    const p = this.page();
    return this.filteredRows().slice((p - 1) * this.PAGE_SIZE, p * this.PAGE_SIZE);
  });

  // ── Modal ─────────────────────────────────────────────────────────────────────
  readonly showModal = signal(false);
  readonly selectedRow = signal<PrecioRow | null>(null);
  readonly formCosto = signal<string>('');
  readonly formVenta = signal<string>('');
  readonly historial = signal<PrecioProductoDto[]>([]);
  readonly loadingHistorial = signal(false);
  readonly loadingGuardar = signal(false);

  ngOnInit(): void {
    this.cargarDatos();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  abrirModal(row: PrecioRow): void {
    this.selectedRow.set(row);
    this.formCosto.set(row.precioCosto != null ? String(row.precioCosto) : '');
    this.formVenta.set(row.precioVenta != null ? String(row.precioVenta) : '');
    this.historial.set([]);
    this.showModal.set(true);
    this.cargarHistorial(row.productoId);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.selectedRow.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cerrarModal();
  }

  guardarPrecio(): void {
    const row = this.selectedRow();
    if (!row) return;

    const costoStr = this.formCosto().trim();
    const ventaStr = this.formVenta().trim();

    const req: SetPrecioRequest = {
      precioCosto: costoStr !== '' ? parseFloat(costoStr) : undefined,
      precioVenta: ventaStr !== '' ? parseFloat(ventaStr) : undefined,
    };

    this.loadingGuardar.set(true);
    this.precioService
      .setPrecio(row.productoId, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingGuardar.set(false);
          const nuevoCosto = req.precioCosto;
          const nuevaVenta = req.precioVenta;
          this.rows.update(list =>
            list.map(r =>
              r.productoId === row.productoId
                ? {
                    ...r,
                    precioCosto: nuevoCosto,
                    precioVenta: nuevaVenta,
                    tienePrecio: true,
                    vigenciaDesde: new Date().toISOString(),
                  }
                : r,
            ),
          );
          Swal.fire({
            icon: 'success',
            title: 'Precio actualizado',
            confirmButtonColor: '#2563eb',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => this.cerrarModal());
        },
        error: (err: { status?: number; error?: { detail?: string } }) => {
          this.loadingGuardar.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.detail ?? 'No se pudo actualizar el precio. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          });
        },
      });
  }

  private cargarDatos(): void {
    this.loading.set(true);
    forkJoin({
      productos: this.productoService.getAll({ pageSize: 500, soloRaices: true }),
      precios: this.precioService.getVigentes({ pageSize: 500 }),
      categorias: this.categoriaService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ productos, precios, categorias }) => {
          this.categorias.set(categorias);

          const precioMap = new Map<string, PrecioProductoDto>(
            precios.items.map(p => [p.productoId, p]),
          );

          const toRow = (p: ProductoDto): PrecioRow => {
            const precio = precioMap.get(p.productoId);
            return {
              productoId: p.productoId,
              productoCodigo: p.codigoInterno,
              productoNombre: p.nombre,
              categoriaNombre: p.categoriaNombre,
              precioCosto: precio?.precioCosto,
              precioVenta: precio?.precioVenta,
              vigenciaDesde: precio?.vigenciaDesde,
              tienePrecio: !!precio,
            };
          };

          const allRows: PrecioRow[] = [];
          for (const p of productos.items) {
            allRows.push(toRow(p));
            for (const h of p.hijos) {
              allRows.push(toRow(h));
            }
          }

          this.rows.set(allRows);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar',
            text: 'No se pudo cargar la lista de precios.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          });
        },
      });
  }

  private cargarHistorial(productoId: string): void {
    this.loadingHistorial.set(true);
    this.precioService
      .getHistorial(productoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.historial.set(data);
          this.loadingHistorial.set(false);
        },
        error: () => {
          this.loadingHistorial.set(false);
        },
      });
  }
}
