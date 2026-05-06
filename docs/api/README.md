# OPT SaaS - API Documentation

## Overview

**Base URL:** `https://localhost:5001`
**Version:** v1
**Authentication:** JWT Bearer (except endpoints marcados como Publico)
**Content-Type:** `application/json`

## Modulos Disponibles

| Modulo | Base Path | Auth | Estado |
|--------|-----------|------|--------|
| Tenant | `/api/tenants` | No | Completo |
| Auth | `/api/auth` | Parcial | Completo |
| Clientes | `/api/clientes` | Si (JWT) | Completo |
| Contactos | `/api/contactos` | Si (JWT) | Completo |

---

## Autenticacion

### Obtener Token JWT

1. Realizar POST a `/api/auth/login` con credenciales
2. Usar el token retornado en el header `Authorization: Bearer <token>`

```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"rutUsuario":"12345678-9","password":"MiClave123!","tenantId":1}'
```

### Claims incluidos en el JWT

| Claim | Tipo | Descripcion |
|-------|------|-------------|
| `sub` | string | UsuarioId |
| `email` | string | Email del usuario |
| `UserId` | string | ID numerico del usuario |
| `TenantId` | string | ID del tenant asignado |
| `role` | string | Rol del usuario |
| `jti` | string | Token unique identifier |

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
  "tenantId": 1
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "tenantId": 1,
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
  "tenantId": 1,
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
      "tenantId": 1,
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
    "tenantId": 1,
    "clienteId": 5,
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
  "clienteId": 5,
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
  -d '{"rutUsuario":"12345678-9","password":"MiClave123!","tenantId":1}' \
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
    "tenantId": 2,
    "rutUsuario": "11111111-1",
    "nombre": "Admin Optica",
    "email": "admin@mioptica.cl",
    "password": "Admin123!",
    "rol": "TenantAdmin"
  }'
```

---

## Swagger

Documentacion interactiva disponible en:
- **Development:** `https://localhost:5001/swagger`

El Swagger UI permite explorar todos los endpoints, ver schemas y realizar requests de prueba.
