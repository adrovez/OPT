# Source Code — Agent Instructions

> **Última actualización:** 2026-05-07 (Sesión 5)

Este directorio contiene **todo el código nuevo**. El código legacy vive en `old/` (raíz del proyecto) y NO debe ser modificado.

## Estructura

```
src/
├── frontend/      # Angular 21 standalone — ver frontend/AGENTS.md
├── backend/       # .NET 10 Clean Architecture — ver backend/AGENTS.md
└── basedatos/     # Scripts SQL Server (numerados secuencialmente)
    ├── 000_creacion_base_datos.sql
    ├── 001_OPT_Tenant.sql
    ├── 002_OPT_Region.sql
    ├── 003_OPT_Comuna.sql
    ├── 004_OPT_Sucursal.sql
    ├── 005_OPT_Cliente.sql
    ├── 006_OPT_Contacto.sql   ← FKs corregidas (ON DELETE NO ACTION desde Tenant)
    ├── 007_datos_iniciales.sql ← Idempotente: usa IF NOT EXISTS
    └── 008_OPT_Usuario.sql    ← Rol NOT NULL DEFAULT 'Operador', índices TenantId+Email
```

> El próximo script incremental debe ser `009_...`

## Reglas

- Todo código nuevo va aquí, nunca en `old/`
- Cada subcapa tiene su propio `AGENTS.md` con convenciones específicas
- Al migrar lógica legacy, leer `old/Fuente/` para entender el comportamiento existente
- Los contratos frontend ↔ backend se coordinan en `docs/api/`

## Base de Datos — Contexto

- **Nombre BD:** `dbOPT`
- **Motor:** SQL Server 2022 (compatible con Azure SQL)
- **Tablas implementadas (Mayo 2026):**

| Tabla | Script | Notas clave |
|-------|--------|-------------|
| `OPT_Tenant` | `001_` | Raíz multi-tenant del SaaS |
| `OPT_Region` | `002_` | Catálogo 16 regiones de Chile |
| `OPT_Comuna` | `003_` | FK a OPT_Region |
| `OPT_Sucursal` | `004_` | TenantId, flag Matriz |
| `OPT_Cliente` | `005_` | Persona + Empresa unificados; `TipoCliente` ('Persona'\|'Empresa'); `NumeroDocumento` UNIQUE por Tenant |
| `OPT_Contacto` | `006_` | Contactos de clientes Empresa; FK a Tenant con NO ACTION, FK a Cliente con CASCADE |
| `OPT_Usuario` | `008_` | `Rol` NOT NULL DEFAULT 'Operador'; roles válidos: Admin, Operador, Lectura |

- **No existe** tabla `OPT_Empresa` — eliminada en propuesta de migración (lógica absorbida por `OPT_Cliente`)
- **Patrón de auditoría** en todas las tablas: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`
- **Multi-tenant:** columna `TenantId` en todas las tablas de negocio
- **Soft-delete:** `IsDeleted = 1`, nunca DELETE físico
- **Idempotencia:** scripts usan `IF NOT EXISTS` / `IF OBJECT_ID IS NULL` para ser re-ejecutables

## Decisión de diseño importante — FKs en OPT_Contacto

La FK desde `OPT_Contacto` hacia `OPT_Tenant` es `ON DELETE NO ACTION` (no CASCADE), porque `OPT_Cliente` ya tiene CASCADE desde Tenant. SQL Server prohíbe múltiples rutas de cascada hacia la misma tabla. La cadena correcta es:

```
OPT_Tenant → (CASCADE) → OPT_Cliente → (CASCADE) → OPT_Contacto
OPT_Tenant → (NO ACTION) → OPT_Contacto
```
