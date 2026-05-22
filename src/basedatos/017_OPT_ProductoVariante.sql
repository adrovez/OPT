-- =============================================================
-- Script 017 — OPT_ProductoVariante
-- Variantes concretas (SKU) de un producto.
-- Solo aplica a TipoProducto = 'Almacenable' o 'Consumible'.
-- Precios y stock se gestionan en módulos separados.
-- =============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OPT_ProductoVariante')
BEGIN
    CREATE TABLE OPT_ProductoVariante (
        VarianteId         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        ProductoId         UNIQUEIDENTIFIER NOT NULL,
        TenantId           UNIQUEIDENTIFIER NOT NULL,
        Nombre             NVARCHAR(200)    NOT NULL,
        CodigoBarras       NVARCHAR(50)     NULL,
        Activo             BIT              NOT NULL DEFAULT 1,
        IsDeleted          BIT              NOT NULL DEFAULT 0,
        CreatedAt          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt          DATETIME2        NULL,
        CreatedBy          NVARCHAR(100)    NULL,
        UpdatedBy          NVARCHAR(100)    NULL,
        CONSTRAINT PK_ProductoVariante   PRIMARY KEY CLUSTERED (VarianteId),
        CONSTRAINT FK_Variante_Producto  FOREIGN KEY (ProductoId)
            REFERENCES OPT_Producto (ProductoId)
    );

    CREATE UNIQUE INDEX IX_Variante_CodigoBarras
        ON OPT_ProductoVariante (TenantId, CodigoBarras)
        WHERE IsDeleted = 0 AND CodigoBarras IS NOT NULL;

    CREATE INDEX IX_Variante_Producto
        ON OPT_ProductoVariante (ProductoId)
        WHERE IsDeleted = 0;

    PRINT 'Tabla OPT_ProductoVariante creada.';
END
ELSE
    PRINT 'OPT_ProductoVariante ya existe — sin cambios.';
GO
