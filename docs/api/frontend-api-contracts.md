# Frontend API Contracts - OPT System

This document describes the API contracts between the Angular frontend and .NET backend.

## Base URL

```
Development: http://localhost:5005/api
Production: TBD
```

## Authentication

### Login

**Endpoint**: `POST /api/Auth/login`

**Request Body**:
```typescript
// src/app/models/auth.ts
export interface LoginRequest {
  rutUsuario: string;
  password: string;
  tenantId?: number;  // Optional
}
```

**Frontend Implementation**:
```typescript
// src/app/services/auth.ts
login(credentials: LoginRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials);
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "userId": 1,
  "userName": "admin",
  "tenantId": 1
}
```

**Storage**: JWT token stored in `localStorage` as `token`

---

## Clientes (Clients)

### Get All Clients (Paginated)

**Endpoint**: `GET /api/Clientes`

**Query Parameters**:
- `page` (default: 1)
- `pageSize` (default: 20)
- `search` (optional)

**Frontend Implementation**:
```typescript
// src/app/services/cliente.ts
getClientes(page = 1, pageSize = 20, search?: string): Observable<any> {
  let params: any = { page, pageSize };
  if (search) params.search = search;
  return this.http.get(this.apiUrl, { params });
}
```

**Expected Response**:
```json
{
  "items": [
    {
      "clienteId": 1,
      "tenantId": 1,
      "tipoCliente": "Persona",
      "numeroDocumento": "12345678-9",
      "nombre": "Juan Pérez",
      "direccion": "Av. Principal 123",
      "idComuna": 1,
      "celular": "+56912345678",
      "mail": "juan@email.com",
      "fechaNacimiento": "1990-05-15",
      "tipoPrevision": "FONASA",
      "giro": null
    }
  ],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

### Get Client by ID

**Endpoint**: `GET /api/Clientes/{id}`

**Frontend Implementation**:
```typescript
getCliente(id: number): Observable<Cliente> {
  return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
}
```

**Expected Response**: Single `Cliente` object (see above)

---

### Create Client

**Endpoint**: `POST /api/Clientes`

**Request Body**:
```typescript
// src/app/models/cliente.ts
export interface CreateClienteDto {
  tenantId: number;
  tipoCliente: string;  // "Persona" | "Empresa"
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  idComuna?: number;
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;  // Format: YYYY-MM-DD
  tipoPrevision?: string;
  giro?: string;  // Only for Empresa
}
```

**Frontend Implementation**:
```typescript
createCliente(cliente: CreateClienteDto): Observable<any> {
  return this.http.post(this.apiUrl, cliente);
}
```

---

### Update Client

**Endpoint**: `PUT /api/Clientes/{id}`

**Request Body**:
```typescript
export interface UpdateClienteDto {
  tipoCliente?: string;
  numeroDocumento?: string;
  nombre?: string;
  direccion?: string;
  idComuna?: number;
  celular?: string;
  mail?: string;
  fechaNacimiento?: string;
  tipoPrevision?: string;
  giro?: string;
}
```

**Frontend Implementation**:
```typescript
updateCliente(id: number, cliente: UpdateClienteDto): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, cliente);
}
```

---

### Delete Client (Soft Delete)

**Endpoint**: `DELETE /api/Clientes/{id}`

**Frontend Implementation**:
```typescript
deleteCliente(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
```

**Note**: This performs a soft delete (sets `IsDeleted = true`), not a physical deletion.

---

## Tenants

### Get All Tenants

**Endpoint**: `GET /api/Tenants`

**Frontend**: Not yet implemented in Angular (planned)

---

## Contactos (Contacts)

### Get Contacts by Cliente

**Endpoint**: `GET /api/Contactos/cliente/{clienteId}`

**Frontend**: Not yet implemented (planned for future session)

### Create Contacto

**Endpoint**: `POST /api/Contactos`

**Request Body**:
```typescript
export interface CreateContactoDto {
  tenantId: number;
  clienteId: number;
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
}
```

**Frontend**: Not yet implemented

---

## Error Responses

All endpoints may return errors in this format:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "NumeroDocumento": ["El número de documento ya existe"],
    "Mail": ["El formato del email no es válido"]
  }
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend API Service Layer

### Auth Service
**Location**: `src/app/services/auth.ts`
- `login(credentials: LoginRequest): Observable<any>`
- `register(user: RegisterUserDto): Observable<any>`

### Cliente Service
**Location**: `src/app/services/cliente.ts`
- `getClientes(page?, pageSize?, search?): Observable<any>`
- `getCliente(id: number): Observable<Cliente>`
- `createCliente(cliente: CreateClienteDto): Observable<any>`
- `updateCliente(id: number, cliente: UpdateClienteDto): Observable<any>`
- `deleteCliente(id: number): Observable<any>`

---

## TODO: HTTP Interceptor

A planned improvement is to create an HTTP Interceptor that automatically attaches the JWT token to all API requests:

```typescript
// Future: src/app/services/auth.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

This will be added in the next session.
