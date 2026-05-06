import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">

        <!-- Branding -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-sm">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Sistema OPT</h1>
          <p class="text-sm text-gray-500 mt-1">Gestión de Óptica</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Iniciar sesión</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="space-y-4">

            <!-- RUT -->
            <div>
              <label for="rut" class="block text-sm font-medium text-gray-700 mb-1.5">
                RUT Usuario
              </label>
              <input
                id="rut"
                type="text"
                formControlName="rut"
                placeholder="12345678-9"
                autocomplete="username"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors
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
                  class="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class]="fieldClass('password')"
                />
                <button
                  type="button"
                  (click)="showPassword.update((v) => !v)"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
              <div class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg" role="alert">
                <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-red-700">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Botón -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     disabled:bg-blue-400 disabled:cursor-not-allowed
                     text-white text-sm font-medium rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Ingresando...</span>
              } @else {
                <span>Ingresar</span>
              }
            </button>

          </form>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">
          Sistema OPT &copy; {{ currentYear }}
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly currentYear = new Date().getFullYear();

  // tenantId fijo en 1 para desarrollo — en producción vendrá del subdominio o configuración
  private readonly DEFAULT_TENANT_ID = 1;

  readonly loginForm = this.fb.group({
    rut: ['', Validators.required],
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
