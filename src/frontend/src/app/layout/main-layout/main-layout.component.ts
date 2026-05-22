import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SucursalContextService } from '../../core/services/sucursal-context.service';
import { SucursalResumen } from '../../core/models/auth.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">

        <!-- Logo -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div class="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-xl shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900">OPT</p>
            <p class="text-xs text-gray-400 truncate">Gestión de Óptica</p>
          </div>
        </div>

        <!-- Selector de sucursal -->
        @if (sucursalActual()) {
          <div class="px-3 py-3 border-b border-gray-100 relative">
            <button
              (click)="toggleDropdown()"
              [disabled]="!tieneMuchas()"
              class="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors"
              [class.hover:bg-gray-50]="tieneMuchas()"
              [class.cursor-default]="!tieneMuchas()"
              aria-label="Cambiar sucursal"
            >
              <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                       M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-400 leading-none mb-0.5">Sucursal activa</p>
                <p class="text-sm font-semibold text-gray-900 truncate">{{ sucursalActual()!.nombre }}</p>
              </div>
              @if (tieneMuchas()) {
                <svg
                  class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
                  [class.rotate-180]="dropdownOpen()"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              }
            </button>

            @if (dropdownOpen()) {
              <div
                class="fixed inset-0"
                (click)="dropdownOpen.set(false)"
                aria-hidden="true"
              ></div>
              <div class="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 overflow-hidden">
                @for (s of sucursales(); track s.sucursalId) {
                  <button
                    (click)="cambiarSucursal(s)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-blue-50"
                    [class.text-blue-700]="s.sucursalId === sucursalActual()?.sucursalId"
                    [class.font-semibold]="s.sucursalId === sucursalActual()?.sucursalId"
                    [class.text-gray-700]="s.sucursalId !== sucursalActual()?.sucursalId"
                  >
                    @if (s.sucursalId === sucursalActual()?.sucursalId) {
                      <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      <span class="w-3.5 shrink-0"></span>
                    }
                    {{ s.nombre }}
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Navegación -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Menú principal">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Módulos
          </p>

          <a
            routerLink="/clientes"
            routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Clientes"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                   M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                   m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Clientes
          </a>

          <a
            routerLink="/sucursales"
            routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Sucursales"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                   M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Sucursales
          </a>

          <a
            routerLink="/usuarios"
            routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Usuarios"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Usuarios
          </a>

          <a
            routerLink="/productos"
            routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Productos"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Productos
          </a>

        </nav>

        <!-- Usuario y logout -->
        <div class="px-3 py-4 border-t border-gray-100">
          <div class="flex items-center gap-3 px-3 py-2 mb-1">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                        text-blue-700 text-sm font-bold shrink-0"
                 aria-hidden="true">
              {{ userInitial() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName() }}</p>
              <p class="text-xs text-gray-400 truncate capitalize">{{ userRol() }}</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7
                   a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 overflow-auto focus:outline-none" id="main-content">
        <router-outlet />
      </main>

    </div>
  `,
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly sucursalContext = inject(SucursalContextService);

  readonly dropdownOpen = signal(false);
  readonly sucursalActual = this.sucursalContext.sucursalActual;
  readonly sucursales = this.sucursalContext.sucursales;
  readonly tieneMuchas = this.sucursalContext.tieneMuchas;

  userInitial(): string {
    return this.authService.currentUser()?.nombre?.charAt(0).toUpperCase() ?? 'U';
  }

  userName(): string {
    return this.authService.currentUser()?.nombre ?? 'Usuario';
  }

  userRol(): string {
    return this.authService.currentUser()?.rol ?? '';
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  cambiarSucursal(s: SucursalResumen): void {
    this.sucursalContext.cambiar(s);
    this.dropdownOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
