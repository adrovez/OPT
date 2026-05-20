# OPT - Project Agent Instructions

> **Última actualización:** 2026-05-20 (Sesión 13 — Frontend Usuarios completo + mejoras planeadas Rol)

## About This Project

OPT es una aplicación legacy en migración a arquitectura SaaS moderna. El proyecto contiene código legacy (`old/`) y nuevo desarrollo (`src/`).

**Contexto de negocio:** Sistema de gestión de ópticas (clientes, contactos, sucursales, usuarios). Modelo SaaS multi-tenant donde cada óptica es un tenant independiente con aislamiento estricto de datos.

---

## Directory Structure

```
OPT/
├── src/                        # CÓDIGO NUEVO — desarrollo activo
│   ├── frontend/               # Angular 21 standalone (feature-based, lazy loading)
│   ├── backend/                # .NET 10 Clean Architecture (4 capas)
│   └── basedatos/              # Scripts SQL Server (numerados 000–008)
│
├── old/                        # CÓDIGO LEGACY — solo referencia (SOLO LECTURA)
│   ├── Fuente/                 # Código fuente legacy
│   └── BD/                     # Scripts de BD legacy
│
├── docs/                       # Documentación del proyecto
│   ├── user-manual/            # Guías para usuarios finales
│   ├── technical-manual/       # Manuales para desarrolladores
│   ├── architecture/           # Decisiones de arquitectura (ADRs)
│   ├── api/                    # Documentación de endpoints
│   └── deployment/             # Infraestructura y CI/CD
│
├── .agents/                    # Archivos de trabajo de agentes IA
│   ├── decisions/              # Architectural Decision Records (ADRs)
│   ├── progress.md             # Log de sesiones y estado actual
│   └── skills/                 # Skills reutilizables de agentes
│
└── skills/                     # Skills instalados para el agente
    ├── angular-developer/
    ├── angular-new-app/
    └── dotnet-best-practices/
```

---

## Stack Tecnológico

### Backend
| Componente | Tecnología |
|-----------|-----------|
| Framework | .NET 10 + Clean Architecture (4 proyectos) |
| Patrón | CQRS con MediatR 12.4.1 |
| Auth | JWT Bearer + BCrypt (BCrypt.Net-Next 4.0.3) |
| ORM | EF Core 9.0 con SQL Server |
| Validación | FluentValidation 11.10.0 |
| Docs | Swashbuckle (Swagger) 7.2.0 |
| Errores | RFC 7807 ProblemDetails (ExceptionHandlingMiddleware) |

### Frontend
| Componente | Tecnología |
|-----------|-----------|
| Framework | Angular 21.0.5 standalone |
| Estilos | Tailwind CSS 4.2.4 |
| Formularios | Signal Forms (signals de Angular 21) |
| HTTP | HttpClient con interceptor JWT |
| Auth | AuthGuard (route guard) |
| Testing | Vitest |

### Base de Datos
| Componente | Tecnología |
|-----------|-----------|
| Motor | SQL Server 2022 (Azure SQL compatible) |
| Nombre BD | `dbOPT` |
| Scripts | Numerados secuencialmente (000–008) |

---

## Reglas Críticas (no negociables)

1. **NUNCA modificar archivos en `old/`** — es código legacy de referencia.
2. **SIEMPRE escribir código nuevo en `src/`** — nunca en `old/`.
3. **CONSULTAR `old/Fuente/`** cuando se migra lógica, para entender el comportamiento existente.
4. **NUNCA exponer datos cross-tenant** — toda query de negocio lleva `TenantId` explícito.
5. **NUNCA hacer DELETE físico** — siempre soft-delete (`IsDeleted = true`).
6. **NUNCA hardcodear** `TenantId`, roles ni secretos.
7. **NUNCA lógica de negocio en controllers** — controllers delegan a handlers via MediatR.
8. **NUNCA acceder a DbContext directamente desde Application** — usar repositorios.
9. **NUNCA try/catch en controllers** — el `ExceptionHandlingMiddleware` lo maneja.
10. **Si cambia el esquema DB**, crear script SQL incremental en `src/basedatos/` (siguiente número secuencial: `013_...`).
11. **SIEMPRE actualizar `.agents/progress.md`** al finalizar sesiones significativas.
12. **NUNCA usar `int` como tipo de PK/FK en entidades de negocio** — todas usan `Guid` en C# / `UNIQUEIDENTIFIER` en SQL. Solo catálogos (Region, Comuna) mantienen `int`/`INT IDENTITY`.
13. **NUNCA usar `GreaterThan(0)` en FluentValidation para IDs tipo Guid** — usar `.NotEmpty()` en su lugar.
14. **NUNCA usar `int.TryParse`** para parsear claims JWT de TenantId/UsuarioId — usar `Guid.TryParse`.

