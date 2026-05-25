# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Qué es este proyecto

OPT es un sistema SaaS multi-tenant de gestión de ópticas en migración desde una aplicación legacy .NET Framework (`old/`) a una arquitectura moderna en `src/`. **Nunca modificar `old/`** — es solo referencia de lectura. Todo el código nuevo va en `src/`.

---

## Comandos

### Backend (.NET 10)

```bash
cd src/backend
dotnet restore
dotnet build
dotnet test                                                          # todos los tests
dotnet test --filter "FullyQualifiedName~NombreDelTest"             # un test específico
dotnet run --project OPT.API   # http://localhost:5005 — Swagger en /swagger
```

> No existen proyectos de test aún. Al crear uno, el nombre de la solución va en `src/backend/`.

### Frontend (Angular 21)

```bash
cd src/frontend
npm install
ng serve                                                            # desarrollo: http://localhost:4200
npm run build                                                       # producción → dist/frontend/
ng test                                                             # todos los tests (Vitest via @angular/build:unit-test)
ng test --include="**/nombre.spec.ts"                              # un archivo de test específico
npm run lint
ng generate component features/<modulo>/<nombre> --standalone
```

### Base de datos

Scripts SQL en `src/basedatos/` numerados `000–020`. Ejecutar en orden sobre SQL Server (base de datos `dbOPT`). **Próximo script incremental: `021_`**.

---

## Arquitectura

### Capas del backend (nunca invertir la dirección)

```
OPT.API → OPT.Infrastructure → OPT.Application → OPT.Domain
```

- **OPT.Domain** — solo entidades, sin dependencias externas
- **OPT.Application** — handlers CQRS (MediatR), DTOs, validadores FluentValidation, *interfaces* de repositorio
- **OPT.Infrastructure** — EF Core (`OPTDbContext`), implementaciones de repositorios, servicio JWT, BCrypt
- **OPT.API** — controllers delgados (sin lógica de negocio, sin try/catch), pipeline de middleware, wiring de DI

### Pipeline de middleware (el orden es crítico)

```
CorrelationId → ExceptionHandling → Swagger(dev) → CORS
→ HttpsRedirection → Authentication → Authorization
→ TenantValidation → MapControllers
```

### Frontend (Angular 21 standalone)

Organización por features, con lazy loading completo. Sin NgModules.

```
core/           # services, guards, interceptors, models, validators
features/       # auth, clientes, anamnesis, productos, sucursales, usuarios (cada uno en su carpeta)
layout/         # main-layout shell (sidebar + router-outlet)
app.routes.ts   # rutas raíz con lazy loading
```

Las llamadas HTTP siempre van a través de servicios en `core/services/`, nunca directamente desde componentes. El JWT se inyecta automáticamente via `core/interceptors/auth.interceptor.ts`.

---

## Patrones clave

### Multi-tenancy
Toda entidad de negocio tiene `TenantId` (Guid). Los query filters de EF Core aplican `!IsDeleted` y aislamiento de tenant automáticamente. Nunca consultar datos entre tenants.

Los handlers reciben `TenantId`, `SucursalId`, `UsuarioId` y `CreatedBy` como campos del command/query — el controller los extrae de `ICurrentTenantService` y del header `X-Sucursal-Id` y los pasa explícitamente:

```csharp
// ✅ CORRECTO: el controller pasa los datos de contexto al command
[HttpPost]
public async Task<IActionResult> Crear([FromBody] MiRequest req)
{
    var cmd = new MiCommand(
        TenantId: _tenant.TenantId,
        SucursalId: ParseSucursalHeader(),
        UsuarioId: _tenant.UsuarioId,
        CreatedBy: _tenant.RutUsuario,
        // ... resto de campos del request
    );
    var id = await _mediator.Send(cmd);
    return CreatedAtAction(...);
}

// ❌ INCORRECTO: el handler NO inyecta ICurrentTenantService
public class MiHandler(IMiRepo repo, ICurrentTenantService tenant) : IRequestHandler<...>
// → los handlers solo inyectan repositorios e infraestructura
```

`ICurrentTenantService` solo se usa en controllers y middleware, nunca en handlers de Application.

### Claves primarias
- Entidades de negocio (tenant-aware): `Guid` en C# / `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()` en SQL
- Catálogos compartidos (Region, Comuna): `int` / `INT IDENTITY`
- **Nunca usar `NEWID()` como DEFAULT** — siempre `NEWSEQUENTIALID()` para evitar fragmentación del índice clustered

### IDs en el frontend
Los IDs de entidades de negocio son `string` (UUID) en TypeScript, nunca `number`. Los catálogos (`idRegion`, `idComuna`) mantienen `number`.

```typescript
// Para validar route params de entidades de negocio:
private static readonly UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// ❌ NUNCA: Number(id) + isNaN() — no aplica a GUIDs
```

