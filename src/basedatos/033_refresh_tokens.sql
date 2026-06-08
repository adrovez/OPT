-- 033_refresh_tokens.sql
-- Tabla de Refresh Tokens para rotación de JWT.
-- Almacena el hash SHA-256 del token crudo, nunca el valor en claro.
-- Requiere: scripts 000-032 ejecutados previamente.
-- Idempotente: usa IF NOT EXISTS.

USE [dbOPT];
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'OPT_RefreshToken' AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[OPT_RefreshToken] (
        [RefreshTokenId]   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [UsuarioId]        UNIQUEIDENTIFIER NOT NULL,
        [TenantId]         UNIQUEIDENTIFIER NOT NULL,
        [TokenHash]        NVARCHAR(64)     NOT NULL,
        [FechaExpiracion]  DATETIME2        NOT NULL,
        [FechaRevocacion]  DATETIME2        NULL,
        [CreatedAt]        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT [PK_OPT_RefreshToken] PRIMARY KEY CLUSTERED ([RefreshTokenId]),
        CONSTRAINT [FK_OPT_RefreshToken_Usuario] FOREIGN KEY ([UsuarioId])
            REFERENCES [dbo].[OPT_Usuario] ([UsuarioId])
    );

    -- Índice para búsquedas por hash (solo tokens no revocados)
    CREATE NONCLUSTERED INDEX [IX_OPT_RefreshToken_TokenHash]
        ON [dbo].[OPT_RefreshToken] ([TokenHash])
        WHERE [FechaRevocacion] IS NULL;

    -- Índice para revocar todos los tokens de un usuario
    CREATE NONCLUSTERED INDEX [IX_OPT_RefreshToken_Usuario]
        ON [dbo].[OPT_RefreshToken] ([UsuarioId], [TenantId])
        WHERE [FechaRevocacion] IS NULL;

    PRINT 'Tabla OPT_RefreshToken creada.';
END
ELSE
    PRINT 'OPT_RefreshToken ya existe — se omite.';
GO

PRINT '=== Script 033_refresh_tokens.sql completado ===';
GO
