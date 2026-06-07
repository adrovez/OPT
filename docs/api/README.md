# OPT SaaS — API Documentation

> **Última actualización:** 2026-06-05 (Sesión 24 — Módulo Órdenes de Trabajo completo: backend + frontend)

## Overview

**Base URL (desarrollo):** `http://localhost:5005/api`
**Swagger UI:** `http://localhost:5005/swagger`
**Versión:** v1
**Autenticación:** JWT Bearer — header `Authorization: Bearer <token>`
**Content-Type:** `application/json`
**Formato de errores:** RFC 7807 ProblemDetails (`status`, `title`, `detail`, `instance`)

## Módulos Disponibles

| Módulo | Base Path | Auth requerida | Estado |
|--------|-----------|---------------|--------|
| Tenant | `/api/tenants` | No | ✅ Completo — CRUD |
| Auth | `/api/auth` | No (login/register) | ✅ Completo |
| Clientes | `/api/clientes` | JWT | ✅ Completo — CRUD + paginado + búsqueda |
| Contactos | `/api/contactos` | JWT | ✅ Completo — CRUD por cliente |
| Regiones | `/api/Regiones` | JWT | ✅ GET /WithComunas (catálogo Chile) |
| Anamnesis | `/api/Anamnesis` | JWT | ✅ Completo — CRUD por clienteId |
| RecetaCristales | `/api/RecetaCristales` | JWT | ✅ Completo — CRUD por clienteId |
| Sucursales | `/api/sucursales` | JWT | ✅ Completo — CRUD por tenant |
| Usuarios | `/api/usuarios` | JWT | ✅ Completo — CRUD + password + sucursales M:N |
| Roles | `/api/roles` | JWT | ✅ GET solo lectura (catálogo); script `013_OPT_Rol.sql` |
| Agenda | `/api/agenda` | JWT + `X-Sucursal-Id` | ✅ Completo — CRUD + PATCH /estado |
| FormaPago | `/api/forma-pagos` | JWT | ✅ GET solo lectura (catálogo 5 filas); script `021_OPT_FormaPago.sql` |
| Categorías Producto | `/api/categorias-producto` | JWT | ✅ Completo — CRUD |
| Productos | `/api/productos` | JWT | ✅ Completo — CRUD paginado + Variantes anidadas (catálogo puro) |
| Stock / Inventario | `/api/stock` | JWT + `X-Sucursal-Id` | ✅ Completo — CRUD + movimientos directos; script `018_OPT_Stock.sql` |
| Documentos de Entrada | `/api/documentos-stock` | JWT + `X-Sucursal-Id` | ✅ POST crear+confirmar / POST anular; script `020_OPT_DocumentoStock.sql` |
| Precios | (interno) | — | ✅ Historial de precios actualizado al confirmar documento; script `019_OPT_Precio.sql` — sin pantalla dedicada aún |
| Atenciones | `/api/atenciones` | JWT | ✅ POST /iniciar (atómico), GET lista/detalle, PATCH /estado; scripts `022–024` |
| CobroServicio | (interno a Atención) | — | ✅ Asociado a Atención; script `023_OPT_CobroServicio.sql` |
| Órdenes de Trabajo | `/api/ordenes-trabajo` | JWT + `X-Sucursal-Id` (POST) | ✅ Completo — 8 endpoints; script `029_OPT_OrdenTrabajo.sql` |
| Salida (documentos) | — | — | 🔮 Futuro — Devoluciones, OtroEgreso |

---

## Autenticacion

### Obtener Token JWT

1. Realizar POST a `/api/auth/login` con credenciales
2. Usar el token retornado en el header `Authorization: Bearer <token>`

```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"rutUsuario":"12345678-9","password":"MiClave123!","tenantId":"550e8400-e29b-41d4-a716-446655440000"}'
```

### Claims incluidos en el JWT

| Claim | Tipo | Descripcion |
|-------|------|-------------|
| `sub` | Guid | UsuarioId |
| `tenant_id` | Guid | TenantId del usuario |
| `rut_usuario` | string | RUT del usuario autenticado |
| `name` | string | Nombre completo |
| `role` | string | Rol: `Admin`, `Operador` o `Lectura` |
| `jti` | Guid | Token unique identifier |

### Header requerido por módulos sucursal-scoped

Los módulos que filtran datos por sucursal (Agenda y futuros) requieren:
```
X-Sucursal-Id: {sucursalId-guid}
```
El frontend lo envía automáticamente desde `SucursalContextService.sucursalActual()`. Si falta o es inválido → `400 Bad Request`.

---

## 1. Tenant API

**Auth:** No requerida

### GET /api/tenants

