-- ============================================================================
-- TABLA: OPT_Cliente (MANTENER - Unificada: Persona y Empresa)
-- Descripción: Datos básicos del cliente (Pacientes Persona y Empresas)
--              - TipoCliente = 'Persona' o 'Empresa'
--              - NumeroDocumento: RUT para personas, RUT empresa para empresas (UNICO)
--              - Campos como FechaNacimiento, TipoPrevision aplican solo a Persona
--              - Campos como Giro aplican solo a Empresa
-- ============================================================================

USE [dbOPT];
GO

IF OBJECT_ID('[dbo].[OPT_Cliente]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OPT_Cliente];
GO

CREATE TABLE [dbo].[OPT_Cliente]
(
    [ClienteId]            INT              IDENTITY(1,1) NOT NULL,
    [TenantId]             INT              NOT NULL,
    [TipoCliente]          NVARCHAR(20)     NOT NULL,  -- 'Persona' | 'Empresa'
    [NumeroDocumento]      NVARCHAR(20)     NOT NULL,
    [Nombre]               NVARCHAR(200)    NOT NULL,
    [Direccion]            NVARCHAR(250)    NULL,
    [idComuna]             INT              NULL,
    [Celular]              NVARCHAR(50)     NULL,
    [Mail]                 NVARCHAR(150)    NULL,
    [FechaIngreso]         DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    -- Campos específicos Persona
    [FechaNacimiento]      DATE             NULL,
    [TipoPrevision]        NVARCHAR(50)     NULL,      -- 'Fonasa', 'Isapre', 'Particular', etc.
    -- Campos específicos Empresa
    [Giro]                  NVARCHAR(150)    NULL,      -- Giro comercial de la empresa
    -- Auditoría
    [CreatedAt]            DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]            DATETIME2        NULL,
    [CreatedBy]            NVARCHAR(100)    NULL,
    [UpdatedBy]            NVARCHAR(100)    NULL,
    [IsDeleted]            BIT              NOT NULL DEFAULT 0,

    CONSTRAINT [PK_OPT_Cliente] PRIMARY KEY CLUSTERED ([ClienteId] ASC),
    CONSTRAINT [FK_OPT_Cliente_OPT_Tenant] FOREIGN KEY ([TenantId])
        REFERENCES [dbo].[OPT_Tenant] ([TenantId])
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT [FK_OPT_Cliente_OPT_Comuna] FOREIGN KEY ([idComuna])
        REFERENCES [dbo].[OPT_Comuna] ([idComuna])
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT [CK_OPT_Cliente_TipoCliente] CHECK ([TipoCliente] IN ('Persona', 'Empresa'))
);
GO

CREATE INDEX [IX_OPT_Cliente_TenantId] ON [dbo].[OPT_Cliente] ([TenantId]);
GO

CREATE INDEX [IX_OPT_Cliente_TipoCliente] ON [dbo].[OPT_Cliente] ([TipoCliente]);
GO

CREATE UNIQUE INDEX [IX_OPT_Cliente_Tenant_Documento]
    ON [dbo].[OPT_Cliente] ([TenantId], [NumeroDocumento]) WHERE [IsDeleted] = 0;
GO

PRINT 'Tabla OPT_Cliente creada exitosamente.';
GO
