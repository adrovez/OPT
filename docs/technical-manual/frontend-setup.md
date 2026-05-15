# Frontend Technical Manual - OPT System

> **Última actualización:** 2026-05-15 (Sesión 9 — Refleja arquitectura real: Reactive Forms, standalone, Anamnesis)

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 21.0.5 | Framework (standalone components) |
| TypeScript | ~5.9.2 | Tipado estático estricto |
| Tailwind CSS | 4.2.4 | Estilos utility-first |
| Angular Signals | Built-in 21 | Estado reactivo (`signal()`, `computed()`) |
| Reactive Forms | `@angular/forms` | Formularios (`FormBuilder`, `FormGroup`, `FormArray`) |
| RxJS | ~7.8.0 | Observables y operadores |
| SweetAlert2 | 11.26.24 | Diálogos de confirmación y notificaciones |

## Comandos de Desarrollo

```bash
cd src/frontend

npm install         # instalar dependencias
npm start           # servidor dev: http://localhost:4200
npm run build       # build producción → dist/frontend/
npm run test        # unit tests con Vitest
npm run lint        # linting TypeScript
```

---

## Arquitectura

### Estructura de directorios

```
src/app/
├── core/                          # Lógica compartida (singleton)
│   ├── guards/
│   │   └── auth.guard.ts          # CanActivateFn — redirige a /login si no hay token
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Inyecta Authorization: Bearer <token> en cada request
│   ├── models/
│   │   ├── auth.model.ts          # LoginRequest, LoginResponse
│   │   ├── cliente.model.ts       # Cliente, CreateClienteDto, UpdateClienteDto, PaginatedResponse<T>
│   │   ├── region.model.ts        # RegionWithComunas, ComunaItem
│   │   └── anamnesis.model.ts     # AnamnesisDto, CreateAnamnesisRequest, UpdateAnamnesisRequest
│   ├── services/
│   │   ├── auth.service.ts        # login(), logout(), currentUser signal
│   │   ├── cliente.service.ts     # CRUD clientes + paginación
│   │   ├── region.service.ts      # getRegionesWithComunas() con shareReplay(1)
│   │   └── anamnesis.service.ts   # CRUD anamnesis por clienteId
│   └── validators/
│       └── rut.validator.ts       # ValidatorFn para RUT chileno + formatRut()
│
├── features/                      # Módulos de dominio (lazy-loaded)
│   ├── auth/
│   │   └── login/
│   │       └── login.component.ts
│   ├── clientes/
│   │   ├── clientes-list/         # Lista paginada con búsqueda + modal form
│   │   ├── cliente-form/          # Formulario crear/editar (modal overlay)
│   │   └── cliente-detail/        # Vista detalle solo lectura + botón Anamnesis
│   └── anamnesis/
│       ├── anamnesis-list/        # Página CRUD de anamnesis para un cliente
│       └── anamnesis-form/        # Formulario modal crear/editar
│
├── layout/
│   └── main-layout/               # Sidebar + router-outlet (envuelve rutas protegidas)
│
├── app.routes.ts                  # Definición de rutas con lazy loading
├── app.config.ts                  # Providers: Router, HttpClient, Interceptors
└── app.ts / app.html              # Componente raíz
```

### Flujo de navegación

```
/ → /clientes                           (redirect)
/login                                  → LoginComponent (anónimo)
/clientes                               → ClientesListComponent (JWT requerido)
/clientes/:id                           → ClienteDetailComponent (JWT requerido)
/clientes/:id/anamnesis                 → AnamnesisListComponent (JWT requerido)
```

Todas las rutas bajo el `MainLayoutComponent` (sidebar + header) requieren `authGuard`.

---

## Patrones de Implementación

### Formularios (Reactive Forms)

Todos los formularios usan `FormBuilder` + `FormGroup`. No se usa Signal Forms (librería descartada).

```typescript
readonly form = this.fb.group({
  nombre:    ['', Validators.required],
  mail:      ['', [Validators.email]],
  idComuna:  [null as number | null],
  contactos: this.fb.array([]),     // FormArray para listas dinámicas
});

// Clase CSS dinámica según estado del campo
fieldClass(field: string): string {
  const c = this.form.get(field);
  return c?.invalid && c?.touched
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200 bg-white hover:border-gray-300';
}
```

### Estado reactivo (Signals)

```typescript
readonly clientes = signal<Cliente[]>([]);
readonly loading  = signal(false);
readonly total    = signal(0);

// En template: @if (loading()) { ... } @else { ... }
// En código:   this.loading.set(true);
//              this.clientes.update(list => list.filter(...));
```

