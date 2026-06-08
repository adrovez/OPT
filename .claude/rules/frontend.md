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
- Suscripciones: `takeUntilDestroyed(this.destroyRef)` siempre — sin excepcion, incluso en metodos de carga/edicion/eliminacion.
- Servicios de catalogo con `shareReplay(1)`.
- Modulos sucursal-scoped (Agenda, Stock) envian header `X-Sucursal-Id`.
- UI: Tailwind v4; SweetAlert2 (`Swal`) para confirmaciones destructivas.

## SOLID (DIP activo — regla de codigo)
- **Nunca usar `localStorage` directamente.** Siempre inyectar `StorageService` de `core/services/storage.service.ts`.
  Aplica a servicios, guards e interceptors.
- Helpers de presentacion (formateo fechas, clases CSS) van en Pipes standalone en `core/pipes/`, no en componentes.
- Si un componente supera ~400 lineas o gestiona multiples secciones independientes, dividirlo en sub-componentes por tab/seccion.

Validar: `cd src/frontend && npm run lint`.
