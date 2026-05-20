# Backend - Agent Instructions
> Alcance: **solo backend** `src/backend/`.
> Objetivo: que cualquier agente contribuya sin romper arquitectura, seguridad multi-tenant ni calidad de entrega.
> Última actualización: 2026-05-19 (Sesión 12 — Módulo Usuarios CRUD + UsuarioSucursal M:N)

---

## 1) Contexto del producto

OPT es un SaaS multi-tenant para gestión de ópticas (clientes, contactos, sucursales).

- **Backend**: .NET 10 con Clean Architecture (4 proyectos).
- **Frontend**: Angular 21 standalone (feature-based, lazy loading).
- **Persistencia**: SQL Server 2022 con query filters por TenantId en EF Core.
- **Auth**: JWT (claim `tenant_id` + `rut_usuario` + rol) + BCrypt.

Principio rector: **nada puede exponer datos cross-tenant** por error de código.

---

## 2) Mapa de arquitectura (fuente de verdad)

### Proyectos y responsabilidades

| Proyecto | Responsabilidad | Dependencias |
|----------|----------------|-------------|
| `OPT.Domain` | Entidades, reglas de dominio | Ninguna |
| `OPT.Application` | Commands, Queries, Handlers, DTOs, Validators, Interfaces | Domain |
| `OPT.Infrastructure` | DbContext, Repositories, JWT, BCrypt, CurrentTenant | Application |
| `OPT.API` | Controllers, Middleware, Program.cs, DI wiring | Application + Infrastructure |

### Regla de dependencias (Clean Architecture)
```
OPT.API → OPT.Infrastructure → OPT.Application → OPT.Domain
```
Nunca en sentido contrario. Application **no** conoce clases concretas de Infrastructure.

### Paquetes NuGet instalados

| Proyecto | Paquete | Versión |
|----------|---------|---------|
| `OPT.Application` | MediatR | 12.4.1 |
| `OPT.Application` | FluentValidation | 11.10.0 |
| `OPT.Application` | FluentValidation.DependencyInjectionExtensions | 11.10.0 |
| `OPT.Infrastructure` | Microsoft.EntityFrameworkCore | 9.0.0 |
| `OPT.Infrastructure` | Microsoft.EntityFrameworkCore.SqlServer | 9.0.0 |
| `OPT.Infrastructure` | Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 |
| `OPT.Infrastructure` | BCrypt.Net-Next | 4.0.3 |
| `OPT.API` | FluentValidation.AspNetCore | 11.3.0 |
| `OPT.API` | Swashbuckle.AspNetCore | 7.2.0 |

---

## 3) Interfaces de Application (contratos clave)

| Interface | Implementación | Descripción |
|-----------|---------------|-------------|
| `IClienteRepository` | `ClienteRepository` | CRUD + paginación + `.Include(Contactos)` en GetByIdAsync, filtra por TenantId |
| `IContactoRepository` | `ContactoRepository` | CRUD + `AddRangeAsync` + `SoftDeleteByClienteAsync`, filtra por TenantId + ClienteId |
| `IRegionRepository` | `RegionRepository` | `GetAllWithComunasAsync` (sin filtro de tenant — son datos de catálogo) |
| `IUsuarioRepository` | `UsuarioRepository` | CRUD completo + GetByRut + AssignSucursal/RemoveSucursal/ExistsAssignment — Include(UsuarioSucursales) |
| `ITenantRepository` | `TenantRepository` | CRUD de tenants (sin filtro de tenant) |
| `IAnamnesisRepository` | `AnamnesisRepository` | CRUD + `SoftDeleteAsync`, filtra por TenantId + ClienteId |
| `IRecetaCristalesRepository` | `RecetaCristalesRepository` | CRUD + `SoftDeleteAsync`, filtra por TenantId + ClienteId |
| `ISucursalRepository` | `SucursalRepository` | CRUD + `SoftDeleteAsync`, filtra por TenantId; lista ordenada por Nombre |
| `IJwtService` | `JwtService` | Genera tokens JWT con claims tenant_id, rut_usuario, rol |
| `ICurrentTenantService` | `CurrentTenantService` | Extrae TenantId y RutUsuario del HttpContext actual |
| `IPasswordHasher` | `BcryptPasswordHasher` | Verifica/hashea contraseñas con BCrypt |

---

## 4) Módulos API implementados (estado: sesión 11)

