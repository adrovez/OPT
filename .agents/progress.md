# Progress Log

Track work sessions and current state for continuity between AI agent sessions.

## Current Status
> Updated: 2026-05-05 (Session 4 - Backend Middleware + Correcciones SQL)

### Active Tasks
- [x] Creacion de base de datos y scripts iniciales de tablas
- [x] Backend API: Auth, Clientes (Clean Architecture, .NET 10)
- [x] Frontend: Login y Cliente modules con Angular 21
- [x] Backend Middleware: ExceptionHandling, TenantValidation, CorrelationId
- [x] Correcciones SQL: FKs, índices, datos idempotentes

### Completed This Session (Session 4)
- **Middleware implementados** en `src/backend/OPT.API/Middleware/`:
  - `CorrelationIdMiddleware.cs` — genera/propaga `X-Correlation-Id`, inyecta en scope de logger
  - `ExceptionHandlingMiddleware.cs` — RFC 7807 ProblemDetails, mapeo de excepciones a HTTP codes
  - `TenantValidationMiddleware.cs` — segunda línea multi-tenant, valida claim `tenant_id > 0`
  - `Program.cs` actualizado con pipeline completo en orden correcto
  - Controllers limpiados de try/catch redundantes (delegan al middleware)

- **Correcciones SQL** en `src/basedatos/`:
  - `006_OPT_Contacto.sql` — FKs con `ON DELETE NO ACTION` (Tenant) y `ON CASCADE` (Cliente)
  - `008_OPT_Usuario.sql` — `Rol NOT NULL DEFAULT 'Operador'`, índices TenantId y Email
  - `007_datos_iniciales.sql` — guards `IF NOT EXISTS` para idempotencia en re-ejecución

- **Documentación creada**:
  - `.agents/decisions/2026-05-05-backend-middleware.md` — ADR de decisiones de middleware
  - `src/backend/AGENTS.md` — actualizado con estado real del backend (sesión 4)
  - `docs/technical-manual/backend-arquitectura.html` — manual completo de arquitectura
  - `docs/api/backend-api-reference.html` — referencia de endpoints Auth + Cliente
  - `docs/technical-manual/base-datos.html` — esquema y guía de base de datos

### Next Steps Sugeridos
- [ ] HTTP Interceptor JWT en Angular frontend
- [ ] Route guards en Angular (AuthGuard, TenantGuard)
- [ ] Módulo Sucursal (CRUD backend + frontend)
- [ ] Módulo Contactos en frontend
- [ ] Script `009_` para datos de prueba de usuarios (con BCrypt hashes)
- [ ] Unit tests backend con xUnit + Moq
- [ ] Validación de formato RUT chileno en FluentValidation

---

## Session History

### 2026-05-05 - Session 4: Middleware + Correcciones SQL
- **Work**: Middleware pipeline completo y correcciones de scripts SQL
- **Archivos creados/modificados** (15 archivos):
  - **Nuevos**:
    - `src/backend/OPT.API/Middleware/CorrelationIdMiddleware.cs`
    - `src/backend/OPT.API/Middleware/ExceptionHandlingMiddleware.cs`
    - `src/backend/OPT.API/Middleware/TenantValidationMiddleware.cs`
    - `.agents/decisions/2026-05-05-backend-middleware.md`
    - `docs/technical-manual/backend-arquitectura.html`
    - `docs/api/backend-api-reference.html`
    - `docs/technical-manual/base-datos.html`
  - **Modificados**:
    - `src/backend/OPT.API/Program.cs` — pipeline ordenado con 3 middleware
    - `src/backend/OPT.API/Controllers/AuthController.cs` — limpio de try/catch
    - `src/backend/OPT.API/Controllers/ClienteController.cs` — limpio de try/catch
    - `src/basedatos/006_OPT_Contacto.sql` — FKs corregidas
    - `src/basedatos/007_datos_iniciales.sql` — guards idempotentes
    - `src/basedatos/008_OPT_Usuario.sql` — Rol NOT NULL, índices
    - `src/backend/AGENTS.md` — actualizado

- **Pipeline middleware (orden definitivo)**:
  ```
  CorrelationId → ExceptionHandling → Swagger(dev) → CORS
  → HttpsRedirection → Authentication → Authorization
  → TenantValidation → MapControllers
  ```
- **Decisiones clave**:
  - ExceptionHandlingMiddleware usa RFC 7807 ProblemDetails (estándar .NET)
  - TenantValidation se ejecuta DESPUÉS de UseAuthentication/UseAuthorization
  - CorrelationId es el PRIMERO para que todos los logs lleven el ID
  - BCrypt abstraído en `IPasswordHasher` interface (Application) → implementado en Infrastructure

### 2026-05-05 - Session 3: Frontend Development (Angular 21)
- **Work**: Creacion completa de frontend Angular con Signal Forms y Tailwind CSS
- **Tech Stack**: Angular 21.0.5, TypeScript 5.x, Tailwind CSS 4.2.4, Signal Forms
- **Archivos clave**: app.config.ts, app.routes.ts, login/login.ts, cliente/lista, cliente/formulario, services/auth.ts, services/cliente.ts
- **Build Results**: `ng build` exitoso, 0 errores

### 2026-05-05 - Session 2: Backend API Creation
- **Work**: Implementacion completa del backend .NET 10 con Clean Architecture
- **Estructura creada**: Domain/Entities, Application/Interfaces+Commands+Queries, Infrastructure/Persistence+Auth, API/Controllers
- **Interfaces clave**: IClienteRepository, IUsuarioRepository, IJwtService, ICurrentTenantService, IPasswordHasher
- **Build**: `dotnet build` exitoso - 0 errores

### 2026-05-05 - Session 1: Base de datos
- **Work**: Creación de base de datos `dbOPT` y scripts de tablas iniciales
- **Tablas**: OPT_Tenant, OPT_Region, OPT_Comuna, OPT_Sucursal, OPT_Cliente, OPT_Contacto, OPT_Usuario
- **Decisión clave**: Unificación OPT_Cliente (Persona + Empresa en una tabla con TipoCliente)
