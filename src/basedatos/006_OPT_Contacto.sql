-- ============================================================================
-- TABLA: OPT_Contacto (NUEVA)
-- Descripción: Contactos de los clientes tipo Empresa
--              Un cliente Empresa puede tener múltiples contactos
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Contacto]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Contacto];
GO

CREATE TABLE [dbo].[OPT_Contacto]
(
    [ContactoId]         INT              IDENTITY(1,1) NOT NULL,
    [TenantId]           INT              NOT NULL,
    [ClienteId]          INT              NOT NULL,  -- FK a OPT_Cliente (solo TipoCliente='Empresa')
    [Nombre]             NVARCHAR(150)    NOT NULL,
    [Email]              NVARCHAR(150)    NULL,
    [Telefono]           NVARCHAR(50)     NULL,
    [Cargo]              NVARCHAR(100)    NULL,
    [Activo]             BIT              NOT NULL DEFAULT 1,
    -- Auditoría
    [CreatedAt]          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]          DATETIME2        NULL,
    [CreatedBy]          NVARCHAR(100)    NULL,
    [UpdatedBy]          NVARCHAR(100)    NULL,
    [IsDeleted]          BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Contacto] PRIMARY KEY CLUSTERED ([ContactoId] ASC),
    -- NO CASCADE desde Tenant para evitar rutas múltiples (Tenant→Cliente→Contacto ya cubre la cascada)
    CONSTRAINT [FK_OPT_Contacto_OPT_Tenant] FOREIGN KEY ([TenantId])
        REFERENCES [dbo].[OPT_Tenant] ([TenantId])
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    -- CASCADE desde Cliente: si se elimina físicamente un Cliente, sus Contactos se eliminan
    CONSTRAINT [FK_OPT_Contacto_OPT_Cliente] FOREIGN KEY ([ClienteId])
        REFERENCES [dbo].[OPT_Cliente] ([ClienteId])
        ON UPDATE CASCADE ON DELETE CASCADE
);
GO

CREATE INDEX [IX_OPT_Contacto_TenantId] ON [dbo].[OPT_Contacto] ([TenantId]);
GO

CREATE INDEX [IX_OPT_Contacto_ClienteId] ON [dbo].[OPT_Contacto] ([ClienteId]);
GO

PRINT 'Tabla OPT_Contacto creada exitosamente.';
GO
