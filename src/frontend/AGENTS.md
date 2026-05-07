# Frontend — Agent Instructions

> **Alcance:** solo `src/frontend/`
> **Objetivo:** que cualquier agente contribuya sin romper la arquitectura standalone, el flujo de autenticación ni las convenciones de Angular 21.
> **Última actualización:** 2026-05-07 (Sesión 6)

---

## 1) Stack y versiones

| Herramienta | Versión |
|-------------|---------|
| Angular | 21.0.5 |
| TypeScript | 5.x |
| Tailwind CSS | 4.2.4 |
| Node (mínimo) | 22.x |
| Gestor de paquetes | npm |
| Test runner | Vitest |

**Principio rector:** Todo son componentes standalone. No existe ni existirá ningún NgModule en este proyecto.

---

## 2) Estructura de carpetas

```
src/frontend/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts                # Protege rutas que requieren JWT
│   ├── interceptors/
│   │   └── auth.interceptor.ts          # Inyecta "Authorization: Bearer <token>" en todas las requests
│   ├── models/
│   │   ├── auth.model.ts                # Interfaces: LoginRequest, LoginResponse, etc.
│   │   ├── cliente.model.ts             # Interfaces: Cliente, CreateClienteDto, UpdateClienteDto, Contacto, PaginatedResponse
│   │   └── region.model.ts              # Interfaces: ComunaItem, RegionWithComunas
│   ├── services/
│   │   ├── auth.service.ts              # login(), logout(), token, isAuthenticated(), currentUser()
│   │   ├── cliente.service.ts           # CRUD de clientes (paginado, búsqueda, getCliente por id)
│   │   └── region.service.ts            # getRegionesWithComunas() → cacheado con shareReplay(1)
│   └── validators/
│       └── rut.validator.ts             # Validador de RUT chileno (dígito verificador)
│
├── features/
│   ├── auth/
│   │   └── login/
│   │       └── login.component.ts       # Pantalla de login (Signal Forms)
│   └── clientes/
│       ├── clientes-list/
│       │   └── clientes-list.component.ts   # Listado paginado con búsqueda, botones Ver/Editar/Eliminar
│       ├── cliente-form/
│       │   └── cliente-form.component.ts    # Modal crear/editar cliente (Persona o Empresa, comunas desde API)
│       └── cliente-detail/
│           └── cliente-detail.component.ts  # Página de solo lectura /clientes/:id
│
├── layout/
│   └── main-layout/
│       └── main-layout.component.ts     # Shell principal con sidebar y router-outlet
│
├── app.config.ts                        # Configuración Angular (providers, interceptors, router)
├── app.routes.ts                        # Definición de rutas (lazy loading por feature)
└── app.ts                               # Componente raíz
```

**Nota:** `core/data/regiones-comunas.data.ts` ya no se usa — fue reemplazado por `RegionService` + API en sesión 6. Si el archivo aún existe, ignorarlo.

---

## 3) Arquitectura y flujo de datos

```
Componente → Service → HttpClient → auth.interceptor → API Backend
                                                          ↓
                                                   auth.guard (rutas protegidas)
```

- Los **componentes** no llaman a la API directamente. Siempre usan servicios.
- El **interceptor** agrega el header `Authorization: Bearer <token>` en cada request automáticamente.
- El **guard** verifica que exista un token válido antes de activar una ruta protegida.
- Los **modelos** definen los contratos de datos entre el frontend y la API.

---

## 4) Autenticación y JWT

- El token JWT se almacena en `localStorage` bajo la clave `token`.
- `auth.service.ts` expone `isAuthenticated()` (comprueba existencia y expiración del token).
- `auth.interceptor.ts` intercepta todas las requests HTTP salientes y adjunta el token.
- `auth.guard.ts` redirige a `/login` si no hay token válido.
- **TenantId** viaja en el claim `tenant_id` del JWT — no se envía manualmente en el body de las requests.

---

## 5) Formularios (Signal Forms)

Usamos Signal Forms de Angular 21, **no** `ReactiveFormsModule` ni `FormsModule`.

```typescript
// Patrón correcto
import { FormBuilder, Validators } from '@angular/forms';

// Patrón a evitar
// import { FormGroup, FormControl } from '@angular/forms'; // ← NO
```

---

## 6) Rutas (app.routes.ts)

```typescript
// Todas las rutas protegidas están anidadas bajo el layout con canActivate: [authGuard]
{
  path: '',
  loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
  canActivate: [authGuard],
  children: [
    {
      path: 'clientes',
      loadComponent: () => import('./features/clientes/clientes-list/clientes-list.component')
        .then(m => m.ClientesListComponent)
    },
    {
      path: 'clientes/:id',       // Detalle de cliente (solo lectura)
      loadComponent: () => import('./features/clientes/cliente-detail/cliente-detail.component')
        .then(m => m.ClienteDetailComponent)
    }
  ]
}
```

