-- ============================================================================
-- OPT SaaS - Script 013: Catálogo de Roles
-- Tabla: OPT_Rol (catálogo compartido, sin TenantId, sin auditoría)
-- PK: INT IDENTITY — es un catálogo de sistema, no entidad de negocio
-- ============================================================================

USE [dbOPT];
GO

-- ── Crear tabla OPT_Rol ────────────────────────────────────────────────────
IF OBJECT_ID(N'[dbo].[OPT_Rol]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Rol] (
        [RolId] INT          IDENTITY(1,1) NOT NULL,
        [Nombre] NVARCHAR(50) NOT NULL,
        CONSTRAINT [PK_OPT_Rol] PRIMARY KEY CLUSTERED ([RolId] ASC)
    );
END
GO

-- ── Datos semilla: Admin=1, Operador=2, Lectura=3 ──────────────────────────
IF NOT EXISTS (SELECT 1 FROM [dbo].[OPT_Rol])
BEGIN
    SET IDENTITY_INSERT [dbo].[OPT_Rol] ON;

    INSERT INTO [dbo].[OPT_Rol] ([RolId], [Nombre]) VALUES
         (1	,'Administrador')
        ,(2	,'Jefe Sucursal')
        ,(3	,'Vendedor')
        ,(4	,'Tecnico Medico')
        ,(5	,'Control Calidad')
        ,(6	,'Externo');

    SET IDENTITY_INSERT [dbo].[OPT_Rol] OFF;
END
GO
