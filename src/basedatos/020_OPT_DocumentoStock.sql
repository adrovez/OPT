-- 020_OPT_DocumentoStock.sql
-- Documentos de entrada de stock (FacturaCompra, BoletaCompra, OtroIngreso)
-- Al confirmar un documento se generan los MovimientoStock correspondientes
-- y se actualiza OPT_PrecioProducto con el costo de la linea.

-- ── 1. Cabecera del documento ─────────────────────────────────────────────────
IF OBJECT_ID('OPT_DocumentoStock', 'U') IS NULL
BEGIN
    CREATE TABLE OPT_DocumentoStock (
        DocumentoId      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID()
                             CONSTRAINT PK_OPT_DocumentoStock PRIMARY KEY,
        TenantId         UNIQUEIDENTIFIER NOT NULL,
        SucursalId       UNIQUEIDENTIFIER NOT NULL,
        TipoDocumento    VARCHAR(20)      NOT NULL
                             CONSTRAINT CK_OPT_DocumentoStock_Tipo
                             CHECK (TipoDocumento IN ('FacturaCompra', 'BoletaCompra', 'OtroIngreso')),
        NumeroDocumento  NVARCHAR(50)     NOT NULL,
        Fecha            DATE             NOT NULL,
        ProveedorNombre  NVARCHAR(200)    NULL,
        Estado           VARCHAR(20)      NOT NULL DEFAULT 'Confirmado'
                             CONSTRAINT CK_OPT_DocumentoStock_Estado
                             CHECK (Estado IN ('Confirmado', 'Anulado')),
        Observacion      NVARCHAR(500)    NULL,
        IsDeleted        BIT              NOT NULL DEFAULT 0,
        CreatedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt        DATETIME2        NULL,
        CreatedBy        NVARCHAR(100)    NULL,
        UpdatedBy        NVARCHAR(100)    NULL,

        CONSTRAINT FK_OPT_DocumentoStock_Sucursal
            FOREIGN KEY (SucursalId)
            REFERENCES OPT_Sucursal (idSucursal)
    );

    CREATE INDEX IX_OPT_DocumentoStock_Sucursal_Fecha
        ON OPT_DocumentoStock (TenantId, SucursalId, Fecha DESC)
        WHERE IsDeleted = 0;

    CREATE INDEX IX_OPT_DocumentoStock_Tipo_Estado
        ON OPT_DocumentoStock (TenantId, TipoDocumento, Estado)
        WHERE IsDeleted = 0;
END;

-- ── 2. Líneas del documento ───────────────────────────────────────────────────
IF OBJECT_ID('OPT_DocumentoStockLinea', 'U') IS NULL
BEGIN
    CREATE TABLE OPT_DocumentoStockLinea (
        LineaId     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID()
                        CONSTRAINT PK_OPT_DocumentoStockLinea PRIMARY KEY,
        DocumentoId UNIQUEIDENTIFIER NOT NULL,
        VarianteId  UNIQUEIDENTIFIER NOT NULL,
        Cantidad    INT              NOT NULL CONSTRAINT CK_OPT_DocumentoStockLinea_Cantidad CHECK (Cantidad > 0),
        PrecioCosto DECIMAL(12, 2)   NULL,

        CONSTRAINT FK_OPT_DocumentoStockLinea_Documento
            FOREIGN KEY (DocumentoId)
            REFERENCES OPT_DocumentoStock (DocumentoId)
            ON DELETE CASCADE,
        CONSTRAINT FK_OPT_DocumentoStockLinea_Variante
            FOREIGN KEY (VarianteId)
            REFERENCES OPT_ProductoVariante (VarianteId)
    );

    CREATE INDEX IX_OPT_DocumentoStockLinea_Documento
        ON OPT_DocumentoStockLinea (DocumentoId);
END;

-- ── 3. FK DocumentoId en MovimientoStock ─────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('OPT_MovimientoStock') AND name = 'DocumentoId'
)
BEGIN
    ALTER TABLE OPT_MovimientoStock
    ADD DocumentoId UNIQUEIDENTIFIER NULL
        CONSTRAINT FK_OPT_MovimientoStock_Documento
        FOREIGN KEY REFERENCES OPT_DocumentoStock (DocumentoId);
END;
