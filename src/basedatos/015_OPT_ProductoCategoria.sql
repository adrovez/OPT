-- =============================================================
-- Script 015 — OPT_ProductoCategoria
-- Catálogo de categorías de productos/servicios (tenant-aware)
-- =============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OPT_ProductoCategoria')
BEGIN
    CREATE TABLE OPT_ProductoCategoria (
        CategoriaId  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        TenantId     UNIQUEIDENTIFIER NOT NULL,
        Nombre       NVARCHAR(100)    NOT NULL,
        IsDeleted    BIT              NOT NULL DEFAULT 0,
        CreatedAt    DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    NVARCHAR(100)    NULL,
        UpdatedBy    NVARCHAR(100)    NULL,
        CONSTRAINT PK_ProductoCategoria PRIMARY KEY CLUSTERED (CategoriaId)
    );

    CREATE INDEX IX_ProductoCategoria_TenantId
        ON OPT_ProductoCategoria (TenantId)
        WHERE IsDeleted = 0;

    PRINT 'Tabla OPT_ProductoCategoria creada.';
END
ELSE
    PRINT 'OPT_ProductoCategoria ya existe — sin cambios.';
GO
