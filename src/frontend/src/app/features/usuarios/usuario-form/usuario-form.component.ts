import { Component, inject, input, output, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioDto, CreateUsuarioRequest, UpdateUsuarioRequest, SucursalResumen } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { SucursalDto } from '../../../core/models/sucursal.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="usuario() ? 'Editar usuario' : 'Nuevo usuario'"
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
            {{ usuario() ? 'Editar usuario' : 'Nuevo usuario' }}
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
          id="usuario-form"
        >

          <!-- RUT (solo en creación) -->
          @if (!usuario()) {
            <div>
              <label for="rut" class="block text-sm font-medium text-gray-700 mb-1.5">
                RUT <span class="text-red-500">*</span>
              </label>
              <input
                id="rut"
                type="text"
                formControlName="rutUsuario"
                maxlength="20"
                placeholder="Ej: 12345678-9"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-300]="form.get('rutUsuario')?.invalid && form.get('rutUsuario')?.touched"
              />
              @if (form.get('rutUsuario')?.invalid && form.get('rutUsuario')?.touched) {
                <p class="mt-1 text-xs text-red-600">El RUT es requerido (máx. 20 caracteres).</p>
              }
            </div>
          }

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
              placeholder="Ej: Juan Pérez"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
            />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="mt-1 text-xs text-red-600">El nombre es requerido (máx. 150 caracteres).</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              maxlength="150"
              placeholder="Ej: juan@optica.cl"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="form.get('email')?.invalid && form.get('email')?.touched"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="mt-1 text-xs text-red-600">Ingrese un email válido.</p>
            }
          </div>

          <!-- Contraseña (solo en creación) -->
          @if (!usuario()) {
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                maxlength="100"
                placeholder="Mínimo 6 caracteres"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-300]="form.get('password')?.invalid && form.get('password')?.touched"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="mt-1 text-xs text-red-600">La contraseña debe tener al menos 6 caracteres.</p>
              }
            </div>
          }

          <!-- Rol -->
          <div>
            <label for="rol" class="block text-sm font-medium text-gray-700 mb-1.5">
              Rol <span class="text-red-500">*</span>
            </label>
            <select
              id="rol"
              formControlName="rol"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                     hover:border-gray-300 bg-white transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class.border-red-300]="form.get('rol')?.invalid && form.get('rol')?.touched"
            >
              <option value="">Seleccione un rol</option>
              <option value="Admin">Admin</option>
              <option value="Operador">Operador</option>
              <option value="Lectura">Lectura</option>
            </select>
            @if (form.get('rol')?.invalid && form.get('rol')?.touched) {
              <p class="mt-1 text-xs text-red-600">Seleccione un rol.</p>
            }
          </div>

          <!-- Gestión de sucursales (solo en edición) -->
          @if (usuario()) {
            <div class="pt-2 border-t border-gray-100">
              <p class="text-sm font-medium text-gray-700 mb-3">Sucursales asignadas</p>

              <!-- Chips sucursales asignadas -->
              @if (sucursalesAsignadas().length === 0) {
                <p class="text-xs text-gray-400 mb-3">Sin sucursales asignadas.</p>
              } @else {
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (s of sucursalesAsignadas(); track s.sucursalId) {
                    <span class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                                 bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                      {{ s.nombre }}
                      <button
                        type="button"
                        (click)="quitarSucursal(s)"
                        [disabled]="loadingSucursal()"
                        class="flex items-center justify-center w-4 h-4 rounded-full text-blue-500
                               hover:text-red-600 hover:bg-red-50 transition-colors
                               focus:outline-none disabled:opacity-40"
                        [attr.aria-label]="'Quitar ' + s.nombre"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </span>
                  }
                </div>
              }

              <!-- Asignar nueva sucursal -->
              @if (sucursalesDisponibles().length > 0) {
                <div class="flex gap-2">
                  <select
                    (change)="onSucursalSelectChange($event)"
                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200
                           hover:border-gray-300 bg-white transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    @for (s of sucursalesDisponibles(); track s.sucursalId) {
                      <option [value]="s.sucursalId">{{ s.nombre }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    (click)="asignarSucursal()"
                    [disabled]="!sucursalSeleccionadaId || loadingSucursal()"
                    class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200
                           rounded-lg hover:bg-blue-100 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Asignar
                  </button>
                </div>
              }

              <!-- Error sucursal -->
              @if (errorSucursal()) {
                <p class="mt-2 text-xs text-red-600">{{ errorSucursal() }}</p>
              }
            </div>
          }

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
            form="usuario-form"
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
            {{ usuario() ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly sucursalService = inject(SucursalService);

  readonly usuario = input<UsuarioDto | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly loadingSucursal = signal(false);
  readonly errorSucursal = signal('');

  readonly sucursalesAsignadas = signal<SucursalResumen[]>([]);
  readonly todasLasSucursales = signal<SucursalDto[]>([]);
  sucursalSeleccionadaId = '';

  readonly sucursalesDisponibles = computed(() => {
    const asignadasIds = new Set(this.sucursalesAsignadas().map((s) => s.sucursalId));
    return this.todasLasSucursales().filter((s) => !asignadasIds.has(s.sucursalId));
  });

  readonly form = this.fb.group({
    rutUsuario: [''],
    nombre:     ['', [Validators.required, Validators.maxLength(150)]],
    email:      ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password:   [''],
    rol:        ['', Validators.required],
  });

  ngOnInit(): void {
    const u = this.usuario();

    if (u) {
      this.form.patchValue({ nombre: u.nombre, email: u.email, rol: u.rol });
      this.sucursalesAsignadas.set([...u.sucursales]);
      this.sucursalService.getAll().subscribe({
        next: (lista) => this.todasLasSucursales.set(lista),
      });
    } else {
      this.form.get('rutUsuario')!.setValidators([Validators.required, Validators.maxLength(20)]);
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100)]);
      this.form.get('rutUsuario')!.updateValueAndValidity();
      this.form.get('password')!.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const values = this.form.getRawValue();
    const existing = this.usuario();

    if (existing) {
      const req: UpdateUsuarioRequest = {
        nombre: values.nombre!.trim(),
        email:  values.email!.trim(),
        rol:    values.rol as 'Admin' | 'Operador' | 'Lectura',
      };
      this.usuarioService.update(existing.usuarioId, req).subscribe({
        next: () => this.onSuccess('actualizado'),
        error: (err) => this.handleError(err),
      });
    } else {
      const req: CreateUsuarioRequest = {
        rutUsuario: values.rutUsuario!.trim(),
        nombre:     values.nombre!.trim(),
        email:      values.email!.trim(),
        password:   values.password!,
        rol:        values.rol as 'Admin' | 'Operador' | 'Lectura',
      };
      this.usuarioService.create(req).subscribe({
        next: () => this.onSuccess('creado'),
        error: (err) => this.handleError(err),
      });
    }
  }

  onSucursalSelectChange(event: Event): void {
    this.sucursalSeleccionadaId = (event.target as HTMLSelectElement).value;
  }

  asignarSucursal(): void {
    const id = this.sucursalSeleccionadaId;
    if (!id) return;

    const u = this.usuario();
    if (!u) return;

    this.loadingSucursal.set(true);
    this.errorSucursal.set('');

    this.usuarioService.assignSucursal(u.usuarioId, { sucursalId: id }).subscribe({
      next: () => {
        const sucursal = this.todasLasSucursales().find((s) => s.sucursalId === id);
        if (sucursal) {
          this.sucursalesAsignadas.update((list) => [...list, { sucursalId: sucursal.sucursalId, nombre: sucursal.nombre }]);
        }
        this.sucursalSeleccionadaId = '';
        this.loadingSucursal.set(false);
      },
      error: (err) => {
        this.loadingSucursal.set(false);
        this.errorSucursal.set(
          err.status === 409
            ? 'Esta sucursal ya estaba asignada.'
            : 'Error al asignar la sucursal. Intente nuevamente.',
        );
      },
    });
  }

  quitarSucursal(s: SucursalResumen): void {
    const u = this.usuario();
    if (!u) return;

    this.loadingSucursal.set(true);
    this.errorSucursal.set('');

    this.usuarioService.removeSucursal(u.usuarioId, s.sucursalId).subscribe({
      next: () => {
        this.sucursalesAsignadas.update((list) => list.filter((x) => x.sucursalId !== s.sucursalId));
        this.loadingSucursal.set(false);
      },
      error: () => {
        this.loadingSucursal.set(false);
        this.errorSucursal.set('Error al quitar la sucursal. Intente nuevamente.');
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

  private onSuccess(accion: string): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'success',
      title: `Usuario ${accion}`,
      text: `El usuario fue ${accion} exitosamente.`,
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
        ? 'Ya existe un usuario con ese RUT en este tenant.'
        : err.status === 400
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