Listar todos los tenants activos.

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "Optica Demo S.A.",
    "rutEmpresa": "76123456-7",
    "direccion": "Av. Principal 1234, Santiago",
    "email": "contacto@opticademo.cl",
    "telefono": "+56 2 2345 6789",
    "activo": true,
    "createdAt": "2026-05-05T10:00:00Z"
  }
]
```

### GET /api/tenants/{id}

Obtener tenant por ID.

**Response 200:** Ver TenantDto arriba
**Response 404:** `"Tenant no encontrado"`

### POST /api/tenants

Crear nuevo tenant.

**Request:**
```json
{
  "nombre": "Optica Central S.A.",
  "rutEmpresa": "96123456-8",
  "direccion": "Av. Libertador 567",
  "email": "admin@opticacentral.cl",
  "telefono": "+56 9 8765 4321"
}
```

**Response 201:**
```json
{
  "id": 2,
  "nombre": "Optica Central S.A.",
  "rutEmpresa": "96123456-8",
  "direccion": "Av. Libertador 567",
  "email": "admin@opticacentral.cl",
  "telefono": "+56 9 8765 4321",
  "activo": true,
  "createdAt": "2026-05-05T12:00:00Z"
}
```

**Response 400:** `"Ya existe un tenant con ese RUT"`

**Validaciones:**
- `nombre`: requerido, max 150 chars
- `rutEmpresa`: requerido, max 20 chars, unico
- `email`: requerido, formato email valido

### PUT /api/tenants/{id}

Actualizar tenant.

**Request:**
```json
{
  "nombre": "Optica Central S.A. (Nuevo Nombre)",
  "direccion": "Nueva Direccion 890",
  "email": "nuevo@opticacentral.cl",
  "telefono": "+56 2 9876 5432",
  "activo": true
}
```

**Response 200:** TenantDto actualizado
**Response 404:** `"Tenant no encontrado"`

### DELETE /api/tenants/{id}

Soft-delete de tenant.

**Response 204:** No Content
**Response 404:** `"Tenant no encontrado"`

---

## 2. Auth API

### POST /api/auth/login

**Auth:** No requerida

**Request:**
```json
{
  "rutUsuario": "12345678-9",
  "password": "MiClaveSegura123!",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Admin Demo",
  "email": "admin@opticademo.cl",
  "rol": "TenantAdmin",
  "expiresAt": "2026-05-05T14:00:00Z"
}
```

**Response 401:** `"Credenciales invalidas"` o `"Usuario desactivado"`

**Notas:**
- `tenantId` es opcional. Si se omite, busca en todos los tenants.
- Las passwords se comparan usando BCrypt.

### POST /api/auth/register

**Auth:** Requiere JWT

**Request:**
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "rutUsuario": "98765432-1",
  "nombre": "Nuevo Usuario",
  "email": "usuario@opticademo.cl",
  "password": "ClaseSegura456!",
  "rol": "Usuario"
}
```

**Response 200:** LoginResponse con token nuevo
**Response 400:** `"Ya existe un usuario con ese RUT en este tenant"` o `"Tenant no encontrado o inactivo"`

**Roles disponibles:**
- `PlatformAdmin` - Acceso global
- `TenantAdmin` - Admin del tenant
- `Usuario` - Usuario estandar (default)

---

## 3. Clientes API

**Auth:** Requiere JWT (el `TenantId` se extrae del token automaticamente)

### GET /api/clientes

Listado paginado con busqueda opcional.

**Query Parameters:**
| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| `page` | int | 1 | Numero de pagina |
| `pageSize` | int | 20 | Items por pagina |
| `search` | string | null | Busqueda por nombre, documento o email |

**Request:**
```
GET /api/clientes?page=1&pageSize=10&search=juan
```

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "tipoCliente": "Persona",
      "numeroDocumento": "12345678-9",
      "nombre": "Juan Perez",
      "direccion": "Calle 123, Santiago",
      "idComuna": 7,
      "celular": "+56 9 1234 5678",
      "mail": "juan@email.com",
      "fechaIngreso": "2026-05-05T10:00:00Z",
      "fechaNacimiento": "1990-05-15",
      "tipoPrevision": "Fonasa",
      "giro": null,
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### GET /api/clientes/{id}

Obtener cliente por ID (valida que pertenezca al tenant del token).

**Response 200:** ClienteDto
**Response 404:** `"Cliente no encontrado"`

### POST /api/clientes

Crear cliente. El `TenantId` se inyecta desde el JWT.

**Request (Persona):**
```json
{
  "tipoCliente": "Persona",
  "numeroDocumento": "12345678-9",
  "nombre": "Juan Perez",
  "direccion": "Calle 123, Santiago",
  "idComuna": 7,
  "celular": "+56 9 1234 5678",
  "mail": "juan@email.com",
  "fechaNacimiento": "1990-05-15",
  "tipoPrevision": "Fonasa",
  "giro": null
}
```

