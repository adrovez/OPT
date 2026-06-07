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

Scripts SQL en `src/basedatos/` numerados `000–029`. Ejecutar en orden sobre SQL Server (base de datos `dbOPT`). **Próximo script incremental: `031_`**.

```bash
sqlcmd -S localhost -d dbOPT -E -i src/basedatos/<script>.sql
```

| Script | Crea |
|--------|------|
| `000` | Base de datos `dbOPT` |
| `001` | `OPT_Tenant` |
| `002` | `OPT_Region` + `OPT_Comuna` |
| `003` | `OPT_Sucursal` |
| `004` | `OPT_Usuario` |
| `005` | `OPT_Cliente` |
| `006` | `OPT_Contacto` |
| `007` | `OPT_Anamnesis` |
| `008–010` | Índices / datos iniciales / ajustes |
| `011` | `OPT_RecetaCristales` |
| `012` | `OPT_UsuarioSucursal` (M:N) |
| `013` | `OPT_Rol` (catálogo compartido, INT PK) |
| `014` | `OPT_Agenda` |
| `015` | `OPT_ProductoCategoria` |
| `016` | `OPT_Producto` |
| `017` | `OPT_ProductoVariante` |
| `018` | `OPT_Stock` + `OPT_MovimientoStock` |
| `019` | `OPT_PrecioProducto` |
| `020` | `OPT_DocumentoStock` + `OPT_DocumentoStockLinea` |
| `021` | `OPT_FormaPago` (catálogo INT PK, 5 filas) |
| `022` | `OPT_Atencion` |
| `023` | `OPT_CobroServicio` |
| `024` | ALTER a `OPT_RecetaCristales` (+`AtencionId`, +`Fuente`) y `OPT_Anamnesis` (+`AtencionId`) |
| `025` | ALTER `OPT_Agenda` — reemplaza estado `Pendiente` → `Ingresado` (DEFAULT + CHECK + datos) |
| `026` | Migración de datos legacy desde `DatosParaMigrar.xlsx` (idempotente; requiere 000–025) |
| `027` | Rediseño módulo Inventario — drop tablas antiguas (ProductoCategoria, ProductoVariante, DocumentoStock, DocumentoStockLinea) y crea: `OPT_Categoria`, `OPT_Producto` (jerarquía self-ref), `OPT_PrecioProducto`, `OPT_Stock`, `OPT_DocumentoEntrada`, `OPT_DocumentoEntradaLinea`, `OPT_Transferencia`, `OPT_MovimientoStock` |
| `028` | `OPT_TransferenciaLinea` — líneas de transferencia de stock (ON DELETE CASCADE desde `OPT_Transferencia`) |
| `029` | `OPT_OrdenTrabajo` + `OPT_OrdenTrabajoLinea` + `OPT_OrdenTrabajoPago` + `OPT_OrdenTrabajoCuota` + `OPT_OrdenTrabajoBitacora` |
| `030` | `OPT_TipoPrevision` (catálogo compartido, INT PK, 7 filas iniciales) |

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
features/       # auth, clientes, anamnesis, productos, stock, sucursales, usuarios (cada uno en su carpeta)
layout/         # main-layout shell (sidebar + router-outlet)
app.routes.ts   # rutas raíz con lazy loading
```

**Rutas registradas (todas bajo `authGuard`, lazy-loaded):**

| Ruta | Componente | Módulo |
|------|-----------|--------|
| `/login` | `LoginComponent` | — (pública) |
| `/clientes` | `ClientesListComponent` | Clientes |
| `/clientes/:id` | `ClienteDetailComponent` | Clientes |
| `/clientes/:id/anamnesis` | `AnamnesisListComponent` | Anamnesis |
| `/clientes/:id/recetas` | `RecetasClienteListComponent` | Recetas del cliente |
| `/precios` | `PreciosListComponent` | Precios |
| `/sucursales` | `SucursalesListComponent` | Sucursales |
| `/usuarios` | `UsuariosListComponent` | Usuarios |
| `/productos` | `ProductosListComponent` | Productos |
| `/stock` | `StockListComponent` | Stock |
| `/agenda` | `AgendaCalendarComponent` | Agenda (usa `X-Sucursal-Id`) |
| `/atenciones` | `AtencionesListComponent` | Atención (2 tabs: Sala espera/Historial) |
| `/atenciones/iniciar?agendaId=` | `AtencionIniciarComponent` | Wizard 3 pasos (requiere agendaId) |
| `/atenciones/nueva` | `AtencionFormComponent` | Formulario atención directa |
| `/atenciones/:id` | `AtencionDetailComponent` | Detalle (4 tabs, lazy load Anamnesis/Receta) |
| `/ordenes-trabajo` | `OrdenesTrabajoListComponent` | OT — lista + filtros |
| `/ordenes-trabajo/nueva` | `OrdenTrabajoFormComponent` | Crear OT |
| `/ordenes-trabajo/:id` | `OrdenTrabajoDetailComponent` | Detalle (2 tabs: Info + Atención) |

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

**Excepción — entidades bitácora (audit log):** `OPT_OrdenTrabajoBitacora` y similares son append-only: sin `IsDeleted`, sin `HasQueryFilter`, FK con `OnDelete(DeleteBehavior.Restrict)`. Cada cambio queda registrado permanentemente. Al leer, ordenar siempre por `Fecha`.

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

**Esto aplica también a FKs:** cualquier tabla que referencie a `OPT_Sucursal` debe declarar la FK sobre la columna `idSucursal`, y el mapping de EF Core necesita `.HasColumnName("idSucursal")` en la propiedad `SucursalId` de la entidad dependiente.

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

### DateOnly vs DateTime para fechas (SQL DATE vs DATETIME2)
- `DATE` → `DateOnly` en C# / `string` ISO date (`"2025-05-24"`) en TypeScript
- `DATETIME2` → `DateTime` en C# / `string` ISO local datetime (`"2026-05-26T09:00:00"`) en TypeScript

System.Text.Json serializa ambos automáticamente. **Nunca usar `DateTime` para columnas `DATE`** — pierde la semántica y rompe la serialización.

### Conflicto namespace/clase en Application (gotcha conocido)
Cuando el namespace del módulo coincide con el nombre de la entidad (ej. `OPT.Application.RecetaCristales` + clase `RecetaCristales`, o `OPT.Application.Stock` + clase `Stock`), usar alias en los archivos afectados. El error del compilador es: `'X' es espacio de nombres pero se usa como tipo`.

```csharp
using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales;
using StockEntity = OPT.Domain.Entities.Stock;
```

Afecta a todos los archivos en `OPT.Application.<Módulo>/` que referencien la clase del mismo nombre, y también a `OPT.Application/Interfaces/I<Módulo>Repository.cs`.

### Transiciones de estado vía PATCH
Para entidades con máquina de estados, exponer un endpoint dedicado en vez de incluir el campo estado en el PUT:

```
PATCH /api/agenda/{id}/estado          →  body: { "estado": "Confirmada" }
PATCH /api/ordenes-trabajo/{id}/etapa  →  body: { "etapa": "Montaje" }
```

El backend valida la transición permitida; el PUT normal actualiza los demás campos sin tocar el estado.

Para workflows con múltiples etapas (ej. OrdenTrabajo: `Ingresado → EnProceso → Montaje → Laboratorio → Calidad → Despacho → Entregado`), el repositorio puede restringir edición/borrado a las primeras etapas:

```csharp
if (ot.EtapaOT is not ("Ingresado" or "EnProceso"))
    throw new InvalidOperationException("Solo se puede modificar en etapas iniciales");
