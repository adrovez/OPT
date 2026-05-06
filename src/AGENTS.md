# Source Code - Agent Instructions

This directory contains all **new development**. Legacy code lives in `old/` (root level) and must NOT be modified.

## Structure

```
src/
├── frontend/    # Client-side application
├── backend/     # Server-side API and services
└── basedatos/   # Database scripts (SQL Server)
    ├── 000_creacion_base_datos.sql
    ├── 001_OPT_Tenant.sql
    ├── 002_OPT_Region.sql
    ├── 003_OPT_Comuna.sql
    ├── 004_OPT_Sucursal.sql
    ├── 005_OPT_Cliente.sql
    ├── 006_OPT_Contacto.sql
    └── 007_datos_iniciales.sql
```

## Rules

- All new code goes here, never in `old/`
- Frontend and backend have their own `AGENTS.md` with specific conventions
- When migrating from legacy, read `old/Fuente/` for reference, implement here
- Coordinate frontend/backend contracts via `docs/api/`

## Database Context

- **Database name**: `dbOPT`
- **Base de datos creada**: Script `000_creacion_base_datos.sql`
- **Tablas creadas** (Mayo 2026):
  - `OPT_Tenant` — Multi-tenant raíz del SaaS
  - `OPT_Region` — Catálogo de regiones de Chile (16 regiones)
  - `OPT_Comuna` — Catálogo de comunas (FK a Region)
  - `OPT_Sucursal` — Sucursales de la óptica (con TenantId, Matriz flag)
  - `OPT_Cliente` — Unificada: Persona y Empresa (campo `TipoCliente`, PK `ClienteId`, `NumeroDocumento` único por Tenant)
  - `OPT_Contacto` — Contactos de clientes tipo Empresa (Nombre, Email, Telefono, Cargo)
- **No se considera**: `OPT_Empresa` (eliminada según propuesta de migración)
- **Convención**: Cada tabla tiene su script individual numerado secuencialmente
- **Nota**: El script `006_OPT_Contacto.sql` fue modificado manualmente después de su creación automática (se eliminó `ON DELETE CASCADE` / `ON UPDATE CASCADE` de las FKs)
- **Patrones de auditoría**: Todas las tablas incluyen `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`
- **Multi-tenant**: Columna `TenantId` en todas las tablas de negocio
