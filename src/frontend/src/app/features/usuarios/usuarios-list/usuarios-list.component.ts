import { Component, inject, signal, OnInit } from '@angular/core';
import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioDto } from '../../../core/models/usuario.model';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';
import { UsuarioPasswordComponent } from '../usuario-password/usuario-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [UsuarioFormComponent, UsuarioPasswordComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-6xl mx-auto">

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-24 gap-3">
          <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      }

      @else {

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p class="text-sm text-gray-500 mt-0.5">Gestión de usuarios del sistema</p>
          </div>
          <button
            (click)="abrirFormulario(null)"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                   text-white text-sm font-medium rounded-xl transition-colors shrink-0
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo usuario
          </button>
        </div>

        <!-- Error -->
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
            <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage() }}</p>
          </div>
        }

        <!-- Lista -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          @if (usuarios().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <svg class="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p class="text-sm font-medium text-gray-700">Sin usuarios registrados</p>
              <p class="text-xs text-gray-400">
                Haga clic en "Nuevo usuario" para registrar el primero.
              </p>
            </div>

          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Sucursales
                    </th>
                    <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (u of usuarios(); track u.usuarioId) {
                    <tr class="hover:bg-gray-50/50 transition-colors">

                      <!-- Usuario: nombre + RUT -->
                      <td class="px-5 py-3.5">
                        <p class="text-sm font-medium text-gray-900">{{ u.nombre }}</p>
                        <p class="text-xs text-gray-400 mt-0.5 font-mono">{{ u.rutUsuario }}</p>
                      </td>

                      <!-- Email -->
                      <td class="px-5 py-3.5 hidden md:table-cell">
                        <p class="text-sm text-gray-600">{{ u.email }}</p>
                      </td>

                      <!-- Rol -->
                      <td class="px-5 py-3.5">
                        <span [class]="rolBadgeClass(u.rol)"
                              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset">
                          {{ u.rol }}
                        </span>
                      </td>

                      <!-- Sucursales -->
                      <td class="px-5 py-3.5 hidden lg:table-cell">
                        @if (u.sucursales.length === 0) {
                          <span class="text-xs text-gray-400">—</span>
                        } @else {
                          <div class="flex flex-wrap gap-1">
                            @for (s of u.sucursales; track s.sucursalId) {
                              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                           bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">
                                {{ s.nombre }}
                              </span>
                            }
                          </div>
                        }
                      </td>

                      <!-- Acciones -->
                      <td class="px-5 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <!-- Editar -->
                          <button
                            (click)="abrirFormulario(u)"
                            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [attr.aria-label]="'Editar ' + u.nombre"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                   m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <!-- Cambiar contraseña -->
                          <button
                            (click)="abrirPassword(u)"
                            class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-amber-500"
                            [attr.aria-label]="'Cambiar contraseña de ' + u.nombre"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                          </button>
                          <!-- Eliminar -->
                          <button
                            (click)="eliminar(u)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-500"
                            [attr.aria-label]="'Eliminar ' + u.nombre"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                                   m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

        </div>
      }
    </div>

    <!-- Modal formulario -->
    @if (showForm()) {
      <app-usuario-form
        [usuario]="seleccionado()"
        (saved)="onFormSaved()"
        (cancelled)="cerrarFormulario()"
      />
    }

    <!-- Modal contraseña -->
    @if (showPassword()) {
      <app-usuario-password
        [usuario]="seleccionado()!"
        (saved)="onPasswordSaved()"
        (cancelled)="cerrarPassword()"
      />
    }
  `,
})
export class UsuariosListComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly showForm = signal(false);
  readonly showPassword = signal(false);
  readonly seleccionado = signal<UsuarioDto | null>(null);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.usuarioService.getAll().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los usuarios. Verifique la conexión.');
        this.loading.set(false);
      },
    });
  }

  abrirFormulario(u: UsuarioDto | null): void {
    this.seleccionado.set(u);
    this.showForm.set(true);
  }

  cerrarFormulario(): void {
    this.showForm.set(false);
    this.seleccionado.set(null);
  }

  onFormSaved(): void {
    this.cerrarFormulario();
    this.cargarUsuarios();
  }

  abrirPassword(u: UsuarioDto): void {
    this.seleccionado.set(u);
    this.showPassword.set(true);
  }

  cerrarPassword(): void {
    this.showPassword.set(false);
    this.seleccionado.set(null);
  }

  onPasswordSaved(): void {
    this.cerrarPassword();
  }

  eliminar(u: UsuarioDto): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      html: `¿Está seguro que desea eliminar a <strong>${u.nombre}</strong>?<br>
             <span class="text-sm text-gray-500">Esta acción no se puede deshacer.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.usuarioService.delete(u.usuarioId).subscribe({
        next: () => {
          this.usuarios.update((list) => list.filter((x) => x.usuarioId !== u.usuarioId));
          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            confirmButtonColor: '#2563eb',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el usuario. Intente nuevamente.',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar',
          }),
      });
    });
  }

  rolBadgeClass(rol: string): string {
    switch (rol) {
      case 'Admin':
        return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'Operador':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      default:
        return 'bg-gray-50 text-gray-500 ring-gray-200';
    }
  }
}
