# Progress Log

Track work sessions and current state for continuity between AI agent sessions.

## Current Status
> Updated: 2026-06-06 (Sesión 26 — Mejoras módulo OT frontend)

### Completado hasta ahora
- [x] Base de datos: scripts `000–029` ejecutados — script 029 crea 5 tablas del módulo Órdenes de Trabajo (ver CLAUDE.md para tabla completa)
- [x] Backend API completo: Tenant, Auth, Clientes+Contactos, Regiones, Anamnesis, RecetaCristales, Sucursales, Usuarios, Roles, Agenda, FormaPago, Categorías, Productos (jerarquía self-ref), Stock, DocumentosEntrada, Precios (interno), Transferencias, Atenciones+CobroServicio, OrdenTrabajo
- [x] Backend Middleware: CorrelationId, ExceptionHandling (RFC 7807), TenantValidation
- [x] Frontend Angular 21 completo: Login, Layout, AuthGuard, Interceptor JWT, RUT Validator
- [x] Frontend: Clientes (lista + form + detalle), Anamnesis, Sucursales, Usuarios, Productos (jerarquía padre/hijos + categorías), Stock (4 tabs: Stock actual + Entradas + Historial + Transferencias), Agenda (calendario semanal), Atenciones (lista 2 tabs + wizard 3 pasos + detalle 4 tabs con solo lectura en estado terminado), Órdenes de Trabajo (lista + form + detalle)
- [x] Módulo Inventario/Stock frontend completamente sincronizado con nuevo esquema (ProductoId, no VarianteId; jerarquía padre/hijos; DocumentoEntrada en lugar de DocumentoStock; PATCH estado para anular)
- [x] Migración PKs INT → GUID en todas las entidades de negocio
- [x] Patrones: shareReplay(1) catálogos, takeUntilDestroyed, Signal Forms, SucursalContextService
- [x] `ICurrentTenantService` solo en controllers/middleware — handlers reciben contexto vía command
- [x] Documentación técnica HTML: backend-arquitectura.html, base-datos.html, backend-api-reference.html
- [x] Manuales técnicos y CLAUDE.md actualizados a sesión 16
- [x] Script 027: rediseño completo BD inventario (8 tablas DROP + 8 tablas CREATE con jerarquía self-ref, transferencias y 7 tipos de movimiento)
- [x] Fix frontend: tabs Anamnesis y Receta en `/atenciones/:id` son solo lectura cuando `estado ∈ {TerminadaServicio, DerivoOT}`
- [x] Módulo Precios frontend: lista todos los productos con precios, filtros, stats, modal editar precio + historial

### Completed This Session (Sesión 24)
- **Frontend Órdenes de Trabajo — completado en su totalidad:**
  - `core/models/orden-trabajo.model.ts` — interfaces TypeScript (OrdenTrabajoDto, OrdenTrabajoDetalleDto, OrdenTrabajoLineaDto, OrdenTrabajoPagoDto, OrdenTrabajoCuotaDto, OrdenTrabajoBitacoraDto, requests), constantes ETAPAS_OT, ETAPA_COLORS, ESTADOS_PAGO_OT, TIPOS_FACTURACION, PagedResult<T>
  - `core/services/orden-trabajo.service.ts` — 8 métodos HTTP: getAll, getById, verificarNumero, create, update, remove, cambiarEtapa, registrarPago; envía `X-Sucursal-Id` header
  - `features/ordenes-trabajo/ordenes-trabajo-list/ordenes-trabajo-list.component.ts` — tabla paginada con filtros N°OT / Etapa / EstadoPago; badges de color por etapa; acciones ver / editar / eliminar (Swal confirm)
  - `features/ordenes-trabajo/orden-trabajo-form/orden-trabajo-form.component.ts` — página crear/editar completa: autocomplete cliente y producto con debounce; líneas dinámicas con cálculo en tiempo real (computed signals); abono inicial múltiple; cuotas opcionales; verificación asíncrona de número OT único
  - `features/ordenes-trabajo/orden-trabajo-detail/orden-trabajo-detail.component.ts` — 2 tabs (Información / Atención-Receta); modales inline para cambiar etapa y registrar pago
  - `app.routes.ts` — rutas `/ordenes-trabajo`, `/ordenes-trabajo/nueva`, `/ordenes-trabajo/:id`, `/ordenes-trabajo/:id/editar`
  - `layout/main-layout/main-layout.component.ts` — "Órdenes de Trabajo" en dropdown Clínica; activeGroup actualizado
- **Estado módulo Orden de Trabajo post-sesión**: BD ✅ | Backend ✅ | Frontend ✅
- **Próximos pasos**: Dashboard / Home screen; autorización por rol; unit tests backend

### Completed This Session (Sesión 26)
- **Mejoras módulo Orden de Trabajo (6 ítems):**
  - **Script 030** `OPT_TipoPrevision` — catálogo compartido (INT PK, sin tenant), 7 tipos de previsión iniciales (Particular, FONASA, ISAPRE, DIPRECA, CAPREDENA, FF.AA./Carabineros, Sin previsión)
  - **Backend TipoPrevision**: Domain entity + `ITipoPrevisionRepository` + `GetTipoPrevisionesQuery` + `TipoPrevisionRepository` + `GET /api/tipo-previsiones` controller + registro en DI y DbContext
  - **Backend EditarOT**: `EditarOrdenTrabajoCommand` ahora incluye `Guid? RecetaCristalesId`; interfaz `IOrdenTrabajoRepository.ActualizarAsync` y repositorio actualizados
  - **Frontend `prevision.service.ts`**: nuevo servicio con `shareReplay(1)` para `GET /api/tipo-previsiones`
  - **Tab rename**: "Lentes" → "Productos o Servicios" en `orden-trabajo-form`
  - **Comunas via API**: `orden-trabajo-form` ya no usa datos estáticos `REGIONES_COMUNAS`; carga `RegionService.getRegionesWithComunas()` igual que `cliente-form`
  - **Previsión dinámica**: `orden-trabajo-form` y `cliente-form` cargan opciones desde API (eliminado `previsionOptions` hardcodeado)
  - **Validación receta**: computed `recetaEsValida()` bloquea avance en tab 1 si una sección está activa pero sin valor esférico; mensaje de error visible
  - **UX cuotas**: computed `cuotasPreview()` genera tabla de N°/vencimiento/valor en el tab Abonos
  - **Receta en edición**: `cargarDetalle()` carga y pre-rellena el form de receta si la OT ya tiene `recetaCristalesId`; `finalizar()` hace PUT si existe o POST si es nueva; error visible con Swal
