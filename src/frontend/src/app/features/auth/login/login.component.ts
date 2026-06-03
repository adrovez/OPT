import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex">

      <!-- Panel izquierdo: marca (solo escritorio) -->
      <div class="hidden lg:flex lg:w-5/12 flex-col justify-center px-14 relative overflow-hidden"
           style="background: #0D1B3D">

        <!-- Detalles decorativos -->
        <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full"
             style="background: rgba(37,99,235,0.15); filter: blur(60px)"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full"
             style="background: rgba(6,182,212,0.08); filter: blur(60px)"></div>

        <div class="relative">
          <!-- Logo -->
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl mb-8">
            <svg class="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>

          <h1 class="text-4xl font-bold text-white mb-2">OPT</h1>
          <p class="text-white/50 mb-12">Sistema de Gestión Óptica</p>

          <!-- Funcionalidades -->
          <div class="space-y-4">
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background: rgba(37,99,235,0.25)">
                <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                       M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                       m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span class="text-white/65 text-sm">Gestión de clientes</span>
            </div>
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background: rgba(37,99,235,0.25)">
                <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-white/65 text-sm">Agenda y citas</span>
            </div>
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background: rgba(37,99,235,0.25)">
                <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                       a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <span class="text-white/65 text-sm">Atención clínica</span>
            </div>
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background: rgba(37,99,235,0.25)">
                <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <span class="text-white/65 text-sm">Productos y stock</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho: formulario -->
      <div class="flex-1 flex items-center justify-center p-8" style="background: #F3F6FA">
        <div class="w-full max-w-sm">

          <!-- Logo mobile -->
          <div class="lg:hidden text-center mb-8">
            <div class="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-lg"
                 style="background: #0D1B3D">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                     -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">OPT</h1>
            <p class="text-sm text-gray-500 mt-1">Sistema de Gestión Óptica</p>
          </div>

          <!-- Tarjeta del formulario -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
            <p class="text-sm text-gray-400 mb-6">Ingresa tus credenciales para continuar</p>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="space-y-5">

              <!-- RUT -->
              <div>
                <label for="rut" class="block text-sm font-medium text-gray-700 mb-1.5">
                  RUT
                </label>
                <input
                  id="rut"
                  type="text"
                  formControlName="rut"
                  placeholder="12345678-9"
                  autocomplete="username"
                  class="w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class]="fieldClass('rut')"
                />
                @if (isInvalid('rut')) {
                  <p class="mt-1.5 text-xs text-red-600" role="alert">El RUT es obligatorio</p>
                }
              </div>

              <!-- Contraseña -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    [class]="fieldClass('password')"
                  />
                  <button
                    type="button"
                    (click)="showPassword.update(v => !v)"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                           transition-colors focus:outline-none"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    @if (showPassword()) {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                             a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                             l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                             -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (isInvalid('password')) {
                  <p class="mt-1.5 text-xs text-red-600" role="alert">La contraseña es obligatoria</p>
                }
              </div>

              <!-- Error general -->
              @if (errorMessage()) {
                <div class="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl" role="alert">
                  <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-red-700">{{ errorMessage() }}</p>
                </div>
              }

              <!-- Botón submit -->
              <button
                type="submit"
                [disabled]="loading()"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       disabled:opacity-60 disabled:cursor-not-allowed
                       text-white text-sm font-semibold rounded-xl
                       transition-all duration-150 focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                @if (loading()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Ingresando...
                } @else {
                  Ingresar
                }
              </button>

            </form>
          </div>

          <p class="text-center text-xs text-gray-400 mt-6">OPT &copy; {{ currentYear }}</p>
        </div>
      </div>

    </div>
  `,
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly showPassword = signal(false);
  readonly loading      = signal(false);
  readonly errorMessage = signal('');
  readonly currentYear  = new Date().getFullYear();

  private readonly DEFAULT_TENANT_ID = environment.defaultTenantId;

  readonly loginForm = this.fb.group({
    rut:      ['', Validators.required],
    password: ['', Validators.required],
  });

  fieldClass(field: string): string {
    const control = this.loginForm.get(field);
    return control?.invalid && control?.touched
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300';
  }

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { rut, password } = this.loginForm.value as { rut: string; password: string };

    this.authService.login({ tenantId: this.DEFAULT_TENANT_ID, rut, password }).subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'RUT o contraseña incorrectos.'
            : (err.error?.message as string | undefined) ?? 'Error al iniciar sesión. Intente nuevamente.',
        );
      },
    });
  }
}
