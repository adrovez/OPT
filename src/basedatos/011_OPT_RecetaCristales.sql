-- ============================================================================
-- OPT SaaS – Módulo Receta de Cristales
-- Script:  011_OPT_RecetaCristales.sql
-- Tabla:   OPT_RecetaCristales
-- Desc:    Receta óptica de un cliente (lejos, cerca, DP y ADD).
--          Cada registro pertenece a un Tenant y está asociado a un Cliente.
--          Puede estar asociada a una Atención (idAtencion — FK diferida hasta
--          que se implemente OPT_Atencion).
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla principal ──────────────────────────────────────────────────────────
IF OBJECT_ID(N'[dbo].[OPT_RecetaCristales]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_RecetaCristales]
    (
        [RecetaCristalesId]         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_RecetaCristales_Id DEFAULT NEWSEQUENTIALID(),
        [TenantId]                  UNIQUEIDENTIFIER NOT NULL,
        [ClienteId]                 UNIQUEIDENTIFIER NOT NULL,

        -- ── Lejos — Ojo Derecho (OD) ────────────────────────────────────────
        [LejosODEsferico]           NVARCHAR(10)    NULL,
        [LejosODCilindro]           NVARCHAR(10)    NULL,
        [LejosODEje]                NVARCHAR(10)    NULL,
        [LejosODObservacion]        NVARCHAR(200)   NULL,

        -- ── Lejos — Ojo Izquierdo (OI) ──────────────────────────────────────
        [LejosOIEsferico]           NVARCHAR(10)    NULL,
        [LejosOICilindro]           NVARCHAR(10)    NULL,
        [LejosOIEje]                NVARCHAR(10)    NULL,
        [LejosOIObservacion]        NVARCHAR(200)   NULL,

        -- ── Lejos — Distancia Pupilar (DP) ──────────────────────────────────
        [LejosDPEsferico]           NVARCHAR(10)    NULL,
        [LejosDPObservacion]        NVARCHAR(200)   NULL,

        -- ── Cerca — Ojo Derecho (OD) ────────────────────────────────────────
        [CercaODEsferico]           NVARCHAR(10)    NULL,
        [CercaODCilindro]           NVARCHAR(10)    NULL,
        [CercaODEje]                NVARCHAR(10)    NULL,
        [CercaODObservacion]        NVARCHAR(200)   NULL,

        -- ── Cerca — Ojo Izquierdo (OI) ──────────────────────────────────────
        [CercaOIEsferico]           NVARCHAR(10)    NULL,
        [CercaOICilindro]           NVARCHAR(10)    NULL,
        [CercaOIEje]                NVARCHAR(10)    NULL,
        [CercaOIObservacion]        NVARCHAR(200)   NULL,

        -- ── Cerca — Distancia Pupilar (DP) ──────────────────────────────────
        [CercaDPEsferico]           NVARCHAR(10)    NULL,
        [CercaDPObservacion]        NVARCHAR(200)   NULL,

        -- ── Adición (ADD) — para bifocales/progresivos ───────────────────────
        [LejosADDEsfera]            NVARCHAR(10)    NULL,

        -- ── Flags de comportamiento ──────────────────────────────────────────
        [CheckLejos]                BIT             NOT NULL CONSTRAINT DF_OPT_RecetaCristales_CheckLejos              DEFAULT (0),
        [CheckCerca]                BIT             NOT NULL CONSTRAINT DF_OPT_RecetaCristales_CheckCerca              DEFAULT (0),
        [CheckCristalesLaboratorio] BIT             NOT NULL CONSTRAINT DF_OPT_RecetaCristales_CheckCristalesLab       DEFAULT (0),
        [CheckUrgente]              BIT             NOT NULL CONSTRAINT DF_OPT_RecetaCristales_CheckUrgente            DEFAULT (0),

        -- ── Fecha de la receta ───────────────────────────────────────────────
        [FechaIngreso]              DATETIME2       NOT NULL CONSTRAINT DF_OPT_RecetaCristales_FechaIngreso DEFAULT (GETUTCDATE()),

        -- ── Auditoría estándar ───────────────────────────────────────────────
        [CreatedAt]                 DATETIME2       NOT NULL CONSTRAINT DF_OPT_RecetaCristales_CreatedAt DEFAULT (GETUTCDATE()),
        [UpdatedAt]                 DATETIME2       NULL,
        [CreatedBy]                 NVARCHAR(100)   NULL,
        [UpdatedBy]                 NVARCHAR(100)   NULL,
        [IsDeleted]                 BIT             NOT NULL CONSTRAINT DF_OPT_RecetaCristales_IsDeleted  DEFAULT (0),

        CONSTRAINT PK_OPT_RecetaCristales PRIMARY KEY CLUSTERED ([RecetaCristalesId] ASC),

        CONSTRAINT FK_OPT_RecetaCristales_Cliente FOREIGN KEY ([ClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_RecetaCristales creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_RecetaCristales ya existe — se omite la creación.';
END
GO

-- ── Índices ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_RecetaCristales_TenantId_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_RecetaCristales]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_RecetaCristales_TenantId_ClienteId]
        ON [dbo].[OPT_RecetaCristales] ([TenantId] ASC, [ClienteId] ASC, [FechaIngreso] DESC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_RecetaCristales_TenantId_ClienteId creado.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_RecetaCristales_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_RecetaCristales]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_RecetaCristales_ClienteId]
        ON [dbo].[OPT_RecetaCristales] ([ClienteId] ASC, [FechaIngreso] DESC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_RecetaCristales_ClienteId creado.';
END
GO

PRINT '=== Script 011_OPT_RecetaCristales.sql completado ===';
GO