- **Próximos pasos**: Dashboard / Home screen; autorización por rol; unit tests backend

### Completed This Session (Sesión 25)
- **Documentación técnica Órdenes de Trabajo:**
  - `docs/technical-manual/ordenes-trabajo.html` — manual HTML nuevo (estilo consistente con base-datos.html): descripción del módulo, 5 tablas SQL con todos los campos/constraints, 8 endpoints REST con ejemplos de request/response, modelos TypeScript, servicio Angular, componentes, rutas, notas técnicas (header X-Sucursal-Id, cálculo de montos, generación de cuotas)
  - `docs/technical-manual/base-datos.html` — actualizado: nav sidebar agrega sección OT; header chips 24→29 tablas y scripts 000–028→000–029; tabla resumen agrega 5 filas OT; tabla scripts agrega fila 029; alerta próximo script 029→030; diagrama ERD extendido con flujo OT; secciones de las 5 tablas OT; tabla índices agrega 6 filas OT; tabla cascadas agrega 4 filas OT; guía próximo número 029→030
  - `docs/api/README.md` — fecha actualizada, fila Órdenes de Trabajo en tabla de módulos, sección 17 con los 8 endpoints
  - `docs/api/frontend-api-contracts.md` — fecha actualizada, OrdenTrabajo en tabla de IDs, sección completa con modelos TypeScript, firma de servicio, tabla de componentes; tabla de servicios actualizada
  - `.agents/progress.md` — esta entrada

### Completed This Session (Sesión 23)
- **Script 029**: 5 tablas nuevas (OPT_OrdenTrabajo, OPT_OrdenTrabajoLinea, OPT_OrdenTrabajoPago, OPT_OrdenTrabajoCuota, OPT_OrdenTrabajoBitacora) + índice UNIQUE (TenantId, NumeroOT)
- **Domain**: 5 entidades (OrdenTrabajo, OrdenTrabajoLinea, OrdenTrabajoPago, OrdenTrabajoCuota, OrdenTrabajoBitacora)
- **Application**: IOrdenTrabajoRepository + OTLineaInput/OTAbonoInput records + DTOs (6 records) + 5 Commands + 3 Queries + 4 Validators
- **Infrastructure**: OrdenTrabajoRepository (CrearAsync atómico con cuotas + bitácora; ActualizarAsync con replace lines/abonos; CambiarEtapaAsync; RegistrarPagoAsync) + OPTDbContext + DI
- **API**: OrdenTrabajoController (7 endpoints) + request records
- **Build**: dotnet build exitoso — 0 errores, 0 advertencias
- **Próximo**: Frontend del módulo OT (completado en Sesión 24)

### Módulos Futuros Planificados
- [x] **Transferencias (frontend)**: tab en `/stock` — lista, crear, Confirmar/Anular (script 028 + backend ✅ + frontend ✅)
- [ ] **Salida (documentos)**: OrdenTrabajo, Devoluciones, OtroEgreso — por ahora solo Salida directa desde form
- [ ] **Unit tests backend**: xUnit + Moq
- [ ] **Autorización por rol** en controllers (actualmente solo `[Authorize]` sin roles específicos)
- [ ] **Dashboard / Home screen** en Angular

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
- [ ] **Salida por documentos** (`025_`): OrdenTrabajo, Devoluciones, OtroEgreso — diseñar esquema y CRUD
- [ ] **Pantalla de Precios**: formulario PrecioVenta por sucursal
- [ ] **Unit tests backend**: xUnit + Moq (ningún test existe aún)
- [ ] **Autorización por rol** en controllers (actualmente solo `[Authorize]`)
- [ ] **Dashboard / Home screen** en Angular

---

## Session History

### 2026-06-05 - Sesión 24: Frontend Órdenes de Trabajo completo

- **Trabajo**: Implementación completa del frontend del módulo Órdenes de Trabajo. El backend ya estaba completo desde la sesión 23.

- **Archivos nuevos** (5 archivos):
  - `src/frontend/src/app/core/models/orden-trabajo.model.ts`
  - `src/frontend/src/app/core/services/orden-trabajo.service.ts`
  - `src/frontend/src/app/features/ordenes-trabajo/ordenes-trabajo-list/ordenes-trabajo-list.component.ts`
  - `src/frontend/src/app/features/ordenes-trabajo/orden-trabajo-form/orden-trabajo-form.component.ts`
  - `src/frontend/src/app/features/ordenes-trabajo/orden-trabajo-detail/orden-trabajo-detail.component.ts`

- **Archivos modificados** (2 archivos):
  - `src/frontend/src/app/app.routes.ts` — rutas `/ordenes-trabajo`, `/ordenes-trabajo/nueva`, `/ordenes-trabajo/:id`, `/ordenes-trabajo/:id/editar`
  - `src/frontend/src/app/layout/main-layout/main-layout.component.ts` — link "Órdenes de Trabajo" en dropdown Clínica

- **Decisiones de diseño**:
  - Autocomplete de cliente y producto con debounce para evitar requests excesivos
  - Computed signals para cálculo en tiempo real de totales por línea y global
  - Cuotas y abono inicial opcionales: solo se envían si el usuario los completa
  - Verificación asíncrona de número OT único (endpoint `GET /api/ordenes-trabajo/verificar/{numero}`)
  - Detalle con 2 tabs: Información (datos OT, líneas, pagos, cuotas, bitácora) y Atención-Receta (tab reservado para integración futura con atención clínica)
  - Modales inline (no rutas separadas) para cambiar etapa y registrar pago

- **Estado módulo Orden de Trabajo**: BD ✅ | Backend ✅ | Frontend ✅

- **Próximos pasos**: Dashboard / Home screen; autorización por rol en controllers; unit tests backend (xUnit + Moq)

---

### 2026-06-10 - Sesión 21: Módulo Precios frontend + fixes Productos y Stock

- **Trabajo**: Correcciones en formulario de Producto + fix del modal de movimiento de stock + nuevo módulo frontend de Precios.

- **Fixes Producto:**
  - Bug: categoría guardada no se mostraba en edición → fix `[selected]="c.categoriaId === categoriaId()"` en cada `<option>` (Angular sin FormsModule necesita `[selected]` explícito)
  - `codigoInterno` ahora obligatorio tanto en producto padre como en sub-producto (era opcional)
  - Sub-producto hereda `categoriaId` del padre: se muestra read-only y se envía en `CreateProductoRequest`

- **Fix Stock modal:** `max-h-[90vh]` + `flex-1 overflow-y-auto` en body → botones footer siempre visibles en pantallas pequeñas

