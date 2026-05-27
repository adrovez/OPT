import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clientes',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes-list/clientes-list.component').then(
            (m) => m.ClientesListComponent,
          ),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./features/clientes/cliente-detail/cliente-detail.component').then(
            (m) => m.ClienteDetailComponent,
          ),
      },
      {
        path: 'clientes/:id/anamnesis',
        loadComponent: () =>
          import('./features/anamnesis/anamnesis-list/anamnesis-list.component').then(
            (m) => m.AnamnesisListComponent,
          ),
      },
      {
        path: 'sucursales',
        loadComponent: () =>
          import('./features/sucursales/sucursales-list/sucursales-list.component').then(
            (m) => m.SucursalesListComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios-list/usuarios-list.component').then(
            (m) => m.UsuariosListComponent,
          ),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos-list/productos-list.component').then(
            (m) => m.ProductosListComponent,
          ),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/stock/stock-list/stock-list.component').then(
            (m) => m.StockListComponent,
          ),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/agenda-calendar/agenda-calendar.component').then(
            (m) => m.AgendaCalendarComponent,
          ),
      },
      {
        path: 'atenciones',
        loadComponent: () =>
          import('./features/atencion/atenciones-list/atenciones-list.component').then(
            (m) => m.AtencionesListComponent,
          ),
      },
      {
        path: 'atenciones/iniciar',
        loadComponent: () =>
          import('./features/atencion/atencion-iniciar/atencion-iniciar.component').then(
            (m) => m.AtencionIniciarComponent,
          ),
      },
      {
        path: 'atenciones/nueva',
        loadComponent: () =>
          import('./features/atencion/atencion-form/atencion-form.component').then(
            (m) => m.AtencionFormComponent,
          ),
      },
      {
        path: 'atenciones/:id',
        loadComponent: () =>
          import('./features/atencion/atencion-detail/atencion-detail.component').then(
            (m) => m.AtencionDetailComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'clientes',
  },
];
