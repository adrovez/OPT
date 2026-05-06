-- ============================================================================
-- TABLA: OPT_Comuna (MANTENER)
-- Descripción: Comunas de cada Región
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Comuna]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Comuna];
GO

CREATE TABLE [dbo].[OPT_Comuna]
(
    [idComuna]        INT              IDENTITY(1,1) NOT NULL,
    [idRegion]        INT              NOT NULL,
    [Comuna]          NVARCHAR(100)    NOT NULL,
    [Codigo]          NVARCHAR(10)     NULL,
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]       DATETIME2        NULL,
    [CreatedBy]       NVARCHAR(100)    NULL,
    [UpdatedBy]       NVARCHAR(100)    NULL,
    [IsDeleted]       BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Comuna] PRIMARY KEY CLUSTERED ([idComuna] ASC),
    CONSTRAINT [FK_OPT_Comuna_OPT_Region] FOREIGN KEY ([idRegion])
        REFERENCES [dbo].[OPT_Region] ([idRegion])
        ON UPDATE CASCADE ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_OPT_Comuna_idRegion] ON [dbo].[OPT_Comuna] ([idRegion]);
GO

CREATE UNIQUE INDEX [IX_OPT_Comuna_Codigo]
    ON [dbo].[OPT_Comuna] ([Codigo]) WHERE [IsDeleted] = 0;
GO

PRINT 'Tabla OPT_Comuna creada exitosamente.';
GO
