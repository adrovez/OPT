-- ============================================================================
-- OPT SaaS – Módulo Agenda
-- Script:  014_OPT_Agenda.sql
-- Tabla:   OPT_Agenda
-- Desc:    Citas agendadas para clientes. Cada cita pertenece a un Tenant
--          y está asociada a la Sucursal activa del usuario que la agenda.
--          Estado: Pendiente | Confirmada | Atendida | Cancelada | NoShow
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla principal ──────────────────────────────────────────────────────────
IF OBJECT_ID(N'[dbo].[OPT_Agenda]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Agenda]
    (
        [AgendaId]          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_Agenda_AgendaId     DEFAULT NEWSEQUENTIALID(),
        [TenantId]          UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]        UNIQUEIDENTIFIER NOT NULL,   -- sucursal activa del usuario al agendar
        [ClienteId]         UNIQUEIDENTIFIER NOT NULL,   -- cliente citado
        [UsuarioId]         UNIQUEIDENTIFIER NULL,       -- profesional asignado (nullable al crear)

        -- Datos de la cita
        [FechaHora]         DATETIME2(0)     NOT NULL,
        [DuracionMinutos]   SMALLINT         NOT NULL CONSTRAINT DF_OPT_Agenda_Duracion     DEFAULT (30),
        [Motivo]            NVARCHAR(200)    NOT NULL,
        [Estado]            NVARCHAR(20)     NOT NULL CONSTRAINT DF_OPT_Agenda_Estado       DEFAULT (N'Pendiente'),
        [Observaciones]     NVARCHAR(500)    NULL,

        -- Auditoría
        [CreatedAt]         DATETIME2        NOT NULL CONSTRAINT DF_OPT_Agenda_CreatedAt    DEFAULT (GETUTCDATE()),
        [UpdatedAt]         DATETIME2        NULL,
        [CreatedBy]         NVARCHAR(100)    NULL,
        [UpdatedBy]         NVARCHAR(100)    NULL,
        [IsDeleted]         BIT              NOT NULL CONSTRAINT DF_OPT_Agenda_IsDeleted    DEFAULT (0),

        CONSTRAINT PK_OPT_Agenda PRIMARY KEY CLUSTERED ([AgendaId] ASC),

        CONSTRAINT CK_OPT_Agenda_Estado CHECK ([Estado] IN (
            N'Pendiente', N'Confirmada', N'Atendida', N'Cancelada', N'NoShow'
        )),

        CONSTRAINT CK_OPT_Agenda_Duracion CHECK ([DuracionMinutos] > 0),

        CONSTRAINT FK_OPT_Agenda_Sucursal FOREIGN KEY ([SucursalId])
            REFERENCES [dbo].[OPT_Sucursal] ([SucursalId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Agenda_Cliente FOREIGN KEY ([ClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Agenda_Usuario FOREIGN KEY ([UsuarioId])
            REFERENCES [dbo].[OPT_Usuario] ([UsuarioId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_Agenda creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_Agenda ya existe — se omite la creación.';
END
GO

-- ── Índices ──────────────────────────────────────────────────────────────────

-- Consulta principal: agenda de una sucursal en un rango de fechas
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Agenda_TenantId_SucursalId_FechaHora'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Agenda]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Agenda_TenantId_SucursalId_FechaHora]
        ON [dbo].[OPT_Agenda] ([TenantId] ASC, [SucursalId] ASC, [FechaHora] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Agenda_TenantId_SucursalId_FechaHora creado.';
END
GO

-- Historial de citas por cliente
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Agenda_ClienteId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Agenda]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Agenda_ClienteId]
        ON [dbo].[OPT_Agenda] ([ClienteId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Agenda_ClienteId creado.';
END
GO

-- Agenda por profesional asignado
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Agenda_UsuarioId'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Agenda]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Agenda_UsuarioId]
        ON [dbo].[OPT_Agenda] ([UsuarioId] ASC)
        WHERE [IsDeleted] = 0 AND [UsuarioId] IS NOT NULL;

    PRINT 'Índice IX_OPT_Agenda_UsuarioId creado.';
END
GO

PRINT '=== Script 014_OPT_Agenda.sql completado ===';
GO