---

## Módulos Implementados (estado: Mayo 2026)

### Backend (API endpoints disponibles)

| Módulo | Controller | Auth | Estado |
|--------|-----------|------|--------|
| **Tenant** | `TenantController` | No | ✅ CRUD completo |
| **Auth** | `AuthController` | No (anónimo) | ✅ Login + Register |
| **Clientes** | `ClienteController` | JWT | ✅ CRUD + paginado + búsqueda + contactos embebidos |
| **Contactos** | `ContactoController` | JWT | ✅ CRUD por cliente |
| **Regiones** | `RegionController` | JWT | ✅ GET /WithComunas (catálogo anidado) |
| **Anamnesis** | `AnamnesisController` | JWT | ✅ CRUD completo (por ClienteId) |
| **RecetaCristales** | `RecetaCristalesController` | JWT | ✅ CRUD completo (por ClienteId) |
| **Sucursales** | `SucursalController` | JWT | ✅ CRUD completo (por Tenant) |
| **Usuarios** | `UsuarioController` | JWT | ✅ CRUD + cambio contraseña + asignar/desasignar sucursales |

### Frontend (Angular)

| Módulo | Componente / Archivo | Estado |
|--------|---------------------|--------|
| Auth | `features/auth/login/login.component.ts` | ✅ Implementado |
| Clientes | `features/clientes/clientes-list/clientes-list.component.ts` | ✅ Implementado |
| Clientes | `features/clientes/cliente-form/cliente-form.component.ts` | ✅ Implementado (comunas desde API) |
| Clientes | `features/clientes/cliente-detail/cliente-detail.component.ts` | ✅ Implementado (solo lectura, ruta `/clientes/:id`) |
| Layout | `layout/main-layout/main-layout.component.ts` | ✅ Implementado |
| Core | `core/services/auth.service.ts` | ✅ Implementado |
| Core | `core/services/cliente.service.ts` | ✅ Implementado |
| Core | `core/services/region.service.ts` | ✅ Implementado (shareReplay cache) |
| Core | `core/interceptors/auth.interceptor.ts` (JWT automático) | ✅ Implementado |
| Core | `core/guards/auth.guard.ts` (protección de rutas) | ✅ Implementado |
| Core | `core/validators/rut.validator.ts` (validación RUT chileno) | ✅ Implementado |
| Core | `core/models/auth.model.ts`, `cliente.model.ts`, `region.model.ts` | ✅ Implementado |
| Core | `core/models/anamnesis.model.ts` | ✅ Implementado |
| Core | `core/services/anamnesis.service.ts` | ✅ Implementado (CRUD por clienteId) |
| Anamnesis | `features/anamnesis/anamnesis-list/anamnesis-list.component.ts` | ✅ Implementado (ruta `/clientes/:id/anamnesis`) |
| Anamnesis | `features/anamnesis/anamnesis-form/anamnesis-form.component.ts` | ✅ Implementado (modal create/edit) |
| Core | `core/models/sucursal.model.ts` | ✅ Implementado |
| Core | `core/services/sucursal.service.ts` | ✅ Implementado |
| Sucursales | `features/sucursales/sucursales-list/sucursales-list.component.ts` | ✅ Implementado (lista + modal crear/editar) |
| Core | `core/models/usuario.model.ts` | ✅ Implementado |
| Core | `core/services/usuario.service.ts` | ✅ Implementado (CRUD + password + sucursales M:N) |
| Usuarios | `features/usuarios/usuarios-list/usuarios-list.component.ts` | ✅ Implementado (badges Rol + chips Sucursales) |
| Usuarios | `features/usuarios/usuario-form/usuario-form.component.ts` | ✅ Implementado (crear/editar + gestión sucursales) |
| Usuarios | `features/usuarios/usuario-password/usuario-password.component.ts` | ✅ Implementado (modal cambio contraseña) |
| Core | `core/models/receta-cristales.model.ts` | ⏳ Pendiente (solo backend implementado) |
| Core | `core/services/receta-cristales.service.ts` | ⏳ Pendiente |

