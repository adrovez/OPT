-- ============================================================================
-- OPT SaaS – Módulo Anamnesis
-- Script:  010_OPT_Anamnesis.sql
-- Tabla:   OPT_Anamnesis
-- Desc:    Historial de salud del cliente (antecedentes médicos).
--          Cada registro pertenece a un Tenant y está asociado a un Cliente.
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla principal ──────────────────────────────────────────────────────────
IF OBJECT_ID(N'[dbo].[OPT_Anamnesis]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Anamnesis]
    (
        [AnamnesisId]   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_Anamnesis_AnamnesisId DEFAULT NEWSEQUENTIALID(),
        [TenantId]      UNIQUEIDENTIFIER NOT NULL,
        [ClienteId]     UNIQUEIDENTIFIER NOT NULL,

        -- Antecedentes de salud
        [Hipertension]  BIT             NOT NULL CONSTRAINT DF_OPT_Anamnesis_Hipertension  DEFAULT (0),
        [Diabetes]      BIT             NOT NULL CONSTRAINT DF_OPT_Anamnesis_Diabetes      DEFAULT (0),
        [Alergias]      BIT             NOT NULL CONSTRAINT DF_OPT_Anamnesis_Alergias      DEFAULT (0),
        [UsaLentes]     BIT             NOT NULL CONSTRAINT DF_OPT_Anamnesis_UsaLentes     DEFAULT (0),
        [Observacion]   NVARCHAR(1000)  NULL,

        -- Fecha en que se registró la anamnesis
        [FechaRegistro] DATETIME2       NOT NULL CONSTRAINT DF_OPT_Anamnesis_FechaRegistro DEFAULT (GETUTCDATE()),

        -- Auditoría
        [CreatedAt]     DATETIME2       NOT NULL CONSTRAINT DF_OPT_Anamnesis_CreatedAt     DEFAULT (GETUTCDATE()),
        [UpdatedAt]     DATETIME2       NULL,
        [CreatedBy]     NVARCHAR(100)   NULL,
        [UpdatedBy]     NVARCHAR(100)   NULL,
        [IsDeleted]     BIT             NOT NULL CONSTRAINT DF_OPT_Anamnesis_IsDeleted     DEFAULT (0),

        CONSTRAINT PK_OPT_Anamnesis PRIMARY KEY CLUSTERED ([AnamnesisId] ASC),

        CONSTRAINT FK_OPT_Anamnesis_Cliente FOREIGN KEY ([ClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_Anamnesis creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_Anamnesis ya existe — se omite la creación.';
END
GO

-- ── Índices ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Anamnesis_TenantId_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Anamnesis]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Anamnesis_TenantId_ClienteId]
        ON [dbo].[OPT_Anamnesis] ([TenantId] ASC, [ClienteId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Anamnesis_TenantId_ClienteId creado.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Anamnesis_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Anamnesis]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Anamnesis_ClienteId]
        ON [dbo].[OPT_Anamnesis] ([ClienteId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Anamnesis_ClienteId creado.';
END
GO

PRINT '=== Script 010_OPT_Anamnesis.sql completado ===';
GO