**Request (Empresa):**
```json
{
  "tipoCliente": "Empresa",
  "numeroDocumento": "76123456-7",
  "nombre": "Empresa ABC SpA",
  "direccion": "Av. Industrial 456",
  "idComuna": 5,
  "celular": "+56 2 2345 6789",
  "mail": "contacto@empresaabc.cl",
  "fechaNacimiento": null,
  "tipoPrevision": null,
  "giro": "Comercio al por mayor"
}
```

**Response 201:** ClienteDto creado
**Response 400:** `"Ya existe un cliente con ese documento en este tenant"` o `"TipoCliente debe ser 'Persona' o 'Empresa'"`

### PUT /api/clientes/{id}

Actualizar cliente.

**Request:**
```json
{
  "tipoCliente": "Persona",
  "numeroDocumento": "12345678-9",
  "nombre": "Juan Perez Actualizado",
  "direccion": "Nueva Direccion 456",
  "idComuna": 8,
  "celular": "+56 9 9876 5432",
  "mail": "juan.nuevo@email.com",
  "fechaNacimiento": "1990-05-15",
  "tipoPrevision": "Isapre",
  "giro": null
}
```

**Response 200:** ClienteDto actualizado
**Response 404:** `"Cliente no encontrado"`
**Response 400:** `"Ya existe un cliente con ese documento en este tenant"`

### DELETE /api/clientes/{id}

Soft-delete de cliente.

**Response 204:** No Content
**Response 404:** `"Cliente no encontrado"`

---

## 4. Contactos API

**Auth:** Requiere JWT

### GET /api/contactos/cliente/{clienteId}

Listar contactos de un cliente especifico.

**Response 200:**
```json
[
  {
    "id": 1,
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "clienteId": "3f2e4a1c-8b5d-4e6f-a9c2-1d7e3f4a5b6c",
    "nombre": "Maria Gonzalez",
    "email": "maria@empresaabc.cl",
    "telefono": "+56 9 8765 4321",
    "cargo": "Jefa de Compras",
    "activo": true
  }
]
```

### POST /api/contactos

Crear contacto para cliente empresa.

**Request:**
```json
{
  "clienteId": "3f2e4a1c-8b5d-4e6f-a9c2-1d7e3f4a5b6c",
  "nombre": "Carlos Rodriguez",
  "email": "carlos@empresaabc.cl",
  "telefono": "+56 9 1111 2222",
  "cargo": "Gerente General"
}
```

**Response 200:** ContactoDto creado
**Response 400:** Error de validacion

### PUT /api/contactos/{id}

Actualizar contacto.

**Request:**
```json
{
  "nombre": "Carlos Rodriguez (Actualizado)",
  "email": "c.rodriguez@empresaabc.cl",
  "telefono": "+56 9 1111 2222",
  "cargo": "Director",
  "activo": true
}
```

**Response 200:** ContactoDto actualizado
**Response 404:** `"Contacto no encontrado"`

### DELETE /api/contactos/{id}

Soft-delete de contacto.

**Response 204:** No Content
**Response 404:** `"Contacto no encontrado"`

---

## 5. Anamnesis API

**Auth:** Requiere JWT (TenantId extraído del token)

Historial de salud del paciente. Siempre asociado a un ClienteId. Todas las operaciones son tenant-aisladas.

### GET /api/Anamnesis?clienteId={uuid}

Listar registros de anamnesis de un cliente.

**Response 200:**
```json
[
  {
    "anamnesisId": "1d0f35a4-83a2-4a2b-8d7e-3f9b1c2e5d6f",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "clienteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "hipertension": true,
    "diabetes": false,
    "alergias": true,
    "usaLentes": true,
    "observacion": "Paciente refiere alergia estacional.",
    "fechaRegistro": "2026-05-15T10:00:00Z",
    "createdAt": "2026-05-15T10:00:00Z",
    "createdBy": "12345678-9"
  }
]
```

### GET /api/Anamnesis/{id}

Obtener anamnesis por ID.

**Response 200:** AnamnesisDto  
**Response 404:** `"Anamnesis no encontrada"`

### POST /api/Anamnesis

Crear nueva anamnesis.

**Request:**
```json
{
  "clienteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "hipertension": true,
  "diabetes": false,
  "alergias": true,
  "usaLentes": true,
  "observacion": "Notas opcionales."
}
```

**Response 200:** `{ "id": "uuid-del-nuevo-registro" }`

### PUT /api/Anamnesis/{id}

Actualizar anamnesis existente.

**Request:**
```json
{
  "hipertension": true,
  "diabetes": true,
  "alergias": true,
  "usaLentes": false,
  "observacion": "Diagnóstico actualizado."
}
```

