-- ============================================================================
-- OPT SaaS – Alteraciones a tablas existentes (Etapa 1)
-- Script:  024_OPT_Alteraciones.sql
-- Desc:    Agrega columnas FK a OPT_Atencion en tablas ya existentes.
--          Idempotente: usa IF COL_LENGTH IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── OPT_RecetaCristales: +AtencionId, +Fuente ────────────────────────────────

IF COL_LENGTH(N'dbo.OPT_RecetaCristales', N'AtencionId') IS NULL
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        ADD [AtencionId] UNIQUEIDENTIFIER NULL;

    PRINT 'OPT_RecetaCristales: columna AtencionId agregada.';
END
ELSE
    PRINT 'OPT_RecetaCristales: AtencionId ya existe — se omite.';
GO

IF COL_LENGTH(N'dbo.OPT_RecetaCristales', N'Fuente') IS NULL
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        ADD [Fuente] NVARCHAR(20) NOT NULL
            CONSTRAINT DF_OPT_RecetaCristales_Fuente DEFAULT (N'Consulta');
    PRINT 'OPT_RecetaCristales: columna Fuente agregada.';
END
ELSE
    PRINT 'OPT_RecetaCristales: Fuente ya existe — se omite.';
GO

-- CHECK constraint en batch separado (el compilador SQL necesita que la columna exista primero)
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_OPT_RecetaCristales_Fuente')
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        ADD CONSTRAINT CK_OPT_RecetaCristales_Fuente
            CHECK ([Fuente] IN (N'Consulta', N'Tercero'));
    PRINT 'CK_OPT_RecetaCristales_Fuente creada.';
END
ELSE
    PRINT 'CK_OPT_RecetaCristales_Fuente ya existe — se omite.';
GO

-- FK OPT_RecetaCristales → OPT_Atencion
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_OPT_RecetaCristales_Atencion'
)
BEGIN
    ALTER TABLE [dbo].[OPT_RecetaCristales]
        ADD CONSTRAINT FK_OPT_RecetaCristales_Atencion
            FOREIGN KEY ([AtencionId])
            REFERENCES [dbo].[OPT_Atencion] ([AtencionId])
            ON DELETE NO ACTION ON UPDATE NO ACTION;

    PRINT 'FK_OPT_RecetaCristales_Atencion creada.';
END
ELSE
    PRINT 'FK_OPT_RecetaCristales_Atencion ya existe — se omite.';
GO

-- ── OPT_Anamnesis: +AtencionId ───────────────────────────────────────────────

IF COL_LENGTH(N'dbo.OPT_Anamnesis', N'AtencionId') IS NULL
BEGIN
    ALTER TABLE [dbo].[OPT_Anamnesis]
        ADD [AtencionId] UNIQUEIDENTIFIER NULL;

    PRINT 'OPT_Anamnesis: columna AtencionId agregada.';
END
ELSE
    PRINT 'OPT_Anamnesis: AtencionId ya existe — se omite.';
GO

-- FK OPT_Anamnesis → OPT_Atencion
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_OPT_Anamnesis_Atencion'
)
BEGIN
    ALTER TABLE [dbo].[OPT_Anamnesis]
        ADD CONSTRAINT FK_OPT_Anamnesis_Atencion
            FOREIGN KEY ([AtencionId])
            REFERENCES [dbo].[OPT_Atencion] ([AtencionId])
            ON DELETE NO ACTION ON UPDATE NO ACTION;

    PRINT 'FK_OPT_Anamnesis_Atencion creada.';
END
ELSE
    PRINT 'FK_OPT_Anamnesis_Atencion ya existe — se omite.';
GO

PRINT '=== Script 024_OPT_Alteraciones.sql completado ===';
GO
