---
paths:
  - src/basedatos/**
---
# Reglas Base de Datos (SQL Server — se cargan al tocar src/basedatos/**)

- Scripts numerados secuencialmente. Crear el SIGUIENTE numero (ver tabla en CLAUDE.md).
- PKs de negocio: `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()`.
  **Nunca `NEWID()` como DEFAULT** (fragmenta el indice clustered).
- Catalogos compartidos: `INT IDENTITY`.
- Soft delete: columna `IsDeleted`, nunca `DELETE` fisico de datos OPT_.
- `DATE` (no `DATETIME2`) cuando la semantica es solo fecha.
- La PK de la tabla de sucursales se llama `idSucursal` en BD.
- Scripts idempotentes cuando sea posible (IF NOT EXISTS).
- No incluir secretos/credenciales en los scripts.

Ejecutar: `sqlcmd -S localhost -d dbOPT -E -i src/basedatos/<script>.sql`.