**Response 200:** sin body

### DELETE /api/Anamnesis/{id}

Soft-delete de anamnesis.

**Response 204:** No Content  
**Response 404:** `"Anamnesis no encontrada"`

---

---

## 6. RecetaCristales API

**Auth:** Requiere JWT (TenantId extraído del token)

Receta óptica del cliente (lejos, cerca, DP y ADD). Siempre asociada a un ClienteId. Múltiples recetas por cliente (historial).

### GET /api/RecetaCristales?clienteId={uuid}

Listar recetas de un cliente, ordenadas por FechaIngreso DESC.

**Response 200:**
```json
[
  {
    "recetaCristalesId": "7f4a1b2c-3d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "clienteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "lejosODEsferico": "-1.50",
    "lejosODCilindro": "-0.50",
    "lejosODEje": "90",
    "lejosOIEsferico": "-1.75",
    "checkLejos": true,
    "checkCerca": false,
    "checkCristalesLaboratorio": true,
    "checkUrgente": false,
    "fechaIngreso": "2026-05-15T10:00:00Z",
    "createdAt": "2026-05-15T10:00:00Z",
    "createdBy": "12345678-9"
  }
]
```

### GET /api/RecetaCristales/{id}

Obtener detalle de una receta por ID.

**Response 200:** RecetaCristalesDto  
**Response 404:** `"RecetaCristales no encontrada"`

### POST /api/RecetaCristales

Registrar una nueva receta de cristales.

**Request:**
```json
{
  "clienteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lejosODEsferico": "-1.50",
  "lejosODCilindro": "-0.50",
  "lejosODEje": "90",
  "lejosODObservacion": null,
  "lejosOIEsferico": "-1.75",
  "lejosOICilindro": null,
  "lejosOIEje": null,
  "lejosDPEsferico": "63",
  "cercaODEsferico": null,
  "cercaODCilindro": null,
  "lejosADDEsfera": null,
  "checkLejos": true,
  "checkCerca": false,
  "checkCristalesLaboratorio": true,
  "checkUrgente": false,
  "fechaIngreso": null
}
```

> `fechaIngreso` es opcional. Si se omite, el backend usa `DateTime.UtcNow`.  
> Todos los campos de medida son opcionales (`string?`). Solo `clienteId` y los flags (`bool`) son requeridos.

**Response 201:** `{ "id": "uuid-nueva-receta" }`

### PUT /api/RecetaCristales/{id}

Actualizar receta existente. Mismos campos que POST excepto `clienteId`.

**Response 204:** No Content  
**Response 404:** `"RecetaCristales no encontrada"`

### DELETE /api/RecetaCristales/{id}

Soft-delete de receta (IsDeleted = true).

**Response 204:** No Content  
**Response 404:** `"RecetaCristales no encontrada"`

---

---

## 7. Sucursales API

**Auth:** Requiere JWT (TenantId extraído del token)

Sucursales de la óptica. Un tenant puede tener múltiples sucursales. El campo `Matriz` indica la sede principal.

### GET /api/sucursales

Listar todas las sucursales activas del tenant autenticado, ordenadas por nombre.

**Response 200:**
```json
[
  {
    "sucursalId": "4e9f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Sucursal Centro",
    "direccion": "Av. Principal 123, Santiago",
    "telefono": "+56 2 2345 6789",
    "matriz": true,
    "fechaRegistro": "2026-05-19T10:00:00Z",
    "createdAt": "2026-05-19T10:00:00Z",
    "createdBy": "12345678-9"
  }
]
```

### GET /api/sucursales/{id}

Obtener detalle de una sucursal por ID.

**Response 200:** SucursalDto  
**Response 404:** `"Sucursal {id} no encontrada."`

### POST /api/sucursales

Crear una nueva sucursal.

**Request:**
```json
{
  "nombre": "Sucursal Norte",
  "direccion": "Calle Los Álamos 456",
  "telefono": "+56 9 8765 4321",
  "matriz": false
}
```

**Response 201:** `{ "id": "uuid-nueva-sucursal" }`

### PUT /api/sucursales/{id}

Actualizar datos de una sucursal existente.

**Request:** Mismo body que POST.

**Response 204:** No Content  
**Response 404:** `"Sucursal {id} no encontrada."`

### DELETE /api/sucursales/{id}

Soft-delete de sucursal (IsDeleted = true).

**Response 204:** No Content  
**Response 404:** `"Sucursal {id} no encontrada."`

---

---

## 8. Usuarios API

**Auth:** Requiere JWT (TenantId extraído del token)

Gestión de usuarios del tenant. Incluye CRUD, cambio de contraseña y asignación de sucursales (relación M:N).

### GET /api/usuarios

