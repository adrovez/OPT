import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioDto } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cambiar contraseña"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal panel -->
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ usuario().nombre }}</p>
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

        <!-- Formulario -->
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          novalidate
          class="px-6 py-5"
          id="password-form"
        >
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nueva contraseña <span class="text-red-500">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              formControlName="newPassword"
              maxlength="100"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="form.get('newPassword')?.invalid && form.get('newPassword')?.touched"
            />
            @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <p class="mt-1 text-xs text-red-600">La contraseña debe tener al menos 6 caracteres.</p>
            }
          </div>
        </form>

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
            type="submit"
            form="password-form"
            [disabled]="loading() || form.invalid"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                   bg-amber-600 hover:bg-amber-700 active:bg-amber-800
                   disabled:bg-amber-400 disabled:cursor-not-allowed
                   rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            @if (loading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            }
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UsuarioPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  readonly usuario = input.required<UsuarioDto>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.usuarioService
      .changePassword(this.usuario().usuarioId, { newPassword: this.form.value.newPassword! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'La contraseña fue cambiada exitosamente.',
            confirmButtonColor: '#2563eb',
            timer: 2200,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => this.saved.emit());
        },
        error: (err: { status?: number; error?: { detail?: string } }) => {
          this.loading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error al cambiar contraseña',
            text: err.error?.detail ?? 'No se pudo cambiar la contraseña. Intente nuevamente.',
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
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }
}
