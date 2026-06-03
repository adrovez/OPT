import { Component, inject, input, output, signal, computed } from '@angular/core';
import { StockDto, TIPOS_MOVIMIENTO, TipoMovimiento } from '../../../core/models/stock.model';
import { StockService } from '../../../core/services/stock.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar movimiento de stock"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Registrar movimiento</h2>
            <p class="text-xs text-gray-400 mt-0.5 truncate max-w-[18rem]">
              {{ stock()?.productoNombre }}
            </p>
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

        <!-- Stock actual (resumen) -->
        <div class="mx-6 mt-5 flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
          <div class="text-center">
            <p class="text-xs text-gray-400">Stock actual</p>
            <p class="text-xl font-bold" [class.text-red-600]="stock()?.bajoMinimo" [class.text-gray-900]="!stock()?.bajoMinimo">
              {{ stock()?.cantidadDisponible ?? 0 }}
            </p>
          </div>
          <div class="w-px h-10 bg-gray-200"></div>
          <div class="text-center">
            <p class="text-xs text-gray-400">Stock mínimo</p>
            <p class="text-xl font-bold text-gray-500">{{ stock()?.stockMinimo ?? 0 }}</p>
          </div>
          @if (stock()?.bajoMinimo) {
            <span class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                         bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42
                     c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3
                     a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"/>
              </svg>
              Bajo mínimo
            </span>
          }
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Tipo de movimiento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Tipo <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              @for (tipo of tipos; track tipo) {
                <button
                  type="button"
                  (click)="tipoMovimiento.set(tipo); cantidadTouched.set(false)"
                  class="py-2.5 text-sm font-medium rounded-lg border transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.bg-blue-600]="tipoMovimiento() === tipo"
                  [class.text-white]="tipoMovimiento() === tipo"
                  [class.border-blue-600]="tipoMovimiento() === tipo"
                  [class.bg-white]="tipoMovimiento() !== tipo"
                  [class.text-gray-700]="tipoMovimiento() !== tipo"
                  [class.border-gray-200]="tipoMovimiento() !== tipo"
                  [class.hover:border-gray-300]="tipoMovimiento() !== tipo"
                >
                  {{ tipo }}
                </button>
              }
            </div>
            @if (tipoMovimiento() === 'Ajuste') {
              <p class="mt-1.5 text-xs text-gray-400">Positivo suma al stock, negativo resta.</p>
            }
          </div>

          <!-- Cantidad -->
          <div>
            <label for="mov-cantidad" class="block text-sm font-medium text-gray-700 mb-1.5">
              Cantidad <span class="text-red-500">*</span>
            </label>
            <input
              id="mov-cantidad"
              type="number"
              [attr.min]="tipoMovimiento() !== 'Ajuste' ? 1 : null"
              step="1"
              placeholder="{{ tipoMovimiento() === 'Ajuste' ? 'Ej: 5 o -3' : 'Ej: 10' }}"
              [value]="cantidad()"
              (input)="cantidad.set(+$any($event.target).value); cantidadTouched.set(true)"
              (blur)="cantidadTouched.set(true)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors bg-white
                     hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="!!cantidadError()"
              [class.border-gray-200]="!cantidadError()"
            />
            @if (cantidadError()) {
              <p class="mt-1 text-xs text-red-600">{{ cantidadError() }}</p>
            }
          </div>

          <!-- Referencia -->
          <div>
            <label for="mov-referencia" class="block text-sm font-medium text-gray-700 mb-1.5">
              Referencia <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="mov-referencia"
              type="text"
              maxlength="100"
              placeholder="Ej: ORD-001, FAC-123"
              [value]="referencia()"
              (input)="referencia.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Observación -->
          <div>
            <label for="mov-observacion" class="block text-sm font-medium text-gray-700 mb-1.5">
              Observación <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="mov-observacion"
              rows="2"
              maxlength="500"
              placeholder="Motivo del movimiento..."
              [value]="observacion()"
              (input)="observacion.set($any($event.target).value)"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
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
            Registrar
          </button>
        </div>

      </div>
    </div>
  `,
})
export class MovimientoFormComponent {
  private readonly stockService = inject(StockService);

  readonly stock = input<StockDto | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly tipos = TIPOS_MOVIMIENTO.filter(t => t !== 'Entrada') as TipoMovimiento[];
  readonly loading = signal(false);

  readonly tipoMovimiento = signal<TipoMovimiento>('Salida');
  readonly cantidad = signal(0);
  readonly cantidadTouched = signal(false);
  readonly referencia = signal('');
  readonly observacion = signal('');

  readonly cantidadError = computed(() => {
    if (!this.cantidadTouched()) return '';
    const tipo = this.tipoMovimiento();
    const cant = this.cantidad();
    if (tipo === 'Entrada' || tipo === 'Salida') {
      return cant > 0 ? '' : 'Debe ser mayor a 0.';
    }
    return cant !== 0 ? '' : 'No puede ser 0.';
  });

  readonly formValid = computed(() => {
    const tipo = this.tipoMovimiento();
    const cant = this.cantidad();
    return tipo === 'Ajuste' ? cant !== 0 : cant > 0;
  });

  onSubmit(): void {
    this.cantidadTouched.set(true);
    if (!this.formValid()) return;

    const productoId = this.stock()?.productoId;
    if (!productoId) return;

    this.loading.set(true);

    this.stockService
      .registrarMovimiento({
        productoId,
        tipoMovimiento: this.tipoMovimiento(),
        cantidad: this.cantidad(),
        referencia: this.referencia().trim() || undefined,
        observacion: this.observacion().trim() || undefined,
      })
      .subscribe({
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
            text: err.error?.detail ?? 'No se pudo registrar el movimiento. Intente nuevamente.',
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