Lista todos los usuarios activos del tenant, con sus sucursales asignadas.

**Response 200:**
```json
[
  {
    "usuarioId": "b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "rutUsuario": "12345678-9",
    "nombre": "Juan Pérez",
    "email": "juan@opticademo.cl",
    "rol": "Operador",
    "fechaIngreso": "2026-05-19T10:00:00Z",
    "sucursales": [
      { "sucursalId": "4e9f1a2b-...", "nombre": "Sucursal Centro" }
    ],
    "createdAt": "2026-05-19T10:00:00Z",
    "createdBy": "Admin Demo"
  }
]
```

### GET /api/usuarios/{id}

**Response 200:** UsuarioDto con sucursales asignadas
**Response 404:** `"Usuario {id} no encontrado."`

### POST /api/usuarios

Crea un usuario. La contraseña se hashea con BCrypt.

**Request:**
```json
{
  "rutUsuario": "98765432-1",
  "nombre": "María López",
  "email": "maria@opticademo.cl",
  "password": "ClaveSegura123",
  "rol": "Operador"
}
```

**Response 201:** `{ "id": "uuid-nuevo-usuario" }`

**Roles válidos:** `Admin` · `Operador` · `Lectura`

### PUT /api/usuarios/{id}

Actualiza Nombre, Email y Rol. No modifica contraseña ni RUT.

**Response 204:** No Content
**Response 404:** `"Usuario {id} no encontrado."`

### DELETE /api/usuarios/{id}

Soft delete (IsDeleted = true).

**Response 204:** No Content

### PUT /api/usuarios/{id}/password

Cambia la contraseña (nueva contraseña en texto plano, hasheada internamente).

**Request:** `{ "newPassword": "NuevaClave456" }`
**Response 204:** No Content

### POST /api/usuarios/{id}/sucursales

Asigna una sucursal al usuario.

**Request:** `{ "sucursalId": "4e9f1a2b-..." }`
**Response 204:** No Content
**Response 409:** `"La sucursal ya está asignada al usuario."`

### DELETE /api/usuarios/{id}/sucursales/{sucursalId}

Desasigna una sucursal del usuario.

**Response 204:** No Content
**Response 404:** `"La sucursal no está asignada al usuario."`

---

## 9. Agenda API

**Auth:** Requiere JWT  
**Header adicional:** `X-Sucursal-Id: {guid}` — sucursal activa del usuario (obligatorio en todos los endpoints)

Estados válidos: `Pendiente` · `Confirmada` · `Atendida` · `Cancelada` · `NoShow`

### GET /api/agenda

Lista las citas de la sucursal activa. Filtros opcionales por fecha, estado y profesional.

**Query Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `desde` | DateTime | Filtro fecha inicio (inclusive) |
| `hasta` | DateTime | Filtro fecha fin (inclusive) |
| `estado` | string | Pendiente / Confirmada / Atendida / Cancelada / NoShow |
| `usuarioId` | Guid | Filtrar por profesional asignado |

**Response 200:**
```json
[
  {
    "agendaId":        "7f4a1b2c-3d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "sucursalId":      "4e9f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
    "sucursalNombre":  "Sucursal Centro",
    "clienteId":       "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "clienteNombre":   "Juan Pérez",
    "usuarioId":       "b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27",
    "usuarioNombre":   "Dra. López",
    "fechaHora":       "2026-05-21T10:30:00Z",
    "duracionMinutos": 30,
    "motivo":          "Control visual anual",
    "estado":          "Pendiente",
    "observaciones":   null,
    "createdAt":       "2026-05-20T15:00:00Z",
    "updatedAt":       null
  }
]
```

### GET /api/agenda/{id}

**Response 200:** AgendaDto  
**Response 404:** `"Agenda {id} no encontrada."`

### POST /api/agenda

Crea una cita. El estado inicial siempre es `Pendiente`. `SucursalId` se toma del header `X-Sucursal-Id`.

**Request:**
```json
{
  "clienteId":       "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "usuarioId":       "b3785e25-9c3f-4aa6-9e2b-a4a6f13e6c27",
  "fechaHora":       "2026-05-21T10:30:00Z",
  "duracionMinutos": 30,
  "motivo":          "Control visual anual",
  "observaciones":   null
}
```

> `usuarioId` es opcional. Se puede asignar el profesional después con `PUT`.

**Response 201:** `Location: /api/agenda/{id}`

### PUT /api/agenda/{id}

Actualiza fecha/hora, duración, profesional y observaciones. No cambia el estado.

**Response 204:** No Content  
**Response 404:** `"Agenda {id} no encontrada."`

### PATCH /api/agenda/{id}/estado

Cambia el estado de la cita.

**Request:** `{ "estado": "Confirmada" }`