| Módulo | Controller | Auth | Estado |
|--------|-----------|------|--------|
| **Tenant** | `TenantController` | No | ✅ CRUD completo |
| **Auth** | `AuthController` | No (anónimo) | ✅ Login + Register |
| **Clientes** | `ClienteController` | JWT | ✅ CRUD + paginado + búsqueda + contactos embebidos |
| **Contactos** | `ContactoController` | JWT | ✅ CRUD por cliente |
| **Regiones** | `RegionController` | JWT | ✅ WithComunas (catálogo anidado) |
| **Anamnesis** | `AnamnesisController` | JWT | ✅ CRUD por clienteId |
| **RecetaCristales** | `RecetaCristalesController` | JWT | ✅ CRUD por clienteId |
| **Sucursales** | `SucursalController` | JWT | ✅ CRUD por tenant |
| **Usuarios** | `UsuarioController` | JWT | ✅ CRUD + cambio contraseña + asignar/desasignar sucursales (M:N) |

### Endpoints detallados

#### Tenant
- `GET /api/tenants` → `List<TenantDto>`
- `GET /api/tenants/{id}` → `TenantDto | 404`
- `POST /api/tenants` → `201 Created`
- `PUT /api/tenants/{id}` → `200 OK`
- `DELETE /api/tenants/{id}` → soft delete → `204 No Content`

#### Auth
- `POST /api/auth/login` → `{ rutUsuario, password, tenantId }` → `{ token, nombre, rol, userId, tenantId, expiresAt }`
- `POST /api/auth/register` → crea usuario (requiere JWT) → `LoginResponse`

#### Clientes
- `GET /api/clientes?page=1&pageSize=20&search=` → `PagedResult<ClienteDto>` (sin contactos — performance)
- `GET /api/clientes/{id}` → `ClienteDto` con `Contactos[]` incluidos | 404
- `POST /api/clientes` → body `CreateClienteRequest` (incluye `Contactos?`) → `201 Created`
- `PUT /api/clientes/{id}` → body `UpdateClienteRequest` (incluye `Contactos?`, replace completo) → `200 OK`
- `DELETE /api/clientes/{id}` → soft delete → `204 No Content`

> **Nota sobre Contactos en Clientes:** `CreateClienteRequest` y `UpdateClienteRequest` aceptan `IReadOnlyList<ContactoInputDto>? Contactos`.
> En Update, la estrategia es **replace completo**: soft-delete todos los contactos existentes, luego crear los nuevos.
> `ContactoInputDto` NO tiene `ContactoId` — si se añadiera en el futuro, cambiar a merge selectivo.

#### Contactos (endpoint independiente — uso alternativo)
- `GET /api/contactos/cliente/{clienteId}` → `List<ContactoDto>`
- `POST /api/contactos` → body `CreateContactoRequest` → `200 OK`
- `PUT /api/contactos/{id}` → body `UpdateContactoRequest` → `200 OK`
- `DELETE /api/contactos/{id}` → soft delete → `204 No Content`

#### Regiones (catálogo — sin filtro de tenant)
- `GET /api/Regiones/WithComunas` → `IReadOnlyList<RegionWithComunasDto>` (regiones de Chile con comunas anidadas, ordenadas por nombre)

#### Anamnesis (historial de salud, por cliente)
- `GET /api/Anamnesis?clienteId={guid}` → `IReadOnlyList<AnamnesisDto>` (orden: FechaRegistro DESC)
- `GET /api/Anamnesis/{id:guid}` → `AnamnesisDto | 404`
- `POST /api/Anamnesis` → body `CreateAnamnesisRequest` → `201 Created { id }`
- `PUT /api/Anamnesis/{id:guid}` → body `UpdateAnamnesisRequest` → `204 No Content`
- `DELETE /api/Anamnesis/{id:guid}` → soft delete → `204 No Content`

#### RecetaCristales (receta óptica, por cliente)
- `GET /api/RecetaCristales?clienteId={guid}` → `IReadOnlyList<RecetaCristalesDto>` (orden: FechaIngreso DESC)
- `GET /api/RecetaCristales/{id:guid}` → `RecetaCristalesDto | 404`
- `POST /api/RecetaCristales` → body `CreateRecetaCristalesRequest` → `201 Created { id }`
- `PUT /api/RecetaCristales/{id:guid}` → body `UpdateRecetaCristalesRequest` → `204 No Content`
- `DELETE /api/RecetaCristales/{id:guid}` → soft delete → `204 No Content`

> **Campos RecetaCristales:** Lejos/Cerca (OD, OI, DP) cada uno con Esferico, Cilindro, Eje y Observacion. ADD (LejosADDEsfera). Flags: CheckLejos, CheckCerca, CheckCristalesLaboratorio, CheckUrgente. FechaIngreso opcional en POST (default: UtcNow).

