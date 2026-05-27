-- ============================================================================
-- OPT SaaS – Módulo Cobro Servicio
-- Script:  023_OPT_CobroServicio.sql
-- Tabla:   OPT_CobroServicio
-- Desc:    Registra el cobro cuando una Atención concluye sin derivar a OT
--          (estado TerminadaServicio). Relación 1:1 con OPT_Atencion.
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla ────────────────────────────────────────────────────────────────────

IF OBJECT_ID(N'[dbo].[OPT_CobroServicio]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_CobroServicio]
    (
        [CobroServicioId]   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_CobroServicio_Id DEFAULT NEWSEQUENTIALID(),
        [TenantId]          UNIQUEIDENTIFIER NOT NULL,
        [idSucursal]        UNIQUEIDENTIFIER NOT NULL,
        [AtencionId]        UNIQUEIDENTIFIER NOT NULL,   -- FK 1:1 → OPT_Atencion
        [FormaPagoId]       INT              NOT NULL,   -- FK → OPT_FormaPago
        [Monto]             DECIMAL(12,2)    NOT NULL,
        [FechaCobro]        DATETIME2(0)     NOT NULL,
        [Observaciones]     NVARCHAR(500)    NULL,       -- N° boleta, nota libre

        -- Auditoría
        [CreatedAt]         DATETIME2        NOT NULL CONSTRAINT DF_OPT_CobroServicio_CreatedAt DEFAULT (GETUTCDATE()),
        [UpdatedAt]         DATETIME2        NULL,
        [CreatedBy]         NVARCHAR(100)    NULL,
        [UpdatedBy]         NVARCHAR(100)    NULL,
        [IsDeleted]         BIT              NOT NULL CONSTRAINT DF_OPT_CobroServicio_IsDeleted DEFAULT (0),

        CONSTRAINT PK_OPT_CobroServicio PRIMARY KEY CLUSTERED ([CobroServicioId] ASC),

        CONSTRAINT CK_OPT_CobroServicio_Monto CHECK ([Monto] > 0),

        -- 1:1 con Atención (un cobro por atención)
        CONSTRAINT UQ_OPT_CobroServicio_AtencionId UNIQUE ([AtencionId]),

        CONSTRAINT FK_OPT_CobroServicio_Atencion FOREIGN KEY ([AtencionId])
            REFERENCES [dbo].[OPT_Atencion] ([AtencionId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_CobroServicio_FormaPago FOREIGN KEY ([FormaPagoId])
            REFERENCES [dbo].[OPT_FormaPago] ([FormaPagoId])
            ON DELETE NO ACTION ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_CobroServicio_Sucursal FOREIGN KEY ([idSucursal])
            REFERENCES [dbo].[OPT_Sucursal] ([idSucursal])
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_CobroServicio creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_CobroServicio ya existe — se omite la creación.';
END
GO

PRINT '=== Script 023_OPT_CobroServicio.sql completado ===';
GO