**Response 204:** No Content  
**Response 409:** Estado inválido (no es uno de los 5 valores permitidos)

### DELETE /api/agenda/{id}

Soft delete (IsDeleted = true).

**Response 204:** No Content  
**Response 404:** `"Agenda {id} no encontrada."`

---

## 10. Categorías de Producto API

**Auth:** Requiere JWT

### GET /api/categorias-producto
Lista todas las categorías del tenant.

**Response 200:** `ProductoCategoriaDto[]`

### POST /api/categorias-producto
**Request:** `{ "nombre": "Monturas" }`
**Response 201:** `{ "id": "uuid" }`

### PUT /api/categorias-producto/{id}
**Request:** `{ "nombre": "Monturas Metálicas" }`
**Response 204:** No Content

### DELETE /api/categorias-producto/{id}
**Response 204:** No Content | **409:** Si existen productos en esa categoría

---

## 11. Productos API

**Auth:** Requiere JWT  
**Nota de diseño:** Catálogo puro. Precios y stock son módulos separados (`018_` y `019_`).

### GET /api/productos
Lista paginada. Filtros opcionales: `tipo` (Almacenable/Consumible/Servicio), `categoriaId`, `busqueda`.

**Response 200:**
```json
{
  "items": [
    {
      "productoId": "uuid",
      "tenantId": "uuid",
      "categoriaId": "uuid",
      "categoriaNombre": "Monturas",
      "nombre": "Marco Rayban RB4165",
      "descripcion": "Marco acetato negro",
      "tipoProducto": "Almacenable",
      "codigoInterno": "RB-4165",
      "activo": true,
      "variantes": [],
      "createdAt": "2026-05-22T10:00:00Z"
    }
  ],
  "totalCount": 1, "page": 1, "pageSize": 20, "totalPages": 1
}
```

### GET /api/productos/{id}
Retorna producto con variantes incluidas.

### POST /api/productos
**Request:** `{ "categoriaId"?: "uuid", "nombre": "...", "descripcion"?: "...", "tipoProducto": "Almacenable|Consumible|Servicio", "codigoInterno"?: "..." }`
**Response 201:** `{ "id": "uuid" }` | **409:** CodigoInterno duplicado

### PUT /api/productos/{id}
**Request:** igual que POST + `"activo": bool`
**Response 204:** No Content

### DELETE /api/productos/{id}
**Response 204:** No Content

### GET /api/productos/{id}/variantes
**Response 200:** `ProductoVarianteDto[]`

### POST /api/productos/{id}/variantes
Solo para TipoProducto ≠ `Servicio`.
**Request:** `{ "nombre": "Negra Talla M", "codigoBarras"?: "..." }`
**Response 201:** `{ "id": "uuid" }` | **409:** CodigoBarras duplicado | **409:** Servicio no admite variantes

### PUT /api/productos/{id}/variantes/{varianteId}
**Request:** `{ "nombre": "...", "codigoBarras"?: "...", "activo": bool }`
**Response 204:** No Content

### DELETE /api/productos/{id}/variantes/{varianteId}
**Response 204:** No Content

---

## 12. Roles API

**Auth:** Requiere JWT  
**Nota:** Catálogo compartido. Solo lectura — sin CRUD.

### GET /api/roles

**Response 200:**
```json
[
  { "rolId": 1, "nombre": "Admin" },
  { "rolId": 2, "nombre": "Operador" },
  { "rolId": 3, "nombre": "Lectura" }
]
```

---

## 13. Formas de Pago API

**Auth:** Requiere JWT  
**Nota:** Catálogo compartido. Solo lectura — sin CRUD.

### GET /api/forma-pagos

**Response 200:**
```json
[
  { "formaPagoId": 1, "nombre": "Efectivo" },
  { "formaPagoId": 2, "nombre": "Tarjeta Débito" },
  { "formaPagoId": 3, "nombre": "Tarjeta Crédito" },
  { "formaPagoId": 4, "nombre": "Transferencia" },
  { "formaPagoId": 5, "nombre": "Cheque" }
]
```

---

## 14. Stock API

**Auth:** Requiere JWT  
**Header adicional:** `X-Sucursal-Id: {guid}` (obligatorio)

### GET /api/stock

Lista el stock actual de la sucursal activa (todas las variantes con cantidad > 0 o registradas).

**Response 200:** `StockDto[]` — incluye `varianteId`, `productoNombre`, `varianteNombre`, `codigoBarras`, `cantidad`, `stockMinimo`, `bajoStock`.

### GET /api/stock/{varianteId}

Obtener stock de una variante específica en la sucursal activa.

### POST /api/stock/movimiento

Registrar movimiento directo (Salida o Ajuste). Las Entradas van por Documentos de Entrada.

