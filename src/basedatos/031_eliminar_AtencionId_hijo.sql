-- ============================================================================
-- OPT SaaS – Eliminar referencia circular AtencionId en tablas hijo
-- Script:  031_eliminar_AtencionId_hijo.sql
-- Desc:    Elimina las columnas AtencionId de OPT_Anamnesis y
--          OPT_RecetaCristales (agregadas en 024_OPT_Alteraciones.sql).
--          La relación Atencion → Anamnesis/RecetaCristales queda solo
--          en OPT_Atencion (AnamnesisId, RecetaCristalesId), sin duplicidad.
-- Idempotente: verifica existencia antes de DROP.
-- ============================================================================

USE [dbOPT];
GO

-- ── OPT_Anamnesis: DROP FK + DROP COLUMN AtencionId ─────────────────────────

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_OPT_Anamnesis_Atencion'
)
BEGIN
    ALTER TABLE [dbo].[OPT_Anamnesis]
        DROP CONSTRAINT FK_OPT_Anamnesis_Atencion;
    PRINT 'FK_OPT_Anamnesis_Atencion eliminada.';
END
ELSE
    PRINT 'FK_OPT_Anamnesis_Atencion no existe — se omite.';
GO

IF COL_LENGTH(N'dbo.OPT_Anamnesis', N'AtencionId') IS NOT NULL
BEGIN
    ALTER TABLE [dbo].[OPT_Anamnesis]
        DROP COLUMN [AtencionId];
    PRINT 'OPT_Anamnesis: columna AtencionId eliminada.';
END
ELSE
    PRINT 'OPT_Anamnesis: AtencionId no existe — se omite.';
GO

-- ── OPT_RecetaCristales: DROP FK + DROP COLUMN AtencionId ───────────────────

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_OPT_RecetaCristales_Atencion'
)
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        DROP CONSTRAINT FK_OPT_RecetaCristales_Atencion;
    PRINT 'FK_OPT_RecetaCristales_Atencion eliminada.';
END
ELSE
    PRINT 'FK_OPT_RecetaCristales_Atencion no existe — se omite.';
GO

IF COL_LENGTH(N'dbo.OPT_RecetaCristales', N'AtencionId') IS NOT NULL
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        DROP COLUMN [AtencionId];
    PRINT 'OPT_RecetaCristales: columna AtencionId eliminada.';
END
ELSE
    PRINT 'OPT_RecetaCristales: AtencionId no existe — se omite.';
GO

PRINT '=== Script 031_eliminar_AtencionId_hijo.sql completado ===';
GO