```

### Patrón Input wrapper para comandos con colecciones anidadas
Cuando un command acepta colecciones complejas (líneas, abonos), definir records de entrada ligeros en la *interfaz* del repositorio, no en el DTO del request:

```csharp
// En IOrdenTrabajoRepository.cs
public record OTLineaInput(Guid ProductoId, int Cantidad, decimal PrecioUnitario, string? Observacion);
public record OTAbonoInput(Guid FormaPagoId, decimal Monto);
// El command acepta IReadOnlyList<OTLineaInput>
// El controller mapea desde el request antes de construir el command
```

### DTOs lista vs. detalle
Para módulos con datos anidados, usar dos DTOs distintos: uno ligero para listas y uno completo para el detalle:
- `OrdenTrabajoDto` — campos escalares, sin colecciones hijas (para `GetPaged`)
- `OrdenTrabajoDetalleDto` — incluye `Lineas`, `Pagos`, `Cuotas`, `Bitacora` (para `GetById`)

### X-Sucursal-Id: requerido en escritura, opcional en lectura
Para módulos scoped por sucursal, la convención es: el header `X-Sucursal-Id` es **requerido** en `POST`/`PUT` (retorna 400 si falta) y **opcional** en `GET` (filtra si se provee, devuelve todos si no). Verificar explícitamente en el controller para escrituras:

```csharp
if (!Guid.TryParse(Request.Headers["X-Sucursal-Id"], out var sucursalId))
    return BadRequest(new ProblemDetails { Title = "X-Sucursal-Id requerido" });
