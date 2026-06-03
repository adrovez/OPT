-- =============================================================
-- Script 027 — Rediseño módulo Inventario
--
-- ELIMINA:  OPT_ProductoCategoria, OPT_Producto, OPT_ProductoVariante,
--           OPT_Stock, OPT_MovimientoStock, OPT_PrecioProducto,
--           OPT_DocumentoStock, OPT_DocumentoStockLinea
--
-- CREA:     OPT_Categoria, OPT_Producto (jerarquía self-ref),
--           OPT_PrecioProducto, OPT_Stock, OPT_DocumentoEntrada,
--           OPT_DocumentoEntradaLinea, OPT_Transferencia, OPT_MovimientoStock
--
-- PRECONDICIÓN: scripts 000–026 aplicados sobre dbOPT.
-- =============================================================

USE [dbOPT];
GO

-- Requerido para índices filtrados (WHERE ...) y vistas indexadas
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '=== 027 — Rediseño Inventario: inicio ===';
GO

-- ════════════════════════════════════════════════════════════
-- SECCIÓN 1: DROP tablas nuevas y antiguas (orden inverso de FK)
-- Permite re-ejecutar el script desde cero en cualquier momento.
-- ════════════════════════════════════════════════════════════

-- 1.0 Tablas nuevas (por si el script se re-ejecuta)
IF OBJECT_ID(N'[dbo].[OPT_MovimientoStock]',       N'U') IS NOT NULL DROP TABLE [dbo].[OPT_MovimientoStock];
IF OBJECT_ID(N'[dbo].[OPT_Transferencia]',          N'U') IS NOT NULL DROP TABLE [dbo].[OPT_Transferencia];
IF OBJECT_ID(N'[dbo].[OPT_DocumentoEntradaLinea]',  N'U') IS NOT NULL DROP TABLE [dbo].[OPT_DocumentoEntradaLinea];
IF OBJECT_ID(N'[dbo].[OPT_DocumentoEntrada]',       N'U') IS NOT NULL DROP TABLE [dbo].[OPT_DocumentoEntrada];
IF OBJECT_ID(N'[dbo].[OPT_Stock]',                  N'U') IS NOT NULL DROP TABLE [dbo].[OPT_Stock];
IF OBJECT_ID(N'[dbo].[OPT_PrecioProducto]',         N'U') IS NOT NULL DROP TABLE [dbo].[OPT_PrecioProducto];
IF OBJECT_ID(N'[dbo].[OPT_Producto]',               N'U') IS NOT NULL DROP TABLE [dbo].[OPT_Producto];
IF OBJECT_ID(N'[dbo].[OPT_Categoria]',              N'U') IS NOT NULL DROP TABLE [dbo].[OPT_Categoria];
PRINT '--- Tablas nuevas eliminadas (re-run) ---';
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1.1 Líneas de documento (depende de OPT_DocumentoStock y OPT_ProductoVariante)
IF OBJECT_ID(N'[dbo].[OPT_DocumentoStockLinea]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_DocumentoStockLinea];
    PRINT 'DROP OPT_DocumentoStockLinea OK';
END
GO

-- 1.2 Quitar FK_OPT_MovimientoStock_Documento antes de eliminar OPT_DocumentoStock
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name        = N'FK_OPT_MovimientoStock_Documento'
      AND parent_object_id = OBJECT_ID(N'OPT_MovimientoStock')
)
BEGIN
    ALTER TABLE [dbo].[OPT_MovimientoStock]
        DROP CONSTRAINT FK_OPT_MovimientoStock_Documento;
    PRINT 'DROP FK_OPT_MovimientoStock_Documento OK';
END
GO