- **Módulo Precios (frontend nuevo):**
  - `core/models/precio.model.ts` — `PrecioProductoDto`, `PreciosPagedResult`, `SetPrecioRequest`
  - `core/services/precio.service.ts` — `getVigentes()`, `getHistorial()`, `setPrecio()`
  - `features/precios/precios-list/precios-list.component.ts` — carga todos los productos (con y sin precio) via forkJoin + todos los precios; stats 3 cards; filtros búsqueda/categoría/solo-sin-precio; tabla paginada; modal edición con historial
  - `app.routes.ts` + nav: ruta `/precios` + link en dropdown Inventario

- **Gotcha resuelto:** `${{` en TypeScript template literals (en `template: \`...\``) es interpretado por TypeScript como inicio de interpolación `${`. Solución: `\${{` — el backslash escapa el `$` y TypeScript ya no lo interpreta como expresión de template literal.

- **Estado módulo Precios post-sesión:** BD ✅ | Backend ✅ | Frontend ✅

- **Próximo script**: `028_`

---

### 2026-06-03 - Sesión 20: Frontend Inventario Etapa 3 — sincronización con nuevo backend

- **Trabajo**: Alineación completa del frontend Angular con el backend refactorizado en sesión 19. El módulo Inventario/Stock queda funcional de extremo a extremo con el nuevo esquema de BD (script 027).

- **Contexto del refactor backend (sesión 19, ya ejecutado)**:
  - `ProductoVariante` eliminada; `Producto` ahora tiene auto-referencia `ProductoPadreId` + `Hijos[]`
  - `ProductoCategoria` renombrada a `Categoria`, ruta `/api/categorias`
  - `DocumentoStock` renombrado a `DocumentoEntrada`, ruta `/api/documentos-entrada`
  - `Stock` y `MovimientoStock` usan `ProductoId` en lugar de `VarianteId`
  - `POST /api/stock/movimiento` (singular, era `/movimientos`)
  - Anulación vía `PATCH /api/documentos-entrada/{id}/estado` con body `{ estado: 'Anulado' }`
  - Tipos de movimiento extendidos a 7: Entrada, Salida, Ajuste, Merma, DevolucionProveedor, TransferenciaEntrada, TransferenciaSalida

- **Archivos frontend modificados (14 archivos)**:

  **Modelos (`core/models/`)**:
  - `producto.model.ts` — Reescrito: `CategoriaDto`, nuevo `ProductoDto` con `hijos[]`, `isActivo`, `tipo`; eliminados `ProductoVarianteDto` y tipos legacy
  - `stock.model.ts` — `StockDto` y `MovimientoStockDto` usan `productoId`/`codigoInterno` (no `varianteId`); `TIPOS_MOVIMIENTO` extendido con `Merma` y `DevolucionProveedor`
  - `documento-stock.model.ts` — Lineas usan `productoId`; campos renombrados (`fechaDocumento`, `observaciones`)

  **Servicios (`core/services/`)**:
  - `stock.service.ts` — `getStock()` maneja `PagedResult`; URL corregida a `/movimiento` (singular)
  - `documento-stock.service.ts` — URL base cambiada a `/documentos-entrada`; `anular()` usa `PATCH /estado`
  - `producto.service.ts` — eliminados métodos de variantes; añadidos parámetros `soloRaices` y `padreId` en `getAll()`
  - `producto-categoria.service.ts` — URL cambiada a `/categorias`; tipo de respuesta `CategoriaDto`

  **Componentes Stock (`features/stock/`)**:
  - `stock-list.component.ts` — columna `varianteNombre` reemplazada por `codigoInterno`; `existingProductoIds` para filtrar duplicados
  - `movimiento-form.component.ts` — campo cambiado de `varianteId` a `productoId`
  - `primer-movimiento-form.component.ts` — Reescrito: selección de producto con optgroup agrupado por padre/hijos
  - `documento-entrada-form.component.ts` — Líneas usan `productoId`; agrupación visual padre/hijos con optgroup

  **Componentes Productos (`features/productos/`)**:
  - `productos-list.component.ts` — Usa `CategoriaDto`; muestra `p.tipo`, `p.isActivo`, `p.hijos.length`
  - `producto-form.component.ts` — Gestión de sub-productos (hijos) en lugar de variantes; campos `tipo` e `isActivo`
  - `categoria-form.component.ts` — Tipo de respuesta `CategoriaDto`

- **Build**: `npm run build` exitoso — 0 errores TypeScript, 0 advertencias

- **Estado módulo Inventario/Stock post-sesión**:
  - Tab "Stock actual": inventario por producto/código con estados (OK / Bajo mínimo / Sin stock)
  - Tab "Entradas": documentos FacturaCompra, BoletaCompra, OtroIngreso + anulación vía PATCH
  - Tab "Historial": movimientos filtrados por tipo y fecha
  - Modal "Nuevo movimiento": Salida / Ajuste / Merma / DevolucionProveedor para productos con stock existente
  - Modal "Primer movimiento": selección de producto sin stock con agrupación padre/hijo, wizard 2 pasos
  - Modal "Nueva entrada": documento multi-línea con agrupación padre/hijo en selector
  - BD ✅ | Backend ✅ | Frontend ✅

- **Próximo script**: `028_`

- **Proximos pasos sugeridos**:
  - Pantalla de Precios (PrecioVenta global)
  - Frontend de Transferencias entre sucursales (backend ya existe)
  - Dashboard / Home screen

---

