-- =============================================================
-- Script 028 — OPT_TransferenciaLinea
--
-- CREA: OPT_TransferenciaLinea (líneas de transferencia de stock)
--
-- PRECONDICIÓN: script 027 aplicado sobre dbOPT.
-- =============================================================

USE [dbOPT];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '=== 028 — OPT_TransferenciaLinea: inicio ===';
GO

IF OBJECT_ID(N'[dbo].[OPT_TransferenciaLinea]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_TransferenciaLinea]
    (
        [LineaId]        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]       UNIQUEIDENTIFIER NOT NULL,
        [TransferenciaId] UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]     UNIQUEIDENTIFIER NOT NULL,
        [Cantidad]       INT              NOT NULL,

        CONSTRAINT PK_OPT_TransferenciaLinea
            PRIMARY KEY CLUSTERED ([LineaId]),

        CONSTRAINT CK_OPT_TransferenciaLinea_Cantidad
            CHECK ([Cantidad] > 0),

        CONSTRAINT FK_OPT_TransferenciaLinea_Transferencia
            FOREIGN KEY ([TransferenciaId])
            REFERENCES [dbo].[OPT_Transferencia] ([TransferenciaId])
            ON DELETE CASCADE,

        CONSTRAINT FK_OPT_TransferenciaLinea_Producto
            FOREIGN KEY ([ProductoId])
            REFERENCES [dbo].[OPT_Producto] ([ProductoId]),

        CONSTRAINT FK_OPT_TransferenciaLinea_Tenant
            FOREIGN KEY ([TenantId])
            REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_TransferenciaLinea_Transferencia
        ON [dbo].[OPT_TransferenciaLinea] ([TransferenciaId]);

    PRINT 'CREATE OPT_TransferenciaLinea OK';
END
ELSE
BEGIN
    PRINT 'OPT_TransferenciaLinea ya existe — sin cambios';
END
GO

PRINT '=== 028 — OPT_TransferenciaLinea: completado ===';
GO
