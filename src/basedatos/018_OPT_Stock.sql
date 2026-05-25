-- ============================================================================
-- OPT SaaS – Módulo Stock / Inventario
-- Script:  018_OPT_Stock.sql
-- Tablas:  OPT_Stock          — stock materializado (cantidad actual por variante+sucursal)
--          OPT_MovimientoStock — historial inmutable de movimientos
-- Tipos:   Entrada (> 0), Salida (> 0 que resta), Ajuste (± firmado)
-- Scoped:  siempre por SucursalId (header X-Sucursal-Id en la API)
-- Idempotente: usa IF OBJECT_ID IS NULL para no fallar en re-ejecuciones.
-- ============================================================================

USE [dbOPT];
GO

-- ── OPT_Stock ────────────────────────────────────────────────────────────────
-- Una fila por (TenantId, VarianteId, SucursalId). Se actualiza en cada movimiento.
-- CantidadDisponible refleja el saldo actual; el historial vive en OPT_MovimientoStock.

IF OBJECT_ID(N'[dbo].[OPT_Stock]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_Stock]
    (
        [StockId]             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_Stock_StockId    DEFAULT NEWSEQUENTIALID(),
        [TenantId]            UNIQUEIDENTIFIER NOT NULL,
        [VarianteId]          UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]          UNIQUEIDENTIFIER NOT NULL,
        [CantidadDisponible]  INT              NOT NULL CONSTRAINT DF_OPT_Stock_Cantidad   DEFAULT (0),
        [StockMinimo]         INT              NOT NULL CONSTRAINT DF_OPT_Stock_Minimo     DEFAULT (0),

        -- Auditoría
        [CreatedAt]           DATETIME2        NOT NULL CONSTRAINT DF_OPT_Stock_CreatedAt  DEFAULT (GETUTCDATE()),
        [UpdatedAt]           DATETIME2        NULL,
        [CreatedBy]           NVARCHAR(100)    NULL,
        [UpdatedBy]           NVARCHAR(100)    NULL,
        [IsDeleted]           BIT              NOT NULL CONSTRAINT DF_OPT_Stock_IsDeleted  DEFAULT (0),

        CONSTRAINT PK_OPT_Stock PRIMARY KEY CLUSTERED ([StockId] ASC),

        -- Solo un registro de stock por variante+sucursal dentro del tenant
        CONSTRAINT UQ_OPT_Stock_Variante_Sucursal UNIQUE ([TenantId], [VarianteId], [SucursalId]),

        CONSTRAINT CK_OPT_Stock_Minimo CHECK ([StockMinimo] >= 0),

        CONSTRAINT FK_OPT_Stock_Variante FOREIGN KEY ([VarianteId])
            REFERENCES [dbo].[OPT_ProductoVariante] ([VarianteId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Stock_Sucursal FOREIGN KEY ([SucursalId])
            REFERENCES [dbo].[OPT_Sucursal] ([idSucursal])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Stock_Tenant FOREIGN KEY ([TenantId])
            REFERENCES [dbo].[OPT_Tenant] ([TenantId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_Stock creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_Stock ya existe — se omite la creación.';
END
GO

-- Listado de stock por sucursal (consulta principal del módulo)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Stock_Sucursal'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Stock]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Stock_Sucursal]
        ON [dbo].[OPT_Stock] ([TenantId] ASC, [SucursalId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Stock_Sucursal creado.';
END
GO

-- Consulta de stock de una variante en todas las sucursales
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Stock_Variante'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_Stock]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Stock_Variante]
        ON [dbo].[OPT_Stock] ([TenantId] ASC, [VarianteId] ASC)
        WHERE [IsDeleted] = 0;

    PRINT 'Índice IX_OPT_Stock_Variante creado.';
END
GO

-- ── OPT_MovimientoStock ───────────────────────────────────────────────────────
-- Registro inmutable: no tiene IsDeleted ni UpdatedAt.
-- Para corregir un movimiento equivocado, se registra un movimiento compensatorio.
-- Reglas de negocio:
--   Entrada → Cantidad > 0   (suma al stock)
--   Salida  → Cantidad > 0   (resta al stock; la dirección la da el tipo)
--   Ajuste  → Cantidad ≠ 0   (+ suma, − resta; para cuadrar inventario físico)

IF OBJECT_ID(N'[dbo].[OPT_MovimientoStock]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_MovimientoStock]
    (
        [MovimientoId]    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OPT_Movimiento_Id        DEFAULT NEWSEQUENTIALID(),
        [TenantId]        UNIQUEIDENTIFIER NOT NULL,
        [VarianteId]      UNIQUEIDENTIFIER NOT NULL,
        [SucursalId]      UNIQUEIDENTIFIER NOT NULL,
        [UsuarioId]       UNIQUEIDENTIFIER NOT NULL,

        -- 'Entrada' | 'Salida' | 'Ajuste'
        [TipoMovimiento]  VARCHAR(10)      NOT NULL,

        -- Cantidad del movimiento según las reglas de negocio del tipo
        [Cantidad]        INT              NOT NULL,

        -- Saldo antes y después del movimiento (para auditoría sin recalcular)
        [CantidadAntes]   INT              NOT NULL,
        [CantidadDespues] INT              NOT NULL,

        -- Referencia opcional: número de orden, factura, remisión, etc.
        [Referencia]      NVARCHAR(100)    NULL,
        [Observacion]     NVARCHAR(500)    NULL,

        [FechaMovimiento] DATETIME2        NOT NULL CONSTRAINT DF_OPT_Movimiento_Fecha     DEFAULT (GETUTCDATE()),
        [CreatedAt]       DATETIME2        NOT NULL CONSTRAINT DF_OPT_Movimiento_CreatedAt DEFAULT (GETUTCDATE()),
        [CreatedBy]       NVARCHAR(100)    NULL,

        CONSTRAINT PK_OPT_MovimientoStock PRIMARY KEY CLUSTERED ([MovimientoId] ASC),

        CONSTRAINT CK_OPT_Movimiento_Tipo CHECK (
            [TipoMovimiento] IN ('Entrada', 'Salida', 'Ajuste')
        ),

        CONSTRAINT CK_OPT_Movimiento_Cantidad CHECK (
            ([TipoMovimiento] = 'Entrada' AND [Cantidad] > 0) OR
            ([TipoMovimiento] = 'Salida'  AND [Cantidad] > 0) OR
            ([TipoMovimiento] = 'Ajuste'  AND [Cantidad] <> 0)
        ),

        CONSTRAINT FK_OPT_Movimiento_Variante FOREIGN KEY ([VarianteId])
            REFERENCES [dbo].[OPT_ProductoVariante] ([VarianteId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Movimiento_Sucursal FOREIGN KEY ([SucursalId])
            REFERENCES [dbo].[OPT_Sucursal] ([idSucursal])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Movimiento_Usuario FOREIGN KEY ([UsuarioId])
            REFERENCES [dbo].[OPT_Usuario] ([UsuarioId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

        CONSTRAINT FK_OPT_Movimiento_Tenant FOREIGN KEY ([TenantId])
            REFERENCES [dbo].[OPT_Tenant] ([TenantId])
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
    );

    PRINT 'Tabla OPT_MovimientoStock creada correctamente.';
END
ELSE
BEGIN
    PRINT 'Tabla OPT_MovimientoStock ya existe — se omite la creación.';
END
GO

-- Historial de una variante en una sucursal ordenado por fecha (consulta más frecuente)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Movimiento_Variante_Sucursal_Fecha'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_MovimientoStock]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Movimiento_Variante_Sucursal_Fecha]
        ON [dbo].[OPT_MovimientoStock] ([TenantId] ASC, [VarianteId] ASC, [SucursalId] ASC, [FechaMovimiento] DESC);

    PRINT 'Índice IX_OPT_Movimiento_Variante_Sucursal_Fecha creado.';
END
GO

-- Auditoría por usuario
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_OPT_Movimiento_Usuario'
      AND object_id = OBJECT_ID(N'[dbo].[OPT_MovimientoStock]')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OPT_Movimiento_Usuario]
        ON [dbo].[OPT_MovimientoStock] ([UsuarioId] ASC, [FechaMovimiento] DESC);

    PRINT 'Índice IX_OPT_Movimiento_Usuario creado.';
END
GO

PRINT '=== Script 018_OPT_Stock.sql completado ===';
GO
