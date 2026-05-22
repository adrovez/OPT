import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoCategoriaService } from '../../../core/services/producto-categoria.service';
import { ProductoDto, ProductoCategoriaDto, TIPOS_PRODUCTO } from '../../../core/models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { CategoriaFormComponent } from '../categoria-form/categoria-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [DecimalPipe, ProductoFormComponent, CategoriaFormComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
          <p class="text-sm text-gray-500 mt-0.5">Catálogo de productos y servicios</p>
        </div>
        <button
          (click)="abrirProductoForm(null)"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                 text-white text-sm font-medium rounded-xl transition-colors shrink-0
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-100 mb-6">
        <button
          (click)="activeTab.set('productos')"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
          [class.bg-blue-50]="activeTab() === 'productos'"
          [class.text-blue-700]="activeTab() === 'productos'"
          [class.text-gray-500]="activeTab() !== 'productos'"
          [class.hover:text-gray-700]="activeTab() !== 'productos'"
        >
          Productos
          @if (totalCount() > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                         bg-blue-100 text-blue-700">{{ totalCount() }}</span>
          }
        </button>
        <button
          (click)="activeTab.set('categorias')"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
          [class.bg-blue-50]="activeTab() === 'categorias'"
          [class.text-blue-700]="activeTab() === 'categorias'"
          [class.text-gray-500]="activeTab() !== 'categorias'"
          [class.hover:text-gray-700]="activeTab() !== 'categorias'"
        >
          Categorías
          @if (categorias().length > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
                         bg-gray-100 text-gray-600">{{ categorias().length }}</span>
          }
        </button>
      </div>

      <!-- ═══════════════════════════ TAB PRODUCTOS ═══════════════════════════ -->
      @if (activeTab() === 'productos') {

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <!-- Búsqueda -->
          <div class="relative flex-1 max-w-sm">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search"
              [value]="busqueda()"
              (input)="onBusquedaInput($any($event.target).value)"
              placeholder="Buscar por nombre o código..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                     hover:border-gray-300 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <!-- Filtro tipo -->
          <select
            [value]="tipoFiltro()"
            (change)="onTipoChange($any($event.target).value)"
            class="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                   hover:border-gray-300 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            @for (t of tipos; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          <!-- Filtro categoría -->
          <select
            [value]="categoriaFiltro()"
            (change)="onCategoriaChange($any($event.target).value)"
            class="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                   hover:border-gray-300 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            @for (c of categorias(); track c.categoriaId) {
              <option [value]="c.categoriaId">{{ c.nombre }}</option>
            }
          </select>
        </div>

        <!-- Loading productos -->
        @if (loading()) {
          <div class="flex items-center justify-center py-24 gap-3">
            <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="text-sm text-gray-500">Cargando...</span>
          </div>
        }

        @if (!loading()) {

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

          <!-- Tabla -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            @if (productos().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <p class="text-sm font-medium text-gray-700">Sin productos</p>
                <p class="text-xs text-gray-400">
                  @if (busqueda() || tipoFiltro() || categoriaFiltro()) {
                    No se encontraron resultados con los filtros aplicados.
                  } @else {
                    Haga clic en "Nuevo producto" para registrar el primero.
                  }
                </p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Tipo / Categoría
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Variantes
                      </th>
                      <th class="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (p of productos(); track p.productoId) {
                      <tr class="hover:bg-gray-50/50 transition-colors">

                        <!-- Nombre + código -->
                        <td class="px-5 py-3.5">
                          <p class="text-sm font-medium text-gray-900">{{ p.nombre }}</p>
                          @if (p.codigoInterno) {
                            <p class="text-xs text-gray-400 mt-0.5 font-mono">{{ p.codigoInterno }}</p>
                          }
                        </td>

                        <!-- Tipo / Categoría -->
                        <td class="px-5 py-3.5 hidden md:table-cell">
                          <span [class]="tipoBadgeClass(p.tipoProducto)"
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset">
                            {{ p.tipoProducto }}
                          </span>
                          @if (p.categoriaNombre) {
                            <p class="text-xs text-gray-400 mt-1">{{ p.categoriaNombre }}</p>
                          }
                        </td>

                        <!-- Variantes -->
                        <td class="px-5 py-3.5 hidden xl:table-cell text-center">
                          @if (p.variantes.length === 0) {
                            <span class="text-xs text-gray-400">—</span>
                          } @else {
                            <span class="text-sm text-gray-700">{{ p.variantes.length }}</span>
                            }
                        </td>

                        <!-- Estado -->
                        <td class="px-5 py-3.5 text-center">
                          @if (p.activo) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                              Activo
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                         bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200">
                              Inactivo
                            </span>
                          }
                        </td>

                        <!-- Acciones -->
                        <td class="px-5 py-3.5 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <button
                              (click)="abrirProductoForm(p)"
                              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                              [attr.aria-label]="'Editar ' + p.nombre"
                            >
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                     m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button
                              (click)="eliminarProducto(p)"
                              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                     focus:outline-none focus:ring-2 focus:ring-red-500"
                              [attr.aria-label]="'Eliminar ' + p.nombre"
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

              <!-- Paginación -->
              @if (totalPages() > 1) {
                <div class="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
                  <p class="text-xs text-gray-500">
                    Mostrando {{ pageInfo().from }}–{{ pageInfo().to }} de {{ pageInfo().total | number }}
                  </p>
                  <div class="flex items-center gap-1">
                    <button
                      (click)="cambiarPagina(currentPage() - 1)"
                      [disabled]="!hasPreviousPage()"
                      class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Página anterior"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <span class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                      {{ currentPage() }} / {{ totalPages() }}
                    </span>
                    <button
                      (click)="cambiarPagina(currentPage() + 1)"
                      [disabled]="!hasNextPage()"
                      class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Página siguiente"
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
        }
      }

      <!-- ═══════════════════════════ TAB CATEGORÍAS ══════════════════════════ -->
      @if (activeTab() === 'categorias') {

        <div class="flex justify-end mb-4">
          <button
            (click)="abrirCategoriaForm(null)"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                   text-white text-sm font-medium rounded-xl transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva categoría
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          @if (categorias().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994
                     1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <p class="text-sm font-medium text-gray-700">Sin categorías</p>
              <p class="text-xs text-gray-400">Haga clic en "Nueva categoría" para registrar la primera.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (c of categorias(); track c.categoriaId) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-5 py-3.5">
                        <p class="text-sm font-medium text-gray-900">{{ c.nombre }}</p>
                      </td>
                      <td class="px-5 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button
                            (click)="abrirCategoriaForm(c)"
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
                            (click)="eliminarCategoria(c)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-500"
                            [attr.aria-label]="'Eliminar ' + c.nombre"
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

    <!-- Modal producto -->
    @if (showProductoForm()) {
      <app-producto-form
        [producto]="productoSeleccionado()"
        [categorias]="categorias()"
        (saved)="onProductoSaved()"
        (cancelled)="cerrarProductoForm()"
      />
    }

    <!-- Modal categoría -->
    @if (showCategoriaForm()) {
      <app-categoria-form
        [categoria]="categoriaSeleccionada()"
        (saved)="onCategoriaSaved()"
        (cancelled)="cerrarCategoriaForm()"
      />
    }
  `,
})
export class ProductosListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(ProductoCategoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tipos = TIPOS_PRODUCTO;
  readonly activeTab = signal<'productos' | 'categorias'>('productos');

  // ── Estado productos ─────────────────────────────────────────────────────────
  readonly productos = signal<ProductoDto[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly busqueda = signal('');
  readonly tipoFiltro = signal('');
  readonly categoriaFiltro = signal('');
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  // ── Estado categorías ────────────────────────────────────────────────────────
  readonly categorias = signal<ProductoCategoriaDto[]>([]);

  // ── Modales ──────────────────────────────────────────────────────────────────
  readonly showProductoForm = signal(false);
  readonly productoSeleccionado = signal<ProductoDto | null>(null);
  readonly showCategoriaForm = signal(false);
  readonly categoriaSeleccionada = signal<ProductoCategoriaDto | null>(null);

  private readonly searchSubject = new Subject<string>();

  readonly pageInfo = computed(() => {
    const total = this.totalCount();
    const page = this.currentPage();
    const from = total === 0 ? 0 : (page - 1) * 20 + 1;
    const to = Math.min(page * 20, total);
    return { from, to, total };
  });

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage.set(1);
        this.cargarProductos();
      });

    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productoService
      .getAll({
        page: this.currentPage(),
        busqueda: this.busqueda(),
        tipo: this.tipoFiltro() || undefined,
        categoriaId: this.categoriaFiltro() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.productos.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.hasNextPage.set(result.hasNextPage);
          this.hasPreviousPage.set(result.hasPreviousPage);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Error al cargar los productos. Verifique la conexión.');
          this.loading.set(false);
        },
      });
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (lista) => this.categorias.set(lista),
    });
  }

  onBusquedaInput(value: string): void {
    this.busqueda.set(value);
    this.searchSubject.next(value);
  }

  onTipoChange(value: string): void {
    this.tipoFiltro.set(value);
    this.currentPage.set(1);
    this.cargarProductos();
  }

  onCategoriaChange(value: string): void {
    this.categoriaFiltro.set(value);
    this.currentPage.set(1);
    this.cargarProductos();
  }

  cambiarPagina(page: number): void {
    this.currentPage.set(page);
    this.cargarProductos();
  }

  // ── CRUD Producto ────────────────────────────────────────────────────────────

  abrirProductoForm(p: ProductoDto | null): void {
    this.productoSeleccionado.set(p);
    this.showProductoForm.set(true);
  }

  cerrarProductoForm(): void {
    this.showProductoForm.set(false);
    this.productoSeleccionado.set(null);
  }

  onProductoSaved(): void {
    this.cerrarProductoForm();
    this.cargarProductos();
  }

  eliminarProducto(p: ProductoDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      html: `¿Está seguro que desea eliminar <strong>${p.nombre}</strong>?<br>
             <span class="text-sm text-gray-500">Esta acción no se puede deshacer.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.productoService.delete(p.productoId).subscribe({
        next: () => {
          this.productos.update((list) => list.filter((x) => x.productoId !== p.productoId));
          this.totalCount.update((n) => n - 1);
          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado',
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
            text: 'No se pudo eliminar el producto. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          }),
      });
    });
  }

  // ── CRUD Categoría ───────────────────────────────────────────────────────────

  abrirCategoriaForm(c: ProductoCategoriaDto | null): void {
    this.categoriaSeleccionada.set(c);
    this.showCategoriaForm.set(true);
  }

  cerrarCategoriaForm(): void {
    this.showCategoriaForm.set(false);
    this.categoriaSeleccionada.set(null);
  }

  onCategoriaSaved(): void {
    this.cerrarCategoriaForm();
    this.cargarCategorias();
  }

  eliminarCategoria(c: ProductoCategoriaDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar categoría?',
      html: `¿Está seguro que desea eliminar <strong>${c.nombre}</strong>?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.categoriaService.delete(c.categoriaId).subscribe({
        next: () => {
          this.categorias.update((list) => list.filter((x) => x.categoriaId !== c.categoriaId));
          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            confirmButtonColor: '#2563eb',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error: (err) =>
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text:
              err.status === 409
                ? 'No se puede eliminar: hay productos usando esta categoría.'
                : 'No se pudo eliminar la categoría. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          }),
      });
    });
  }

  tipoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'Almacenable':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'Consumible':
        return 'bg-green-50 text-green-700 ring-green-200';
      case 'Servicio':
        return 'bg-purple-50 text-purple-700 ring-purple-200';
      default:
        return 'bg-gray-50 text-gray-500 ring-gray-200';
    }
  }
}