**Regla:** Todas las rutas con datos protegidos deben estar anidadas bajo el layout que tiene `canActivate: [authGuard]`.

---

## 7) Comunicación con el backend

**URL base en desarrollo:** `http://localhost:5005/api`

| Servicio | Métodos clave |
|----------|--------------|
| `auth.service.ts` | `login(req)`, `logout()`, `token`, `isAuthenticated()`, `currentUser()` |
| `cliente.service.ts` | `getClientes(page, pageSize, search?)`, `getCliente(id)`, `createCliente(dto)`, `updateCliente(id, dto)`, `deleteCliente(id)` |
| `region.service.ts` | `getRegionesWithComunas()` → `Observable<RegionWithComunas[]>` con `shareReplay(1)` |

Ver contratos completos en `docs/api/frontend-api-contracts.md`.

---

## 8) Patrones de implementación importantes

### Cargar datos de catálogo (ej. comunas)
Usar `RegionService` — ya está cacheado con `shareReplay(1)`. No volver a importar datos estáticos en duro.

```typescript
// ✅ Correcto
private readonly regionService = inject(RegionService);

ngOnInit() {
  this.regionService.getRegionesWithComunas()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(r => this.regiones.set(r));
}
```

### Navegar al detalle de un cliente
```typescript
// Desde clientes-list:
this.router.navigate(['/clientes', cliente.clienteId]);
```

### Regresar al listado y abrir formulario de edición
```typescript
// Desde cliente-detail (el botón Editar fue eliminado en sesión 6)
// Si se reintroduce, usar state navigation:
this.router.navigate(['/clientes'], {
  state: { editarClienteId: this.cliente()?.clienteId }
});

// En clientes-list (ngOnInit):
const idEditar = window.history.state?.editarClienteId;
if (idEditar) this.abrirFormulario(idEditar);
```

### Resolver nombre de comuna en un componente
```typescript
nombreComuna(): string {
  const idComuna = this.cliente()?.idComuna;
  if (!idComuna) return '—';
  for (const region of this.regiones) {
    const c = region.comunas.find(c => c.idComuna === idComuna);
    if (c) return `${c.nombre} (${region.nombre})`;
  }
  return String(idComuna);
}
```

---

## 9) Módulos pendientes de implementar (frontend)

| Módulo | Prioridad | Notas |
|--------|----------|-------|
| Sucursales | Alta | Requiere módulo backend primero |
| Usuarios (gestión) | Media | Requiere módulo backend |
| Dashboard / Home | Media | — |

---

## 10) Convenciones de código

- **Componentes:** PascalCase, un componente por archivo, siempre `standalone: true`
- **Servicios:** camelCase con sufijo `Service`, decorados con `@Injectable({ providedIn: 'root' })`
- **Guards:** función exportada (functional guard), no clase
- **Modelos:** interfaces TypeScript (no clases), en `core/models/`
- **Imports:** cada componente declara sus propios imports (no compartir módulos)
- **Tailwind:** usar clases utilitarias directamente en el template; no CSS personalizado salvo en `styles.css`
- **Errores HTTP:** capturar en el servicio con `catchError`, mostrar feedback al usuario en el componente
- **Suscripciones:** usar `takeUntilDestroyed(this.destroyRef)` para evitar memory leaks; nunca suscribirse sin destruir

---

## 11) Comandos de desarrollo

```bash
cd src/frontend
ng serve                    # Servidor dev: http://localhost:4200
ng build                    # Build de producción
npm run lint                # Linting
npm run test                # Tests con Vitest
ng generate component features/<modulo>/<nombre> --standalone
```

---

## 12) Anti-patrones (NUNCA hacer esto)

- ❌ Llamar a `HttpClient` directamente desde un componente (usar servicios)
- ❌ Crear `NgModule` (el proyecto es 100% standalone)
- ❌ Poner el token JWT en el body de las requests (el interceptor lo maneja)
- ❌ Acceder a `localStorage` desde los componentes (usar `auth.service.ts`)
- ❌ Usar `any` en TypeScript sin comentario explicativo
- ❌ Lógica de validación de negocio en templates (extraer a validators o servicios)
- ❌ Componentes sin `standalone: true` en la metadata
- ❌ Crear rutas sin el guard cuando la ruta requiere autenticación
- ❌ Hardcodear listas de regiones/comunas — siempre usar `RegionService`
- ❌ Importar `RouterLink` o cualquier otro directive en un componente si no se usa en el template (Angular 21 reporta NG8113)
- ❌ Suscribirse a un Observable sin destruirlo (`takeUntilDestroyed` es obligatorio en componentes)