### 2026-06-02 - Sesión 19: Backend Inventario Etapa 2 — alineación con esquema 027
- **Trabajo**: Reemplazo completo de la capa backend C# para alinearla con el nuevo esquema de BD del script 027 (rediseño inventario).
- **Domain/Entities — eliminadas**: `ProductoCategoria.cs`, `ProductoVariante.cs`, `DocumentoStock.cs`, `DocumentoStockLinea.cs`
- **Domain/Entities — reescritas**: `Producto.cs` (self-ref, campo `Tipo`), `Stock.cs` (`ProductoId` reemplaza `VarianteId`), `PrecioProducto.cs` (`ProductoId` sin `SucursalId`), `MovimientoStock.cs` (7 tipos + `CantidadAntes`/`CantidadDespues` + FKs a `DocumentoEntrada` y `Transferencia`)
- **Domain/Entities — creadas**: `Categoria.cs`, `DocumentoEntrada.cs`, `DocumentoEntradaLinea.cs`, `Transferencia.cs`, `TransferenciaLinea.cs`
- **Application/Interfaces**: eliminadas `IProductoCategoriaRepository`, `IProductoVarianteRepository`, `IDocumentoStockRepository`; creadas `ICategoriaRepository`, `IDocumentoEntradaRepository`, `ITransferenciaRepository`, `IPrecioProductoRepository`; reescritas `IProductoRepository`, `IStockRepository`
- **Application/Categorias**: módulo nuevo completo (Commands, Queries, DTOs, Validators)
- **Application/Productos**: reescrito sin variantes; campos `Tipo`, `UnidadMedida`, `ProductoPadreId`; comando `SetPrecioProducto`
- **Application/Stock**: reescrito con `ProductoId`, paginación, 7 tipos de movimiento; eliminado `GetStockByVarianteQuery`
- **Application/DocumentoEntrada**: módulo nuevo (reemplaza `DocumentoStock`); flujo Borrador→Confirmar→Anular via PATCH estado con generación atómica de movimientos y precios
- **Application/Transferencia**: módulo nuevo completo con flujo Pendiente→Confirmada (movimientos TransferenciaSalida + TransferenciaEntrada)
- **Infrastructure/OPTDbContext**: nuevos DbSets y configuraciones EF Core para las 8 nuevas tablas; eliminados DbSets obsoletos; self-ref configurado con `HasOne(p => p.ProductoPadre).WithMany(p => p.Hijos)`
- **Infrastructure/Repositories**: creados `CategoriaRepository`, `PrecioProductoRepository`, `DocumentoEntradaRepository`, `TransferenciaRepository`; reescritos `ProductoRepository`, `StockRepository`; eliminados repos obsoletos
- **Infrastructure/DependencyInjection**: 6 registros nuevos, 3 obsoletos eliminados
- **API/Controllers**: `ProductoCategoriaController.cs` → clase `CategoriaController` (`/api/categorias`); `DocumentosStockController.cs` → clase `DocumentoEntradaController` (`/api/documentos-entrada`); `ProductoController` reescrito; `StockController` reescrito; `TransferenciaController` nuevo (`/api/transferencias`)
- **Build**: `dotnet build` exitoso — 0 errores, 0 advertencias
- **Estado módulo inventario**: BD ✅ | Backend ✅ | Frontend ⏳ (etapa 3 — aún usa API vieja con VarianteId)
- **Próximo script**: `028_`

### 2026-06-02 - Sesión 18: Rediseño BD Inventario + Atención solo lectura al terminar
- **Work**: Rediseño completo del módulo de inventario a nivel de base de datos (etapa 1 de 3). Bloqueo de edición en atención terminada.
- **BD — script 027** (ejecutado exitosamente):
  - DROP 8 tablas: OPT_ProductoCategoria, OPT_Producto, OPT_ProductoVariante, OPT_Stock, OPT_MovimientoStock, OPT_PrecioProducto, OPT_DocumentoStock, OPT_DocumentoStockLinea
  - CREATE 8 tablas: OPT_Categoria, OPT_Producto (jerarquía self-ref), OPT_PrecioProducto (global), OPT_Stock, OPT_DocumentoEntrada, OPT_DocumentoEntradaLinea, OPT_Transferencia (nueva), OPT_MovimientoStock (7 tipos)
- **Decisiones de diseño inventario**:
  - Jerarquía de producto: self-ref `ProductoPadreId` nullable — elimina tabla OPT_ProductoVariante
  - Sin OPT_ProductoAtributo (descartada)
  - Precio global (sin SucursalId en OPT_PrecioProducto)
  - Stock negativo permitido (sin CHECK en CantidadDisponible)
  - OPT_Transferencia: estado Pendiente → Confirmada (stock se mueve al Confirmar)
  - 7 tipos de movimiento: Entrada, Salida, Ajuste, Merma, DevolucionProveedor, TransferenciaEntrada, TransferenciaSalida
  - DevolucionProveedor: sin documento, solo Referencia/Observacion
- **Fix frontend**: tabs Anamnesis y Receta en `/atenciones/:id` son solo lectura cuando `estado ∈ {TerminadaServicio, DerivoOT}`. Computed `esTerminada`, inputs `[disabled]`, botones Guardar ocultos, badge "Solo lectura".
- **Estado módulo inventario**: BD ✅ | Backend ⏳ (etapa 2) | Frontend ⏳ (etapa 3 — actual usa API vieja con VarianteId)
- **Próximo script**: `028_`

### 2026-06-02 - Sesión 17: Harness de agentes IA (`.claude/` ejecutable)
- **Trabajo**: Implementación del harness ejecutable para trabajar con Claude + VS Code. Documentado en `.claude/HARNESS.md`.
- **Subagentes** (`.claude/agents/`): `backend-developer`, `frontend-developer`, `migration-analyst` (solo lectura), `documentation-writer`. Cada uno con tools restringidas y checklist propio.
- **Hooks** (`.claude/hooks/`, PowerShell): `block-old.ps1` (bloqueo duro de `old/`), `sql-guard.ps1` (bloquea `NEWID()` DEFAULT; advierte DELETE físico/secretos), `tenant-guard.ps1` (advierte `ICurrentTenantService` en handlers), `post-edit-validate.ps1` (opt-in, no cableado).
- **Reglas path-scoped** (`.claude/rules/`): `backend.md`, `frontend.md`, `basedatos.md`.
- **VS Code** (`.vscode/`): `extensions.json`, `settings.json` (excluye `old/` y `dist/`, `old/` readonly), `tasks.json` (build/test/lint/serve).
- **settings.json**: reorganizado a permisos por patrón + `deny old/**` y `appsettings*.json` + wiring de hooks. Backup en `settings.json.bak`.
- **Decisiones**: `block-old` y `NEWID()` en bloqueo duro; tenant/secretos en advertencia; `post-edit-validate` opt-in para evitar ruido. Entorno asumido Windows/PowerShell.
- **Próximos pasos**: probar los hooks en una sesión real; opcional CI `.github/workflows/build-test.yml` cuando existan proyectos de test.

### 2026-05-24 - Sesión 16: Stock frontend completo + Primer movimiento + Documentos de Entrada + Precios

- **Work**: Completar el frontend de Stock (ruta + sidebar), agregar registro de primer movimiento para variantes sin stock, e implementar el módulo completo de Documentos de Entrada con historial de precios.

