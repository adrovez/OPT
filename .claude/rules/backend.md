---
paths:
  - src/backend/**
---
# Reglas Backend (.NET 10 — se cargan al tocar src/backend/**)

## Direccion de capas (nunca invertir)
`OPT.API -> OPT.Infrastructure -> OPT.Application -> OPT.Domain`
- Domain: solo entidades, sin dependencias externas.
- Application: handlers CQRS (MediatR), DTOs, validadores FluentValidation, interfaces de repositorio.
- Infrastructure: EF Core (`OPTDbContext`), repos, JWT, BCrypt.
- API: controllers delgados (sin logica, sin try/catch), middleware, DI.

## Multi-tenant
- Handlers reciben `TenantId`/`SucursalId`/`UsuarioId`/`CreatedBy` como campos del command.
- `ICurrentTenantService` SOLO en controllers y middleware, nunca en handlers.
- Toda entidad de negocio filtra por `TenantId` (`HasQueryFilter`).

## Anti-patrones (NUNCA)
- `PagedResult<T>` con constructor posicional -> usar object initializer (props `init`).
- `.GreaterThan(0)` para Guid -> usar `.NotEmpty()`.
- `int.TryParse` para claims JWT -> usar `Guid.TryParse`.
- `WithMany()` sin navegacion -> genera FK shadow; usar `WithMany(x => x.Hijos)`.
- `DELETE` fisico -> soft delete (`IsDeleted = true`).
- try/catch en controllers -> dejar que `ExceptionHandlingMiddleware` traduzca.

## Gotchas
- Alias de namespace si modulo == entidad: `using StockEntity = OPT.Domain.Entities.Stock;`
- PK de `Sucursal` mapea a columna `idSucursal`.
- `DATE` -> `DateOnly`; `DATETIME2` -> `DateTime`.

Validar: `cd src/backend && dotnet build`.
