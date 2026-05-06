# Frontend Technical Manual - OPT System

## Overview

The OPT frontend is built with **Angular 21** using modern standalone components and **Signal Forms** for reactive form handling. The UI is styled with **Tailwind CSS** following a custom design system.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.0.5 | Framework (standalone components) |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.2.4 | Utility-first CSS framework |
| Angular Signals | Built-in | Reactive state management |
| Signal Forms | Built-in | Modern form handling (@angular/forms/signals) |

## Project Initialization

The project was created using the **angular-new-app** skill with the following command:

```bash
npx ng new opt-frontend --directory="frontend" --style=css --routing --skip-git --interactive=false --ai-config=none --ssr=false
```

Tailwind CSS was added via:

```bash
npx ng add tailwindcss --skip-confirmation
```

## Architecture

### Component Structure

```
src/app/
├── login/              # Authentication module
├── cliente/           # Client management module
│   ├── lista/         # List view with pagination
│   └── formulario/   # Create/Edit form
├── services/           # API communication layer
├── models/            # TypeScript interfaces
├── app.config.ts      # App configuration
└── app.routes.ts     # Route definitions
```

### Key Design Decisions

1. **Standalone Components**: No NgModules, each component is self-contained
2. **Signal Forms**: Replaced Reactive Forms for better type safety and reactivity
3. **Lazy Loading**: All feature modules use `loadComponent()` for on-demand loading
4. **Service Layer**: All API calls go through services (never in components)
5. **Tailwind CSS**: Utility-first approach with custom design tokens in `@theme`

## Signal Forms Implementation

### Model Definition

```typescript
import { form, FormField, submit, required } from '@angular/forms/signals';

// Model with initial values (NEVER use null)
loginModel = signal({
  rutUsuario: '',
  password: '',
  tenantId: 0
});

// Form with validation schema
loginForm = form(this.loginModel, (s) => {
  required(s.rutUsuario, { message: 'El RUT es requerido' });
  required(s.password, { message: 'La contraseña es requerida' });
});
```

### Template Binding

```html
<!-- Bind with [formField] directive -->
<input type="text" [formField]="loginForm.rutUsuario" class="input-field">

<!-- Access field state by calling it -->
@if (loginForm.rutUsuario().touched() && loginForm.rutUsuario().errors().length > 0) {
  <span>{{ loginForm.rutUsuario().errors()[0].message }}</span>
}
```

### Submission

```typescript
login() {
  submit(this.loginForm, async () => {
    // Only runs if form is valid
    const formData = this.loginModel();
    this.auth.login(formData).subscribe({ ... });
  });
}
```

## Design System

### Custom Theme (styles.css)

```css
@theme {
  /* Primary Colors - Blue Optico */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;

  /* Status Colors */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
}
```

### Reusable Component Classes

```css
@layer components {
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-primary-500
           transition-all duration-200;
  }

  .btn-primary {
    @apply w-full flex justify-center py-2.5 px-4 
           bg-primary-600 hover:bg-primary-700 text-white
           rounded-lg shadow-sm text-sm font-medium
           focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
}
```

## Authentication Flow

1. User enters credentials in Login component
2. `Auth` service calls `POST /api/Auth/login`
3. On success, JWT token is stored in `localStorage`
4. User is redirected to `/clientes`
5. Token should be attached to subsequent API requests (TODO: HTTP Interceptor)

## Routing Configuration

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'clientes', loadComponent: () => import('./cliente/lista/lista').then(m => m.Lista) },
  { path: 'clientes/nuevo', loadComponent: () => import('./cliente/formulario/formulario').then(m => m.Formulario) },
  { path: 'clientes/editar/:id', loadComponent: () => import('./cliente/formulario/formulario').then(m => m.Formulario) },
];
```

## API Services

### Auth Service

```typescript
@Injectable({ providedIn: 'root' })
export class Auth {
  private apiUrl = 'http://localhost:5005/api/Auth';

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}
```

### Cliente Service

```typescript
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:5005/api/Clientes';

  getClientes(page = 1, pageSize = 20, search?: string): Observable<any> { ... }
  getCliente(id: number): Observable<Cliente> { ... }
  createCliente(cliente: CreateClienteDto): Observable<any> { ... }
  updateCliente(id: number, cliente: UpdateClienteDto): Observable<any> { ... }
  deleteCliente(id: number): Observable<any> { ... }
}
```

## Build & Deployment

### Development

```bash
cd src/frontend
npx ng serve
# App runs on http://localhost:4200
```

### Production Build

```bash
npx ng build
# Output in dist/opt-frontend/
```

## Common Pitfalls (Lessons Learned)

| Error | Cause | Solution |
|-------|------|-----------|
| `Property 'value' does not exist on type 'FormField'` | Not calling field to access state | Use `form.field().value()` not `form.field.value()` |
| `TS2774: This condition will always return true` | Signal not called in template | Use `errorMessage()` not `errorMessage` in `@if` |
| `NG8022: Setting 'disabled' attribute is not allowed` | Conflicting with `[formField]` | Use `disabled()` rule in form schema, not `[disabled]` attribute |
| `Module has no exported member 'FormState'` | Wrong import | Use `FieldState` concepts, not `FormState` (doesn't exist) |

## TODO / Next Steps

- [ ] Add HTTP Interceptor for JWT token injection
- [ ] Add route guards for authentication
- [ ] Implement Contactos module
- [ ] Add Tenant selection dropdown in login
- [ ] Implement logout functionality
- [ ] Add unit tests
- [ ] Set up CI/CD for frontend
- [ ] Configure environment-specific API URLs

## References

- Angular Signal Forms: `C:\Adrovez\GitHub\OPT\skills\angular-developer\references\signal-forms.md`
- Tailwind Customization: `C:\Adrovez\GitHub\OPT\skills\ui-ux-pro-max\ui-styling\references\tailwind-customization.md`
- Component Specs: `C:\Adrovez\GitHub\OPT\skills\ui-ux-pro-max\design-system\references\component-specs.md`
