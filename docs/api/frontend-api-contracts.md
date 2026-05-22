# Frontend API Contracts - OPT System

> **Última actualización:** 2026-05-22 (Sesión 15 — Productos: catálogo puro, modelos TypeScript limpios; Precios y Stock como módulos futuros)

Este documento describe los contratos de API entre el frontend Angular y el backend .NET.

---

## ⚠️ Convención de tipos para IDs

Desde la **Sesión 7**, todos los IDs de entidades de negocio son **UUID** (`UNIQUEIDENTIFIER` en SQL Server, `Guid` en C#).

En TypeScript/Angular, los UUIDs se representan como **`string`** (no `number`).

| Entidad | Tipo ID en TypeScript | Ejemplo |
|---|---|---|
| Tenant | `string` | `"550e8400-e29b-41d4-a716-446655440001"` |
| Cliente | `string` | `"3fa85f64-5717-4562-b3fc-2c963f66afa6"` |
| Contacto | `string` | `"7c9e6679-7425-40de-944b-e07fc1f90ae7"` |
| Usuario | `string` | `"b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27"` |
| Anamnesis | `string` | `"1d0f35a4-83a2-4a2b-8d7e-3f9b1c2e5d6f"` |
| RecetaCristales | `string` | `"7f4a1b2c-3d5e-6f7a-8b9c-0d1e2f3a4b5c"` |
| Sucursal | `string` | `"4e9f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"` |
| ProductoCategoria | `string` | UUID |
| Producto | `string` | UUID |
| ProductoVariante | `string` | UUID |
| UsuarioSucursal | — | Join table — no tiene ID propio, PK compuesta en SQL |
| Region (catálogo) | `number` | `7` |
| Comuna (catálogo) | `number` | `318` |

---

## Base URL

```
Desarrollo: http://localhost:5005/api
Producción: TBD
```

## Autenticación

### Login

**Endpoint**: `POST /api/Auth/login`

**Request Body**:
```typescript
export interface LoginRequest {
  tenantId: string;   // UUID — identificador de la óptica
  rut: string;        // RUT del usuario: "12345678-9"
  password: string;
}
```

**Respuesta exitosa** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Juan Pérez",
  "rol": "Operador",
  "usuarioId": "b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "expiracion": "2026-05-08T14:30:00Z"
}
```

**Respuesta error** (`401 Unauthorized`):
```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "Credenciales inválidas."
}
```

**Storage**: Token JWT almacenado en `localStorage` como `token`.

**Claims incluidos en el JWT**:
```json
{
  "sub":         "b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27",
  "tenant_id":   "550e8400-e29b-41d4-a716-446655440001",
  "rut_usuario": "12345678-9",
  "name":        "Juan Pérez",
  "role":        "Operador",
  "jti":         "guid-unico-por-token"
}
```

---

## Modelos TypeScript base

```typescript
// core/models/auth.model.ts
export interface LoginRequest {
  tenantId: string;   // UUID
  rut: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombre: string;
  rol: string;
  usuarioId: string;   // UUID
  tenantId: string;    // UUID
  expiracion: string;  // ISO 8601
}
```

```typescript
// core/models/cliente.model.ts
export interface ContactoDto {
  contactoId: string;   // UUID
  tenantId: string;     // UUID
  clienteId: string;    // UUID
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ContactoInputDto {
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
}

export interface ClienteDto {
  clienteId: string;         // UUID
  tenantId: string;          // UUID
  tipoCliente: 'Persona' | 'Empresa';
  numeroDocumento: string;   // RUT
  nombre: string;
  direccion?: string;
  idComuna?: number;          // INT — catálogo compartido
  celular?: string;
  mail?: string;
  fechaIngreso: string;
  // Solo Persona
  fechaNacimiento?: string;
  tipoPrevision?: string;
  // Solo Empresa
  giro?: string;
  contactos: ContactoDto[];
  // Auditoría
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateClienteRequest {
  tipoCliente: 'Persona' | 'Empresa';
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;          // INT — catálogo compartido
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
  contactos?: ContactoInputDto[];
}

export interface UpdateClienteRequest {
  nombre: string;
  direccion?: string;
  idComuna?: number;          // INT — catálogo compartido
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
  contactos?: ContactoInputDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
```

---

## Clientes

### Listar clientes (paginado)

**Endpoint**: `GET /api/Clientes`

**Query params**: `page` (default: 1) · `pageSize` (default: 20, máx: 100) · `tipoCliente?` · `busqueda?`

```typescript
getClientes(page = 1, pageSize = 20, busqueda?: string, tipoCliente?: string)
  : Observable<PagedResult<ClienteDto>> {
  const params: any = { page, pageSize };
  if (busqueda) params.busqueda = busqueda;
  if (tipoCliente) params.tipoCliente = tipoCliente;
  return this.http.get<PagedResult<ClienteDto>>(this.apiUrl, { params });
}
```

**Respuesta** (`200 OK`):
```json
{
  "items": [
    {
      "clienteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "tenantId": "550e8400-e29b-41d4-a716-446655440001",
      "tipoCliente": "Persona",
      "numeroDocumento": "12345678-9",
      "nombre": "Juan Pérez",
      "idComuna": 318,
      "contactos": []
    }
  ],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20
}
```

---

### Obtener cliente por ID

**Endpoint**: `GET /api/Clientes/{id}` — `id` es UUID string

```typescript
getCliente(id: string): Observable<ClienteDto> {
  return this.http.get<ClienteDto>(`${this.apiUrl}/${id}`);
}
```

---

### Crear cliente

**Endpoint**: `POST /api/Clientes`

```typescript
createCliente(cliente: CreateClienteRequest): Observable<{ clienteId: string }> {
  return this.http.post<{ clienteId: string }>(this.apiUrl, cliente);
}
```

**Respuesta** (`201 Created`): `{ "clienteId": "3fa85f64-..." }`

---

### Actualizar cliente

**Endpoint**: `PUT /api/Clientes/{id}` — `id` es UUID string

```typescript
updateCliente(id: string, cliente: UpdateClienteRequest): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}`, cliente);
}
```

**Respuesta** (`204 No Content`)

> **Contactos en update**: estrategia **replace completo** — soft-delete de todos los contactos previos + creación de los nuevos. No es merge selectivo.

---

### Eliminar cliente

**Endpoint**: `DELETE /api/Clientes/{id}` — `id` es UUID string

```typescript
deleteCliente(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
```

**Respuesta** (`204 No Content`). Soft delete — `IsDeleted = true`.

---

## Contactos

Sub-recurso de un cliente Empresa. Rutas anidadas bajo `/api/Clientes/{clienteId}/Contactos`.

### Listar contactos por cliente

**Endpoint**: `GET /api/Clientes/{clienteId}/Contactos`

### Obtener contacto por ID

**Endpoint**: `GET /api/Clientes/{clienteId}/Contactos/{id}`

### Crear contacto

**Endpoint**: `POST /api/Clientes/{clienteId}/Contactos`

```typescript
export interface CreateContactoRequest {
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
}
```

**Respuesta** (`201 Created`): `{ "contactoId": "uuid" }`

### Actualizar contacto

**Endpoint**: `PUT /api/Clientes/{clienteId}/Contactos/{id}`

```typescript
export interface UpdateContactoRequest {
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  activo: boolean;
}
```

### Eliminar contacto

**Endpoint**: `DELETE /api/Clientes/{clienteId}/Contactos/{id}`

---

## Regiones y Comunas (catálogos compartidos)

> IDs son `number` — catálogos sin TenantId, no son entidades de negocio.

### Obtener regiones con comunas

**Endpoint**: `GET /api/Regiones/WithComunas`

```typescript
// core/models/region.model.ts
export interface ComunaItem {
  idComuna: number;    // INT — catálogo
  nombre: string;
}

export interface RegionWithComunas {
  idRegion: number;    // INT — catálogo
  nombre: string;
  codigo?: string;
  comunas: ComunaItem[];
}
```

```typescript
// core/services/region.service.ts
getRegionesWithComunas(): Observable<RegionWithComunas[]> {
  return this.http.get<RegionWithComunas[]>(`${this.apiUrl}/Regiones/WithComunas`)
    .pipe(shareReplay(1));   // Cache en memoria — datos estáticos
}
```

---

## Anamnesis

### Listar por cliente

**Endpoint**: `GET /api/Anamnesis?clienteId={uuid}`

```typescript
// core/models/anamnesis.model.ts
export interface AnamnesisDto {
  anamnesisId: string;    // UUID
  tenantId: string;       // UUID
  clienteId: string;      // UUID
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
  fechaRegistro: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
```

### Obtener por ID

**Endpoint**: `GET /api/Anamnesis/{id}` — `id` es UUID string

### Crear anamnesis

**Endpoint**: `POST /api/Anamnesis`

```typescript
export interface CreateAnamnesisRequest {
  clienteId: string;       // UUID
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
}
```

**Respuesta** (`201 Created`): `{ "id": "uuid" }`

### Actualizar anamnesis

**Endpoint**: `PUT /api/Anamnesis/{id}` — `id` es UUID string

```typescript
export interface UpdateAnamnesisRequest {
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
}
```

**Respuesta** (`200 OK`): sin body

### Eliminar anamnesis

**Endpoint**: `DELETE /api/Anamnesis/{id}` — `id` es UUID string

---

## RecetaCristales

### Modelos TypeScript (pendiente implementar en frontend)

**Endpoint base**: `GET|POST /api/RecetaCristales`, `GET|PUT|DELETE /api/RecetaCristales/{id}`

```typescript
// core/models/receta-cristales.model.ts  (pendiente crear)
export interface RecetaCristalesDto {
  recetaCristalesId: string;  // UUID
  tenantId: string;           // UUID
  clienteId: string;          // UUID

  // Lejos
  lejosODEsferico?: string;   lejosODCilindro?: string;   lejosODEje?: string;   lejosODObservacion?: string;
  lejosOIEsferico?: string;   lejosOICilindro?: string;   lejosOIEje?: string;   lejosOIObservacion?: string;
  lejosDPEsferico?: string;   lejosDPObservacion?: string;

  // Cerca
  cercaODEsferico?: string;   cercaODCilindro?: string;   cercaODEje?: string;   cercaODObservacion?: string;
  cercaOIEsferico?: string;   cercaOICilindro?: string;   cercaOIEje?: string;   cercaOIObservacion?: string;
  cercaDPEsferico?: string;   cercaDPObservacion?: string;

  // ADD
  lejosADDEsfera?: string;

  // Flags
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;

  fechaIngreso: string;       // ISO 8601
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateRecetaCristalesRequest {
  clienteId: string;           // UUID — requerido
  lejosODEsferico?: string;    lejosODCilindro?: string;   lejosODEje?: string;   lejosODObservacion?: string;
  lejosOIEsferico?: string;    lejosOICilindro?: string;   lejosOIEje?: string;   lejosOIObservacion?: string;
  lejosDPEsferico?: string;    lejosDPObservacion?: string;
  cercaODEsferico?: string;    cercaODCilindro?: string;   cercaODEje?: string;   cercaODObservacion?: string;
  cercaOIEsferico?: string;    cercaOICilindro?: string;   cercaOIEje?: string;   cercaOIObservacion?: string;
  cercaDPEsferico?: string;    cercaDPObservacion?: string;
  lejosADDEsfera?: string;
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;
  fechaIngreso?: string;       // Opcional — backend usa UtcNow si se omite
}

export interface UpdateRecetaCristalesRequest {
  // Mismos campos que Create excepto clienteId
  lejosODEsferico?: string;    lejosODCilindro?: string;   lejosODEje?: string;   lejosODObservacion?: string;
  lejosOIEsferico?: string;    lejosOICilindro?: string;   lejosOIEje?: string;   lejosOIObservacion?: string;
  lejosDPEsferico?: string;    lejosDPObservacion?: string;
  cercaODEsferico?: string;    cercaODCilindro?: string;   cercaODEje?: string;   cercaODObservacion?: string;
  cercaOIEsferico?: string;    cercaOICilindro?: string;   cercaOIEje?: string;   cercaOIObservacion?: string;
  cercaDPEsferico?: string;    cercaDPObservacion?: string;
  lejosADDEsfera?: string;
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;
  fechaIngreso: string;        // Requerido en update
}
```

### Servicio Angular (pendiente implementar)

```typescript
// core/services/receta-cristales.service.ts  (pendiente crear)
// Patrón idéntico a AnamnesisService:
getByCliente(clienteId: string): Observable<RecetaCristalesDto[]>
getById(id: string): Observable<RecetaCristalesDto>
create(req: CreateRecetaCristalesRequest): Observable<{ id: string }>
update(id: string, req: UpdateRecetaCristalesRequest): Observable<void>
delete(id: string): Observable<void>
// URL base: /api/RecetaCristales
```

---

## Sucursales

### Modelos TypeScript (pendiente implementar en frontend)

**Endpoint base**: `GET|POST /api/sucursales`, `GET|PUT|DELETE /api/sucursales/{id}`

```typescript
// core/models/sucursal.model.ts  (pendiente crear)
export interface SucursalDto {
  sucursalId: string;     // UUID
  tenantId: string;       // UUID
  nombre: string;
  direccion?: string;
  telefono?: string;
  matriz: boolean;        // true = sede principal
  fechaRegistro: string;  // ISO 8601
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSucursalRequest {
  nombre: string;         // requerido, max 150 chars
  direccion?: string;
  telefono?: string;
  matriz: boolean;
}

export interface UpdateSucursalRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
  matriz: boolean;
}
```

### Servicio Angular (pendiente implementar)

```typescript
// core/services/sucursal.service.ts  (pendiente crear)
// Patrón idéntico a AnamnesisService, sin clienteId:
getAll(): Observable<SucursalDto[]>
getById(id: string): Observable<SucursalDto>
create(req: CreateSucursalRequest): Observable<{ id: string }>
update(id: string, req: UpdateSucursalRequest): Observable<void>
delete(id: string): Observable<void>
// URL base: /api/sucursales
```

---

## Usuarios

### Modelos TypeScript ✅ Implementado en Sesión 13

**Endpoints**: `GET|POST /api/usuarios`, `GET|PUT|DELETE /api/usuarios/{id}`, `PUT /api/usuarios/{id}/password`, `POST|DELETE /api/usuarios/{id}/sucursales`

```typescript
// core/models/usuario.model.ts  (pendiente crear)
export interface SucursalResumen {
  sucursalId: string;  // UUID
  nombre: string;
}

export interface UsuarioDto {
  usuarioId: string;   // UUID
  tenantId: string;    // UUID
  rutUsuario: string;  // RUT chileno: "12345678-9"
  nombre: string;
  email: string;
  rol: 'Admin' | 'Operador' | 'Lectura';
  fechaIngreso: string;   // ISO 8601
  sucursales: SucursalResumen[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUsuarioRequest {
  rutUsuario: string;  // requerido, max 20 chars
  nombre: string;      // requerido, max 150 chars
  email: string;       // requerido, formato email
  password: string;    // requerido, min 6 chars
  rol: 'Admin' | 'Operador' | 'Lectura';
}

export interface UpdateUsuarioRequest {
  nombre: string;
  email: string;
  rol: 'Admin' | 'Operador' | 'Lectura';
}

export interface ChangePasswordRequest {
  newPassword: string;  // min 6 chars
}

export interface AssignSucursalRequest {
  sucursalId: string;  // UUID
}
```

### Servicio Angular ✅ Implementado

```typescript
// core/services/usuario.service.ts  ← implementado en Sesión 13
getAll(): Observable<UsuarioDto[]>
getById(id: string): Observable<UsuarioDto>
create(req: CreateUsuarioRequest): Observable<{ id: string }>
update(id: string, req: UpdateUsuarioRequest): Observable<void>
delete(id: string): Observable<void>
changePassword(id: string, req: ChangePasswordRequest): Observable<void>
assignSucursal(id: string, req: AssignSucursalRequest): Observable<void>
removeSucursal(id: string, sucursalId: string): Observable<void>
// URL base: /api/usuarios
```

---

## Roles (catálogo) — Planeado Sesión 14

### Objetivo
Reemplazar el `<select>` hardcodeado en `usuario-form.component.ts` por opciones cargadas desde la API.

**Endpoint planeado**: `GET /api/roles`

```typescript
// core/models/rol.model.ts  (pendiente crear)
export interface RolDto {
  rolId: number;   // INT IDENTITY — catálogo compartido, no GUID
  nombre: string;  // 'Admin' | 'Operador' | 'Lectura'
}
```

```typescript
// core/services/rol.service.ts  (pendiente crear)
// Patrón idéntico a RegionService — catálogo estático con cache:
getRoles(): Observable<RolDto[]> {
  return this.http.get<RolDto[]>(`${this.apiUrl}/roles`)
    .pipe(shareReplay(1));
}
```

**Tabla BD planeada** (`013_OPT_Rol.sql`):
```sql
CREATE TABLE [dbo].[OPT_Rol] (
    [RolId]  INT IDENTITY(1,1) NOT NULL,
    [Nombre] NVARCHAR(50)      NOT NULL,
    CONSTRAINT [PK_OPT_Rol] PRIMARY KEY CLUSTERED ([RolId])
);
-- Sin TenantId (catálogo global), sin IsDeleted (nunca se borra)
INSERT INTO [dbo].[OPT_Rol] ([Nombre]) VALUES ('Admin'), ('Operador'), ('Lectura');
```

---

## Productos y Categorías

> **Diseño:** El módulo Productos es un **catálogo puro**. No contiene precios ni stock — esos datos son módulos separados (`018_OPT_Precio`, `019_OPT_Stock`) pendientes de implementar.

### Modelos TypeScript ✅ Implementado en Sesión 15

**Endpoints Categorías:** `GET|POST /api/categorias-producto`, `PUT|DELETE /api/categorias-producto/{id}`  
**Endpoints Productos:** `GET|POST /api/productos`, `GET|PUT|DELETE /api/productos/{id}`, `GET|POST /api/productos/{id}/variantes`, `PUT|DELETE /api/productos/{id}/variantes/{varianteId}`

```typescript
// core/models/producto.model.ts

export interface ProductoCategoriaDto {
  categoriaId: string;    // UUID
  tenantId: string;       // UUID
  nombre: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductoVarianteDto {
  varianteId: string;     // UUID
  productoId: string;     // UUID
  tenantId: string;       // UUID
  nombre: string;
  codigoBarras?: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductoDto {
  productoId: string;     // UUID
  tenantId: string;       // UUID
  categoriaId?: string;   // UUID opcional
  categoriaNombre?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: 'Almacenable' | 'Consumible' | 'Servicio';
  codigoInterno?: string;
  activo: boolean;
  variantes: ProductoVarianteDto[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateProductoRequest {
  categoriaId?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: 'Almacenable' | 'Consumible' | 'Servicio';
  codigoInterno?: string;
}

export interface UpdateProductoRequest {
  categoriaId?: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: 'Almacenable' | 'Consumible' | 'Servicio';
  codigoInterno?: string;
  activo: boolean;
}

export interface CreateProductoVarianteRequest {
  nombre: string;
  codigoBarras?: string;
}

export interface UpdateProductoVarianteRequest {
  nombre: string;
  codigoBarras?: string;
  activo: boolean;
}

export interface CreateProductoCategoriaRequest {
  nombre: string;
}

export interface UpdateProductoCategoriaRequest {
  nombre: string;
}

export interface ProductosPagedResult {
  items: ProductoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Constante compartida con el backend
export const TIPOS_PRODUCTO = ['Almacenable', 'Consumible', 'Servicio'] as const;
export type TipoProducto = typeof TIPOS_PRODUCTO[number];
```

### Servicios Angular ⏳ Pendiente implementar componentes

```typescript
// core/services/producto.service.ts  ← creado en Sesión 15
getAll(params): Observable<ProductosPagedResult>
getById(id: string): Observable<ProductoDto>
create(req: CreateProductoRequest): Observable<{ id: string }>
update(id: string, req: UpdateProductoRequest): Observable<void>
delete(id: string): Observable<void>
createVariante(productoId: string, req: CreateProductoVarianteRequest): Observable<{ id: string }>
updateVariante(productoId: string, varianteId: string, req: UpdateProductoVarianteRequest): Observable<void>
deleteVariante(productoId: string, varianteId: string): Observable<void>
// URL base: /api/productos

// core/services/producto-categoria.service.ts  ← creado en Sesión 15
getAll(): Observable<ProductoCategoriaDto[]>
create(req: CreateProductoCategoriaRequest): Observable<{ id: string }>
update(id: string, req: UpdateProductoCategoriaRequest): Observable<void>
delete(id: string): Observable<void>
// URL base: /api/categorias-producto
```

### Módulos futuros: Precios y Stock

```typescript
// FUTURO — core/models/precio.model.ts  (pendiente módulo 018)
export interface PrecioProductoDto {
  precioId: string;       // UUID
  productoId?: string;    // UUID — precio a nivel de producto
  varianteId?: string;    // UUID — precio a nivel de variante (más específico)
  sucursalId?: string;    // UUID — null = precio global del tenant
  precioVenta: number;
  costo: number;
  vigenciaDesde: string;  // ISO 8601
  vigenciaHasta?: string; // null = vigente indefinidamente
}

// FUTURO — core/models/stock.model.ts  (pendiente módulo 019)
export interface StockDto {
  stockId: string;          // UUID
  varianteId: string;       // UUID
  sucursalId: string;       // UUID — siempre scoped por sucursal (X-Sucursal-Id header)
  cantidadDisponible: number;
  stockMinimo: number;
  bajoStock: boolean;       // computed: cantidadDisponible <= stockMinimo
}
```

---

## Respuestas de error (RFC 7807 ProblemDetails)

Todos los endpoints devuelven errores en este formato:

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Ya existe un cliente con el documento '12345678-9' en este tenant.",
  "instance": "/api/Clientes"
}
```

| Status | Causa |
|---|---|
| `400` | Validación FluentValidation fallida |
| `401` | Token JWT ausente o inválido |
| `403` | TenantId inválido o sin acceso |
| `404` | Entidad no encontrada |
| `409` | Regla de negocio violada (ej. RUT duplicado) |
| `500` | Error inesperado del servidor |

---

## Capa de servicios Angular (`core/services/`)

| Servicio | Archivo | Firma de métodos clave |
|---|---|---|
| `AuthService` | `auth.service.ts` | `login(req: LoginRequest): Observable<LoginResponse>` |
| `ClienteService` | `cliente.service.ts` | `getCliente(id: string)`, `createCliente()`, `updateCliente(id: string, ...)`, `deleteCliente(id: string)` |
| `RegionService` | `region.service.ts` | `getRegionesWithComunas()` con `shareReplay(1)` |
| `AnamnesisService` | `anamnesis.service.ts` | `getByCliente(clienteId: string)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `RecetaCristalesService` | `receta-cristales.service.ts` | `getByCliente(clienteId: string)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` — **pendiente** |
| `SucursalService` | `sucursal.service.ts` | `getAll()`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `UsuarioService` | `usuario.service.ts` | `getAll()`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)`, `changePassword(id, req)`, `assignSucursal(id, req)`, `removeSucursal(id, sucursalId)` |
| `RolService` | `rol.service.ts` | `getRoles()` con `shareReplay(1)` — **pendiente** |
| `ProductoService` | `producto.service.ts` | `getAll(params)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)`, variante CRUD |
| `ProductoCategoriaService` | `producto-categoria.service.ts` | `getAll()`, `create(req)`, `update(id, req)`, `delete(id)` |

> **Todos los `id` de entidades de negocio son `string` (UUID). Los catálogos (Region, Comuna) siguen usando `number`.**

---

## HTTP Interceptor JWT

Implementado en `core/interceptors/auth.interceptor.ts`. Agrega automáticamente el header `Authorization: Bearer <token>` a todas las peticiones. No requiere lógica manual en los servicios.