- **Decisiones arquitecturales clave**:
  - Documentos de Entrada (FacturaCompra, BoletaCompra, OtroIngreso) confirman atómicamente: MovimientoStock(Entrada) + PrecioProducto cierre/apertura — single SaveChangesAsync
  - Anular: compensación con Ajuste negativo por línea; los precios NO se revierten
  - Primer movimiento de variante sin stock: solo Ajuste directo (Entrada va por documento)
  - `MovimientoForm` excluye "Entrada" de los tipos disponibles (solo Salida y Ajuste directos)
  - Handlers de Application NO inyectan `ICurrentTenantService` — el controller pasa TenantId/SucursalId/UsuarioId/CreatedBy en el command

- **SQL creado** (2 scripts):
  - `019_OPT_Precio.sql` — `OPT_PrecioProducto(PrecioId, TenantId, VarianteId, SucursalId?, PrecioCosto, PrecioVenta?, VigenciaDesde, VigenciaHasta)` — historial; `VigenciaHasta NULL` = vigente
  - `020_OPT_DocumentoStock.sql` — `OPT_DocumentoStock` (cabecera, TipoDocumento CHECK, Estado CHECK, IsDeleted) + `OPT_DocumentoStockLinea` (ON DELETE CASCADE, no IsDeleted) + `ALTER TABLE OPT_MovimientoStock ADD DocumentoId NULLABLE FK`

- **Backend creado** (~20 archivos):
  - Domain: `PrecioProducto.cs`, `DocumentoStock.cs`, `DocumentoStockLinea.cs`; modificado `MovimientoStock.cs` (DocumentoId nullable FK)
  - Application: `IDocumentoStockRepository` (con record `DocumentoLineaInput`), `DocumentoStockDto`, `CrearYConfirmarDocumentoCommand`, `AnularDocumentoCommand`, `GetDocumentosQuery`, `GetDocumentoByIdQuery`, `CrearYConfirmarDocumentoCommandValidator`
  - Infrastructure: `DocumentoStockRepository` (CrearYConfirmarAsync atómico, AnularAsync compensatorio), `OPTDbContext` (3 nuevos DbSets + configs EF), `DependencyInjection`
  - API: `DocumentosStockController` (GET lista paginada, GET por id, POST crear+confirmar 201, POST anular 204)

- **Frontend creado/modificado** (~5 archivos):
  - `core/models/documento-stock.model.ts` — `DocumentoStockDto`, `DocumentoStockLineaDto`, `CrearDocumentoRequest`, `TIPOS_DOCUMENTO_ENTRADA`, `TIPOS_DOCUMENTO_LABEL`
  - `core/services/documento-stock.service.ts` — `getDocumentos()`, `getById()`, `crear()`, `anular()` con X-Sucursal-Id
  - `documento-entrada-form/` — modal full-screen 2 secciones: cabecera + tabla dinámica de líneas; filtra variantes duplicadas por línea
  - `primer-movimiento-form/` — modal 2 pasos: selector de variante sin stock (grouped) → formulario Ajuste
  - `stock-list/` — tab "Entradas" con tabla de documentos + botón Anular; botón "Nuevo movimiento" abre primer-movimiento-form; tab Stock muestra "Nuevo movimiento" en header
  - `movimiento-form/` — excluye "Entrada" de tipos disponibles

- **Bug fix**: `DatePipe` importado pero no usado en `documento-entrada-form` → removido

- **Lección técnica**: `PagedResult<T>` usa `init` properties — usar object initializer, no constructor. Causa CS1739 si se intenta `new PagedResult<T>(Items: ...)`.

- **Build**: 0 errores, 0 advertencias (backend y frontend)

- **Documentación actualizada**: CLAUDE.md (scripts 000-020, patrón ICurrentTenantService, PagedResult gotcha, DateOnly), progress.md, memory/project_state.md, memory/feedback_patterns.md

### 2026-05-22 - Sesión 15: Módulo Productos API CRUD + decisión arquitectural Precios/Stock
- **Work**: Implementación completa del módulo backend de Productos (Catálogo puro, sin precios ni stock). Decisión arquitectural de separar Precios e Inventario como módulos independientes. Limpieza de campos de precio/stock en toda la pila.
- **Decisión clave**: `PrecioVenta`, `Costo` eliminados de `Producto` y `ProductoVariante`. `CantidadDisponible`, `StockMinimo`, `BajoStock` eliminados de `ProductoVariante`. Justificación: precios varían por sucursal e historial; stock es por sucursal; servicios no tienen stock.
- **SQL creado** (3 scripts):
  - `015_OPT_ProductoCategoria.sql` — catálogo de categorías (TenantId, Nombre, soft delete)
  - `016_OPT_Producto.sql` — catálogo maestro (TipoProducto CHECK: Almacenable/Consumible/Servicio, CodigoInterno único por tenant, FK a categoría)
  - `017_OPT_ProductoVariante.sql` — SKUs del producto (CodigoBarras único por tenant, FK cascade a Producto)
- **Archivos creados** (backend — 30+ archivos):
  - Domain: `Producto.cs`, `ProductoCategoria.cs`, `ProductoVariante.cs`
  - Application/Interfaces: `IProductoRepository`, `IProductoCategoriaRepository`, `IProductoVarianteRepository`
  - Application/Productos: DTOs (3), Commands (9 + handlers), Queries (4 + handlers), Validators (6)
  - Infrastructure: 3 repositorios, config EF Core en `OPTDbContext`, registro en `DependencyInjection`
  - API: `ProductoController` (9 endpoints), `ProductoCategoriaController` (4 endpoints)
- **Frontend** (archivos ya creados antes de esta sesión):
  - `core/models/producto.model.ts` — interfaces limpias (sin precios/stock)
  - `core/services/producto.service.ts`, `producto-categoria.service.ts`
  - `features/productos/` — pendiente de implementar componentes
- **Limpieza realizada**: eliminados `PrecioVenta`, `Costo` de Producto; `PrecioVenta`, `Costo`, `CantidadDisponible`, `StockMinimo`, `BajoStock` de ProductoVariante — en Domain, Application, Infrastructure, API y SQL.
- **Módulos futuros planificados**: Precios (`018_`) e Inventario/Stock (`019_`) — ver sección "Módulos Futuros Planificados"
- **Build**: Application y Domain compilaron con exit 0. API/Infrastructure bloqueadas por Visual Studio (file lock, no errores de código).
- **Documentación actualizada**: CLAUDE.md, progress.md, docs/api/README.md, docs/api/frontend-api-contracts.md, manuales HTML.