**Request:**
```json
{
  "varianteId": "uuid",
  "tipoMovimiento": "Salida",
  "cantidad": 2,
  "observacion": "Venta mostrador"
}
```
**Tipos válidos (directos):** `Salida`, `Ajuste`  
**Response 200:** MovimientoStockDto

### GET /api/stock/movimientos

Lista el historial de movimientos de la sucursal activa (paginado).

---

## 15. Documentos de Entrada API

**Auth:** Requiere JWT  
**Header adicional:** `X-Sucursal-Id: {guid}` (obligatorio)

### GET /api/documentos-stock

Lista documentos de la sucursal (paginado). Filtros: `tipo`, `estado`.

**Response 200:** `PagedResult<DocumentoStockDto>`

### GET /api/documentos-stock/{id}

Obtener documento con líneas incluidas.

### POST /api/documentos-stock

Crea y confirma un documento de entrada atómicamente. Genera `MovimientoStock(Entrada)` por línea y actualiza `PrecioProducto`.

**Request:**
```json
{
  "tipoDocumento": "FacturaCompra",
  "numeroDocumento": "F-001234",
  "proveedor": "Distribuidora Óptica SpA",
  "fecha": "2026-05-24",
  "lineas": [
    {
      "varianteId": "uuid",
      "cantidad": 10,
      "precioCosto": 15000
    }
  ]
}
```
**Tipos válidos:** `FacturaCompra`, `BoletaCompra`, `OtroIngreso`  
**Response 201:** `{ "id": "uuid" }`

### POST /api/documentos-stock/{id}/anular

Anula un documento confirmado. Genera movimientos compensatorios de Ajuste negativo. Los precios **no** se revierten.

**Response 204:** No Content  
**Response 409:** Si el documento ya está anulado

---

## 16. Atenciones API

**Auth:** Requiere JWT

### GET /api/atenciones

Lista atenciones del tenant. Filtros: `sucursalId`, `estado`, `desde`, `hasta`.

**Query:** `?estado=EnEspera&sucursalId=uuid`  
**Response 200:** `PagedResult<AtencionDto>`

**Estados válidos:** `EnEspera` · `EnAtencion` · `Finalizada`

### GET /api/atenciones/{id}

Detalle completo con Anamnesis y RecetaCristales anidadas.

### POST /api/atenciones/iniciar

**Crea atómicamente:** Atención + Anamnesis + RecetaCristales en un solo request.  
Acepta `agendaId` opcional para vincular con la cita previa.

**Request:**
```json
{
  "agendaId": "uuid-opcional",
  "sucursalId": "uuid",
  "clienteId": "uuid",
  "motivoConsulta": "Control anual",
  "anamnesis": {
    "hipertension": false,
    "diabetes": false,
    "alergias": true,
    "usaLentes": true,
    "observacion": "Alergia estacional"
  },
  "receta": {
    "lejosODEsferico": "-1.50",
    "lejosODCilindro": "-0.50",
    "lejosODEje": "90",
    "checkLejos": true,
    "checkCerca": false,
    "checkCristalesLaboratorio": false,
    "checkUrgente": false
  }
}
```

**Response 201:** `{ "atencionId": "uuid", "anamnesisId": "uuid", "recetaId": "uuid" }`

### POST /api/atenciones/nueva

Crea una atención directa sin cita previa (sin Anamnesis/Receta iniciales).

### PATCH /api/atenciones/{id}/estado

Cambia el estado de la atención.

**Request:** `{ "estado": "EnAtencion" }`  
**Response 204:** No Content

---

## Respuestas de Error Estandar

### Formato de error
Todos los errores retornan un string descriptivo en el body:
```json
"Mensaje descriptivo del error"
```

### Codigos de estado HTTP

| Status | Significado | Causa comun |
|--------|-------------|-------------|
| 200 | OK | Request exitoso |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Delete exitoso |
| 400 | Bad Request | Validacion fallida, datos invalidos |
| 401 | Unauthorized | Token ausente, invalido o expirado |
| 404 | Not Found | Recurso no encontrado o no pertenece al tenant |

---

## Ejemplos de uso con cURL

### Flujo completo: Login -> Crear Cliente

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"rutUsuario":"12345678-9","password":"MiClave123!","tenantId":"550e8400-e29b-41d4-a716-446655440000"}' \
  | jq -r '.token')

# 2. Crear cliente
curl -X POST https://localhost:5001/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipoCliente": "Persona",
    "numeroDocumento": "11111111-1",
    "nombre": "Maria Lopez",
    "mail": "maria@email.com",
    "celular": "+56 9 5555 6666"
  }'

# 3. Listar clientes
curl -X GET "https://localhost:5001/api/clientes?page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Crear tenant y usuario admin

