import { Component, inject, input, output, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, Contacto, CreateClienteDto, UpdateClienteDto } from '../../../core/models/cliente.model';
import { RegionWithComunas } from '../../../core/models/region.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { RegionService } from '../../../core/services/region.service';
import { AuthService } from '../../../core/services/auth.service';
import { rutValidator, formatRut } from '../../../core/validators/rut.validator';
import Swal from 'sweetalert2';

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
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
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
            <div class="flex gap-4">
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

          <!-- RUT -->
          <div>
            <label for="numeroDocumento" class="block text-sm font-medium text-gray-700 mb-1.5">
              RUT <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="numeroDocumento"
              type="text"
              formControlName="numeroDocumento"
              (input)="onRutInput($event)"
              (blur)="onRutBlur()"
              placeholder="12.345.678-9"
              maxlength="12"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class]="fieldClass('numeroDocumento')"
            />
            @if (showError('numeroDocumento', 'required')) {
              <p class="mt-1.5 text-xs text-red-600" role="alert">El RUT es obligatorio.</p>
            }
            @if (showError('numeroDocumento', 'rutInvalido')) {
              <p class="mt-1.5 text-xs text-red-600" role="alert">
                RUT inválido. Verifique el dígito verificador (ej: 12.345.678-9).
              </p>
            }
          </div>

          <!-- Nombre / Razón social -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ form.get('tipoCliente')?.value === 'Empresa' ? 'Razón social' : 'Nombre completo' }}
              <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              [placeholder]="form.get('tipoCliente')?.value === 'Empresa' ? 'Mi Empresa S.A.' : 'Juan Pérez'"
              class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [class]="fieldClass('nombre')"
            />
            @if (showError('nombre', 'required')) {
              <p class="mt-1.5 text-xs text-red-600" role="alert">
                {{ form.get('tipoCliente')?.value === 'Empresa' ? 'La razón social es obligatoria.' : 'El nombre es obligatorio.' }}
              </p>
            }
          </div>

          <!-- Dirección + Comuna -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label for="idComuna" class="block text-sm font-medium text-gray-700 mb-1.5">
                Comuna
              </label>
              <select
                id="idComuna"
                formControlName="idComuna"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200
                       hover:border-gray-300 bg-white transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option [ngValue]="null">Seleccionar comuna</option>
                @for (region of regionesConComunas(); track region.idRegion) {
                  <optgroup [label]="(region.codigo ? region.codigo + ' – ' : '') + region.nombre">
                    @for (comuna of region.comunas; track comuna.idComuna) {
                      <option [ngValue]="comuna.idComuna">{{ comuna.nombre }}</option>
                    }
                  </optgroup>
                }
              </select>
            </div>
          </div>

          <!-- Celular + Email -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="celular" class="block text-sm font-medium text-gray-700 mb-1.5">
                Celular
              </label>
              <input
                id="celular"
                type="tel"
                formControlName="celular"
                placeholder="+56 9 1234 5678"
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
              @if (showError('mail', 'email')) {
                <p class="mt-1.5 text-xs text-red-600" role="alert">Formato de email inválido.</p>
              }
            </div>
          </div>

          <!-- Fecha nacimiento + Previsión (solo Persona) -->
          @if (form.get('tipoCliente')?.value === 'Persona') {
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
          }

          <!-- Giro + Previsión (solo Empresa) -->
          @if (form.get('tipoCliente')?.value === 'Empresa') {
            <div class="grid grid-cols-2 gap-3">
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
              <div>
                <label for="tipoPrevisionEmp" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Previsión
                </label>
                <select
                  id="tipoPrevisionEmp"
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
          }

          <!-- ── Sección Contactos (solo Empresa) ── -->
          @if (form.get('tipoCliente')?.value === 'Empresa') {
            <div class="border-t border-gray-100 pt-4">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="text-sm font-semibold text-gray-800">Contactos</h3>
                  <p class="text-xs text-gray-400 mt-0.5">Personas de contacto en la empresa</p>
                </div>
                <button
                  type="button"
                  (click)="addContacto()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                         text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar contacto
                </button>
              </div>

              @if (contactosArray.length === 0) {
                <p class="text-xs text-gray-400 italic py-2">
                  Aún no hay contactos. Haz clic en "Agregar contacto" para añadir uno.
                </p>
              }

              <div class="space-y-3" formArrayName="contactos">
                @for (ctrl of contactosArray.controls; track $index; let i = $index) {
                  <div
                    [formGroupName]="i"
                    class="relative bg-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <!-- Botón eliminar contacto -->
                    <button
                      type="button"
                      (click)="removeContacto(i)"
                      class="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                      [attr.aria-label]="'Eliminar contacto ' + (i + 1)"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                             m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>

                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Contacto {{ i + 1 }}
                    </p>

                    <div class="grid grid-cols-2 gap-3">
                      <!-- Nombre contacto -->
                      <div>
                        <label [for]="'c-nombre-' + i" class="block text-xs font-medium text-gray-600 mb-1">
                          Nombre <span class="text-red-500">*</span>
                        </label>
                        <input
                          [id]="'c-nombre-' + i"
                          type="text"
                          formControlName="nombre"
                          placeholder="María González"
                          class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          [class]="contactoFieldClass(i, 'nombre')"
                        />
                        @if (contactoIsInvalid(i, 'nombre')) {
                          <p class="mt-1 text-xs text-red-600" role="alert">Nombre obligatorio.</p>
                        }
                      </div>

                      <!-- Cargo -->
                      <div>
                        <label [for]="'c-cargo-' + i" class="block text-xs font-medium text-gray-600 mb-1">
                          Cargo
                        </label>
                        <input
                          [id]="'c-cargo-' + i"
                          type="text"
                          formControlName="cargo"
                          placeholder="Gerente de compras"
                          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                                 hover:border-gray-300 bg-white transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <!-- Email contacto -->
                      <div>
                        <label [for]="'c-email-' + i" class="block text-xs font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          [id]="'c-email-' + i"
                          type="email"
                          formControlName="email"
                          placeholder="contacto@empresa.cl"
                          class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          [class]="contactoFieldClass(i, 'email')"
                        />
                        @if (contactoIsInvalid(i, 'email')) {
                          <p class="mt-1 text-xs text-red-600" role="alert">Email inválido.</p>
                        }
                      </div>

                      <!-- Teléfono contacto -->
                      <div>
                        <label [for]="'c-tel-' + i" class="block text-xs font-medium text-gray-600 mb-1">
                          Teléfono
                        </label>
                        <input
                          [id]="'c-tel-' + i"
                          type="tel"
                          formControlName="telefono"
                          placeholder="+56 2 1234 5678"
                          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                                 hover:border-gray-300 bg-white transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                }
              </div>
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
  private readonly regionService = inject(RegionService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs / Outputs ──────────────────────────────────────────────────────
  readonly cliente = input<Cliente | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  // ── Catálogo de Regiones/Comunas (cargado desde la API) ───────────────────
  readonly regionesConComunas = signal<RegionWithComunas[]>([]);

  readonly tiposCliente = [
    { value: 'Persona', label: 'Persona natural' },
    { value: 'Empresa', label: 'Empresa' },
  ];

  readonly previsionOptions = ['FONASA', 'ISAPRE', 'DIPRECA', 'CAPREDENA', 'Sin previsión'];

  // ── Formulario ────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    tipoCliente:     ['Persona', Validators.required],
    numeroDocumento: ['', [Validators.required, rutValidator()]],
    nombre:          ['', Validators.required],
    direccion:       [''],
    idComuna:        [null as number | null],
    celular:         [''],
    mail:            ['', [Validators.email]],
    fechaNacimiento: [''],
    tipoPrevision:   [''],
    giro:            [''],
    contactos:       this.fb.array([]),
  });

  get contactosArray(): FormArray {
    return this.form.get('contactos') as FormArray;
  }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Cargar catálogo de regiones/comunas desde la API
    this.regionService.getRegionesWithComunas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(regiones => this.regionesConComunas.set(regiones));

    const c = this.cliente();
    if (!c) return;

    this.form.patchValue({
      tipoCliente:     c.tipoCliente,
      numeroDocumento: c.numeroDocumento,
      nombre:          c.nombre,
      direccion:       c.direccion ?? '',
      idComuna:        c.idComuna ?? null,
      celular:         c.celular ?? '',
      mail:            c.mail ?? '',
      fechaNacimiento: c.fechaNacimiento ?? '',
      tipoPrevision:   c.tipoPrevision ?? '',
      giro:            c.giro ?? '',
    });

    if (c.contactos?.length) {
      c.contactos.forEach(ct => this.addContacto(ct));
    }
  }

  // ── Gestión de Contactos ──────────────────────────────────────────────────
  addContacto(datos?: Partial<Contacto>): void {
    this.contactosArray.push(
      this.fb.group({
        nombre:   [datos?.nombre   ?? '', Validators.required],
        cargo:    [datos?.cargo    ?? ''],
        email:    [datos?.email    ?? '', [Validators.email]],
        telefono: [datos?.telefono ?? ''],
      }),
    );
  }

  removeContacto(index: number): void {
    this.contactosArray.removeAt(index);
  }

  // ── Formato / validación RUT ──────────────────────────────────────────────
  onRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Solo permite dígitos, K, puntos y guión mientras escribe
    const clean = input.value.replace(/[^0-9kK.\-]/gi, '');
    this.form.get('numeroDocumento')?.setValue(clean, { emitEvent: false });
    input.value = clean;
  }

  onRutBlur(): void {
    const ctrl = this.form.get('numeroDocumento');
    if (!ctrl?.value) return;
    ctrl.setValue(formatRut(ctrl.value), { emitEvent: false });
    ctrl.markAsTouched();
  }

  // ── Clases CSS dinámicas ──────────────────────────────────────────────────
  fieldClass(field: string): string {
    const control = this.form.get(field);
    return control?.invalid && control?.touched
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300';
  }

  showError(field: string, errorKey: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.errors?.[errorKey]);
  }

  contactoFieldClass(index: number, field: string): string {
    const ctrl = this.contactosArray.at(index)?.get(field);
    return ctrl?.invalid && ctrl?.touched
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300';
  }

  contactoIsInvalid(index: number, field: string): boolean {
    const ctrl = this.contactosArray.at(index)?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ── Envío del formulario ──────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete los campos obligatorios y corrija los errores indicados.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    this.loading.set(true);

    const tenantId = this.authService.currentUser()?.tenantId ?? '';
    const values = this.form.getRawValue();
    const contactos = this.buildContactos();
    const existing = this.cliente();

    if (existing) {
      const dto: UpdateClienteDto = {
        tipoCliente:     values.tipoCliente     ?? undefined,
        numeroDocumento: values.numeroDocumento  ?? undefined,
        nombre:          values.nombre           ?? undefined,
        direccion:       values.direccion        || undefined,
        idComuna:        values.idComuna         ?? undefined,
        celular:         values.celular          || undefined,
        mail:            values.mail             || undefined,
        fechaNacimiento: values.fechaNacimiento  || undefined,
        tipoPrevision:   values.tipoPrevision    || undefined,
        giro:            values.giro             || undefined,
        contactos,
      };

      this.clienteService.updateCliente(existing.clienteId, dto).subscribe({
        next: () => this.onSuccess('actualizado'),
        error: (err) => this.handleError(err),
      });
    } else {
      const dto: CreateClienteDto = {
        tenantId,
        tipoCliente:     values.tipoCliente     ?? 'Persona',
        numeroDocumento: values.numeroDocumento  ?? '',
        nombre:          values.nombre           ?? '',
        direccion:       values.direccion        || undefined,
        idComuna:        values.idComuna         ?? undefined,
        celular:         values.celular          || undefined,
        mail:            values.mail             || undefined,
        fechaNacimiento: values.fechaNacimiento  || undefined,
        tipoPrevision:   values.tipoPrevision    || undefined,
        giro:            values.giro             || undefined,
        contactos,
      };

      this.clienteService.createCliente(dto).subscribe({
        next: () => this.onSuccess('creado'),
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

  // ── Helpers privados ──────────────────────────────────────────────────────
  private buildContactos(): Contacto[] | undefined {
    if (this.form.get('tipoCliente')?.value !== 'Empresa') return undefined;
    const raw = this.contactosArray.getRawValue() as Contacto[];
    return raw.length ? raw : undefined;
  }

  private onSuccess(accion: string): void {
    this.loading.set(false);
    Swal.fire({
      icon: 'success',
      title: `Cliente ${accion}`,
      text: `El cliente fue ${accion} exitosamente.`,
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
