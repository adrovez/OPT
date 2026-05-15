-- ============================================================================
-- TABLA: OPT_Usuario (NUEVA)
-- Descripcion: Usuarios del sistema con autenticacion JWT
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Usuario]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Usuario];
GO

CREATE TABLE [dbo].[OPT_Usuario]
(
    [UsuarioId]        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    [TenantId]         UNIQUEIDENTIFIER NOT NULL,
    [RutUsuario]       NVARCHAR(20)     NOT NULL,
    [Nombre]           NVARCHAR(150)    NOT NULL,
    [Email]            NVARCHAR(150)    NOT NULL,
    [PasswordHash]     NVARCHAR(256)    NOT NULL,
    [Rol]              NVARCHAR(50)     NOT NULL DEFAULT 'Operador',  -- 'Admin' | 'Operador' | 'Lectura'
    [FechaIngreso]     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    -- Auditoria
    [CreatedAt]        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]        DATETIME2        NULL,
    [CreatedBy]        NVARCHAR(100)    NULL,
    [UpdatedBy]        NVARCHAR(100)    NULL,
    [IsDeleted]        BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Usuario] PRIMARY KEY CLUSTERED ([UsuarioId] ASC),
    CONSTRAINT [FK_OPT_Usuario_OPT_Tenant] FOREIGN KEY ([TenantId])
        REFERENCES [dbo].[OPT_Tenant] ([TenantId])
        ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_OPT_Usuario_Tenant_Rut]
    ON [dbo].[OPT_Usuario] ([TenantId], [RutUsuario]) WHERE [IsDeleted] = 0;
GO

-- Índice para consultas generales por tenant
CREATE INDEX [IX_OPT_Usuario_TenantId]
    ON [dbo].[OPT_Usuario] ([TenantId]);
GO

-- Índice para búsqueda por email (ej. recuperación de contraseña)
CREATE INDEX [IX_OPT_Usuario_Email]
    ON [dbo].[OPT_Usuario] ([Email]);
GO

PRINT 'Tabla OPT_Usuario creada exitosamente.';
GO
