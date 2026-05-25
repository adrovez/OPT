-- 019_OPT_Precio.sql
-- Historial de precios por variante (costo y venta)
-- VigenciaHasta NULL = precio vigente actual

IF OBJECT_ID('OPT_PrecioProducto', 'U') IS NULL
BEGIN
    CREATE TABLE OPT_PrecioProducto (
        PrecioId      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID()
                          CONSTRAINT PK_OPT_PrecioProducto PRIMARY KEY,
        TenantId      UNIQUEIDENTIFIER NOT NULL,
        VarianteId    UNIQUEIDENTIFIER NOT NULL,
        SucursalId    UNIQUEIDENTIFIER NULL,          -- NULL = precio global del tenant
        PrecioCosto   DECIMAL(12, 2)   NOT NULL DEFAULT 0,
        PrecioVenta   DECIMAL(12, 2)   NULL,
        VigenciaDesde DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        VigenciaHasta DATETIME2        NULL,          -- NULL = vigente
        CreatedAt     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy     NVARCHAR(100)    NULL,

        CONSTRAINT FK_OPT_PrecioProducto_Variante
            FOREIGN KEY (VarianteId)
            REFERENCES OPT_ProductoVariante (VarianteId),
        CONSTRAINT FK_OPT_PrecioProducto_Sucursal
            FOREIGN KEY (SucursalId)
            REFERENCES OPT_Sucursal (idSucursal)
    );

    CREATE INDEX IX_OPT_PrecioProducto_Variante_Vigencia
        ON OPT_PrecioProducto (TenantId, VarianteId, VigenciaDesde DESC);

    CREATE INDEX IX_OPT_PrecioProducto_Sucursal
        ON OPT_PrecioProducto (TenantId, SucursalId, VarianteId);
END;