```bash
# 1. Crear tenant
curl -X POST https://localhost:5001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Optica Nueva",
    "rutEmpresa": "99999999-9",
    "email": "admin@mioptica.cl"
  }'

# 2. Registrar usuario admin
curl -X POST https://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "660e8400-e29b-41d4-a716-446655441111",
    "rutUsuario": "11111111-1",
    "nombre": "Admin Optica",
    "email": "admin@mioptica.cl",
    "password": "Admin123!",
    "rol": "TenantAdmin"
  }'
```

---

## 17. Órdenes de Trabajo API

**Auth:** Requiere JWT  
**Header adicional:** `X-Sucursal-Id: {guid}` — obligatorio en POST, opcional (filtra por sucursal) en GET

**Etapas válidas:** `Ingresado` · `EnProceso` · `Montaje` · `Laboratorio` · `Calidad` · `Despacho` · `Entregado`  
**EstadoPago:** `Pendiente` · `Pagado`  
**TipoFacturacion:** `Particular` · `Empresa`

### GET /api/ordenes-trabajo

Lista paginada. Filtros opcionales: `numeroOT`, `clienteId`, `estadoPago`, `etapaOT`. Si se envía `X-Sucursal-Id`, filtra por sucursal.

**Query Parameters:** `page` (default 1) · `pageSize` (default 50) · `numeroOT?` · `clienteId?` · `estadoPago?` · `etapaOT?`

**Response 200:** `PagedResult<OrdenTrabajoDto>`

### GET /api/ordenes-trabajo/verificar-numero

Verifica si un `numeroOT` ya está en uso en el tenant.

**Query Parameters:** `numeroOT` (requerido) · `excluirId?` (GUID — excluye esta OT al editar)

**Response 200:** `{ "existe": false }`

### GET /api/ordenes-trabajo/{id}

Detalle completo de la OT incluyendo lineas, pagos, cuotas y bitácora.

**Response 200:** `OrdenTrabajoDetalleDto`  
**Response 404:** OT no encontrada o no pertenece al tenant.

### POST /api/ordenes-trabajo

Crea la OT atómicamente: cabecera + lineas + abonos iniciales + cuotas + primer registro en bitácora (etapa Ingresado).

**Headers requeridos:** `X-Sucursal-Id: {guid}`

**Request:**
```json
{
  "numeroOT":          "LAB-001234",
  "clienteId":         "uuid",
  "tipoFacturacion":   "Particular",
  "empresaClienteId":  null,
  "beneficiario":      null,
  "atencionId":        null,
  "recetaCristalesId": null,
  "fechaEntrega":      "2026-06-10",
  "horaEntrega":       "14:00:00",
  "descuento":         0,
  "numeroCuotas":      2,
  "fechaInicioCuotas": "2026-07-01",
  "observacion":       null,
  "lineas": [
    { "productoId": "uuid", "cantidad": 1, "valorUnitario": 120000, "comentario": null }
  ],
  "abonos": [
    { "formaPagoId": 1, "monto": 50000, "fechaPago": "2026-06-05", "observacion": null }
  ]
}
```

**Response 201:** `{ "otId": "uuid" }` + header `Location`  
**Response 400:** Header X-Sucursal-Id ausente o datos inválidos.  
**Response 409:** NumeroOT ya existe en el tenant.

### PUT /api/ordenes-trabajo/{id}

Actualiza la OT. Las lineas y abonos se reemplazan completamente (soft-delete + re-insert). No modifica SucursalId, AtencionId ni RecetaCristalesId.

**Response 204:** No Content  
**Response 404/409:** Ver POST.

### DELETE /api/ordenes-trabajo/{id}

Soft-delete (IsDeleted = true). La bitácora queda intacta.

**Response 204:** No Content  
**Response 404:** OT no encontrada.

### PATCH /api/ordenes-trabajo/{id}/etapa

Cambia la etapa de la OT y registra el cambio en la bitácora.

**Request:** `{ "etapa": "Montaje", "observacion": "Enviado al montajista" }`

**Response 204:** No Content  
**Response 400:** Etapa inválida.  
**Response 404:** OT no encontrada.

### POST /api/ordenes-trabajo/{id}/pagos

Registra un pago posterior. Actualiza TotalAbonado, Saldo y EstadoPago automáticamente.

**Request:** `{ "formaPagoId": 2, "monto": 100000, "fechaPago": "2026-06-12", "observacion": null }`

**Response 200:** `{ "pagoId": "uuid" }`  
**Response 404:** OT no encontrada.

---

## Swagger

Documentacion interactiva disponible en:
- **Development:** `https://localhost:5001/swagger`

El Swagger UI permite explorar todos los endpoints, ver schemas y realizar requests de prueba.
