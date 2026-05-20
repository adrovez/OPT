import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
              <p class="text-xs text-gray-400 truncate">Tenant {{ tenantId() }}</p>
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

  userInitial(): string {
    return this.authService.currentUser()?.userName?.charAt(0).toUpperCase() ?? 'U';
  }

  userName(): string {
    return this.authService.currentUser()?.userName ?? 'Usuario';
  }

  tenantId(): number | string {
    return this.authService.currentUser()?.tenantId ?? '-';
  }

  logout(): void {
    this.authService.logout();
  }
}
