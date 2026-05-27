-- ============================================================================
-- OPT SaaS – Catálogo Forma de Pago
-- Script:  021_OPT_FormaPago.sql
-- Tabla:   OPT_FormaPago
-- Desc:    Catálogo compartido de formas de pago. Clave INT IDENTITY igual que
--          los demás catálogos del sistema (Region, Rol).
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── Tabla ────────────────────────────────────────────────────────────────────

IF OBJECT_ID(N'[dbo].[OPT_FormaPago]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_FormaPago]
    (
        [FormaPagoId]   INT           NOT NULL IDENTITY(1,1),
        [Descripcion]   NVARCHAR(100) NOT NULL,

        CONSTRAINT PK_OPT_FormaPago PRIMARY KEY CLUSTERED ([FormaPagoId] ASC),
        CONSTRAINT UQ_OPT_FormaPago_Descripcion UNIQUE ([Descripcion])
    );

    PRINT 'Tabla OPT_FormaPago creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_FormaPago ya existe — se omite la creación.';
END
GO

-- ── Datos iniciales ──────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM [dbo].[OPT_FormaPago])
BEGIN
    SET IDENTITY_INSERT [dbo].[OPT_FormaPago] ON;

    INSERT INTO [dbo].[OPT_FormaPago] ([FormaPagoId], [Descripcion])
    VALUES
        (1, N'Efectivo'),
        (2, N'Débito'),
        (3, N'Crédito'),
        (4, N'Cheque'),
        (5, N'Transferencia');

    SET IDENTITY_INSERT [dbo].[OPT_FormaPago] OFF;

    PRINT 'Datos iniciales OPT_FormaPago insertados.';
END
ELSE
BEGIN
    PRINT 'OPT_FormaPago ya tiene datos — se omite la inserción.';
END
GO

PRINT '=== Script 021_OPT_FormaPago.sql completado ===';
GO
