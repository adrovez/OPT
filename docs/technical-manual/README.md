# Technical Manual

Documentation for developers working on OPT.

## Manuales Disponibles

### [Manual Tecnico Completo (HTML)](backend-api.html)
Documento HTML completo con toda la documentacion del backend API, incluyendo:
- Arquitectura Clean Architecture (4 capas)
- Stack tecnologico y paquetes NuGet
- Modelo de dominio y entidades
- Documentacion completa de todos los endpoints API
- Patrones de diseno (CQRS, MediatR, Result Pattern)
- Seguridad multi-tenant
- Setup y ejecucion
- Guia de migracion desde legacy

## Estructura Esperada

```
docs/technical-manual/
├── README.md                 # Este archivo
├── backend-api.html          # Manual tecnico completo (HTML)
├── setup.md                  # Development environment setup
├── coding-standards.md       # Code style and conventions
├── testing-guide.md          # Testing strategy and patterns
└── troubleshooting.md        # Common issues and solutions
```

## Contenido por Modulo

### Backend (src/backend/)
- **Framework:** .NET 10
- **Arquitectura:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Patron:** CQRS con MediatR, Vertical Slices
- **Auth:** JWT + BCrypt
- **Base de datos:** SQL Server 2022 via EF Core 9.0
- **Validacion:** FluentValidation

### Modulos Implementados
| Modulo | Estado | Endpoints |
|--------|--------|-----------|
| Tenant | Completo | CRUD (GET, POST, PUT, DELETE) |
| Auth | Completo | Login, Register |
| Clientes | Completo | CRUD + paginado + busqueda |
| Contactos | Completo | CRUD por cliente |

### Base de Datos
- Scripts en `src/basedatos/` (000 a 008)
- 8 tablas: Tenant, Region, Comuna, Sucursal, Cliente, Contacto, Usuario
- Multi-tenant: TenantId en todas las tablas de negocio
- Soft-delete: IsDeleted en todas las tablas

## Comandos de Desarrollo

```bash
cd src/backend
dotnet restore          # Restaurar paquetes
dotnet build            # Compilar
dotnet run --project OPT.API  # Ejecutar API
```

## Links Relacionados
- [API Documentation](../api/README.md) - Referencia de endpoints
- [Backend AGENTS.md](../../src/backend/AGENTS.md) - Instrucciones para agentes
- [Progress Log](../../.agents/progress.md) - Historial de sesiones
