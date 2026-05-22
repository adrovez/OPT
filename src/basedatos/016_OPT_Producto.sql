-- =============================================================
-- Script 016 — OPT_Producto
-- Ficha maestra de productos y servicios (tenant-aware)
-- TipoProducto: 'Almacenable' | 'Consumible' | 'Servicio'
-- Precios y stock se gestionan en módulos separados.
-- =============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OPT_Producto')
BEGIN
    CREATE TABLE OPT_Producto (
        ProductoId    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        TenantId      UNIQUEIDENTIFIER NOT NULL,
        CategoriaId   UNIQUEIDENTIFIER NULL,
        Nombre        NVARCHAR(200)    NOT NULL,
        Descripcion   NVARCHAR(1000)   NULL,
        TipoProducto  NVARCHAR(20)     NOT NULL DEFAULT 'Almacenable',
        CodigoInterno NVARCHAR(50)     NULL,
        Activo        BIT              NOT NULL DEFAULT 1,
        IsDeleted     BIT              NOT NULL DEFAULT 0,
        CreatedAt     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     NVARCHAR(100)    NULL,
        UpdatedBy     NVARCHAR(100)    NULL,
        CONSTRAINT PK_Producto      PRIMARY KEY CLUSTERED (ProductoId),
        CONSTRAINT FK_Producto_Cat  FOREIGN KEY (CategoriaId)
            REFERENCES OPT_ProductoCategoria (CategoriaId),
        CONSTRAINT CK_Producto_Tipo CHECK (TipoProducto IN ('Almacenable','Consumible','Servicio'))
    );

    CREATE UNIQUE INDEX IX_Producto_CodigoInterno
        ON OPT_Producto (TenantId, CodigoInterno)
        WHERE IsDeleted = 0 AND CodigoInterno IS NOT NULL;

    CREATE INDEX IX_Producto_TenantCategoria
        ON OPT_Producto (TenantId, CategoriaId)
        WHERE IsDeleted = 0;

    PRINT 'Tabla OPT_Producto creada.';
END
ELSE
    PRINT 'OPT_Producto ya existe — sin cambios.';
GO
