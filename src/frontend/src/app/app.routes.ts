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
    ],
  },
  {
    path: '**',
    redirectTo: 'clientes',
  },
];