### 2026-05-20 - Sesión 13: Frontend Usuarios completo + mejoras planeadas Rol
- **Work**: Implementación completa del módulo frontend de Usuarios. Corrección de bug ngModel. Actualización de documentación y anotación de mejoras para módulo Rol.
- **Archivos creados** (5 archivos nuevos):
  - `src/frontend/src/app/core/models/usuario.model.ts` — interfaces `UsuarioDto`, `SucursalResumen`, `CreateUsuarioRequest`, `UpdateUsuarioRequest`, `ChangePasswordRequest`, `AssignSucursalRequest`
  - `src/frontend/src/app/core/services/usuario.service.ts` — 8 métodos HTTP: `getAll`, `getById`, `create`, `update`, `delete`, `changePassword`, `assignSucursal`, `removeSucursal`
  - `src/frontend/src/app/features/usuarios/usuarios-list/usuarios-list.component.ts` — tabla con badges de rol (color por tipo), chips de sucursales, acciones (editar / cambiar contraseña / eliminar)
  - `src/frontend/src/app/features/usuarios/usuario-form/usuario-form.component.ts` — modal crear/editar con ReactiveFormsModule; en edición incluye sección de sucursales (asignar/quitar en tiempo real via API)
  - `src/frontend/src/app/features/usuarios/usuario-password/usuario-password.component.ts` — modal exclusivo cambio de contraseña (botón ámbar en lista)
- **Archivos modificados** (2 archivos):
  - `src/frontend/src/app/app.routes.ts` — ruta lazy `/usuarios`
  - `src/frontend/src/app/layout/main-layout/main-layout.component.ts` — link "Usuarios" en sidebar
- **Bug fix**: `[(ngModel)]` en select de sucursales → reemplazado por `(change)="onSucursalSelectChange($event)"` (no se importaba FormsModule)
- **Decisiones de diseño**:
  - Gestión de sucursales en tiempo real (API calls inmediatos al asignar/quitar), no diferida al guardar
  - Crear usuario: solo campos básicos (sin sucursales) — se asignan desde edición posterior
  - Cambio de contraseña: modal separado accesible con ícono de candado en la lista
  - Roles hardcodeados en combobox (Admin/Operador/Lectura) — **mejora anotada**: cargar desde `GET /api/roles`
- **Mejoras anotadas para próxima sesión** (módulo Rol):
  1. `013_OPT_Rol.sql` — tabla catálogo `OPT_Rol`
  2. `GET /api/roles` — endpoint solo lectura
  3. `rol.service.ts` + combobox dinámico en `usuario-form`

### 2026-05-19 - Sesión 12: Backend Usuarios CRUD + UsuarioSucursal M:N + documentación
- **Work**: Implementación completa del módulo backend de Usuarios con relación M:N a Sucursales. Actualización de todos los archivos de contexto IA y manuales técnicos.
- **SQL creado** (1 archivo):
  - `012_OPT_UsuarioSucursal.sql` — tabla pivote M:N con PK compuesta (UsuarioId, SucursalId), FK a OPT_Usuario (CASCADE) y OPT_Sucursal (NO ACTION)
- **Archivos creados** (15 archivos nuevos):
  - `OPT.Domain/Entities/UsuarioSucursal.cs` — entidad pivote con AssignedAt, AssignedBy, navegación a Usuario y Sucursal
  - `OPT.Application/Interfaces/IUsuarioRepository.cs` — expandido con GetAll, GetById, Add, Update, SoftDelete, AssignSucursal, RemoveSucursal, ExistsSucursalAssignment
  - `OPT.Application/Usuarios/DTOs/UsuarioDto.cs` — record con `IReadOnlyList<SucursalResumenDto> Sucursales`
  - `OPT.Application/Usuarios/DTOs/UsuarioMappingExtensions.cs` — ToDto con sucursales activas
  - `OPT.Application/Usuarios/Commands/CreateUsuarioCommand.cs` (+ handler, hashea password con BCrypt)
  - `OPT.Application/Usuarios/Commands/UpdateUsuarioCommand.cs` (+ handler, sin modificar contraseña)
  - `OPT.Application/Usuarios/Commands/DeleteUsuarioCommand.cs` (+ handler, soft delete)
  - `OPT.Application/Usuarios/Commands/ChangePasswordCommand.cs` (+ handler, rehashea con BCrypt)
  - `OPT.Application/Usuarios/Commands/AssignSucursalCommand.cs` (+ handler, valida duplicados con 409)
  - `OPT.Application/Usuarios/Commands/RemoveSucursalCommand.cs` (+ handler, valida existencia)
  - `OPT.Application/Usuarios/Queries/GetUsuariosQuery.cs` (+ handler)
  - `OPT.Application/Usuarios/Queries/GetUsuarioByIdQuery.cs` (+ handler)
  - `OPT.Application/Usuarios/Validators/CreateUsuarioCommandValidator.cs` — valida Rol (Admin|Operador|Lectura), email, password min 6
  - `OPT.Application/Usuarios/Validators/UpdateUsuarioCommandValidator.cs`
  - `OPT.API/Controllers/UsuarioController.cs` — 8 endpoints en `/api/usuarios`
- **Archivos modificados** (4 archivos):
  - `OPT.Domain/Entities/Usuario.cs` — agregada `ICollection<UsuarioSucursal> UsuarioSucursales`
  - `OPT.Infrastructure/Persistence/Repositories/UsuarioRepository.cs` — implementación completa con Include ThenInclude
  - `OPT.Infrastructure/Persistence/OPTDbContext.cs` — DbSet<UsuarioSucursal> + config EF (PK compuesta, FKs, HasMaxLength)
- **Build**: `dotnet build` exitoso — 0 errores, 0 advertencias
- **Documentación actualizada**: AGENTS.md raíz, src/backend/AGENTS.md, .agents/progress.md, docs/api/README.md, docs/api/frontend-api-contracts.md, backend-arquitectura.html, base-datos.html

