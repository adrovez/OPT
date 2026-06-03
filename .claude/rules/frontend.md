---
paths:
  - src/frontend/**
---
# Reglas Frontend (Angular 21 — se cargan al tocar src/frontend/**)

## Estructura
- Standalone components, por features con lazy loading. Sin NgModules.
- HTTP solo via `core/services/`, nunca desde componentes. JWT via interceptor.

## Obligatorio
- **Signal Forms** (no `ReactiveFormsModule`/`FormsModule`).
  Excepcion tech-debt: `usuario-form.component.ts`.
- IDs de negocio = `string` (UUID). Catalogos (`idRegion`, `idComuna`) = `number`.
  Validar route params de negocio con regex UUID, nunca `Number(id)` + `isNaN()`.
- Suscripciones: `takeUntilDestroyed(this.destroyRef)` siempre.
- Servicios de catalogo con `shareReplay(1)`.
- Modulos sucursal-scoped (Agenda, Stock) envian header `X-Sucursal-Id`.
- UI: Tailwind v4; SweetAlert2 (`Swal`) para confirmaciones destructivas.

Validar: `cd src/frontend && npm run lint`.
