# OPT - Project Agent Instructions

## About This Project
OPT is a legacy application undergoing migration to a modern SaaS architecture. The project contains both legacy code (`old/`) and new development (`src/`).

## Directory Structure

```
OPT/
├── src/                    # NEW CODE - Active development
│   ├── frontend/           # New frontend application
│   ├── backend/            # New backend API/services
│   └── basedatos/          # Database scripts (SQL Server)
│
├── old/                    # LEGACY CODE - Reference only (READ-ONLY)
│   ├── Fuente/             # Legacy source code
│   └── BD/                 # Legacy database scripts
│
├── docs/                   # Documentation
│   ├── user-manual/        # End-user guides
│   ├── technical-manual/   # Developer guides
│   ├── architecture/       # Architecture decisions & diagrams
│   ├── api/                # API documentation
│   └── deployment/         # Deployment & infrastructure guides
│
├── .agents/                # AI agent working files
│   ├── decisions/          # Architectural decision records
│   └── skills/             # Reusable agent skills
│
└── skills/                 # Installed agent skills
    ├── angular-developer/
    ├── angular-new-app/
    ├── dotnet-best-practices/
    └── ui-ux-pro-max/
```

## Critical Rules

- **NEVER modify files in `old/`** — this is reference-only legacy code
- **ALWAYS write new code in `src/`** — never add to `old/`
- **ALWAYS consult `old/`** when migrating logic to understand existing behavior
- **NEVER commit secrets or API keys**
- **ALWAYS update `.agents/progress.md`** after significant work sessions

## Migration Workflow

1. Read legacy code in `old/Fuente/` to understand current behavior
2. Check `docs/architecture/` for target architecture patterns
3. Implement new code in `src/frontend/` or `src/backend/`
4. Record migration decisions in `.agents/decisions/`
5. Update `docs/` with any new API or technical documentation

## Coding Conventions

### General
- Use conventional commits: `feat(scope): description`, `fix(scope): description`
- Functions must include type annotations and JSDoc comments
- No `any` types — if unavoidable, add comment explaining why
- Keep functions under 50 lines when possible

### Frontend (src/frontend/)
- Components: PascalCase, one component per file
- Hooks/Services: camelCase with `use` prefix for hooks
- Error handling: use centralized error service, never silent failures

## Backend (src/backend/)

### Stack
- **.NET 10** con Clean Architecture (4 capas)
- **Pattern**: CQRS con MediatR, Vertical Slices
- **Auth**: JWT + BCrypt passwords
- **Validacion**: FluentValidation
- **ORM**: EF Core 9.0 con SQL Server

### Estructura de proyectos
| Proyecto | Responsabilidad |
|----------|----------------|
| `OPT.Domain` | Entidades, constantes, base entity |
| `OPT.Application` | Commands, Queries, Handlers, DTOs, Validators, Interfaces |
| `OPT.Infrastructure` | DbContext, EF Configurations, Repositories, JWT, PasswordHasher |
| `OPT.API` | Controllers, Program.cs, appsettings |

### API implementadas (Estado: Mayo 2026)
| Modulo | Endpoints | Auth |
|--------|-----------|------|
| **Tenant** | CRUD completo | No |
| **Auth** | Login, Register | No (Login anonimo) |
| **Clientes** | CRUD + paginado + busqueda | Si (JWT) |
| **Contactos** | CRUD por cliente | Si (JWT) |

### Comandos de build
| Comando | Descripcion |
|---------|-------------|
| `dotnet restore` | Restaurar paquetes NuGet |
| `dotnet build` | Compilar solucion |
| `dotnet run --project OPT.API` | Iniciar API en desarrollo |

### Convenciones backend
- Controllers delgados: delegan a MediatR handlers
- Handlers usan interfaces de repositorio, nunca DbContext directo
- Soft-delete obligatorio: `IsDeleted = true`, nunca DELETE fisico
- Multi-tenant: `TenantId` en JWT claim, filter automatico en DbContext
- DTOs usan `record` inmutables
- Result pattern para errores: `Result<T>.Success()` / `Result<T>.Failure()`

### Database (src/basedatos/)
- SQL Server 2022 (Azure SQL compatible)
- Scripts numbered sequentially: `000_`, `001_`, etc.
- One script per table for maintainability
- All tables include: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`
- Multi-tenant: `TenantId` column on all business tables
- Foreign keys with explicit `ON DELETE` / `ON UPDATE` behavior
- Unique indexes with `WHERE [IsDeleted] = 0` for soft-delete tables

### Scripts de base de datos existentes
| Script | Tabla |
|--------|-------|
| `000_creacion_base_datos.sql` | Base de datos `dbOPT` |
| `001_OPT_Tenant.sql` | OPT_Tenant |
| `002_OPT_Region.sql` | OPT_Region |
| `003_OPT_Comuna.sql` | OPT_Comuna |
| `004_OPT_Sucursal.sql` | OPT_Sucursal |
| `005_OPT_Cliente.sql` | OPT_Cliente (unificada Persona/Empresa) |
| `006_OPT_Contacto.sql` | OPT_Contacto |
| `007_datos_iniciales.sql` | Datos semilla (regiones, tenant demo) |
| `008_OPT_Usuario.sql` | OPT_Usuario |

## Build & Test Commands

### Backend
| Command     | Description              |
|-------------|--------------------------|
| `dotnet restore` | Restaurar paquetes NuGet |
| `dotnet build` | Compilar solucion |
| `dotnet run --project OPT.API` | Iniciar API en desarrollo |

## Documentation Guidelines

- **User Manual** (`docs/user-manual/`): Written for end users, step-by-step guides with screenshots
- **Technical Manual** (`docs/technical-manual/`): Developer onboarding, setup, coding standards
- **Architecture** (`docs/architecture/`): System diagrams, ADRs, technology decisions
- **API** (`docs/api/`): Endpoint documentation, request/response examples
- **Deployment** (`docs/deployment/`): Infrastructure, CI/CD, environment configuration

## Agents

### migration-analyst
Analyzes legacy code in `old/` and produces migration plans with dependency mapping.

### frontend-developer
Implements new frontend features in `src/frontend/` following established patterns.

### backend-developer
Implements new backend services in `src/backend/` with proper validation and error handling.

### documentation-writer
Updates documentation in `docs/` to reflect current system state.