-- 1.3 Cabecera de documentos de entrada
IF OBJECT_ID(N'[dbo].[OPT_DocumentoStock]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_DocumentoStock];
    PRINT 'DROP OPT_DocumentoStock OK';
END
GO

-- 1.4 Historial de precios (depende de OPT_ProductoVariante)
IF OBJECT_ID(N'[dbo].[OPT_PrecioProducto]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_PrecioProducto];
    PRINT 'DROP OPT_PrecioProducto OK';
END
GO

-- 1.5 Movimientos de stock (depende de OPT_ProductoVariante)
IF OBJECT_ID(N'[dbo].[OPT_MovimientoStock]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_MovimientoStock];
    PRINT 'DROP OPT_MovimientoStock OK';
END
GO

-- 1.6 Stock materializado (depende de OPT_ProductoVariante)
IF OBJECT_ID(N'[dbo].[OPT_Stock]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_Stock];
    PRINT 'DROP OPT_Stock OK';
END
GO

-- 1.7 Variantes (depende de OPT_Producto)
IF OBJECT_ID(N'[dbo].[OPT_ProductoVariante]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_ProductoVariante];
    PRINT 'DROP OPT_ProductoVariante OK';
END
GO

-- 1.8 Ficha de producto (depende de OPT_ProductoCategoria)
IF OBJECT_ID(N'[dbo].[OPT_Producto]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_Producto];
    PRINT 'DROP OPT_Producto OK';
END
GO

-- 1.9 Categorías
IF OBJECT_ID(N'[dbo].[OPT_ProductoCategoria]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[OPT_ProductoCategoria];
    PRINT 'DROP OPT_ProductoCategoria OK';
END
GO

PRINT '--- Tablas antiguas eliminadas ---';
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ════════════════════════════════════════════════════════════
-- SECCIÓN 2: CREATE tablas nuevas
-- ════════════════════════════════════════════════════════════

-- ── 2.1  OPT_Categoria ───────────────────────────────────────
-- Catálogo plano de categorías, por tenant.
IF OBJECT_ID(N'[dbo].[OPT_Categoria]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Categoria]
    (
        [CategoriaId]  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]     UNIQUEIDENTIFIER NOT NULL,
        [Nombre]       NVARCHAR(100)    NOT NULL,
        [Descripcion]  NVARCHAR(500)    NULL,
        [IsActivo]     BIT              NOT NULL DEFAULT 1,
        [IsDeleted]    BIT              NOT NULL DEFAULT 0,
        [CreatedAt]    DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]    DATETIME2        NULL,
        [CreatedBy]    NVARCHAR(100)    NULL,
        [UpdatedBy]    NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_Categoria
            PRIMARY KEY CLUSTERED ([CategoriaId]),

        CONSTRAINT FK_OPT_Categoria_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_Categoria_Tenant
        ON [dbo].[OPT_Categoria] ([TenantId])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_Categoria OK';
END
GO

-- ── 2.2  OPT_Producto (jerarquía self-reference) ─────────────
-- Un nodo raíz (ProductoPadreId NULL) representa la familia de producto.
-- Los nodos hijo representan los SKU concretos que tienen stock.
-- Tipo = 'Servicio' → nunca tiene hijos ni stock.
IF OBJECT_ID(N'[dbo].[OPT_Producto]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Producto]
    (
        [ProductoId]      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]        UNIQUEIDENTIFIER NOT NULL,
        [ProductoPadreId] UNIQUEIDENTIFIER NULL,       -- NULL = nodo raíz
        [CategoriaId]     UNIQUEIDENTIFIER NULL,
        [CodigoInterno]   NVARCHAR(100)    NOT NULL,
        [Nombre]          NVARCHAR(200)    NOT NULL,
        [Descripcion]     NVARCHAR(2000)   NULL,
        [Tipo]            NVARCHAR(20)     NOT NULL DEFAULT 'Producto',
        [UnidadMedida]    NVARCHAR(50)     NULL,       -- 'unidad', 'par', 'caja', etc.
        [IsActivo]        BIT              NOT NULL DEFAULT 1,
        [IsDeleted]       BIT              NOT NULL DEFAULT 0,
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]       DATETIME2        NULL,
        [CreatedBy]       NVARCHAR(100)    NULL,
        [UpdatedBy]       NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_Producto
            PRIMARY KEY CLUSTERED ([ProductoId]),

        CONSTRAINT CK_OPT_Producto_Tipo
            CHECK ([Tipo] IN ('Producto', 'Servicio')),

        CONSTRAINT FK_OPT_Producto_Categoria
            FOREIGN KEY ([CategoriaId]) REFERENCES [dbo].[OPT_Categoria] ([CategoriaId]),

        CONSTRAINT FK_OPT_Producto_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    -- Self-reference se agrega después del CREATE para evitar dependencia circular
    ALTER TABLE [dbo].[OPT_Producto]
        ADD CONSTRAINT FK_OPT_Producto_Padre
            FOREIGN KEY ([ProductoPadreId]) REFERENCES [dbo].[OPT_Producto] ([ProductoId]);

    -- CodigoInterno único por tenant (padres e hijos comparten el mismo espacio)
    CREATE UNIQUE NONCLUSTERED INDEX UQ_OPT_Producto_Codigo
        ON [dbo].[OPT_Producto] ([TenantId], [CodigoInterno])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_Producto_Padre
        ON [dbo].[OPT_Producto] ([TenantId], [ProductoPadreId])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_Producto_Categoria
        ON [dbo].[OPT_Producto] ([TenantId], [CategoriaId])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_Producto OK';
END
GO

-- ── 2.3  OPT_PrecioProducto (historial global por producto) ──
-- Precio global (no por sucursal). Ambos campos son opcionales.
-- VigenciaHasta NULL = precio actualmente vigente.
-- Sin IsDeleted: el historial se gestiona con VigenciaDesde/VigenciaHasta.
IF OBJECT_ID(N'[dbo].[OPT_PrecioProducto]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_PrecioProducto]
    (
        [PrecioId]      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]      UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]    UNIQUEIDENTIFIER NOT NULL,
        [PrecioCosto]   DECIMAL(18,2)    NULL,
        [PrecioVenta]   DECIMAL(18,2)    NULL,
        [VigenciaDesde] DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [VigenciaHasta] DATETIME2        NULL,       -- NULL = vigente
        [CreatedAt]     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy]     NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_PrecioProducto
            PRIMARY KEY CLUSTERED ([PrecioId]),

        CONSTRAINT FK_OPT_PrecioProducto_Producto
            FOREIGN KEY ([ProductoId]) REFERENCES [dbo].[OPT_Producto] ([ProductoId]),

        CONSTRAINT FK_OPT_PrecioProducto_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    -- Precio vigente de un producto (consulta más frecuente)
    CREATE NONCLUSTERED INDEX IX_OPT_PrecioProducto_Vigente
        ON [dbo].[OPT_PrecioProducto] ([TenantId], [ProductoId], [VigenciaDesde] DESC)
        WHERE [VigenciaHasta] IS NULL;

    PRINT 'CREATE OPT_PrecioProducto OK';
END
GO

-- ── 2.4  OPT_Stock ───────────────────────────────────────────
-- Stock materializado: una fila por (Tenant, Producto, Sucursal).
-- CantidadDisponible puede ser negativa (salida sin stock permitida).
-- StockMinimo >= 0 para alertas de reposición.
IF OBJECT_ID(N'[dbo].[OPT_Stock]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Stock]
    (
        [StockId]            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]           UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]         UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]         UNIQUEIDENTIFIER NOT NULL,
        [CantidadDisponible] INT              NOT NULL DEFAULT 0,
        [StockMinimo]        INT              NOT NULL DEFAULT 0,
        [IsDeleted]          BIT              NOT NULL DEFAULT 0,
        [CreatedAt]          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]          DATETIME2        NULL,
        [CreatedBy]          NVARCHAR(100)    NULL,
        [UpdatedBy]          NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_Stock
            PRIMARY KEY CLUSTERED ([StockId]),

        CONSTRAINT UQ_OPT_Stock_Producto_Sucursal
            UNIQUE ([TenantId], [ProductoId], [SucursalId]),

        CONSTRAINT CK_OPT_Stock_Minimo
            CHECK ([StockMinimo] >= 0),

        CONSTRAINT FK_OPT_Stock_Producto
            FOREIGN KEY ([ProductoId]) REFERENCES [dbo].[OPT_Producto] ([ProductoId]),

        CONSTRAINT FK_OPT_Stock_Sucursal
            FOREIGN KEY ([SucursalId]) REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_Stock_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_Stock_Sucursal
        ON [dbo].[OPT_Stock] ([TenantId], [SucursalId])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_Stock_Producto
        ON [dbo].[OPT_Stock] ([TenantId], [ProductoId])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_Stock OK';
END
GO

-- ── 2.5  OPT_DocumentoEntrada ────────────────────────────────
-- Cabecera del documento de entrada de mercadería.
-- Estado Borrador → Confirmado (genera movimientos) | Anulado (compensación).
IF OBJECT_ID(N'[dbo].[OPT_DocumentoEntrada]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_DocumentoEntrada]
    (
        [DocumentoId]     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]        UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]      UNIQUEIDENTIFIER NOT NULL,
        [TipoDocumento]   NVARCHAR(20)     NOT NULL,
        [NumeroDocumento] NVARCHAR(50)     NULL,
        [FechaDocumento]  DATE             NOT NULL,
        [ProveedorNombre] NVARCHAR(200)    NULL,
        [ProveedorRut]    NVARCHAR(20)     NULL,
        [Observaciones]   NVARCHAR(2000)   NULL,
        [Estado]          NVARCHAR(20)     NOT NULL DEFAULT 'Borrador',
        [IsDeleted]       BIT              NOT NULL DEFAULT 0,
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]       DATETIME2        NULL,
        [CreatedBy]       NVARCHAR(100)    NULL,
        [UpdatedBy]       NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_DocumentoEntrada
            PRIMARY KEY CLUSTERED ([DocumentoId]),

        CONSTRAINT CK_OPT_DocumentoEntrada_Tipo
            CHECK ([TipoDocumento] IN ('FacturaCompra','BoletaCompra','GuiaDespacho','OtroIngreso')),

        CONSTRAINT CK_OPT_DocumentoEntrada_Estado
            CHECK ([Estado] IN ('Borrador','Confirmado','Anulado')),

        CONSTRAINT FK_OPT_DocumentoEntrada_Sucursal
            FOREIGN KEY ([SucursalId]) REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_DocumentoEntrada_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_DocumentoEntrada_Sucursal_Fecha
        ON [dbo].[OPT_DocumentoEntrada] ([TenantId], [SucursalId], [FechaDocumento] DESC)
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_DocumentoEntrada_Estado
        ON [dbo].[OPT_DocumentoEntrada] ([TenantId], [Estado])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_DocumentoEntrada OK';
END
GO

-- ── 2.6  OPT_DocumentoEntradaLinea ───────────────────────────
-- Líneas del documento. ON DELETE CASCADE: al eliminar la cabecera (Borrador)
-- se eliminan las líneas.
IF OBJECT_ID(N'[dbo].[OPT_DocumentoEntradaLinea]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_DocumentoEntradaLinea]
    (
        [LineaId]      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]     UNIQUEIDENTIFIER NOT NULL,
        [DocumentoId]  UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]   UNIQUEIDENTIFIER NOT NULL,
        [Cantidad]     INT              NOT NULL,
        [PrecioCosto]  DECIMAL(18,2)    NULL,
        [Observaciones] NVARCHAR(500)   NULL,

        CONSTRAINT PK_OPT_DocumentoEntradaLinea
            PRIMARY KEY CLUSTERED ([LineaId]),

        CONSTRAINT CK_OPT_DocumentoEntradaLinea_Cantidad
            CHECK ([Cantidad] > 0),

        CONSTRAINT FK_OPT_DocumentoEntradaLinea_Documento
            FOREIGN KEY ([DocumentoId])
            REFERENCES [dbo].[OPT_DocumentoEntrada] ([DocumentoId])
            ON DELETE CASCADE,

        CONSTRAINT FK_OPT_DocumentoEntradaLinea_Producto
            FOREIGN KEY ([ProductoId]) REFERENCES [dbo].[OPT_Producto] ([ProductoId]),

        CONSTRAINT FK_OPT_DocumentoEntradaLinea_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_DocumentoEntradaLinea_Documento
        ON [dbo].[OPT_DocumentoEntradaLinea] ([DocumentoId]);

    PRINT 'CREATE OPT_DocumentoEntradaLinea OK';
END
GO

-- ── 2.7  OPT_Transferencia ───────────────────────────────────
-- Cabecera de transferencia entre sucursales.
-- El stock se mueve al Confirmar: genera TransferenciaSalida + TransferenciaEntrada
-- en OPT_MovimientoStock.
IF OBJECT_ID(N'[dbo].[OPT_Transferencia]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Transferencia]
    (
        [TransferenciaId]    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]           UNIQUEIDENTIFIER NOT NULL,
        [SucursalOrigenId]   UNIQUEIDENTIFIER NOT NULL,
        [SucursalDestinoId]  UNIQUEIDENTIFIER NOT NULL,
        [FechaTransferencia] DATE             NOT NULL,
        [Estado]             NVARCHAR(20)     NOT NULL DEFAULT 'Pendiente',
        [Observaciones]      NVARCHAR(500)    NULL,
        [IsDeleted]          BIT              NOT NULL DEFAULT 0,
        [CreatedAt]          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]          DATETIME2        NULL,
        [CreatedBy]          NVARCHAR(100)    NULL,
        [UpdatedBy]          NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_Transferencia
            PRIMARY KEY CLUSTERED ([TransferenciaId]),

        CONSTRAINT CK_OPT_Transferencia_Estado
            CHECK ([Estado] IN ('Pendiente','Confirmada','Anulada')),

        CONSTRAINT CK_OPT_Transferencia_Sucursales
            CHECK ([SucursalOrigenId] <> [SucursalDestinoId]),

        CONSTRAINT FK_OPT_Transferencia_Origen
            FOREIGN KEY ([SucursalOrigenId]) REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_Transferencia_Destino
            FOREIGN KEY ([SucursalDestinoId]) REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_Transferencia_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_Transferencia_Origen
        ON [dbo].[OPT_Transferencia] ([TenantId], [SucursalOrigenId], [FechaTransferencia] DESC)
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_Transferencia_Destino
        ON [dbo].[OPT_Transferencia] ([TenantId], [SucursalDestinoId], [FechaTransferencia] DESC)
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_Transferencia OK';
END
GO

-- ── 2.8  OPT_MovimientoStock (rediseñado) ────────────────────
-- Registro inmutable. Para corregir un movimiento erróneo se emite
-- un movimiento compensatorio.
--
-- Tipos y reglas de Cantidad:
--   Entrada              → Cantidad > 0  (vía DocumentoEntrada)
--   Salida               → Cantidad > 0
--   Ajuste               → Cantidad ≠ 0  (firmado: + suma, − resta)
--   Merma                → Cantidad > 0
--   DevolucionProveedor  → Cantidad > 0
--   TransferenciaSalida  → Cantidad > 0  (vía OPT_Transferencia, sucursal origen)
--   TransferenciaEntrada → Cantidad > 0  (vía OPT_Transferencia, sucursal destino)
IF OBJECT_ID(N'[dbo].[OPT_MovimientoStock]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_MovimientoStock]
    (
        [MovimientoId]    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        [TenantId]        UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]      UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]      UNIQUEIDENTIFIER NOT NULL,
        [UsuarioId]       UNIQUEIDENTIFIER NOT NULL,
        [TipoMovimiento]  NVARCHAR(30)     NOT NULL,

        -- Ajuste: firmado. Resto: siempre positivo.
        [Cantidad]        INT              NOT NULL,
        [CantidadAntes]   INT              NOT NULL,
        [CantidadDespues] INT              NOT NULL,

        -- Trazabilidad: solo uno aplica según el tipo
        [DocumentoId]     UNIQUEIDENTIFIER NULL,   -- Entrada
        [TransferenciaId] UNIQUEIDENTIFIER NULL,   -- Transferencia*

        [Referencia]      NVARCHAR(100)    NULL,
        [Observacion]     NVARCHAR(500)    NULL,
        [FechaMovimiento] DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy]       NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_MovimientoStock
            PRIMARY KEY CLUSTERED ([MovimientoId]),

        CONSTRAINT CK_OPT_Movimiento_Tipo CHECK ([TipoMovimiento] IN (
            'Entrada', 'Salida', 'Ajuste', 'Merma',
            'DevolucionProveedor', 'TransferenciaEntrada', 'TransferenciaSalida'
        )),

        CONSTRAINT CK_OPT_Movimiento_Cantidad CHECK (
            ([TipoMovimiento] = 'Ajuste'  AND [Cantidad] <> 0) OR
            ([TipoMovimiento] <> 'Ajuste' AND [Cantidad] > 0)
        ),

        CONSTRAINT FK_OPT_Movimiento_Producto
            FOREIGN KEY ([ProductoId]) REFERENCES [dbo].[OPT_Producto] ([ProductoId]),

        CONSTRAINT FK_OPT_Movimiento_Sucursal
            FOREIGN KEY ([SucursalId]) REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_Movimiento_Usuario
            FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[OPT_Usuario] ([UsuarioId]),

        CONSTRAINT FK_OPT_Movimiento_Documento
            FOREIGN KEY ([DocumentoId]) REFERENCES [dbo].[OPT_DocumentoEntrada] ([DocumentoId]),

        CONSTRAINT FK_OPT_Movimiento_Transferencia
            FOREIGN KEY ([TransferenciaId]) REFERENCES [dbo].[OPT_Transferencia] ([TransferenciaId]),

        CONSTRAINT FK_OPT_Movimiento_Tenant
            FOREIGN KEY ([TenantId]) REFERENCES [dbo].[OPT_Tenant] ([TenantId])
    );

    -- Historial por producto + sucursal (consulta más frecuente del módulo)
    CREATE NONCLUSTERED INDEX IX_OPT_Movimiento_Producto_Sucursal_Fecha
        ON [dbo].[OPT_MovimientoStock] ([TenantId], [ProductoId], [SucursalId], [FechaMovimiento] DESC);

    -- Historial general de una sucursal
    CREATE NONCLUSTERED INDEX IX_OPT_Movimiento_Sucursal_Fecha
        ON [dbo].[OPT_MovimientoStock] ([TenantId], [SucursalId], [FechaMovimiento] DESC);

    -- Auditoría por usuario
    CREATE NONCLUSTERED INDEX IX_OPT_Movimiento_Usuario
        ON [dbo].[OPT_MovimientoStock] ([UsuarioId], [FechaMovimiento] DESC);

    PRINT 'CREATE OPT_MovimientoStock OK';
END
GO

PRINT '=== 027 — Rediseño Inventario: completado ===';
GO
