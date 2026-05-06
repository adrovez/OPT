# 2026-05-05 - Backend Middleware y Correcciones Arquitectónicas

## Status
Accepted

## Context
En la sesión 4 se completó el pipeline de middleware para el backend .NET 10 y se corrigieron
problemas en los scripts SQL. Los controllers tenían try/catch dispersos y no había manejo
global de excepciones. Los scripts SQL tenían FKs con comportamiento por defecto ambiguo.

---

## Decisiones de Middleware

### 1. Orden del pipeline en Program.cs
**Decisión**:
```
CorrelationId → ExceptionHandling → Swagger(dev) → CORS
→ HttpsRedirection → Authentication → Authorization
→ TenantValidation → MapControllers
```
**Razón**: El orden es determinante para que cada capa funcione correctamente.
- `CorrelationId` primero: todos los logs del request llevan el mismo ID
- `ExceptionHandling` segundo: envuelve todo el pipeline y captura cualquier excepción
- `TenantValidation` después de Authorization: requiere que `context.User` esté poblado

### 2. Formato de errores: RFC 7807 ProblemDetails
**Decisión**: Usar `ProblemDetails` como formato estándar de errores en `ExceptionHandlingMiddleware`
**Razón**: Es el estándar de .NET para APIs REST. Compatible con clientes Angular que esperan
un contrato de error consistente. Incluye `status`, `title`, `detail`, `instance`.

**Mapeo de excepciones**:
| Excepción | HTTP | Uso |
|-----------|------|-----|
| `ValidationException` (FluentValidation) | 400 | Datos de entrada inválidos |
| `UnauthorizedAccessException` | 401 | Credenciales inválidas en login |
| `KeyNotFoundException` | 404 | Entidad no encontrada (o de otro tenant) |
| `InvalidOperationException` | 409 | Regla de negocio violada (ej. RUT duplicado) |
| `Exception` (catch-all) | 500 | Error inesperado — detalle NO expuesto al cliente |

**Consecuencias**: Los controllers NO deben tener try/catch para estas excepciones.
Lanzar la excepción semánticamente correcta desde los handlers es suficiente.

### 3. TenantValidationMiddleware como segunda línea de defensa
**Decisión**: Middleware dedicado que valida `tenant_id` claim > 0 en rutas autenticadas
**Razón**: JwtBearer valida la firma pero no el contenido semántico de los claims.
Un token podría tener `tenant_id = 0` o ausente y pasar la verificación criptográfica.
**Consecuencia**: Cualquier token con TenantId inválido recibe 403 antes de llegar a los handlers.

### 4. IPasswordHasher interface en Application
**Decisión**: Crear `IPasswordHasher` en `OPT.Application.Interfaces`, implementar con BCrypt en Infrastructure
**Razón**: La capa Application no debe depender de `BCrypt.Net-Next` directamente.
Clean Architecture exige que Application solo conozca abstracciones.
**Consecuencia**: Fácil reemplazar el algoritmo de hash sin tocar casos de uso.

### 5. Controllers sin try/catch
**Decisión**: Controllers delegan completamente el manejo de errores al ExceptionHandlingMiddleware
**Razón**: Elimina código duplicado, centraliza la política de errores, simplifica los controllers.
**Consecuencia**: Los handlers de Application deben lanzar excepciones semánticamente correctas.

---

## Correcciones SQL

### 6. OPT_Contacto FK cascade behavior
**Decisión**:
- FK a OPT_Tenant → `ON DELETE NO ACTION` (explícito)
- FK a OPT_Cliente → `ON DELETE CASCADE`
**Razón**: OPT_Cliente ya tiene `ON DELETE CASCADE` desde OPT_Tenant. Si Contacto también
tuviera CASCADE desde Tenant, SQL Server detecta "múltiples rutas de cascada" y rechaza la tabla.
La cadena de cascada correcta es: Tenant → Cliente → Contacto.

### 7. OPT_Usuario.Rol debe ser NOT NULL con DEFAULT
**Decisión**: `[Rol] NVARCHAR(50) NOT NULL DEFAULT 'Operador'`
**Razón**: Un usuario sin rol rompe la autorización. El default 'Operador' es el rol mínimo.
Roles válidos: `'Admin'`, `'Operador'`, `'Lectura'`.

### 8. Datos iniciales idempotentes
**Decisión**: Scripts de datos usan `IF NOT EXISTS` antes de cada INSERT
**Razón**: Permite re-ejecutar scripts en entornos de dev/QA sin duplicar datos.
