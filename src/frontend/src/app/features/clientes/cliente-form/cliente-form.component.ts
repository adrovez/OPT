import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="cliente() ? 'Editar cliente' : 'Nuevo cliente'"
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
            {{ cliente() ? 'Editar cliente' : 'Nuevo cliente' }}
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
          id="cliente-form"
        >
          <!-- Tipo de cliente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de cliente</label>
            <div class="flex gap-3">
              @for (tipo of tiposCliente; track tipo.value) {
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    formControlName="tipoCliente"
                    [value]="tipo.value"
                    class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">{{ tipo.label }}</span>
                </label>
              }
            </div>
          </div>

          <!-- RUT / Número de documento -->
          <div>
            <label for="numeroDocumento" class="block text-sm font-medium text-gray-700 mb-1.5">
              Número de documento <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="numeroDocumento"
              type="text"
              formControlName="numeroDocumento"
              placeholder="12345678-9"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class]="fieldClass('numeroDocumento')"
            />
            @if (isInvalid('numeroDocumento')) {
              <p class="mt-1.5 text-xs text-red-600" role="alert">El número de documento es obligatorio</p>
            }
          </div>

          <!-- Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre completo <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Juan Pérez"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class]="fieldClass('nombre')"
            />
            @if (isInvalid('nombre')) {
              <p class="mt-1.5 text-xs text-red-600" role="alert">El nombre es obligatorio</p>
            }
          </div>

          <!-- Dirección -->
          <div>
            <label for="direccion" class="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              formControlName="direccion"
              placeholder="Av. Principal 123"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Celular / Mail -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="celular" class="block text-sm font-medium text-gray-700 mb-1.5">
                Celular
              </label>
              <input
                id="celular"
                type="tel"
                formControlName="celular"
                placeholder="+56912345678"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="mail" class="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="mail"
                type="email"
                formControlName="mail"
                placeholder="correo@ejemplo.cl"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class]="fieldClass('mail')"
              />
              @if (isInvalid('mail')) {
                <p class="mt-1.5 text-xs text-red-600" role="alert">Formato de email inválido</p>
              }
            </div>
          </div>

          <!-- Fecha nacimiento / Previsión -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de nacimiento
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                formControlName="fechaNacimiento"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="tipoPrevision" class="block text-sm font-medium text-gray-700 mb-1.5">
                Previsión
              </label>
              <select
                id="tipoPrevision"
                formControlName="tipoPrevision"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                @for (prev of previsionOptions; track prev) {
                  <option [value]="prev">{{ prev }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Giro (solo Empresa) -->
          @if (form.get('tipoCliente')?.value === 'Empresa') {
            <div>
              <label for="giro" class="block text-sm font-medium text-gray-700 mb-1.5">
                Giro comercial
              </label>
              <input
                id="giro"
                type="text"
                formControlName="giro"
                placeholder="Comercio al por menor"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          }

          <!-- Error general -->
          @if (errorMessage()) {
            <div class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg" role="alert">
              <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
          }
        </form>

        <!-- Footer / Acciones -->
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
            form="cliente-form"
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
            {{ cliente() ? 'Guardar cambios' : 'Crear cliente' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ClienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly authService = inject(AuthService);

  // Inputs / Outputs
  readonly cliente = input<Cliente | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly tiposCliente = [
    { value: 'Persona', label: 'Persona' },
    { value: 'Empresa', label: 'Empresa' },
  ];

  readonly previsionOptions = ['FONASA', 'ISAPRE', 'DIPRECA', 'CAPREDENA', 'Sin previsión'];

  readonly form = this.fb.group({
    tipoCliente: ['Persona', Validators.required],
    numeroDocumento: ['', Validators.required],
    nombre: ['', Validators.required],
    direccion: [''],
    celular: [''],
    mail: ['', [Validators.email]],
    fechaNacimiento: [''],
    tipoPrevision: [''],
    giro: [''],
  });

  ngOnInit(): void {
    const c = this.cliente();
    if (c) {
      this.form.patchValue({
        tipoCliente: c.tipoCliente,
        numeroDocumento: c.numeroDocumento,
        nombre: c.nombre,
        direccion: c.direccion ?? '',
        celular: c.celular ?? '',
        mail: c.mail ?? '',
        fechaNacimiento: c.fechaNacimiento ?? '',
        tipoPrevision: c.tipoPrevision ?? '',
        giro: c.giro ?? '',
      });
    }
  }

  fieldClass(field: string): string {
    const control = this.form.get(field);
    return control?.invalid && control?.touched
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const tenantId = this.authService.currentUser()?.tenantId ?? 1;
    const values = this.form.value;

    const existing = this.cliente();

    if (existing) {
      const dto: UpdateClienteDto = {
        tipoCliente: values.tipoCliente ?? undefined,
        numeroDocumento: values.numeroDocumento ?? undefined,
        nombre: values.nombre ?? undefined,
        direccion: values.direccion || undefined,
        celular: values.celular || undefined,
        mail: values.mail || undefined,
        fechaNacimiento: values.fechaNacimiento || undefined,
        tipoPrevision: values.tipoPrevision || undefined,
        giro: values.giro || undefined,
      };

      this.clienteService.updateCliente(existing.clienteId, dto).subscribe({
        next: () => { this.loading.set(false); this.saved.emit(); },
        error: (err) => this.handleError(err),
      });
    } else {
      const dto: CreateClienteDto = {
        tenantId,
        tipoCliente: values.tipoCliente ?? 'Persona',
        numeroDocumento: values.numeroDocumento ?? '',
        nombre: values.nombre ?? '',
        direccion: values.direccion || undefined,
        celular: values.celular || undefined,
        mail: values.mail || undefined,
        fechaNacimiento: values.fechaNacimiento || undefined,
        tipoPrevision: values.tipoPrevision || undefined,
        giro: values.giro || undefined,
      };

      this.clienteService.createCliente(dto).subscribe({
        next: () => { this.loading.set(false); this.saved.emit(); },
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

  private handleError(err: { status?: number; error?: { message?: string } }): void {
    this.loading.set(false);
    const msg =
      err.error?.message ??
      (err.status === 400 ? 'Datos inválidos. Revise los campos e intente nuevamente.' : 'Error al guardar. Intente nuevamente.');
    this.errorMessage.set(msg);
  }
}
