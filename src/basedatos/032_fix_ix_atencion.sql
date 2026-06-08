-- 032_fix_ix_atencion.sql
-- Reemplaza el índice filtrado de OPT_Atencion por uno compuesto no filtrado.
--
-- Problema: el índice filtrado WHERE [IsDeleted] = 0 (literal INT) no era
--   reconocido por el optimizador cuando EF Core genera CAST(0 AS bit), lo que
--   producía full clustered-index scan y timeout de 30 s en GetAll.
--   Adicionalmente, FechaHoraAtencion ASC no coincide con ORDER BY DESC.
--
-- Solución: índice compuesto sin filtro, con FechaHoraAtencion DESC e
--   IsDeleted+Estado en INCLUDE para cubrir los predicados más frecuentes.
--
-- Requiere: scripts 000–031 ejecutados previamente.
-- Idempotente: usa IF EXISTS / IF NOT EXISTS.
-- NOTA: requiere SET QUOTED_IDENTIFIER ON para CREATE INDEX.

USE [dbOPT];
GO

SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

-- 1. Eliminar el índice filtrado obsoleto (si aún existe)
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name      = N'IX_OPT_Atencion_TenantId_idSucursal_FechaHora'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Atencion]')
)
BEGIN
    DROP INDEX [IX_OPT_Atencion_TenantId_idSucursal_FechaHora]
        ON [dbo].[OPT_Atencion];
    PRINT 'Índice filtrado IX_OPT_Atencion_TenantId_idSucursal_FechaHora eliminado.';
END
ELSE
    PRINT 'Índice filtrado no encontrado — se omite el DROP.';

-- 2. Crear índice compuesto no filtrado
--    Clave: TenantId + idSucursal (igualdad) + FechaHoraAtencion DESC (rango + ORDER BY)
--    INCLUDE: IsDeleted y Estado para filtrar en el nodo hoja sin key-lookup
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name      = N'IX_OPT_Atencion_Tenant_Sucursal_Fecha'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Atencion]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Atencion_Tenant_Sucursal_Fecha]
        ON [dbo].[OPT_Atencion]
            ([TenantId] ASC, [idSucursal] ASC, [FechaHoraAtencion] DESC)
        INCLUDE ([IsDeleted], [Estado]);

    PRINT 'Índice IX_OPT_Atencion_Tenant_Sucursal_Fecha creado.';
END
ELSE
    PRINT 'Índice IX_OPT_Atencion_Tenant_Sucursal_Fecha ya existe — se omite.';

COMMIT TRANSACTION;
GO

-- 3. Actualizar estadísticas: los UPDATE masivos del script 031 degradaron
--    el histograma y pueden producir planes subóptimos.
UPDATE STATISTICS [dbo].[OPT_Atencion] WITH FULLSCAN;
PRINT 'Estadísticas de OPT_Atencion actualizadas.';
GO

PRINT '=== Script 032_fix_ix_atencion.sql completado ===';
GO
