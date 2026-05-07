# Progress Log

Track work sessions and current state for continuity between AI agent sessions.

## Current Status
> Updated: 2026-05-07 (Sesión 6 — RegionService, contactos embebidos, vista detalle cliente)

### Completado hasta ahora
- [x] Base de datos: scripts 000–008, tablas Tenant/Region/Comuna/Sucursal/Cliente/Contacto/Usuario
- [x] Backend API: Tenant, Auth, Clientes (+ contactos embebidos), Contactos, Regiones (WithComunas)
- [x] Backend Middleware: CorrelationId, ExceptionHandling (RFC 7807), TenantValidation
- [x] Frontend Angular 21: Login, Clientes (lista + form + detalle), Layout, AuthGuard, HTTP Interceptor JWT, RUT Validator
- [x] Frontend: RegionService con shareReplay (comunas desde API, no hardcodeado)
- [x] Frontend: ClienteDetailComponent — página solo lectura `/clientes/:id`
- [x] Fix EF Core: WithMany(cl => cl.Contactos) — resuelve shadow FK ClienteId1
- [x] Correcciones SQL: FKs OPT_Contacto, índices OPT_Usuario, idempotencia datos iniciales
- [x] Documentación técnica HTML: backend-arquitectura, base-datos, backend-api-reference
- [x] Memoria IA actualizada: AGENTS.md raíz, src/backend/, src/frontend/, .agents/progress.md

### Completed This Session (Sesión 6)
- **Backend — nuevas features:**
  - `IRegionRepository` + `RegionRepository.GetAllWithComunasAsync` (Include Comunas)
  - `GetRegionesWithComunasQuery` + Handler → `RegionWithComunasDto` / `ComunaItemDto`
  - `GET /api/Regiones/WithComunas` en `RegionController`
  - `Cliente.Contactos` navigation property (`ICollection<Contacto>`)
  - `ContactoInputDto` (sin ContactoId — replace strategy)
  - `ClienteDto` actualizado con `IReadOnlyList<ContactoDto> Contactos`
  - `CreateClienteCommand` / `UpdateClienteCommand` aceptan `Contactos?`
  - `IContactoRepository.AddRangeAsync` + `SoftDeleteByClienteAsync`
  - `ClienteRepository.GetByIdAsync` incluye `.Include(c => c.Contactos)`
  - Fix `OPTDbContext`: `.WithMany(cl => cl.Contactos)` — resuelve `ClienteId1` shadow FK
- **Frontend — nuevas features:**
  - `core/models/region.model.ts` (ComunaItem, RegionWithComunas)
  - `core/services/region.service.ts` (shareReplay(1))
  - `cliente-form`: comunas cargadas desde API (no hardcodeadas)
  - `clientes-list`: botón Ver + ngOnInit con state `editarClienteId` + getCliente(id) antes de editar
  - `app.routes.ts`: ruta lazy `/clientes/:id`
  - `cliente-detail.component.ts`: standalone, señales, header con avatar+badge, secciones Persona/Empresa/Auditoría
- **Documentación actualizada:**
  - `AGENTS.md` raíz, `src/backend/AGENTS.md`, `src/frontend/AGENTS.md`, `.agents/progress.md`
  - Memoria IA: `project_opt_estado.md`, `project_opt_reglas.md` (lecciones EF Core, replace strategy, shareReplay)

### Next Steps Sugeridos
- [ ] Módulo Sucursal — backend (CRUD) + frontend
- [ ] Script `009_` para datos de prueba de usuarios con hashes BCrypt reales
- [ ] Unit tests backend con xUnit + Moq (IClienteRepository, handlers)
- [ ] Validación de formato RUT chileno en FluentValidation (backend)
- [ ] Dashboard / Home screen en Angular
- [ ] Módulo Usuarios — gestión de usuarios del tenant (Admin)

---

## Session History

