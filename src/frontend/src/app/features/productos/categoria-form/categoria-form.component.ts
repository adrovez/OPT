import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CategoriaDto } from '../../../core/models/producto.model';
import { ProductoCategoriaService } from '../../../core/services/producto-categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="categoria() ? 'Editar categoría' : 'Nueva categoría'"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ categoria() ? 'Editar categoría' : 'Nueva categoría' }}
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
        <div class="px-6 py-5">
          <label for="cat-nombre" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            id="cat-nombre"
            type="text"
            maxlength="100"
            placeholder="Ej: Armazones"
            [value]="nombre()"
            (input)="nombre.set($any($event.target).value)"
            (blur)="nombreTouched.set(true)"
            (keydown.enter)="onSubmit()"
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

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
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
            {{ categoria() ? 'Guardar cambios' : 'Crear categoría' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CategoriaFormComponent {
  private readonly categoriaService = inject(ProductoCategoriaService);

  readonly categoria = input<CategoriaDto | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly nombre = signal('');
  readonly nombreTouched = signal(false);

  readonly nombreError = computed(() => {
    if (!this.nombreTouched()) return '';
    const v = this.nombre().trim();
    if (!v) return 'El nombre es requerido.';
    if (v.length > 100) return 'Máximo 100 caracteres.';
    return '';
  });

  readonly formValid = computed(() => {
    const v = this.nombre().trim();
    return !!v && v.length <= 100;
  });

  constructor() {
    effect(() => {
      const c = this.categoria();
      if (c) this.nombre.set(c.nombre);
    });
  }

  onSubmit(): void {
    this.nombreTouched.set(true);
    if (!this.formValid()) return;

    this.loading.set(true);
    const existing = this.categoria();
    const request = { nombre: this.nombre().trim() };

    if (existing) {
      this.categoriaService.update(existing.categoriaId, { ...request, isActivo: existing.isActivo ?? true }).subscribe({
        next: () => this.onSuccess('actualizada'),
        error: (err) => this.handleError(err),
      });
    } else {
      this.categoriaService.create(request).subscribe({
        next: () => this.onSuccess('creada'),
        error: (err) => this.handleError(err),
      });
    }
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
      title: `Categoría ${accion}`,
      text: `La categoría fue ${accion} exitosamente.`,
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
        ? 'Ya existe una categoría con ese nombre.'
        : 'Error al guardar. Intente nuevamente más tarde.');
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: msg,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Cerrar',
    });
  }
}
