-- ============================================================================
-- OPT SaaS – Módulo Atención
-- Script:  022_OPT_Atencion.sql
-- Tabla:   OPT_Atencion
-- Desc:    Registra una visita clínica. Puede originarse desde una cita de
--          Agenda (AgendaId nullable) o ser un ingreso directo (walk-in).
--          Estado: Abierta → TerminadaServicio | DerivoOT (sin retroceso).
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla principal ──────────────────────────────────────────────────────────

IF OBJECT_ID(N'[dbo].[OPT_Atencion]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Atencion]
    (
        [AtencionId]          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_Atencion_AtencionId DEFAULT NEWSEQUENTIALID(),
        [TenantId]            UNIQUEIDENTIFIER NOT NULL,
        [idSucursal]          UNIQUEIDENTIFIER NOT NULL,   -- sucursal activa del usuario (header X-Sucursal-Id)

        -- Origen de la atención
        [AgendaId]            UNIQUEIDENTIFIER NULL,       -- NULL si walk-in
        [ClienteId]           UNIQUEIDENTIFIER NOT NULL,   -- cliente atendido (TipoCliente='Persona')
        [UsuarioAtencionId]   UNIQUEIDENTIFIER NOT NULL,   -- profesional que atendió

        -- Datos clínicos opcionales vinculados durante la atención
        [AnamnesisId]         UNIQUEIDENTIFIER NULL,
        [RecetaCristalesId]   UNIQUEIDENTIFIER NULL,

        -- Datos de la visita
        [FechaHoraAtencion]   DATETIME2(0)     NOT NULL,
        [Motivo]              NVARCHAR(300)    NOT NULL,
        [Observaciones]       NVARCHAR(2000)   NULL,
        [Estado]              NVARCHAR(20)     NOT NULL CONSTRAINT DF_OPT_Atencion_Estado DEFAULT (N'Abierta'),

        -- Auditoría
        [CreatedAt]           DATETIME2        NOT NULL CONSTRAINT DF_OPT_Atencion_CreatedAt DEFAULT (GETUTCDATE()),
        [UpdatedAt]           DATETIME2        NULL,
        [CreatedBy]           NVARCHAR(100)    NULL,
        [UpdatedBy]           NVARCHAR(100)    NULL,
        [IsDeleted]           BIT              NOT NULL CONSTRAINT DF_OPT_Atencion_IsDeleted DEFAULT (0),

        CONSTRAINT PK_OPT_Atencion PRIMARY KEY CLUSTERED ([AtencionId] ASC),

        CONSTRAINT CK_OPT_Atencion_Estado CHECK ([Estado] IN (
            N'Abierta', N'TerminadaServicio', N'DerivoOT'
        )),

        CONSTRAINT FK_OPT_Atencion_Sucursal FOREIGN KEY ([idSucursal])
            REFERENCES [dbo].[OPT_Sucursal] ([idSucursal])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Atencion_Agenda FOREIGN KEY ([AgendaId])
            REFERENCES [dbo].[OPT_Agenda] ([AgendaId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Atencion_Cliente FOREIGN KEY ([ClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Atencion_Usuario FOREIGN KEY ([UsuarioAtencionId])
            REFERENCES [dbo].[OPT_Usuario] ([UsuarioId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Atencion_Anamnesis FOREIGN KEY ([AnamnesisId])
            REFERENCES [dbo].[OPT_Anamnesis] ([AnamnesisId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Atencion_RecetaCristales FOREIGN KEY ([RecetaCristalesId])
            REFERENCES [dbo].[OPT_RecetaCristales] ([RecetaCristalesId])
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_Atencion creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_Atencion ya existe — se omite la creación.';
END
GO

-- ── Índices ──────────────────────────────────────────────────────────────────

-- Consulta principal: atenciones de una sucursal por fecha
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Atencion_TenantId_idSucursal_FechaHora'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Atencion]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Atencion_TenantId_idSucursal_FechaHora]
        ON [dbo].[OPT_Atencion] ([TenantId] ASC, [idSucursal] ASC, [FechaHoraAtencion] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Atencion_TenantId_idSucursal_FechaHora creado.';
END
GO

-- Historial de atenciones por cliente
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Atencion_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Atencion]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Atencion_ClienteId]
        ON [dbo].[OPT_Atencion] ([ClienteId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Atencion_ClienteId creado.';
END
GO

-- Búsqueda por cita de origen
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Atencion_AgendaId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Atencion]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Atencion_AgendaId]
        ON [dbo].[OPT_Atencion] ([AgendaId] ASC)
        WHERE [IsDeleted] = 0 AND [AgendaId] IS NOT NULL;

    PRINT 'Índice IX_OPT_Atencion_AgendaId creado.';
END
GO

PRINT '=== Script 022_OPT_Atencion.sql completado ===';
GO
