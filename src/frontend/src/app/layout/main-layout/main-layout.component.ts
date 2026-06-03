import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SucursalContextService } from '../../core/services/sucursal-context.service';
import { SucursalResumen } from '../../core/models/auth.model';

type GroupKey    = 'clinica' | 'inventario' | 'admin';
type OpenSection = GroupKey | 'sucursal';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col h-screen overflow-hidden" style="background: #F3F6FA">

      <!-- Topbar -->
      <header class="flex items-center px-5 h-14 shrink-0 z-30 border-b border-white/10"
              style="background: #0D1B3D">

        <!-- Logo -->
        <div class="flex items-center gap-2.5 mr-8 shrink-0">
          <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <span class="text-sm font-bold text-white">OPT</span>
        </div>

        <!-- Navegación principal -->
        <nav class="flex items-center gap-0.5 flex-1" aria-label="Menú principal">

          <!-- Clientes (directo) -->
          <a
            routerLink="/clientes"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                   text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                   M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                   m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Clientes
          </a>

          <!-- Clínica (dropdown) -->
          <div class="relative">
            <button
              type="button"
              (click)="toggle('clinica')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              [class]="navGroupClass('clinica')"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                     M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              Clínica
              <svg
                class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                [class.rotate-180]="openSection() === 'clinica'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (openSection() === 'clinica') {
              <div class="fixed inset-0 z-40" (click)="close()" aria-hidden="true"></div>
              <div class="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-40 z-50">
                <a
                  routerLink="/agenda"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Agenda
                </a>
                <a
                  routerLink="/atenciones"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                         a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Atenciones
                </a>
              </div>
            }
          </div>

          <!-- Inventario (dropdown) -->
          <div class="relative">
            <button
              type="button"
              (click)="toggle('inventario')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              [class]="navGroupClass('inventario')"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Inventario
              <svg
                class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                [class.rotate-180]="openSection() === 'inventario'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (openSection() === 'inventario') {
              <div class="fixed inset-0 z-40" (click)="close()" aria-hidden="true"></div>
              <div class="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-40 z-50">
                <a
                  routerLink="/productos"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  Productos
                </a>
                <a
                  routerLink="/stock"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5
                         m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172
                         a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                  Stock
                </a>
                <a
                  routerLink="/precios"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Precios
                </a>
              </div>
            }
          </div>

          <!-- Administración (dropdown) -->
          <div class="relative">
            <button
              type="button"
              (click)="toggle('admin')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              [class]="navGroupClass('admin')"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066
                     c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924
                     0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724
                     0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066
                     c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924
                     0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07
                     2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Administración
              <svg
                class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                [class.rotate-180]="openSection() === 'admin'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (openSection() === 'admin') {
              <div class="fixed inset-0 z-40" (click)="close()" aria-hidden="true"></div>
              <div class="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-40 z-50">
                <a
                  routerLink="/sucursales"
                  routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                  (click)="close()"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Usuarios
                </a>
              </div>
            }
          </div>

        </nav>

        <!-- Lado derecho: sucursal + usuario + logout -->
        <div class="flex items-center gap-3 shrink-0">

          <!-- Selector de sucursal -->
          @if (sucursalActual()) {
            <div class="relative">
              <button
                (click)="toggle('sucursal')"
                [disabled]="!tieneMuchas()"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20
                       text-sm transition-colors"
                [class.hover:bg-white/10]="tieneMuchas()"
                [class.cursor-default]="!tieneMuchas()"
                aria-label="Cambiar sucursal"
              >
                <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                       M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="text-white/80 font-medium max-w-32 truncate">{{ sucursalActual()!.nombre }}</span>
                @if (tieneMuchas()) {
                  <svg
                    class="w-3.5 h-3.5 text-white/40 shrink-0 transition-transform"
                    [class.rotate-180]="openSection() === 'sucursal'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                }
              </button>

              @if (openSection() === 'sucursal') {
                <div class="fixed inset-0 z-40" (click)="close()" aria-hidden="true"></div>
                <div class="absolute top-full right-0 mt-1.5 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 min-w-44">
                  @for (s of sucursales(); track s.sucursalId) {
                    <button
                      (click)="cambiarSucursal(s)"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-blue-50"
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

          <!-- Divisor -->
          <div class="w-px h-6 bg-white/20"></div>

          <!-- Usuario -->
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center
                        text-white text-xs font-bold shrink-0" aria-hidden="true">
              {{ userInitial() }}
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-medium text-white">{{ userName() }}</span>
              <span class="text-xs text-white/50 capitalize">{{ userRol() }}</span>
            </div>
          </div>

          <!-- Logout -->
          <button
            (click)="logout()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                   text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="Cerrar sesión"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7
                   a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Salir
          </button>
        </div>

      </header>

      <!-- Contenido principal -->
      <main class="flex-1 overflow-auto focus:outline-none" id="main-content">
        <router-outlet />
      </main>

    </div>
  `,
})
export class MainLayoutComponent implements OnInit {
  private readonly authService     = inject(AuthService);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly router          = inject(Router);
  private readonly destroyRef      = inject(DestroyRef);

  readonly sucursalActual = this.sucursalContext.sucursalActual;
  readonly sucursales     = this.sucursalContext.sucursales;
  readonly tieneMuchas    = this.sucursalContext.tieneMuchas;

  readonly currentUrl  = signal(this.router.url);
  readonly openSection = signal<OpenSection | null>(null);

  readonly activeGroup = computed<GroupKey | null>(() => {
    const url = this.currentUrl();
    if (url.startsWith('/agenda') || url.startsWith('/atenciones')) return 'clinica';
    if (url.startsWith('/productos') || url.startsWith('/stock'))    return 'inventario';
    if (url.startsWith('/sucursales') || url.startsWith('/usuarios')) return 'admin';
    return null;
  });

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.currentUrl.set(this.router.url);
      this.openSection.set(null);
    });
  }

  toggle(section: OpenSection): void {
    this.openSection.update(c => c === section ? null : section);
  }

  close(): void {
    this.openSection.set(null);
  }

  navGroupClass(group: GroupKey): string {
    const isActive = this.activeGroup() === group;
    const isOpen   = this.openSection() === group;
    if (isActive) return 'bg-blue-600 text-white font-semibold';
    if (isOpen)   return 'text-white bg-white/10';
    return 'text-white/70 hover:bg-white/10 hover:text-white';
  }

  userInitial(): string {
    return this.authService.currentUser()?.nombre?.charAt(0).toUpperCase() ?? 'U';
  }

  userName(): string {
    return this.authService.currentUser()?.nombre ?? 'Usuario';
  }

  userRol(): string {
    return this.authService.currentUser()?.rol ?? '';
  }

  cambiarSucursal(s: SucursalResumen): void {
    this.sucursalContext.cambiar(s);
    this.openSection.set(null);
  }

  logout(): void {
    this.authService.logout();
  }
}