### Paginación
Las queries de listado usan `PagedResult<T>` (`OPT.Application.Common`). El repositorio recibe `page` (1-based) y `pageSize`, y devuelve `Items`, `TotalCount`, `TotalPages`, `HasNextPage`, `HasPreviousPage`. Los controllers exponen estos parámetros como query string.

### Soft delete
Todos los borrados setean `IsDeleted = true`. Nunca usar `DELETE` físico.

### CQRS
Commands y queries viven en `OPT.Application/<Modulo>/Commands/` y `Queries/`. Cada handler accede a datos solo a través de interfaces de repositorio — nunca directamente a `OPTDbContext`.

### Manejo de errores
Los controllers no tienen try/catch. El `ExceptionHandlingMiddleware` convierte excepciones a RFC 7807 `ProblemDetails`. Usar excepciones semánticas desde los handlers:

| Excepción | HTTP | Cuándo |
|-----------|------|--------|
| `ValidationException` | 400 | FluentValidation falla |
| `UnauthorizedAccessException` | 401 | Credenciales inválidas |
| `KeyNotFoundException` | 404 | Entidad no encontrada |
| `InvalidOperationException` | 409 | Regla de negocio (ej. RUT duplicado) |

### FluentValidation
Usar `.NotEmpty()` para IDs Guid, nunca `.GreaterThan(0)`. Para parsear claims JWT usar `Guid.TryParse`, nunca `int.TryParse`.

### Suscripciones Angular
Siempre usar `takeUntilDestroyed(this.destroyRef)` en componentes. Nunca suscribirse sin destruir el observable.

### Formularios Angular
Usar **Signal Forms** de Angular 21. No usar `ReactiveFormsModule` ni `FormsModule`.

> **Excepción conocida (tech debt):** `usuario-form.component.ts` fue creado con `ReactiveFormsModule` y pendiente de migrar a Signal Forms.

### Librerías UI del frontend
- **Tailwind CSS v4** — clases utilitarias directamente en templates
- **SweetAlert2 (`Swal`)** — para diálogos de confirmación antes de eliminar o acciones destructivas

### Servicios de catálogo
Los servicios de catálogos compartidos (Regiones, Roles) usan `shareReplay(1)` para evitar múltiples llamadas HTTP. Al crear un nuevo servicio de catálogo, aplicar este mismo patrón:

```typescript
readonly getAll = (): Observable<RolDto[]> =>
  this.http.get<RolDto[]>('/api/roles').pipe(shareReplay(1));
```

### EF Core — relación uno-a-muchos (gotcha conocido)
Al configurar una relación bidireccional en `OPTDbContext.OnModelCreating`, siempre especificar la propiedad de navegación en `WithMany()`:

```csharp
// ✅ CORRECTO
entity.HasOne(ct => ct.Cliente).WithMany(cl => cl.Contactos).HasForeignKey(ct => ct.ClienteId);
// ❌ INCORRECTO — genera FK shadow "ClienteId1" → error en runtime
entity.HasOne(ct => ct.Cliente).WithMany().HasForeignKey(ct => ct.ClienteId);
```

### Columna `idSucursal` en SQL (gotcha conocido)
La entidad `Sucursal` mapea su PK con `HasColumnName("idSucursal")` porque la tabla SQL legacy usa ese nombre de columna. En C# la propiedad se llama `SucursalId` — al escribir SQL directo o scripts de migración, recordar que la columna en BD es `idSucursal`, no `SucursalId`.

### PagedResult — siempre object initializer (gotcha conocido)
`PagedResult<T>` en `OPT.Application.Common` usa propiedades `init`, no constructor con parámetros. Usar siempre object initializer o el compilador lanza CS1739:

```csharp
// ✅ CORRECTO
return new PagedResult<MiDto>
{
    Items = items.Select(i => i.ToDto()).ToList(),
    TotalCount = total, Page = q.Page, PageSize = q.PageSize,
};
// ❌ INCORRECTO — CS1739: no tiene parámetro denominado 'Items'
return new PagedResult<MiDto>(Items: ..., TotalCount: ...);
```

### DateOnly para campos de fecha sin hora (SQL DATE)
Usar `DateOnly` en C# para columnas `DATE` de SQL Server (sin componente horario). System.Text.Json serializa/deserializa `DateOnly` automáticamente desde .NET 7+ como `"2025-05-24"`.

### Conflicto namespace/clase en Application (gotcha conocido)
Cuando el namespace del módulo coincide con el nombre de la entidad (ej. `OPT.Application.RecetaCristales` + clase `RecetaCristales`, o `OPT.Application.Stock` + clase `Stock`), usar alias en los archivos afectados. El error del compilador es: `'X' es espacio de nombres pero se usa como tipo`.

```csharp
using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales;
using StockEntity = OPT.Domain.Entities.Stock;
```

