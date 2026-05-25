# Progress Log

Track work sessions and current state for continuity between AI agent sessions.

## Current Status
> Updated: 2026-05-24 (Sesión 16 — Stock frontend completo + Primer movimiento + Documentos de Entrada + Precios)

### Completado hasta ahora
- [x] Base de datos: scripts 000–020, tablas Tenant/Region/Comuna/Sucursal/Cliente/Contacto/Usuario/Anamnesis/RecetaCristales/Rol/Agenda/ProductoCategoria/Producto/ProductoVariante/Stock/MovimientoStock/PrecioProducto/DocumentoStock/DocumentoStockLinea
- [x] Backend API: Tenant, Auth, Clientes (+ contactos embebidos), Contactos, Regiones (WithComunas), Anamnesis, RecetaCristales, **Sucursales**
- [x] Backend Middleware: CorrelationId, ExceptionHandling (RFC 7807), TenantValidation
- [x] Frontend Angular 21: Login, Clientes (lista + form + detalle), Layout, AuthGuard, HTTP Interceptor JWT, RUT Validator
- [x] Frontend: RegionService con shareReplay (comunas desde API, no hardcodeado)
- [x] Frontend: ClienteDetailComponent — página solo lectura `/clientes/:id`
- [x] Fix EF Core: WithMany(cl => cl.Contactos) — resuelve shadow FK ClienteId1
- [x] Correcciones SQL: FKs OPT_Contacto, índices OPT_Usuario, idempotencia datos iniciales
- [x] Documentación técnica HTML: backend-arquitectura, base-datos, backend-api-reference
- [x] Memoria IA actualizada: AGENTS.md raíz, src/backend/, src/frontend/, .agents/progress.md
- [x] **Migración PKs INT → UNIQUEIDENTIFIER (GUID)**: 6 tablas SQL + entidades Domain + repositorios + Application + controllers
- [x] **Modelos Angular actualizados**: `clienteId`, `tenantId`, `contactoId`, `anamnesisId`, `usuarioId` → `string` (UUID)
- [x] **Manuales técnicos actualizados**: backend-arquitectura.html, frontend-setup.md, API Reference (tipos GUID)
- [x] **Frontend Anamnesis**: model, service, anamnesis-list (página `/clientes/:id/anamnesis`), anamnesis-form (modal), botón en cliente-detail
- [x] **Backend RecetaCristales**: entidad Domain, interfaz Application, Commands/Queries/Validators, repositorio Infrastructure, DbContext, DI, Controller CRUD completo (`/api/RecetaCristales`)
- [x] **Backend Sucursales**: entidad Domain, ISucursalRepository, Commands/Queries/Validators, SucursalRepository, DbContext, DI, Controller CRUD completo (`/api/sucursales`)
- [x] **Backend Usuarios**: entidad UsuarioSucursal (M:N), IUsuarioRepository expandido, Commands (CRUD + ChangePassword + AssignSucursal + RemoveSucursal), Queries, Validators, UsuarioRepository, DbContext, Controller CRUD completo (`/api/usuarios`) con endpoints de sucursales
- [x] **Frontend Usuarios**: `usuario.model.ts`, `usuario.service.ts`, `usuarios-list` (tabla con badges de rol + chips de sucursales), `usuario-form` (modal crear/editar + gestión de sucursales en tiempo real), `usuario-password` (modal cambio contraseña), rutas lazy `/usuarios`, link en sidebar

### Módulos Futuros Planificados
- [ ] **Salida (documentos)** (`021_?`): OrdenTrabajo, Devoluciones, OtroEgreso — por ahora solo Salida directa desde form por fila
- [ ] **Frontend RecetaCristales**: model, service, lista + form modal, botón en cliente-detail
- [ ] **Frontend Agenda**: model, service, componente lista/calendario por sucursal (usa X-Sucursal-Id)
- [ ] **Frontend Productos**: lista con tabs Productos/Categorías, form modal, gestión de variantes
- [ ] **Roles GET /api/roles**: endpoint de solo lectura + combobox dinámico en usuario-form (reemplazar hardcodeado)
- [ ] **Precios dedicados**: pantalla de gestión de PrecioVenta (PrecioCosto solo se actualiza via Entradas)

### Mejoras Anotadas — Módulo Rol (próxima sesión)
- [ ] **BD**: Crear `013_OPT_Rol.sql` — tabla catálogo `OPT_Rol` (`RolId INT IDENTITY PK`, `Nombre NVARCHAR(50)`, sin TenantId — catálogo compartido). Poblar con Admin, Operador, Lectura.
- [ ] **Backend**: API de solo lectura `GET /api/roles` — retorna `RolDto[]` (`rolId: number`, `nombre: string`). Sin CRUD (catálogo). Controller sin `[Authorize]` o con JWT según decisión.
- [ ] **Frontend**: `rol.model.ts` + `rol.service.ts` (con `shareReplay(1)`) → cargar roles en `usuario-form` reemplazando las opciones hardcodeadas del `<select>` de Rol.

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
- [ ] **Frontend RecetaCristales**: model, service, lista + form modal (patrón Anamnesis), botón en `cliente-detail`
- [ ] **Frontend Agenda**: model, service, componente lista/calendario por sucursal (`X-Sucursal-Id`)
- [ ] **Frontend Productos**: implementar `features/productos/` (modelos y servicios ya creados)
- [ ] **Roles GET /api/roles**: endpoint solo lectura + combobox dinámico en `usuario-form`
- [ ] **Salida por documentos**: diseñar e implementar OrdenTrabajo/Devoluciones (021_)
- [ ] Unit tests backend con xUnit + Moq
- [ ] Dashboard / Home screen en Angular
- [ ] Autorización por rol en controllers (actualmente solo `[Authorize]`)

---

## Session History

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