### Base de Datos (scripts SQL en `src/basedatos/`)

| Script | Tabla / Acción |
|--------|---------------|
| `000_creacion_base_datos.sql` | Base de datos `dbOPT` |
| `001_OPT_Tenant.sql` | OPT_Tenant — **PK: UNIQUEIDENTIFIER** |
| `002_OPT_Region.sql` | OPT_Region (catálogo — PK: INT IDENTITY) |
| `003_OPT_Comuna.sql` | OPT_Comuna (catálogo — PK: INT IDENTITY) |
| `004_OPT_Sucursal.sql` | OPT_Sucursal — **PK + FK TenantId: UNIQUEIDENTIFIER** |
| `005_OPT_Cliente.sql` | OPT_Cliente — **PK + FK TenantId: UNIQUEIDENTIFIER** · FK idComuna: INT (catálogo) |
| `006_OPT_Contacto.sql` | OPT_Contacto — **PK + FK TenantId + FK ClienteId: UNIQUEIDENTIFIER** |
| `007_datos_iniciales.sql` | Datos semilla idempotentes (regiones, tenant demo) |
| `008_OPT_Usuario.sql` | OPT_Usuario — **PK + FK TenantId: UNIQUEIDENTIFIER** |
| `010_OPT_Anamnesis.sql` | OPT_Anamnesis — **PK + FK TenantId + FK ClienteId: UNIQUEIDENTIFIER** |
| `011_OPT_RecetaCristales.sql` | OPT_RecetaCristales — **PK + FK TenantId + FK ClienteId: UNIQUEIDENTIFIER** · Campos Lejos/Cerca/DP/ADD + flags |
| `012_OPT_UsuarioSucursal.sql` | OPT_UsuarioSucursal — tabla pivote M:N (UsuarioId + SucursalId, PK compuesta) + AssignedAt + AssignedBy |

> **Próximo script incremental: `013_OPT_Rol.sql`** (tabla catálogo de roles — mejora planeada para Sesión 14)

> **Regla de tipo de PK:** Las tablas de negocio (tenant-aware) usan `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()`. Los catálogos compartidos (Region, Comuna) mantienen `INT IDENTITY`. Ver ADR: `.agents/decisions/2026-05-08-migracion-pk-guid.md`

---

## Pipeline de Middleware (orden crítico — backend)

```
CorrelationId → ExceptionHandling → Swagger(dev) → CORS
→ HttpsRedirection → Authentication → Authorization
→ TenantValidation → MapControllers
```

Ver ADR: `.agents/decisions/2026-05-05-backend-middleware.md`

---

## Workflow de Migración

1. Leer código legacy en `old/Fuente/` para entender el comportamiento actual.
2. Revisar `docs/architecture/` para patrones de arquitectura objetivo.
3. Implementar código nuevo en `src/frontend/` o `src/backend/`.
4. Registrar decisiones de arquitectura en `.agents/decisions/` (formato ADR).
5. Actualizar `docs/` con cualquier nueva API o documentación técnica.
6. Actualizar `.agents/progress.md` con el resumen de la sesión.

---

## Cómo Agregar un Nuevo Módulo

### Backend (checklist)
1. `OPT.Domain/Entities/` → crear entidad
2. `OPT.Application/Interfaces/` → crear interfaz de repositorio
3. `OPT.Application/<Modulo>/Commands/` y `Queries/` → crear handlers y DTOs
4. `OPT.Infrastructure/Persistence/Repositories/` → implementar repositorio
5. `OPT.Infrastructure/Persistence/OPTDbContext.cs` → agregar DbSet y configuración EF (con HasQueryFilter)
6. `OPT.API/Controllers/` → crear controller delgado (sin try/catch)
7. `src/basedatos/00X_...sql` → script incremental si hay cambios de esquema

