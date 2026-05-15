# 2026-05-08 — Migración de PKs INT IDENTITY → UNIQUEIDENTIFIER (GUID)

## Status
Accepted — implementado en Sesión 7

## Contexto

El esquema inicial del proyecto usaba `INT IDENTITY(1,1)` como PK en todas las tablas. Durante el crecimiento del producto SaaS se identificaron tres riesgos concretos:

1. **Seguridad (IDOR)**: PKs secuenciales expuestas en la API permiten enumerar recursos de otros tenants (`?id=1001`, `?id=1002`).
2. **Multi-tenant**: si en el futuro se necesita fusionar datos de dos tenants, colisión de IDs es inevitable con enteros.
3. **Distribución**: generación de IDs en múltiples fuentes (cliente, microservicio, import masivo) requiere GUIDs.

## Decisión

### Tablas migradas a `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()`

| Tabla | PK | FKs afectadas |
|---|---|---|
| `OPT_Tenant` | `TenantId` | — |
| `OPT_Sucursal` | `idSucursal` | `TenantId` |
| `OPT_Cliente` | `ClienteId` | `TenantId` |
| `OPT_Contacto` | `ContactoId` | `TenantId`, `ClienteId` |
| `OPT_Usuario` | `UsuarioId` | `TenantId` |
| `OPT_Anamnesis` | `AnamnesisId` | `TenantId`, `ClienteId` |

### Tablas que mantienen `INT IDENTITY` (catálogos compartidos)

| Tabla | PK | Razón |
|---|---|---|
| `OPT_Region` | `IdRegion` | Catálogo de solo lectura, sin TenantId, sin exposición directa en API |
| `OPT_Comuna` | `IdComuna` | Igual. FK a Region (int → int). Referenciado como `idComuna INT NULL` en Cliente |

### Por qué `NEWSEQUENTIALID()` y no `NEWID()`

`NEWID()` genera GUIDs completamente aleatorios. En SQL Server, el índice clustered (la PK) se fragmenta con cada inserción porque el nuevo valor se inserta en posición aleatoria del B-tree. Con tablas de miles de clientes esto degrada el rendimiento significativamente.

`NEWSEQUENTIALID()` genera GUIDs incrementales por sesión de servidor, lo que mantiene las inserciones al final del índice clustered — comportamiento equivalente al `INT IDENTITY` en términos de I/O.

```sql
-- ✅ CORRECTO
[ClienteId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID()

-- ❌ INCORRECTO — fragmenta índice clustered
[ClienteId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
```

### Configuración EF Core

```csharp
// En OPTDbContext.OnModelCreating — para cada entidad de negocio
e.Property(c => c.ClienteId)
 .HasDefaultValueSql("NEWSEQUENTIALID()");
```

EF Core NO usa `ValueGeneratedOnAdd()` con GUIDs en SQL Server cuando hay un `DEFAULT` definido en la columna — el `HasDefaultValueSql` es suficiente.

### Rutas API

```csharp
// ✅ CORRECTO — entidades de negocio
[HttpGet("{id:guid}")]
public async Task<IActionResult> GetCliente(Guid id, ...)

// ✅ CORRECTO — catálogos
[HttpGet("{id:int}")]
public async Task<IActionResult> GetRegion(int id, ...)
```

### FluentValidation

```csharp
// ✅ CORRECTO para Guid
RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId inválido.");

// ❌ INCORRECTO — no aplica a Guid
RuleFor(x => x.TenantId).GreaterThan(0);
```

### CurrentTenantService — parseo del JWT

```csharp
// ✅ CORRECTO
if (!Guid.TryParse(claim, out var tenantId))
    throw new InvalidOperationException("TenantId inválido.");

// ❌ INCORRECTO
if (!int.TryParse(claim, out var tenantId)) ...
```

### Frontend Angular — tipos TypeScript

Los IDs de entidades de negocio pasan de `number` a `string` (UUID es `string` en TypeScript/JSON):

```typescript
// ✅ CORRECTO
export interface ClienteDto {
  clienteId: string;   // UUID
  tenantId: string;    // UUID
  // ...
}

// ❌ INCORRECTO
export interface ClienteDto {
  clienteId: number;
  tenantId: number;
}
```

## Archivos modificados

### SQL (`src/basedatos/`)
- `001_OPT_Tenant.sql`
- `004_OPT_Sucursal.sql`
- `005_OPT_Cliente.sql`
- `006_OPT_Contacto.sql`
- `008_OPT_Usuario.sql`
- `010_OPT_Anamnesis.sql`

### Backend C# (`src/backend/`)
- `OPT.Domain/Entities/`: Cliente, Usuario, Contacto, Anamnesis — `int` → `Guid`
- `OPT.Infrastructure/Persistence/OPTDbContext.cs` — `HasDefaultValueSql("NEWSEQUENTIALID()")`
- `OPT.Infrastructure/Auth/CurrentTenantService.cs` — `Guid.TryParse`
- `OPT.Infrastructure/Persistence/Repositories/`: 4 repositorios — firmas `int` → `Guid`
- `OPT.Application/Interfaces/`: 4 interfaces de repositorio + `ICurrentTenantService`
- `OPT.Application/**/DTOs/`: ClienteDto, ContactoDto, AnamnesisDto
- `OPT.Application/**/Commands/`: Create*, Update*, Delete* de Clientes, Contactos, Anamnesis
- `OPT.Application/**/Queries/`: GetById*, GetBy*, GetAll* de las 3 entidades
- `OPT.Application/**/Validators/`: `NotEmpty()` en lugar de `GreaterThan(0)` para IDs
- `OPT.Application/Auth/`: `LoginCommand`, `LoginCommandValidator`
- `OPT.API/Controllers/`: ClienteController, ContactoController, AnamnesisController, AuthController

## Consecuencias

**Positivas:**
- IDs no enumerables → mitiga IDOR (Insecure Direct Object Reference)
- Compatibilidad directa con PostgreSQL (`UUID`) si se migra en el futuro
- Permite generación de IDs en cliente o en import masivo sin colisión

**Negativas (mitigadas):**
- PKs de 16 bytes vs 4 bytes → mayor tamaño de índices. Mitigado con `NEWSEQUENTIALID()` (inserciones secuenciales, sin fragmentación)
- Debugging menos legible (`3f2e4a1c-...` vs `42`). Mitigado: los campos de negocio identificables (RUT, NumeroDocumento) siguen siendo legibles

**Pendiente:**
- Actualizar modelos Angular (`number` → `string`) — pendiente sesión de frontend
- Actualizar script `009_comunas_datos.sql` si referencia IDs de catálogos (no aplica — usa INT)