#### Sucursales
- `GET /api/sucursales` → `IReadOnlyList<SucursalDto>` (orden: Nombre ASC)
- `GET /api/sucursales/{id:guid}` → `SucursalDto | 404`
- `POST /api/sucursales` → body `{ Nombre, Direccion?, Telefono?, Matriz }` → `201 Created { id }`
- `PUT /api/sucursales/{id:guid}` → body `{ Nombre, Direccion?, Telefono?, Matriz }` → `204 No Content`
- `DELETE /api/sucursales/{id:guid}` → soft delete → `204 No Content`

> TenantId siempre extraído del claim JWT. No es campo del body. `Matriz: bool` indica si es la sede principal.

#### Usuarios
- `GET /api/usuarios` → `IReadOnlyList<UsuarioDto>` (incluye `sucursales[]` asignadas, orden: Nombre ASC)
- `GET /api/usuarios/{id:guid}` → `UsuarioDto | 404`
- `POST /api/usuarios` → body `{ RutUsuario, Nombre, Email, Password, Rol }` → `201 Created { id }`
- `PUT /api/usuarios/{id:guid}` → body `{ Nombre, Email, Rol }` → `204 No Content`
- `DELETE /api/usuarios/{id:guid}` → soft delete → `204 No Content`
- `PUT /api/usuarios/{id:guid}/password` → body `{ NewPassword }` → `204 No Content`
- `POST /api/usuarios/{id:guid}/sucursales` → body `{ SucursalId }` → `204 No Content | 409 ya asignada`
- `DELETE /api/usuarios/{id:guid}/sucursales/{sucursalId:guid}` → `204 No Content`

> Roles válidos: `Admin`, `Operador`, `Lectura`. Contraseña hasheada con BCrypt al crear/cambiar. La relación con Sucursales es M:N via `OPT_UsuarioSucursal`. Un usuario puede acceder a múltiples sucursales del mismo tenant.

---

## 5) Pipeline de Middleware (orden crítico)

```
CorrelationId → ExceptionHandling → Swagger(dev) → CORS
→ HttpsRedirection → Authentication → Authorization
→ TenantValidation → MapControllers
```

### Middleware implementados en `OPT.API/Middleware/`

| Middleware | Posición | Función |
|-----------|---------|---------|
| `CorrelationIdMiddleware` | 1° | Genera/propaga `X-Correlation-Id`, lo inyecta en scope de logger |
| `ExceptionHandlingMiddleware` | 2° | Captura todas las excepciones → RFC 7807 ProblemDetails |
| `TenantValidationMiddleware` | Tras Authorization | Valida `tenant_id` claim > 0, 403 si inválido |

### Mapeo de excepciones → HTTP

| Excepción | HTTP | Cuándo lanzarla |
|-----------|------|----------------|
| `ValidationException` | 400 | FluentValidation falla |
| `UnauthorizedAccessException` | 401 | Credenciales inválidas |
| `KeyNotFoundException` | 404 | Entidad no encontrada |
| `InvalidOperationException` | 409 | Regla de negocio (ej. RUT duplicado) |
| `Exception` | 500 | Error inesperado |

**Regla**: Los controllers NO deben tener try/catch. Lanzar la excepción correcta desde el handler.

---

## 6) Multi-tenancy y seguridad (reglas no negociables)

1. Toda consulta de negocio lleva `TenantId` explícito (nunca confiar solo en query filters).
2. `OPTDbContext` tiene `HasQueryFilter` para `IsDeleted = false` en todas las entidades.
3. **`TenantValidationMiddleware` rechaza tokens con `tenant_id` vacío o que no sea un Guid válido.**
4. `CurrentTenantService` extrae el `TenantId` del claim JWT — nunca del body/query.
5. El delete siempre es lógico: `IsDeleted = true`, nunca `DELETE` físico.

### Claims JWT incluidos
```json
{ "sub": "550e8400-e29b-41d4-a716-446655440000", "tenant_id": "550e8400-e29b-41d4-a716-446655440001", "rut_usuario": "12345678-9",
  "name": "Juan Pérez", "role": "Operador", "jti": "guid-unico" }
```

---

## 7) Entidades de dominio actuales