### 2026-05-07 - Sesión 6: RegionService, contactos embebidos, vista detalle cliente
- **Work**: Carga de comunas desde API, contactos en formulario Empresa, página Ver Cliente, mejoras UX header
- **Archivos backend modificados/creados** (12 archivos):
  - `OPT.Application/Interfaces/IRegionRepository.cs` — agregado `GetAllWithComunasAsync`
  - `OPT.Infrastructure/Persistence/Repositories/RegionRepository.cs` — implementación con Include
  - `OPT.Application/Regiones/DTOs/RegionWithComunasDto.cs` — nuevo record DTO
  - `OPT.Application/Regiones/Queries/GetRegionesWithComunasQuery.cs` — nuevo query + handler
  - `OPT.API/Controllers/RegionController.cs` — endpoint GET /WithComunas
  - `OPT.Domain/Entities/Cliente.cs` — `ICollection<Contacto> Contactos`
  - `OPT.Application/Clientes/DTOs/ContactoInputDto.cs` — nuevo (sin ContactoId)
  - `OPT.Application/Clientes/DTOs/ClienteDto.cs` — campo Contactos agregado
  - `OPT.Application/Clientes/Commands/CreateClienteCommand + Handler` — Contactos propagados
  - `OPT.Application/Clientes/Commands/UpdateClienteCommand + Handler` — replace strategy
  - `OPT.Application/Interfaces/IContactoRepository.cs` — AddRangeAsync + SoftDeleteByClienteAsync
  - `OPT.Infrastructure/Persistence/Repositories/ContactoRepository.cs` — implementaciones
  - `OPT.Infrastructure/Persistence/Repositories/ClienteRepository.cs` — Include Contactos
  - `OPT.API/Controllers/ClienteController.cs` — Contactos en Create/Update requests
  - `OPT.Infrastructure/Persistence/OPTDbContext.cs` — fix WithMany(cl => cl.Contactos)
- **Archivos frontend modificados/creados** (7 archivos):
  - `core/models/region.model.ts` — nuevo
  - `core/services/region.service.ts` — nuevo (shareReplay)
  - `core/models/cliente.model.ts` — campos auditoría agregados
  - `features/clientes/cliente-form/cliente-form.component.ts` — comunas desde API
  - `features/clientes/clientes-list/clientes-list.component.ts` — botón Ver, state edit
  - `app.routes.ts` — ruta /clientes/:id
  - `features/clientes/cliente-detail/cliente-detail.component.ts` — nuevo (solo lectura)
- **Bug fix crítico**: EF Core shadow FK `ClienteId1` → causa: `WithMany()` sin argumento
- **Decisiones de diseño**:
  - Contactos en Update usan replace completo (soft-delete all + re-create)
  - `ClienteDetailComponent` no tiene botón Editar (vista solo lectura)
  - Header del detalle usa avatar con inicial coloreado por tipo cliente

### 2026-05-07 - Sesión 5: Documentación y memoria IA
- **Work**: Actualización completa de archivos de memoria para agentes IA y manuales técnicos
- **Archivos modificados/creados** (5 archivos):
  - `AGENTS.md` — reescrito con estado completo del proyecto (stack, módulos, anti-patrones, comandos)
  - `src/AGENTS.md` — corregido (script 008 faltaba, decisión FK documentada)
  - `src/backend/AGENTS.md` — módulos Tenant y Contactos agregados, interfaces y entidades actualizadas
  - `src/frontend/AGENTS.md` — **creado desde cero** con toda la arquitectura Angular
  - `.agents/progress.md` — sesión 5 registrada, next steps actualizados
  - `docs/technical-manual/README.md` — inventario de manuales HTML actualizado
  - `docs/api/README.md` — descripción de módulos alineada con estado real
- **Hallazgos importantes:**
  - `auth.interceptor.ts` y `auth.guard.ts` ya estaban implementados en sesión 3 pero no documentados correctamente en progress.md
  - `rut.validator.ts` también ya existía — se documenta ahora
  - El módulo Contactos backend estaba completo pero faltaba en src/backend/AGENTS.md



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