```

### Checklist para nuevo módulo
**Backend:** Entidad Domain → Interfaz Application → Handlers+DTOs Application → Repositorio Infrastructure → Config DbContext (`HasQueryFilter`) → Controller API → Script SQL (`030_...`)

**Frontend:** `core/models/<mod>.model.ts` → `core/services/<mod>.service.ts` → componentes en `features/<mod>/` → ruta en `app.routes.ts`

---

## Estado de módulos (Junio 2026)

| Módulo | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ (login devuelve `sucursales[]`) | ✅ |
| Clientes + Contactos | ✅ | ✅ |
| Regiones/Comunas | ✅ (catálogo) | ✅ (shareReplay cache) |
| Anamnesis | ✅ | ✅ |
| RecetaCristales | ✅ | ✅ via wizard `/atenciones/iniciar` (paso 3); editable en `/atenciones/:id` tab Receta |
| Sucursales | ✅ | ✅ (switcher en sidebar vía `SucursalContextService`) |
| Usuarios | ✅ | ✅ |
| Roles (catálogo) | ✅ (`013_OPT_Rol.sql` + `GET /api/roles`) | ✅ `rol.service.ts` + combobox dinámico en `usuario-form` |
| Agenda | ✅ (`014_OPT_Agenda.sql` + API CRUD + `X-Sucursal-Id` header) | ✅ Calendario semanal en `/agenda`. Botón "Atender" en citas Confirmadas → navega a `/atenciones/iniciar?agendaId=xxx` |
| FormaPago (catálogo) | ✅ (`021_OPT_FormaPago.sql` + `GET /api/forma-pagos`) | ✅ `forma-pago.service.ts` con `shareReplay(1)` |
| Atención + CobroServicio | ✅ (`022–024` scripts; `POST /api/atenciones/iniciar` crea Atención+Anamnesis+RecetaCristales atómicamente) | ✅ Lista `/atenciones` (2 tabs: Sala de espera/Historial), wizard `/atenciones/iniciar` (3 pasos: Atención→Anamnesis→RecetaCristales), detalle `/atenciones/:id` (4 tabs: Información, Anamnesis, Receta Cristales, Cobro con lazy load) |
| Productos (catálogo) | ✅ (`015-017` scripts + API CRUD + Categorías + Variantes — **sin precios ni stock**) | ✅ `/productos` con lista + formulario + gestión de categorías |
| Stock / Inventario | ✅ (`018_OPT_Stock.sql` + API CRUD + `X-Sucursal-Id` header) | ✅ (4 tabs: Stock actual, Entradas, Historial de movimientos, Transferencias) |
| Precios | ✅ (`027` — `OPT_PrecioProducto` global por producto; `GET/POST /api/precios`) | ✅ `/precios` — lista con filtros, edición inline, historial por producto |
| Documentos de Entrada | ✅ (`027` — `OPT_DocumentoEntrada`; FacturaCompra, BoletaCompra, OtroIngreso + Anular) | ✅ (tab Entradas en `/stock`) |
| Transferencias de Stock | ✅ (`028_OPT_TransferenciaLinea.sql` + `POST /api/transferencias` + `PATCH /api/transferencias/{id}/estado`) | ✅ tab Transferencias en `/stock` — lista, crear, Confirmar/Anular |
| Orden de Trabajo | ✅ (`029` — 5 tablas + 7 endpoints; `POST /api/ordenes-trabajo`, `PATCH /{id}/etapa`, `POST /{id}/pagos`) | ✅ Lista `/ordenes-trabajo` (tabla+filtros), form crear/editar, detalle 2 tabs (Info+Atención), modales cambiar etapa y registrar pago |
| Salida (documentos) | 🔮 Futuro — por ahora solo Salida directa desde formulario | ⏳ Salida directa disponible en form por fila |

### Arquitectura: Inventario (post-script 027)

**Jerarquía de Productos (self-reference):**
- `OPT_Producto` usa `ProductoPadreId` (nullable): nodo raíz (`NULL`) = familia, nodo hijo = SKU concreto con stock
- `Tipo` ∈ `{'Producto', 'Servicio'}` — los servicios nunca tienen hijos ni stock
- `OPT_Categoria` reemplaza `OPT_ProductoCategoria` (catálogo plano por tenant)
- No existe `OPT_ProductoVariante`: las variantes son ahora nodos hijo de `OPT_Producto`

**Flujo de Entrada (documento-based):**
- El usuario crea un `OPT_DocumentoEntrada` (`FacturaCompra`, `BoletaCompra`, `OtroIngreso`) con líneas (`OPT_DocumentoEntradaLinea`: producto + cantidad + precio costo opcional)
- Al confirmar: genera `OPT_MovimientoStock(TipoMovimiento="Entrada", DocumentoId=FK)` por cada línea y actualiza `OPT_PrecioProducto` (cierra el precio vigente, crea uno nuevo)
- Al anular: genera `OPT_MovimientoStock(TipoMovimiento="Ajuste", Cantidad=-n)` como compensación. Los precios NO se revierten
- Los movimientos directos (Salida, Ajuste) NO requieren documento — `DocumentoId` es NULLABLE
- `OPT_Transferencia` está en BD (script 027) para movimientos entre sucursales — pendiente de implementar

**Estructura de precios:**
- `OPT_PrecioProducto(ProductoId, TenantId, PrecioCosto?, PrecioVenta?, VigenciaDesde, VigenciaHasta)` — precio global por producto (sin SucursalId); `VigenciaHasta NULL` = vigente
- Sin IsDeleted: la expiración se maneja con `VigenciaHasta`

### Regla de negocio: SucursalId en módulos sucursal-scoped
Los módulos asociados a sucursal (Agenda, Stock) reciben el `SucursalId` via header HTTP `X-Sucursal-Id`. El frontend lo envía desde `SucursalContextService.sucursalActual().sucursalId`. Los datos generales (Clientes, Anamnesis, RecetaCristales) NO requieren este header — son datos del tenant completo.

**Excepción — stock cross-sucursal:** `GET /api/stock/por-producto/{productoId}` devuelve el stock del producto en *todas* las sucursales del tenant y no requiere `X-Sucursal-Id`. Retorna `IReadOnlyList<StockPorSucursalDto>` (SucursalId, SucursalNombre, CantidadDisponible, StockMinimo, BajoMinimo).

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

## Design System

Definido en `.agents/branding.md`. Resumen para trabajo en frontend:

| Token | Valor | Uso |
|-------|-------|-----|
| Azul oscuro | `#0D1B3D` | Sidebar, headers |
| Azul medio | `#2563EB` | Botones principales |
| Celeste | `#06B6D4` | Elementos informativos |
| Verde | `#10B981` | Estados positivos, confirmación |
| Gris claro | `#F3F6FA` | Fondos de página |

**Tipografía:** Poppins (Bold H1, SemiBold H2, Regular body, Medium labels)

**Estilo UI:** cards, espaciado amplio, iconos outline. Sidebar fondo azul oscuro con iconos + texto.

---

## Documentación de referencia

| Documento | Contenido |
|-----------|-----------|
| `docs/api/frontend-api-contracts.md` | DTOs y firmas de servicios Angular |
| `docs/api/README.md` | Resumen de todos los endpoints |
| `docs/requerimientos/flujo-clinico-comercial.html` | Flujo clínico-comercial de referencia (legacy) |
| `.agents/progress.md` | Historial de sesiones y próximos pasos |
| `.agents/decisions/` | ADRs (middleware, schema, migración GUID) |
| `.agents/branding.md` | Paleta de colores, tipografía y guías UX completas |