### 2026-05-19 - Sesión 11: Backend Sucursales CRUD + documentación
- **Work**: Implementación completa del módulo backend de Sucursales. Actualización de todos los archivos de contexto IA y manuales técnicos.
- **Archivos creados** (13 archivos nuevos):
  - `OPT.Domain/Entities/Sucursal.cs` — entidad con campos Nombre, Direccion, Telefono, Matriz (bool), FechaRegistro, auditoría
  - `OPT.Application/Interfaces/ISucursalRepository.cs` — contrato GetAll, GetById, Add, Update, SoftDelete
  - `OPT.Application/Sucursales/DTOs/SucursalDto.cs` — record de respuesta completo
  - `OPT.Application/Sucursales/DTOs/SucursalMappingExtensions.cs` — ToDto extension
  - `OPT.Application/Sucursales/Commands/CreateSucursalCommand.cs` (+ handler)
  - `OPT.Application/Sucursales/Commands/UpdateSucursalCommand.cs` (+ handler, lanza KeyNotFoundException si no existe)
  - `OPT.Application/Sucursales/Commands/DeleteSucursalCommand.cs` (+ handler)
  - `OPT.Application/Sucursales/Queries/GetSucursalesQuery.cs` (+ handler — lista ordenada por Nombre)
  - `OPT.Application/Sucursales/Queries/GetSucursalByIdQuery.cs` (+ handler)
  - `OPT.Application/Sucursales/Validators/CreateSucursalCommandValidator.cs`
  - `OPT.Application/Sucursales/Validators/UpdateSucursalCommandValidator.cs`
  - `OPT.Infrastructure/Persistence/Repositories/SucursalRepository.cs`
  - `OPT.API/Controllers/SucursalController.cs` — CRUD completo en `/api/sucursales`
- **Archivos modificados** (3 archivos):
  - `OPT.Infrastructure/Persistence/OPTDbContext.cs` — DbSet<Sucursal> + configuración EF (HasMaxLength, HasQueryFilter, NEWSEQUENTIALID, índice TenantId)
  - `OPT.Infrastructure/DependencyInjection.cs` — registro `ISucursalRepository`
  - `CLAUDE.md` — actualizado: script 012, Signal Forms, UUID string, takeUntilDestroyed, módulos pendientes
- **Nota**: La tabla `OPT_Sucursal` ya existía en `004_OPT_Sucursal.sql` — no se requirió nuevo script SQL.
- **Build**: `dotnet build` exitoso — 0 errores, 0 advertencias en todos los proyectos.
- **Documentación actualizada** (7 archivos):
  - `AGENTS.md` raíz — Sucursal ✅ en tablas backend y módulos
  - `src/backend/AGENTS.md` — módulo Sucursal, endpoints, interfaz, repositorio, entidad
  - `.agents/progress.md` — esta entrada
  - `docs/api/README.md` — módulo Sucursal en tabla + sección endpoints
  - `docs/api/frontend-api-contracts.md` — modelos TypeScript Sucursal
  - `docs/technical-manual/backend-arquitectura.html` — entidad, interfaz, repositorio, controller
  - `docs/technical-manual/base-datos.html` — sección "Guía nuevo módulo" actualizada

### 2026-05-15 - Sesión 10: Backend RecetaCristales CRUD + documentación
- **Work**: Implementación completa del módulo backend de RecetaCristales. Actualización de todos los archivos de contexto IA y manuales técnicos.
- **Archivos creados** (15 archivos nuevos):
  - `OPT.Domain/Entities/RecetaCristales.cs` — entidad con campos Lejos/Cerca (OD, OI, DP), ADD, 4 flags, FechaIngreso, auditoría
  - `OPT.Application/Interfaces/IRecetaCristalesRepository.cs` — contrato GetByCliente, GetById, Add, Update, SoftDelete
  - `OPT.Application/RecetaCristales/DTOs/RecetaCristalesDto.cs` — record de respuesta completo
  - `OPT.Application/RecetaCristales/DTOs/RecetaCristalesMappingExtensions.cs` — alias `RecetaCristalesEntity` para resolver conflicto de nombre namespace
  - `OPT.Application/RecetaCristales/Commands/Create|Update|DeleteRecetaCristalesCommand.cs` (+ handlers) — 6 archivos
  - `OPT.Application/RecetaCristales/Queries/GetRecetasByClienteQuery.cs` + Handler, `GetRecetaByIdQuery.cs` + Handler — 4 archivos
  - `OPT.Application/RecetaCristales/Validators/CreateRecetaCristalesCommandValidator.cs` + Update — 2 archivos
  - `OPT.Infrastructure/Persistence/Repositories/RecetaCristalesRepository.cs` — implementación con alias tipo
  - `OPT.API/Controllers/RecetaCristalesController.cs` — CRUD completo en `/api/RecetaCristales`
- **Archivos modificados** (3 archivos):
  - `OPT.Infrastructure/Persistence/OPTDbContext.cs` — DbSet + configuración EF (HasMaxLength, HasQueryFilter, FK Restrict, NEWSEQUENTIALID)
  - `OPT.Infrastructure/DependencyInjection.cs` — registro `IRecetaCristalesRepository`
- **Lección técnica**: Conflicto C# entre namespace `OPT.Application.RecetaCristales` y clase `RecetaCristales` del dominio. Solución: alias `using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales` en los archivos afectados.
- **Documentación actualizada** (8 archivos):
  - `AGENTS.md` raíz — tabla backend, tabla DB scripts (011), tabla frontend (pendientes), fecha
  - `src/backend/AGENTS.md` — interfaces, módulos (sesión 10), entidades, endpoints detallados
  - `.agents/progress.md` — esta entrada
  - `docs/api/README.md` — módulo RecetaCristales en tabla + sección de endpoints
  - `docs/api/frontend-api-contracts.md` — modelos TypeScript RecetaCristales (pendientes)
  - `docs/technical-manual/base-datos.html` — tabla resumen + script 011
  - `docs/technical-manual/backend-arquitectura.html` — entidad, interfaz, repositorio, controller

### 2026-05-15 - Sesión 9: Frontend Anamnesis CRUD completo
- **Work**: Implementación completa del módulo frontend de Anamnesis (modelo, servicio, lista, formulario modal). Actualización de documentación técnica y archivos de contexto IA.
- **Archivos creados** (4 archivos nuevos):
  - `src/frontend/src/app/core/models/anamnesis.model.ts` — `AnamnesisDto`, `CreateAnamnesisRequest`, `UpdateAnamnesisRequest`
  - `src/frontend/src/app/core/services/anamnesis.service.ts` — `getByCliente(clienteId)`, `getById`, `create`, `update`, `delete`
  - `src/frontend/src/app/features/anamnesis/anamnesis-list/anamnesis-list.component.ts` — página CRUD en `/clientes/:id/anamnesis`; lista con badges de condiciones + modal inline
  - `src/frontend/src/app/features/anamnesis/anamnesis-form/anamnesis-form.component.ts` — modal create/edit; checkboxes para 4 condiciones + textarea observación
- **Archivos modificados** (2 archivos):
  - `src/frontend/src/app/app.routes.ts` — ruta lazy `clientes/:id/anamnesis`
  - `src/frontend/src/app/features/clientes/cliente-detail/cliente-detail.component.ts` — botón "Anamnesis" (teal) en header + método `irAnamnesis()`