### Frontend (checklist)
1. `src/app/core/models/<modulo>.model.ts` → definir interfaces TypeScript
2. `src/app/core/services/<modulo>.service.ts` → crear servicio HTTP
3. `src/app/features/<modulo>/` → implementar componentes standalone
4. `src/app/app.routes.ts` → agregar ruta con lazy loading

---

## Anti-patrones (NUNCA hacer esto)

### Backend
- ❌ Lógica de negocio en controllers
- ❌ Acceder a `OPTDbContext` directamente desde Application (usar interfaces de repositorio)
- ❌ Hardcodear `TenantId` o roles en queries
- ❌ `DELETE` físico en tablas con `IsDeleted`
- ❌ `try/catch` en controllers (el `ExceptionHandlingMiddleware` lo maneja)
- ❌ Lanzar `Exception` genérica desde handlers (usar excepción semántica: `KeyNotFoundException`, `InvalidOperationException`, etc.)
- ❌ Loguear `PasswordHash`, tokens JWT, ni PII sensible
- ❌ Saltar capas (Application no depende de Infrastructure; API no depende de Domain directamente)

### Frontend
- ❌ Llamar a la API directamente desde componentes (siempre usar servicios)
- ❌ Guardar información sensible en `localStorage` (solo el JWT token)
- ❌ Componentes con lógica de negocio compleja (extraer a servicios)
- ❌ Módulos NgModule (el proyecto usa standalone components exclusivamente)
- ❌ `any` types en TypeScript sin comentario explicativo
- ❌ Acceder a endpoints sin pasar por el `auth.interceptor.ts`

### Base de Datos
- ❌ Scripts sin numeración secuencial
- ❌ Scripts sin guards de idempotencia (`IF NOT EXISTS` / `IF OBJECT_ID IS NULL`)
- ❌ Tablas de negocio sin `TenantId`
- ❌ Tablas sin campos de auditoría (`CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`)
- ❌ FKs con comportamiento CASCADE ambiguo (puede generar rutas múltiples de cascada en SQL Server)
- ❌ `INT IDENTITY` como PK en tablas de negocio (tenant-aware) — usar `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()`
- ❌ `NEWID()` como DEFAULT de GUIDs — usar `NEWSEQUENTIALID()` para evitar fragmentación de índice clustered

---

## Comandos de Validación

### Backend
```bash
cd src/backend
dotnet restore
dotnet build
dotnet test
dotnet run --project OPT.API   # API en http://localhost:5005, Swagger en /swagger
```

### Frontend
```bash
cd src/frontend
npm run lint
npm run test
npm run build
ng serve                        # desarrollo local: http://localhost:4200
```

---

## Documentación de Referencia

| Documento | Ruta | Contenido |
|-----------|------|-----------|
| Arquitectura backend | `docs/technical-manual/backend-arquitectura.html` | Clean Architecture, capas, patrones |
| Manual base de datos | `docs/technical-manual/base-datos.html` | Esquema, scripts, convenciones |
| API Reference HTML | `docs/api/backend-api-reference.html` | Endpoints Auth + Cliente |
| API Reference MD | `docs/api/README.md` | Todos los endpoints (Tenant, Auth, Clientes, Contactos) |
| Contratos frontend-API | `docs/api/frontend-api-contracts.md` | DTOs y llamadas desde Angular |
| Setup frontend | `docs/technical-manual/frontend-setup.md` | Configuración entorno Angular |
| ADR Middleware | `.agents/decisions/2026-05-05-backend-middleware.md` | Decisiones de middleware |
| ADR Base de Datos | `.agents/decisions/2026-05-05-diseno-base-datos-inicial.md` | Decisiones de esquema |
| Progress log | `.agents/progress.md` | Historial completo de sesiones |

---

## Agentes Disponibles

| Agente | Responsabilidad |
|--------|----------------|
| `migration-analyst` | Analiza código legacy en `old/` y produce planes de migración |
| `frontend-developer` | Implementa features en `src/frontend/` (Angular 21) — ver `src/frontend/AGENTS.md` |
| `backend-developer` | Implementa servicios en `src/backend/` (.NET 10) — ver `src/backend/AGENTS.md` |
| `documentation-writer` | Actualiza `docs/` para reflejar el estado actual del sistema |
