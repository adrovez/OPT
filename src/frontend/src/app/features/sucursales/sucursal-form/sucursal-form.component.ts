import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalDto, CreateSucursalRequest, UpdateSucursalRequest } from '../../../core/models/sucursal.model';
import { SucursalService } from '../../../core/services/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sucursal-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="sucursal() ? 'Editar sucursal' : 'Nueva sucursal'"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal panel -->
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ sucursal() ? 'Editar sucursal' : 'Nueva sucursal' }}
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

        <!-- Formulario -->
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          novalidate
          class="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          id="sucursal-form"
        >
          <!-- Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              maxlength="150"
              placeholder="Ej: Sucursal Centro"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
            />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="mt-1 text-xs text-red-600">El nombre es requerido (máx. 150 caracteres).</p>
            }
          </div>

          <!-- Dirección -->
          <div>
            <label for="direccion" class="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="direccion"
              type="text"
              formControlName="direccion"
              maxlength="200"
              placeholder="Ej: Av. Providencia 1234, Santiago"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1.5">
              Teléfono
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="telefono"
              type="tel"
              formControlName="telefono"
              maxlength="20"
              placeholder="Ej: +56 2 2345 6789"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Matriz (toggle) -->
          <div>
            <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                          hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
              <span class="flex flex-col gap-0.5">
                <span class="text-sm font-medium text-gray-800">Sede matriz</span>
                <span class="text-xs text-gray-400">Marcar si esta es la sucursal principal</span>
              </span>
              <input
                type="checkbox"
                formControlName="matriz"
                class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </form>

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
            type="submit"
            form="sucursal-form"
            [disabled]="loading() || form.invalid"
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
            {{ sucursal() ? 'Guardar cambios' : 'Crear sucursal' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SucursalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sucursalService = inject(SucursalService);

  readonly sucursal = input<SucursalDto | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    nombre:    ['', [Validators.required, Validators.maxLength(150)]],
    direccion: [''],
    telefono:  [''],
    matriz:    [false],
  });

  ngOnInit(): void {
    const s = this.sucursal();
    if (!s) return;
    this.form.patchValue({
      nombre:    s.nombre,
      direccion: s.direccion ?? '',
      telefono:  s.telefono  ?? '',
      matriz:    s.matriz,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const values = this.form.getRawValue();
    const existing = this.sucursal();

    const base = {
      nombre:    values.nombre!.trim(),
      direccion: values.direccion?.trim() || undefined,
      telefono:  values.telefono?.trim()  || undefined,
      matriz:    values.matriz ?? false,
    };

    if (existing) {
      const req: UpdateSucursalRequest = base;
      this.sucursalService.update(existing.sucursalId, req).subscribe({
        next: () => this.onSuccess('actualizada'),
        error: (err) => this.handleError(err),
      });
    } else {
      const req: CreateSucursalRequest = base;
      this.sucursalService.create(req).subscribe({
        next: () => this.onSuccess('creada'),
        error: (err) => this.handleError(err),
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  private onSuccess(accion: string): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'success',
      title: `Sucursal ${accion}`,
      text: `La sucursal fue ${accion} exitosamente.`,
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
      (err.status === 400
        ? 'Datos inválidos. Revise los campos e intente nuevamente.'
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
