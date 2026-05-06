-- ============================================================================
-- TABLA: OPT_Tenant (NUEVA)
-- Descripción: Empresas clientes del SaaS (multi-tenancy raíz)
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Tenant]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Tenant];
GO

CREATE TABLE [dbo].[OPT_Tenant]
(
    [TenantId]        INT              IDENTITY(1,1) NOT NULL,
    [Nombre]          NVARCHAR(150)    NOT NULL,
    [RutEmpresa]      NVARCHAR(20)     NOT NULL,
    [Direccion]       NVARCHAR(250)    NULL,
    [Email]           NVARCHAR(150)    NOT NULL,
    [Telefono]        NVARCHAR(50)     NULL,
    [Activo]          BIT              NOT NULL DEFAULT 1,
    [FechaRegistro]   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedAt]       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]       DATETIME2        NULL,
    [CreatedBy]       NVARCHAR(100)    NULL,
    [UpdatedBy]       NVARCHAR(100)    NULL,
    [IsDeleted]       BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Tenant] PRIMARY KEY CLUSTERED ([TenantId] ASC)
);
GO

CREATE UNIQUE INDEX [IX_OPT_Tenant_RutEmpresa]
    ON [dbo].[OPT_Tenant] ([RutEmpresa]) WHERE [IsDeleted] = 0;
GO

PRINT 'Tabla OPT_Tenant creada exitosamente.';
GO
