import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AnamnesisDto, CreateAnamnesisRequest, UpdateAnamnesisRequest } from '../../../core/models/anamnesis.model';
import { AnamnesisService } from '../../../core/services/anamnesis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-anamnesis-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="anamnesis() ? 'Editar anamnesis' : 'Nueva anamnesis'"
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
            @if (viewOnly()) { Ver anamnesis }
            @else { {{ anamnesis() ? 'Editar anamnesis' : 'Nueva anamnesis' }} }
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
          class="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          id="anamnesis-form"
        >
          <!-- Condiciones de salud -->
          <div>
            <p class="text-sm font-medium text-gray-700 mb-3">Condiciones de salud</p>
            <div class="space-y-2">

              <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                            hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <span class="flex items-center gap-3">
                  <span class="text-lg" aria-hidden="true">🩺</span>
                  <span class="text-sm font-medium text-gray-800">Hipertensión</span>
                </span>
                <input
                  type="checkbox"
                  formControlName="hipertension"
                  class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

              <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                            hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <span class="flex items-center gap-3">
                  <span class="text-lg" aria-hidden="true">🩸</span>
                  <span class="text-sm font-medium text-gray-800">Diabetes</span>
                </span>
                <input
                  type="checkbox"
                  formControlName="diabetes"
                  class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

              <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                            hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <span class="flex items-center gap-3">
                  <span class="text-lg" aria-hidden="true">🌿</span>
                  <span class="text-sm font-medium text-gray-800">Alergias</span>
                </span>
                <input
                  type="checkbox"
                  formControlName="alergias"
                  class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

              <label class="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100
                            hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <span class="flex items-center gap-3">
                  <span class="text-lg" aria-hidden="true">👓</span>
                  <span class="text-sm font-medium text-gray-800">Usa lentes</span>
                </span>
                <input
                  type="checkbox"
                  formControlName="usaLentes"
                  class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

            </div>
          </div>

          <!-- Observación -->
          <div>
            <label for="observacion" class="block text-sm font-medium text-gray-700 mb-1.5">
              Observación
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="observacion"
              formControlName="observacion"
              rows="4"
              placeholder="Notas adicionales sobre el estado de salud del paciente..."
              maxlength="1000"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
            <p class="mt-1 text-xs text-gray-400 text-right">
              {{ form.get('observacion')?.value?.length ?? 0 }} / 1000
            </p>
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
            {{ viewOnly() ? 'Cerrar' : 'Cancelar' }}
          </button>
          @if (!viewOnly()) {
            <button
              type="submit"
              form="anamnesis-form"
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
              {{ anamnesis() ? 'Guardar cambios' : 'Registrar anamnesis' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class AnamnesisFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly anamnesisService = inject(AnamnesisService);

  readonly anamnesis = input<AnamnesisDto | null>(null);
  readonly clienteId = input.required<string>();
  readonly viewOnly = input<boolean>(false);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    hipertension: [false],
    diabetes:     [false],
    alergias:     [false],
    usaLentes:    [false],
    observacion:  [''],
  });

  ngOnInit(): void {
    const a = this.anamnesis();
    if (!a) return;
    this.form.patchValue({
      hipertension: a.hipertension,
      diabetes:     a.diabetes,
      alergias:     a.alergias,
      usaLentes:    a.usaLentes,
      observacion:  a.observacion ?? '',
    });
    if (this.viewOnly()) this.form.disable();
  }

  onSubmit(): void {
    this.loading.set(true);
    const values = this.form.getRawValue();
    const existing = this.anamnesis();

    if (existing) {
      const req: UpdateAnamnesisRequest = {
        hipertension: values.hipertension ?? false,
        diabetes:     values.diabetes     ?? false,
        alergias:     values.alergias     ?? false,
        usaLentes:    values.usaLentes    ?? false,
        observacion:  values.observacion  || undefined,
      };
      this.anamnesisService.update(existing.anamnesisId, req).subscribe({
        next: () => this.onSuccess('actualizada'),
        error: (err) => this.handleError(err),
      });
    } else {
      const req: CreateAnamnesisRequest = {
        clienteId:    this.clienteId(),
        hipertension: values.hipertension ?? false,
        diabetes:     values.diabetes     ?? false,
        alergias:     values.alergias     ?? false,
        usaLentes:    values.usaLentes    ?? false,
        observacion:  values.observacion  || undefined,
      };
      this.anamnesisService.create(req).subscribe({
        next: () => this.onSuccess('registrada'),
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
      title: `Anamnesis ${accion}`,
      text: `La anamnesis fue ${accion} exitosamente.`,
      confirmButtonColor: '#2563eb',
      timer: 2200,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => this.saved.emit());
  }

  private handleError(err: { status?: number; error?: { message?: string } }): void {
    this.loading.set(false);
    const msg =
      err.error?.message ??
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
