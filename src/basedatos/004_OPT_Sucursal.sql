-- ============================================================================
-- TABLA: OPT_Sucursal (MANTENER + TenantId + auditoría)
-- Descripción: Sucursales de la Óptica
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Sucursal]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Sucursal];
GO

CREATE TABLE [dbo].[OPT_Sucursal]
(
    [idSucursal]      INT              IDENTITY(1,1) NOT NULL,
    [TenantId]        INT              NOT NULL,
    [Nombre]          NVARCHAR(150)    NOT NULL,
    [Direccion]       NVARCHAR(250)    NULL,
    [Telefono]        NVARCHAR(50)     NULL,
    [Matriz]          BIT              NOT NULL DEFAULT 0,
    [FechaRegistro]   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]       DATETIME2        NULL,
    [CreatedBy]       NVARCHAR(100)    NULL,
    [UpdatedBy]       NVARCHAR(100)    NULL,
    [IsDeleted]       BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Sucursal] PRIMARY KEY CLUSTERED ([idSucursal] ASC),
    CONSTRAINT [FK_OPT_Sucursal_OPT_Tenant] FOREIGN KEY ([TenantId])
        REFERENCES [dbo].[OPT_Tenant] ([TenantId])
        ON UPDATE CASCADE ON DELETE CASCADE
);
GO

CREATE INDEX [IX_OPT_Sucursal_TenantId] ON [dbo].[OPT_Sucursal] ([TenantId]);
GO

PRINT 'Tabla OPT_Sucursal creada exitosamente.';
GO