### Modales

Los formularios son componentes standalone que se renderizan con `@if (showForm())` en la plantilla del componente padre. Usan un overlay con `fixed inset-0 bg-black/40 backdrop-blur-sm z-40`.

```typescript
// Padre declara signals y pasa al hijo via @Input
readonly showForm      = signal(false);
readonly seleccionado  = signal<T | null>(null);

// Hijo emite outputs
readonly saved     = output<void>();
readonly cancelled = output<void>();
```

### Servicios HTTP

Todos los servicios son `providedIn: 'root'` e inyectan `HttpClient`. El interceptor `auth.interceptor.ts` agrega el token JWT automáticamente.

```typescript
@Injectable({ providedIn: 'root' })
export class AnamnesisService {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = `${environment.apiUrl}/Anamnesis`;

  getByCliente(clienteId: string): Observable<AnamnesisDto[]> {
    return this.http.get<AnamnesisDto[]>(this.apiUrl, {
      params: new HttpParams().set('clienteId', clienteId),
    });
  }
}
```

---

## Módulos Implementados

| Módulo | Rutas | Descripción |
|--------|-------|-------------|
| Auth | `/login` | Login con RUT, password y tenantId |
| Clientes | `/clientes`, `/clientes/:id` | Lista paginada + detalle. Form como modal. |
| Anamnesis | `/clientes/:id/anamnesis` | Historial médico por cliente. Accedido desde detalle del cliente. |

### Módulo Anamnesis — detalles

**Acceso:** Botón "Anamnesis" (color teal) en `ClienteDetailComponent`.

**`AnamnesisListComponent`** (`/clientes/:id/anamnesis`):
- Lee `clienteId` desde `ActivatedRoute.snapshot.paramMap`
- Valida UUID con regex antes de llamar a la API
- Carga nombre del cliente (`ClienteService.getCliente`) para el header
- Tabla con badges de condiciones: Hipertensión (rojo), Diabetes (ámbar), Alergias (verde), Usa lentes (azul)
- Eliminación optimista: `registros.update()` sin recargar la lista completa
- Abre `AnamnesisFormComponent` como modal inline con `@if (showForm())`

**`AnamnesisFormComponent`** (modal):
- `input.required<string>()` para `clienteId` — obligatorio siempre
- `input<AnamnesisDto | null>()` para `anamnesis` — `null` = modo crear
- Checkboxes para 4 condiciones + textarea observación (máx 1000 chars)
- Contador de caracteres en tiempo real
- `output<void>()` `saved` y `cancelled`

---

## Convención de Tipos

| Campo | Tipo TypeScript | Tipo BD |
|-------|----------------|---------|
| IDs de entidades (clienteId, tenantId, etc.) | `string` (UUID) | `UNIQUEIDENTIFIER` |
| IDs de catálogos (idComuna, idRegion) | `number` | `INT IDENTITY` |
| Fechas | `string` (ISO 8601) | `DATETIME2` |
| Flags de condición (hipertension, etc.) | `boolean` | `BIT` |

---

## Manejo de Errores

Los componentes muestran errores de API via **SweetAlert2**:

```typescript
Swal.fire({
  icon: 'error',
  title: 'Error al guardar',
  text: err.error?.message ?? 'Intente nuevamente.',
  confirmButtonColor: '#2563eb',
  confirmButtonText: 'Cerrar',
});
```

Para confirmaciones de eliminación:
```typescript
Swal.fire({
  icon: 'warning',
  title: '¿Eliminar registro?',
  showCancelButton: true,
  confirmButtonColor: '#dc2626',
  reverseButtons: true,
}).then((result) => {
  if (!result.isConfirmed) return;
  // llamar al servicio...
});
```

Los servicios nunca manejan errores internamente — se propagan al componente.

---

## Variables de Entorno

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5005/api',
  defaultTenantId: '6003e976-f14a-f111-ba1e-588a5a073a51',
};
```

---

## Referencia Rápida Anti-patrones

| ❌ No hacer | ✅ Hacer en su lugar |
|------------|---------------------|
| Llamar API desde componentes | Usar servicios en `core/services/` |
| Usar `NgModule` | Standalone components únicamente |
| Usar `any` sin comentario | Tipado explícito con interfaces |
| Usar `localStorage` para datos de sesión | Solo el JWT token va en `localStorage` |
| Lógica de negocio en templates | Mover a métodos del componente o servicio |
| `number` para IDs de entidades | `string` (UUID) para todas las entidades de negocio |
