import { Component, inject, input, output, signal, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ProductoDto,
  CategoriaDto,
  CreateProductoRequest,
  UpdateProductoRequest,
  TIPOS_PRODUCTO,
} from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="producto() ? 'Editar producto' : 'Nuevo producto'"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ producto() ? 'Editar producto' : 'Nuevo producto' }}
          </h2>
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

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Nombre -->
          <div>
            <label for="prod-nombre" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="prod-nombre"
              type="text"
              maxlength="200"
              placeholder="Ej: Armazón Titanio"
              [value]="nombre()"
              (input)="nombre.set($any($event.target).value)"
              (blur)="nombreTouched.set(true)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors bg-white
                     hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!nombreError()"
              [class.border-gray-200]="!nombreError()"
            />
            @if (nombreError()) {
              <p class="mt-1 text-xs text-red-600">{{ nombreError() }}</p>
            }
          </div>

          <!-- Descripción -->
          <div>
            <label for="prod-descripcion" class="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="prod-descripcion"
              rows="2"
              maxlength="1000"
              placeholder="Descripción del producto..."
              [value]="descripcion()"
              (input)="descripcion.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Tipo + Categoría -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="prod-tipo" class="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                id="prod-tipo"
                [value]="tipo()"
                (change)="tipo.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                @for (t of tipos; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </div>
            <div>
              <label for="prod-categoria" class="block text-sm font-medium text-gray-700 mb-1.5">
                Categoría <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <select
                id="prod-categoria"
                [value]="categoriaId()"
                (change)="categoriaId.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" [selected]="!categoriaId()">Sin categoría</option>
                @for (c of categorias(); track c.categoriaId) {
                  <option [value]="c.categoriaId" [selected]="c.categoriaId === categoriaId()">{{ c.nombre }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Código interno -->
          <div>
            <label for="prod-codigo" class="block text-sm font-medium text-gray-700 mb-1.5">
              Código interno <span class="text-red-500">*</span>
            </label>
            <input
              id="prod-codigo"
              type="text"
              maxlength="50"
              placeholder="Ej: ARM-001"
              [value]="codigoInterno()"
              (input)="codigoInterno.set($any($event.target).value)"
              (blur)="codigoInternoTouched.set(true)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors bg-white
                     hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!codigoInternoError()"
              [class.border-gray-200]="!codigoInternoError()"
            />
            @if (codigoInternoError()) {
              <p class="mt-1 text-xs text-red-600">{{ codigoInternoError() }}</p>
            }
          </div>

          <!-- Activo (solo en edición) -->
          @if (producto()) {
            <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                          hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
              <span class="flex flex-col gap-0.5">
                <span class="text-sm font-medium text-gray-800">Activo</span>
                <span class="text-xs text-gray-400">El producto aparece disponible para venta</span>
              </span>
              <input
                type="checkbox"
                [checked]="isActivo()"
                (change)="isActivo.set($any($event.target).checked)"
                class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </label>
          }

          <!-- Sub-productos (solo en edición) -->
          @if (producto()) {
            <div class="pt-2 border-t border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-gray-700">Sub-productos</p>
                @if (!showHijoForm()) {
                  <button
                    type="button"
                    (click)="abrirHijoForm(null)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700
                           bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Agregar sub-producto
                  </button>
                }
              </div>

              <!-- Lista hijos -->
              @if (hijos().length === 0 && !showHijoForm()) {
                <p class="text-xs text-gray-400 text-center py-3">Sin sub-productos registrados.</p>
              }
              @if (hijos().length > 0) {
                <div class="space-y-1.5 mb-3">
                  @for (h of hijos(); track h.productoId) {
                    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-sm text-gray-800 font-medium truncate">{{ h.nombre }}</span>
                        @if (h.codigoInterno) {
                          <span class="text-xs font-mono text-gray-400">{{ h.codigoInterno }}</span>
                        }
                        @if (!h.isActivo) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold
                                       bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200 shrink-0">
                            Inactivo
                          </span>
                        }
                      </div>
                      <div class="flex items-center gap-2 ml-2 shrink-0">
                        <button
                          type="button"
                          (click)="abrirHijoForm(h)"
                          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Editar sub-producto"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                 m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          (click)="eliminarHijo(h)"
                          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label="Eliminar sub-producto"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                                 m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Formulario inline hijo -->
              @if (showHijoForm()) {
                <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    {{ editingHijoId() ? 'Editar sub-producto' : 'Nuevo sub-producto' }}
                  </p>

                  <!-- Nombre -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      Nombre <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxlength="150"
                      placeholder="Ej: Talla M, Color Negro"
                      [value]="varNombre()"
                      (input)="varNombre.set($any($event.target).value)"
                      (blur)="varNombreTouched.set(true)"
                      class="w-full px-3 py-2 text-sm rounded-lg border transition-colors bg-white
                             hover:border-gray-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-300]="!!varNombreError()"
                      [class.border-gray-200]="!varNombreError()"
                    />
                    @if (varNombreError()) {
                      <p class="mt-0.5 text-xs text-red-600">{{ varNombreError() }}</p>
                    }
                  </div>

                  <!-- Categoría heredada del padre -->
                  @if (categoriaPadreNombre()) {
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                      <div class="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                        {{ categoriaPadreNombre() }}
                        <span class="ml-1 text-xs text-gray-400">(heredada del producto)</span>
                      </div>
                    </div>
                  }

                  <!-- Código interno -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      Código interno <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxlength="50"
                      placeholder="Ej: ARM-001-M"
                      [value]="varCodigoInterno()"
                      (input)="varCodigoInterno.set($any($event.target).value)"
                      (blur)="varCodigoInternoTouched.set(true)"
                      class="w-full px-3 py-2 text-sm rounded-lg border transition-colors bg-white
                             hover:border-gray-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-300]="!!varCodigoInternoError()"
                      [class.border-gray-200]="!varCodigoInternoError()"
                    />
                    @if (varCodigoInternoError()) {
                      <p class="mt-0.5 text-xs text-red-600">{{ varCodigoInternoError() }}</p>
                    }
                  </div>

                  <!-- Activo (solo edición) -->
                  @if (editingHijoId()) {
                    <label class="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-gray-100 cursor-pointer">
                      <span class="text-xs font-medium text-gray-700">Sub-producto activo</span>
                      <input
                        type="checkbox"
                        [checked]="varIsActivo()"
                        (change)="varIsActivo.set($any($event.target).checked)"
                        class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </label>
                  }

                  <!-- Botones -->
                  <div class="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      (click)="cancelarHijoForm()"
                      class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200
                             rounded-lg hover:bg-gray-50 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      (click)="guardarHijo()"
                      [disabled]="loadingVariante()"
                      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
                             bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                             rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      @if (loadingVariante()) {
                        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      }
                      {{ editingHijoId() ? 'Guardar cambios' : 'Agregar' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          }

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
            {{ producto() ? 'Guardar cambios' : 'Crear producto' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductoFormComponent {
  private readonly productoService = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly producto = input<ProductoDto | null>(null);
  readonly categorias = input<CategoriaDto[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly tipos = TIPOS_PRODUCTO;
  readonly loading = signal(false);

  // ── Campos del producto ──────────────────────────────────────────────────────
  readonly nombre = signal('');
  readonly nombreTouched = signal(false);
  readonly descripcion = signal('');
  readonly tipo = signal('Producto');
  readonly categoriaId = signal('');
  readonly codigoInterno = signal('');
  readonly codigoInternoTouched = signal(false);
  readonly isActivo = signal(true);

  // ── Validación ───────────────────────────────────────────────────────────────
  readonly nombreError = computed(() => {
    if (!this.nombreTouched()) return '';
    const v = this.nombre().trim();
    if (!v) return 'El nombre es requerido.';
    if (v.length > 200) return 'Máximo 200 caracteres.';
    return '';
  });

  readonly codigoInternoError = computed(() => {
    if (!this.codigoInternoTouched()) return '';
    if (!this.codigoInterno().trim()) return 'El código interno es requerido.';
    return '';
  });

  readonly formValid = computed(() => {
    const n = this.nombre().trim();
    const c = this.codigoInterno().trim();
    return !!n && n.length <= 200 && !!c;
  });

  // ── Hijos (sub-productos) ─────────────────────────────────────────────────────
  readonly hijos = signal<ProductoDto[]>([]);
  readonly showHijoForm = signal(false);
  readonly editingHijoId = signal<string | null>(null);

  readonly varNombre = signal('');
  readonly varNombreTouched = signal(false);
  readonly varCodigoInterno = signal('');
  readonly varCodigoInternoTouched = signal(false);
  readonly varIsActivo = signal(true);
  readonly loadingVariante = signal(false);

  readonly varNombreError = computed(() => {
    if (!this.varNombreTouched()) return '';
    if (!this.varNombre().trim()) return 'El nombre es requerido.';
    return '';
  });

  readonly varCodigoInternoError = computed(() => {
    if (!this.varCodigoInternoTouched()) return '';
    if (!this.varCodigoInterno().trim()) return 'El código interno es requerido.';
    return '';
  });

  readonly varFormValid = computed(
    () => !!this.varNombre().trim() && !!this.varCodigoInterno().trim(),
  );

  readonly categoriaPadreNombre = computed(() => {
    const catId = this.categoriaId();
    if (!catId) return '';
    return this.categorias().find(c => c.categoriaId === catId)?.nombre ?? '';
  });

  constructor() {
    effect(() => {
      const p = this.producto();
      if (!p) return;
      this.nombre.set(p.nombre);
      this.descripcion.set(p.descripcion ?? '');
      this.tipo.set(p.tipo);
      this.categoriaId.set(p.categoriaId ?? '');
      this.codigoInterno.set(p.codigoInterno ?? '');
      this.isActivo.set(p.isActivo);
      this.hijos.set([...p.hijos]);
    });
  }

  onSubmit(): void {
    this.nombreTouched.set(true);
    this.codigoInternoTouched.set(true);
    if (!this.formValid()) return;

    this.loading.set(true);
    const existing = this.producto();

    if (existing) {
      const req: UpdateProductoRequest = {
        codigoInterno: this.codigoInterno().trim(),
        nombre: this.nombre().trim(),
        descripcion: this.descripcion().trim() || undefined,
        tipo: this.tipo(),
        categoriaId: this.categoriaId() || undefined,
        productoPadreId: existing.productoPadreId,
        isActivo: this.isActivo(),
      };
      this.productoService.update(existing.productoId, req).subscribe({
        next: () => this.onSuccess('actualizado'),
        error: (err) => this.handleError(err),
      });
    } else {
      const req: CreateProductoRequest = {
        codigoInterno: this.codigoInterno().trim(),
        nombre: this.nombre().trim(),
        descripcion: this.descripcion().trim() || undefined,
        tipo: this.tipo(),
        categoriaId: this.categoriaId() || undefined,
      };
      this.productoService.create(req).subscribe({
        next: () => this.onSuccess('creado'),
        error: (err) => this.handleError(err),
      });
    }
  }

  // ── Métodos de hijos ──────────────────────────────────────────────────────────

  abrirHijoForm(hijo: ProductoDto | null): void {
    this.editingHijoId.set(hijo?.productoId ?? null);
    this.varNombre.set(hijo?.nombre ?? '');
    this.varNombreTouched.set(false);
    this.varCodigoInterno.set(hijo?.codigoInterno ?? '');
    this.varIsActivo.set(hijo?.isActivo ?? true);
    this.showHijoForm.set(true);
  }

  cancelarHijoForm(): void {
    this.showHijoForm.set(false);
    this.editingHijoId.set(null);
    this.varCodigoInternoTouched.set(false);
    this.varNombreTouched.set(false);
  }

  guardarHijo(): void {
    this.varNombreTouched.set(true);
    this.varCodigoInternoTouched.set(true);
    if (!this.varFormValid()) return;

    const productoId = this.producto()?.productoId;
    if (!productoId) return;

    this.loadingVariante.set(true);
    const editingId = this.editingHijoId();

    if (editingId) {
      const hijoActual = this.hijos().find(h => h.productoId === editingId);
      const req: UpdateProductoRequest = {
        codigoInterno: this.varCodigoInterno().trim(),
        nombre: this.varNombre().trim(),
        tipo: hijoActual?.tipo ?? this.tipo(),
        productoPadreId: productoId,
        isActivo: this.varIsActivo(),
      };
      this.productoService
        .update(editingId, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.hijos.update(list =>
              list.map(h =>
                h.productoId === editingId
                  ? { ...h, nombre: req.nombre, codigoInterno: req.codigoInterno, isActivo: req.isActivo }
                  : h,
              ),
            );
            this.loadingVariante.set(false);
            this.cancelarHijoForm();
          },
          error: () => {
            this.loadingVariante.set(false);
            Swal.fire({ icon: 'error', title: 'Error al guardar', confirmButtonColor: '#2563eb', confirmButtonText: 'Cerrar' });
          },
        });
    } else {
      const req: CreateProductoRequest = {
        codigoInterno: this.varCodigoInterno().trim(),
        nombre: this.varNombre().trim(),
        tipo: this.tipo(),
        categoriaId: this.categoriaId() || undefined,
        productoPadreId: productoId,
      };
      this.productoService
        .create(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const nuevo: ProductoDto = {
              productoId: res.id,
              tenantId: this.producto()!.tenantId,
              productoPadreId: productoId,
              codigoInterno: req.codigoInterno,
              nombre: req.nombre,
              tipo: req.tipo,
              isActivo: true,
              hijos: [],
              createdAt: new Date().toISOString(),
            };
            this.hijos.update(list => [...list, nuevo]);
            this.loadingVariante.set(false);
            this.cancelarHijoForm();
          },
          error: () => {
            this.loadingVariante.set(false);
            Swal.fire({ icon: 'error', title: 'Error al guardar', confirmButtonColor: '#2563eb', confirmButtonText: 'Cerrar' });
          },
        });
    }
  }

  eliminarHijo(hijo: ProductoDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar sub-producto?',
      html: `¿Está seguro que desea eliminar <strong>${hijo.nombre}</strong>?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.productoService
        .delete(hijo.productoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.hijos.update(list => list.filter(h => h.productoId !== hijo.productoId)),
          error: () =>
            Swal.fire({ icon: 'error', title: 'Error al eliminar', confirmButtonColor: '#2563eb', confirmButtonText: 'Cerrar' }),
        });
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelled.emit();
  }

  private onSuccess(accion: string): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'success',
      title: `Producto ${accion}`,
      text: `El producto fue ${accion} exitosamente.`,
      confirmButtonColor: '#2563eb',
      timer: 2200,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => this.saved.emit());
  }

  private handleError(err: { status?: number; error?: { detail?: string } }): void {
    this.loading.set(false);
    const msg =
      err.error?.detail ??
      (err.status === 409
        ? 'Ya existe un producto con ese código interno.'
        : err.status === 400
          ? 'Datos inválidos. Revise los campos e intente nuevamente.'
          : 'Error al guardar. Intente nuevamente más tarde.');
    Swal.fire({ icon: 'error', title: 'Error al guardar', text: msg, confirmButtonColor: '#2563eb', confirmButtonText: 'Cerrar' });
  }
}
