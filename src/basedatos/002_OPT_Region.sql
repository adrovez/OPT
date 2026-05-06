-- ============================================================================
-- TABLA: OPT_Region (MANTENER)
-- Descripción: Regiones del país (catálogo)
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Region]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Region];
GO

CREATE TABLE [dbo].[OPT_Region]
(
    [idRegion]        INT              IDENTITY(1,1) NOT NULL,
    [Region]          NVARCHAR(100)    NOT NULL,
    [Codigo]          NVARCHAR(10)     NULL,
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]       DATETIME2        NULL,
    [CreatedBy]       NVARCHAR(100)    NULL,
    [UpdatedBy]       NVARCHAR(100)    NULL,
    [IsDeleted]       BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Region] PRIMARY KEY CLUSTERED ([idRegion] ASC)
);
GO

CREATE UNIQUE INDEX [IX_OPT_Region_Codigo]
    ON [dbo].[OPT_Region] ([Codigo]) WHERE [IsDeleted] = 0;
GO

PRINT 'Tabla OPT_Region creada exitosamente.';
GO
