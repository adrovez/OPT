# Architectural Decisions

Record of significant technical decisions made during the OPT migration.

## How to Create a Decision Record

1. Create a new file: `YYYY-MM-DD-short-description.md`
2. Use the ADR template from `docs/architecture/adr/`
3. Include context, options considered, decision, and consequences

## Decision Log

- [2026-05-05](2026-05-05-diseno-base-datos-inicial.md) - Diseño inicial de base de datos dbOPT, unificación OPT_Cliente, eliminación OPT_Empresa, multi-tenant desde inicio
- [2026-05-05](2026-05-05-backend-middleware.md) - Pipeline de middleware (CorrelationId, ExceptionHandling, TenantValidation), IPasswordHasher, correcciones SQL FKs y datos idempotentes
