# 2026-05-05-diseno-base-datos-inicial.md

## Status
Accepted

## Context
Se inició la creación de la base de datos para la migración de OPT a SaaS. Se necesitaba definir la estructura inicial de tablas basándose en la `Propuesta_Migracion_OPT_SaaS` y el código legacy en `old/Fuente/`.

## Decisions

### 1. Nombre de base de datos
- **Decisión**: `dbOPT` en lugar de `OPT_v2` (propuesta original)
- **Razón**: Solicitado explícitamente por el equipo

### 2. Unificación de OPT_Cliente y OPT_Empresa
- **Decisión**: Mantener una sola tabla `OPT_Cliente` con campo `TipoCliente` ('Persona' | 'Empresa') en lugar de tablas separadas
- **Razón**: Simplificar el modelo de datos, evitar joins innecesarios, los campos específicos de cada tipo pueden ser NULL
- **Consecuencias**: 
  - Campos como `FechaNacimiento`, `TipoPrevision` solo aplican a Persona
  - Campo `Giro` solo aplica a Empresa
  - Se usa constraint CHECK para validar TipoCliente

### 3. Eliminación de OPT_Empresa
- **Decisión**: No crear tabla OPT_Empresa
- **Razón**: Solicitado explícitamente, la lógica de empresa se maneja dentro de OPT_Cliente

### 4. Campo NumeroDocumento
- **Decisión**: Usar `NumeroDocumento` en lugar de `RutCliente`
- **Razón**: Más genérico, aplica tanto a personas (RUT) como empresas (RUT empresa)
- **Restricción**: UNIQUE por TenantId (índice filtrado con IsDeleted = 0)

### 5. Tabla OPT_Contacto
- **Decisión**: Crear tabla separada para contactos de clientes tipo Empresa
- **Campos**: ContactoId, TenantId, ClienteId, Nombre, Email, Telefono, Cargo, Activo
- **Relación**: FK a OPT_Cliente (solo clientes con TipoCliente='Empresa')
- **Nota**: El script fue modificado manualmente después de su creación automática

### 6. Multi-tenant desde el inicio
- **Decisión**: Incluir `TenantId` en todas las tablas de negocio
- **Razón**: La propuesta SaaS lo requiere, mejor tenerlo desde el inicio

### 7. Scripts separados por tabla
- **Decisión**: Un script por tabla en lugar de un script monolítico
- **Razón**: Facilita mantenimiento, versionado y ejecución individual
- **Numeración**: Secuencial (000_, 001_, 002_, etc.)

### 8. Auditoría estándar
- **Decisión**: Todas las tablas incluyen `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`
- **Razón**: Requerimiento de la propuesta para trazabilidad completa

## Consequences
- Modelo de datos más limpio y preparado para SaaS multi-tenant
- Scripts modulares fáciles de mantener y ejecutar
- Documentación actualizada para contexto en futuras sesiones