Afecta a todos los archivos en `OPT.Application.<Módulo>/` que referencien la clase del mismo nombre, y también a `OPT.Application/Interfaces/I<Módulo>Repository.cs`.

### Checklist para nuevo módulo
**Backend:** Entidad Domain → Interfaz Application → Handlers+DTOs Application → Repositorio Infrastructure → Config DbContext (`HasQueryFilter`) → Controller API → Script SQL (`021_...`)

**Frontend:** `core/models/<mod>.model.ts` → `core/services/<mod>.service.ts` → componentes en `features/<mod>/` → ruta en `app.routes.ts`

---

## Estado de módulos (Mayo 2026)

| Módulo | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ (login devuelve `sucursales[]`) | ✅ |
| Clientes + Contactos | ✅ | ✅ |
| Regiones/Comunas | ✅ (catálogo) | ✅ (shareReplay cache) |
| Anamnesis | ✅ | ✅ |
| RecetaCristales | ✅ | ⏳ Pendiente |
| Sucursales | ✅ | ✅ (switcher en sidebar vía `SucursalContextService`) |
| Usuarios | ✅ | ✅ |
| Roles (catálogo) | ✅ (`013_OPT_Rol.sql` creado, `GET /api/roles` ⏳) | ⏳ Pendiente (combobox en usuario-form) |
| Agenda | ✅ (`014_OPT_Agenda.sql` + API CRUD + `X-Sucursal-Id` header) | ⏳ Pendiente |
| Productos (catálogo) | ✅ (`015-017` scripts + API CRUD + Categorías + Variantes — **sin precios ni stock**) | ⏳ En progreso (componentes en `features/productos/`) |
| Stock / Inventario | ✅ (`018_OPT_Stock.sql` + API CRUD + `X-Sucursal-Id` header) | ✅ (3 tabs: Stock actual, Entradas, Historial) |
| Precios | ✅ (`019_OPT_Precio.sql` — historial de costo, actualizado al confirmar documento de entrada) | ⏳ Sin pantalla dedicada (solo se actualiza via Entradas) |
| Documentos de Entrada | ✅ (`020_OPT_DocumentoStock.sql` — FacturaCompra, BoletaCompra, OtroIngreso + Anular) | ✅ (tab Entradas en `/stock`) |
| Salida (documentos) | 🔮 Futuro — por ahora solo Salida directa desde formulario | ⏳ Salida directa disponible en form por fila |

### Arquitectura: Documentos de Stock y Precios

**Flujo de Entrada (documento-based):**
- El usuario crea un documento (`FacturaCompra`, `BoletaCompra`, `OtroIngreso`) con múltiples líneas (variante + cantidad + precio costo opcional)
- Al confirmar: genera `MovimientoStock(TipoMovimiento="Entrada", DocumentoId=FK)` por cada línea y actualiza `OPT_PrecioProducto` (cierra el precio vigente, crea uno nuevo)
- Al anular: genera `MovimientoStock(TipoMovimiento="Ajuste", Cantidad=-n)` como compensación. Los precios NO se revierten
- Los movimientos directos (Salida, Ajuste) NO requieren documento y siguen el flujo original
- `OPT_MovimientoStock` tiene `DocumentoId NULLABLE FK` → null para movimientos directos

**Estructura de precios:**
- `OPT_PrecioProducto(VarianteId, SucursalId?, PrecioCosto, PrecioVenta?, VigenciaDesde, VigenciaHasta)` — historial de precios; `VigenciaHasta NULL` = vigente
- Sin IsDeleted: la expiración se maneja con `VigenciaHasta`
- Próximo script: `021_...`

### Regla de negocio: SucursalId en módulos sucursal-scoped
Los módulos asociados a sucursal (Agenda y futuros) reciben el `SucursalId` via header HTTP `X-Sucursal-Id`. El frontend lo envía desde `SucursalContextService.sucursalActual().sucursalId`. Los datos generales (Clientes, Anamnesis, RecetaCristales) NO requieren este header — son datos del tenant completo.

---

## Claims JWT

```json
{
  "sub": "<usuarioId: Guid>",
  "tenant_id": "<tenantId: Guid>",
  "rut_usuario": "12345678-9",
  "role": "Admin|Operador|Lectura",
  "jti": "<guid>"
}
```

---

## Conexión a base de datos (dev)

```
Server=localhost;Database=dbOPT;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true
```

El secreto JWT y demás configuración están en `src/backend/OPT.API/appsettings.json`.

---

## Documentación de referencia

| Documento | Contenido |
|-----------|-----------|
| `docs/api/frontend-api-contracts.md` | DTOs y firmas de servicios Angular |
| `docs/api/README.md` | Resumen de todos los endpoints |
| `.agents/progress.md` | Historial de sesiones y próximos pasos |
| `.agents/decisions/` | ADRs (middleware, schema, migración GUID) |