| Entidad | Archivo | PK | TenantId | Notas |
|---------|---------|-----|---------|-------|
| `Tenant` | `OPT.Domain/Entities/Tenant.cs` | `TenantId` **Guid** | No (es la raíz) | — |
| `Cliente` | `OPT.Domain/Entities/Cliente.cs` | `ClienteId` **Guid** | Sí **Guid** | TipoCliente: Persona|Empresa; FK `IdComuna` sigue INT (catálogo) |
| `Contacto` | `OPT.Domain/Entities/Contacto.cs` | `ContactoId` **Guid** | Sí **Guid** | Solo para clientes Empresa; FK ClienteId Guid |
| `Region` | `OPT.Domain/Entities/Region.cs` | `IdRegion` **int** | No (catálogo) | Dato compartido — sin TenantId |
| `Comuna` | `OPT.Domain/Entities/Comuna.cs` | `IdComuna` **int** | No (catálogo) | FK IdRegion int |
| `Usuario` | `OPT.Domain/Entities/Usuario.cs` | `UsuarioId` **Guid** | Sí **Guid** | Roles: Admin, Operador, Lectura |
| `Anamnesis` | `OPT.Domain/Entities/Anamnesis.cs` | `AnamnesisId` **Guid** | Sí **Guid** | Historial de salud; FK ClienteId Guid |
| `RecetaCristales` | `OPT.Domain/Entities/RecetaCristales.cs` | `RecetaCristalesId` **Guid** | Sí **Guid** | Receta óptica (lejos/cerca/DP/ADD); FK ClienteId Guid |
| `Sucursal` | `OPT.Domain/Entities/Sucursal.cs` | `SucursalId` **Guid** | Sí **Guid** | Sucursal de la óptica; campo Matriz (bool) para sede principal |
| `UsuarioSucursal` | `OPT.Domain/Entities/UsuarioSucursal.cs` | PK compuesta **(UsuarioId, SucursalId)** | — | Pivote M:N. Campos: AssignedAt, AssignedBy |

### Regla de tipos de PK/FK

| Tipo de tabla | PK en C# | PK en SQL | DEFAULT SQL |
|---|---|---|---|
| Negocio (tenant-aware) | `Guid` | `UNIQUEIDENTIFIER` | `NEWSEQUENTIALID()` |
| Catálogo compartido | `int` | `INT IDENTITY` | Autoincremental |

- **EF Core**: `e.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");`
- **FluentValidation**: IDs `Guid` usan `.NotEmpty()` — nunca `.GreaterThan(0)`
- **CurrentTenantService**: parsear claims con `Guid.TryParse` — nunca `int.TryParse`
- **Rutas API**: `{id:guid}` en controllers de entidades negocio · `{id:int}` solo en catálogos (Region, Comuna)
- **Fragmentación**: nunca usar `NEWID()` como DEFAULT — usar `NEWSEQUENTIALID()` (secuencial, evita fragmentación del índice clustered)

### Advertencia EF Core — relación Cliente ↔ Contacto

En `OPTDbContext.OnModelCreating`, la configuración de Contacto **debe** especificar la propiedad de navegación en ambos lados:

```csharp
// ✅ CORRECTO
entity.HasOne(ct => ct.Cliente)
      .WithMany(cl => cl.Contactos)   // ← nombre de la colección en Cliente
      .HasForeignKey(ct => ct.ClienteId);

// ❌ INCORRECTO — genera shadow FK "ClienteId1" → error en runtime
entity.HasOne(ct => ct.Cliente).WithMany()...
```

**Causa real:** al agregar `ICollection<Contacto> Contactos` a `Cliente` sin actualizar `WithMany()`, EF Core creó una segunda FK shadow. Esto generó el error `Invalid column name 'ClienteId1'` en producción.

---

## 8) Patrones de implementación

### Agregar un nuevo módulo (ejemplo: Sucursal)
1. **Domain**: crear `Entities/Sucursal.cs`
2. **Application**: crear `Interfaces/ISucursalRepository.cs`, `Sucursales/Commands/`, `Sucursales/Queries/`
3. **Infrastructure**: crear `Persistence/Repositories/SucursalRepository.cs`, mapear en `OPTDbContext`
4. **API**: crear `Controllers/SucursalController.cs`
5. **SQL**: crear `src/basedatos/009_OPT_Sucursal_actualizar.sql` si hay cambios de esquema

### Agregar campo a entidad existente
1. Actualizar entidad en Domain
2. Actualizar configuración EF en `OPTDbContext.OnModelCreating`
3. Crear script SQL incremental (ALTER TABLE)
4. Actualizar DTO y mapping extensions
5. Actualizar validators si aplica

---

## 9) Comandos de desarrollo

```bash
dotnet restore
dotnet build
dotnet run --project OPT.API
dotnet test
```

---

## 10) Anti-patrones a evitar

- ❌ Poner lógica de negocio en controllers
- ❌ Acceder a `OPTDbContext` directamente desde Application (usar repositorios)
- ❌ Hardcodear `TenantId` en queries
- ❌ `DELETE` físico en tablas con `IsDeleted`
- ❌ `try/catch` en controllers (el middleware lo maneja)
- ❌ Lanzar `Exception` genérica desde handlers (usar la excepción semántica correcta)
- ❌ Loguear `PasswordHash`, tokens JWT, ni PII sensible
