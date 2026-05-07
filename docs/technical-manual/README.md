# Manual Técnico — OPT SaaS

> **Última actualización:** 2026-05-07 (Sesión 5)
> Documentación para desarrolladores que trabajan en el proyecto OPT.

---

## Manuales disponibles

| Archivo | Contenido |
|---------|-----------|
| [backend-arquitectura.html](backend-arquitectura.html) | Arquitectura Clean Architecture (.NET 10), capas, patrones CQRS/MediatR, seguridad multi-tenant, middleware pipeline |
| [base-datos.html](base-datos.html) | Esquema de base de datos, descripción de tablas, scripts, convenciones de auditoría y soft-delete |
| [backend-api-reference.html](../api/backend-api-reference.html) *(en docs/api/)* | Referencia de endpoints Auth y Clientes con ejemplos de request/response |
| [frontend-setup.md](frontend-setup.md) | Configuración del entorno Angular 21, comandos y estructura del proyecto |

> **Nota:** `backend-api.html` es un archivo anterior — usar `backend-arquitectura.html` como fuente de verdad.

---

## Estructura actual de este directorio

```
docs/technical-manual/
├── README.md                   # Este archivo
├── backend-arquitectura.html   # Manual de arquitectura backend (fuente de verdad)
├── base-datos.html             # Esquema BD, scripts, convenciones
└── frontend-setup.md           # Setup del entorno Angular
```

---

## Estado del sistema (Mayo 2026)

### Backend — src/backend/
- **Framework:** .NET 10
- **Arquitectura:** Clean Architecture (Domain → Application → Infrastructure → API)
- **Patrón:** CQRS con MediatR 12.4.1, Vertical Slices
- **Auth:** JWT Bearer + BCrypt (BCrypt.Net-Next 4.0.3)
- **ORM:** EF Core 9.0 con SQL Server
- **Validación:** FluentValidation 11.10.0
- **Errores:** RFC 7807 ProblemDetails via ExceptionHandlingMiddleware

### Frontend — src/frontend/
- **Framework:** Angular 21.0.5 (standalone components)
- **Estilos:** Tailwind CSS 4.2.4
- **Formularios:** Signal Forms
- **HTTP:** HttpClient + auth.interceptor.ts (JWT automático)
- **Routing:** Lazy loading por feature + auth.guard.ts
- **Testing:** Vitest

### Base de Datos — src/basedatos/
- Scripts `000_` a `008_` — 8 tablas: Tenant, Region, Comuna, Sucursal, Cliente, Contacto, Usuario
- Multi-tenant: `TenantId` en todas las tablas de negocio
- Soft-delete: `IsDeleted` en todas las tablas
- Auditoría: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`

### Módulos implementados
| Módulo | Backend | Frontend |
|--------|---------|---------|
| Auth (Login/Register) | ✅ | ✅ |
| Tenant | ✅ | — |
| Clientes | ✅ | ✅ |
| Contactos | ✅ | ⏳ pendiente |
| Sucursales | ⏳ | ⏳ |
| Usuarios (gestión) | ⏳ | ⏳ |

---

## Comandos de desarrollo

### Backend
```bash
cd src/backend
dotnet restore
dotnet build
dotnet run --project OPT.API   # API: http://localhost:5005 | Swagger: /swagger
dotnet test
```

### Frontend
```bash
cd src/frontend
ng serve                        # http://localhost:4200
npm run build
npm run lint
npm run test
```

---

## Referencias cruzadas

| Recurso | Ruta |
|---------|------|
| API Documentation completa | [docs/api/README.md](../api/README.md) |
| Contratos frontend ↔ API | [docs/api/frontend-api-contracts.md](../api/frontend-api-contracts.md) |
| Instrucciones para agentes (backend) | [src/backend/AGENTS.md](../../src/backend/AGENTS.md) |
| Instrucciones para agentes (frontend) | [src/frontend/AGENTS.md](../../src/frontend/AGENTS.md) |
| ADR Middleware | [.agents/decisions/2026-05-05-backend-middleware.md](../../.agents/decisions/2026-05-05-backend-middleware.md) |
| ADR Base de datos | [.agents/decisions/2026-05-05-diseno-base-datos-inicial.md](../../.agents/decisions/2026-05-05-diseno-base-datos-inicial.md) |
| Historial de sesiones | [.agents/progress.md](../../.agents/progress.md) |
