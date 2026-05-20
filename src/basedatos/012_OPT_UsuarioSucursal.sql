-- ============================================================================
-- TABLA: OPT_UsuarioSucursal (NUEVA)
-- Descripción: Relación M:N entre Usuarios y Sucursales del mismo Tenant.
-- Un usuario puede tener acceso a una o más sucursales.
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_UsuarioSucursal]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_UsuarioSucursal];
GO

CREATE TABLE [dbo].[OPT_UsuarioSucursal]
(
    [UsuarioId]    UNIQUEIDENTIFIER NOT NULL,
    [SucursalId]   UNIQUEIDENTIFIER NOT NULL,
    [AssignedAt]   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [AssignedBy]   NVARCHAR(100)    NULL,

    CONSTRAINT [PK_OPT_UsuarioSucursal]
        PRIMARY KEY CLUSTERED ([UsuarioId] ASC, [SucursalId] ASC),

    CONSTRAINT [FK_OPT_UsuarioSucursal_Usuario]
        FOREIGN KEY ([UsuarioId])
        REFERENCES [dbo].[OPT_Usuario] ([UsuarioId]),
       -- ON DELETE CASCADE,

    CONSTRAINT [FK_OPT_UsuarioSucursal_Sucursal]
        FOREIGN KEY ([SucursalId])
        REFERENCES [dbo].[OPT_Sucursal] ([idSucursal])
        ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_OPT_UsuarioSucursal_SucursalId]
    ON [dbo].[OPT_UsuarioSucursal] ([SucursalId]);
GO

PRINT 'Tabla OPT_UsuarioSucursal creada exitosamente.';
GO