- **Documentación actualizada** (5 archivos):
  - `AGENTS.md` raíz — Anamnesis agregado a tablas backend y frontend, fecha actualizada
  - `.agents/progress.md` — esta entrada
  - `docs/api/README.md` — módulo Anamnesis en tabla + sección de endpoints
  - `docs/api/frontend-api-contracts.md` — `UpdateAnamnesisRequest` agregado, tabla servicios actualizada
  - `docs/technical-manual/frontend-setup.md` — reescrito para reflejar arquitectura real actual
- **Decisiones de diseño**:
  - Acceso a Anamnesis desde `cliente-detail` via botón, no desde sidebar (siempre requiere ClienteId)
  - Validación UUID regex en `ngOnInit` del componente lista (igual que `ClienteDetailComponent`)
  - Eliminación optimista: `registros.update()` sin recargar toda la lista
  - `AnamnesisFormComponent` como componente modal reutilizable con `input.required<string>()` para `clienteId`

### 2026-05-08 - Sesión 8: Modelos Angular UUID + Documentación técnica
- **Work**: Actualización de modelos TypeScript/Angular para reflejar migración GUID. Actualización de archivos de contexto IA y manuales técnicos.
- **Archivos Angular modificados** (5 archivos):
  - `core/models/cliente.model.ts` — `clienteId: number → string`, `tenantId: number → string` (con comentarios UUID)
  - `core/models/auth.model.ts` — `tenantId: number → string`, `userId: number → string`
  - `core/services/cliente.service.ts` — parámetros `id: number → id: string`
  - `features/clientes/cliente-detail/cliente-detail.component.ts` — validación UUID regex en lugar de `Number(id) + isNaN`
  - `features/clientes/clientes-list/clientes-list.component.ts` — state `editarClienteId?: number → string`
  - `features/clientes/cliente-form/cliente-form.component.ts` — fallback tenantId `?? 1 → ?? ''`
- **Archivos de contexto IA actualizados** (3 archivos):
  - `src/frontend/AGENTS.md` — sección 12 nueva (regla tipos UUID), sección 13 anti-patrones UUID, fecha actualizada
  - `.agents/progress.md` — estado actual + sesión 8 registrada
- **Manuales técnicos actualizados**: ver tarea #12
- **Decisiones clave**:
  - `idComuna` mantiene `number` en TypeScript (FK a catálogo INT)
  - Validación de ID en router param usa regex UUID, no `Number(id)`
  - Fallback de `tenantId` en form cambiado de `1` (int inválido) a `''` (string vacío que la API rechaza con 401)

### 2026-05-08 - Sesión 7: Migración PKs INT → GUID
- **Work**: Cambio de tipo de PK/FK de `INT IDENTITY` a `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()` en todas las entidades de negocio del SaaS.
- **Motivación**: Seguridad (prevención IDOR), compatibilidad futura con PostgreSQL, generación de IDs distribuida.
- **Archivos SQL modificados** (6 scripts):
  - `001_OPT_Tenant.sql` — TenantId UNIQUEIDENTIFIER
  - `004_OPT_Sucursal.sql` — idSucursal + TenantId UNIQUEIDENTIFIER
  - `005_OPT_Cliente.sql` — ClienteId + TenantId UNIQUEIDENTIFIER (idComuna INT se mantiene)
  - `006_OPT_Contacto.sql` — ContactoId + TenantId + ClienteId UNIQUEIDENTIFIER
  - `008_OPT_Usuario.sql` — UsuarioId + TenantId UNIQUEIDENTIFIER
  - `010_OPT_Anamnesis.sql` — AnamnesisId + TenantId + ClienteId UNIQUEIDENTIFIER
- **Archivos Domain modificados** (4 entidades):
  - `Cliente.cs`, `Usuario.cs`, `Contacto.cs`, `Anamnesis.cs` — propiedades `int` → `Guid`
- **Archivos Infrastructure modificados**:
  - `OPTDbContext.cs` — `HasDefaultValueSql("NEWSEQUENTIALID()")` en 4 entidades
  - `CurrentTenantService.cs` — `Guid.TryParse` + propiedad `Guid TenantId`
  - `ClienteRepository.cs`, `ContactoRepository.cs`, `UsuarioRepository.cs`, `AnamnesisRepository.cs` — firmas `int` → `Guid`
- **Archivos Application modificados** (18 archivos):
  - `ICurrentTenantService.cs` — `Guid TenantId`
  - `IClienteRepository.cs`, `IContactoRepository.cs`, `IUsuarioRepository.cs`, `IAnamnesisRepository.cs`
  - DTOs: `ClienteDto`, `ContactoDto`, `AnamnesisDto`
  - Commands/Queries: Create*, Update*, Delete*, GetBy*, GetAll* de Clientes, Contactos, Anamnesis
  - Handlers: `CreateClienteCommandHandler`, `CreateContactoCommandHandler`, `CreateAnamnesisCommandHandler` — `IRequest<Guid>`
  - Validators: `LoginCommandValidator`, `UpdateClienteCommandValidator`, `CreateAnamnesisCommandValidator`, `UpdateAnamnesisCommandValidator`, `CreateContactoCommandValidator` — `.NotEmpty()` en lugar de `.GreaterThan(0)`
  - Auth: `LoginCommand` (Guid TenantId), `LoginCommandHandler`
- **Archivos API modificados** (4 controllers):
  - `ClienteController.cs` — rutas `{id:guid}`, parámetros `Guid`
  - `ContactoController.cs` — rutas `{clienteId:guid}/{id:guid}`, parámetros `Guid`
  - `AnamnesisController.cs` — rutas `{id:guid}`, parámetros `Guid`, `CreateAnamnesisRequest.ClienteId: Guid`
  - `AuthController.cs` — `LoginRequest.TenantId: Guid`
- **Documentación actualizada**:
  - `AGENTS.md` raíz — reglas 12-14 agregadas, scripts actualizados, anti-patrones GUID
  - `src/backend/AGENTS.md` — tabla de entidades con tipos, sección "Regla de tipos PK/FK", anti-patrones GUID
  - `.agents/decisions/2026-05-08-migracion-pk-guid.md` — ADR completo
  - `.agents/progress.md` — esta entrada
  - `docs/api/frontend-api-contracts.md` — IDs actualizados a `string` (UUID)
- **Decisión clave**: catálogos compartidos (Region, Comuna) mantienen `INT IDENTITY` — no tienen TenantId ni se exponen directamente.
- **Próximo paso pendiente**: actualizar modelos Angular (`number` → `string` para IDs de negocio).

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
