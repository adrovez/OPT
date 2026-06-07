-- =============================================================================
-- Script 029 — OPT_OrdenTrabajo
--
-- CREA:
--   OPT_OrdenTrabajo         Cabecera de la orden de trabajo
--   OPT_OrdenTrabajoLinea    Productos / servicios de la OT
--   OPT_OrdenTrabajoPago     Abonos (al crear) y pagos posteriores unificados
--   OPT_OrdenTrabajoCuota    Plan de cuotas generado sobre el saldo
--   OPT_OrdenTrabajoBitacora Bitácora inmutable de etapas físicas
--
-- PRECONDICIÓN: scripts 000–028 aplicados sobre dbOPT.
-- =============================================================================

USE [dbOPT];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '=== 029 — OPT_OrdenTrabajo: inicio ===';
GO

-- =============================================================================
-- 1. OPT_OrdenTrabajo — cabecera
-- =============================================================================
IF OBJECT_ID(N'[dbo].[OPT_OrdenTrabajo]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_OrdenTrabajo]
    (
        -- Identidad y tenant
        [OTId]                UNIQUEIDENTIFIER NOT NULL
                                  CONSTRAINT DF_OPT_OrdenTrabajo_OTId DEFAULT NEWSEQUENTIALID(),
        [TenantId]            UNIQUEIDENTIFIER NOT NULL,
        [idSucursal]          UNIQUEIDENTIFIER NOT NULL,   -- header X-Sucursal-Id

        -- Número de orden (externo, ingresado manualmente — p. ej., número del laboratorio)
        [NumeroOT]            VARCHAR(20)      NOT NULL,

        -- Paciente (siempre una Persona)
        [ClienteId]           UNIQUEIDENTIFIER NOT NULL,

        -- Facturación
        [TipoFacturacion]     VARCHAR(15)      NOT NULL    -- 'Particular' | 'Empresa'
                                  CONSTRAINT DF_OPT_OrdenTrabajo_TipoFact DEFAULT 'Particular',
        [EmpresaClienteId]    UNIQUEIDENTIFIER NULL,       -- FK a OPT_Cliente (TipoCliente='Empresa')
        [Beneficiario]        NVARCHAR(100)    NULL,       -- nombre libre del receptor si difiere del cliente

        -- Vínculo clínico (nullable — OT puede crearse sin Atención previa)
        [AtencionId]          UNIQUEIDENTIFIER NULL,
        [RecetaCristalesId]   UNIQUEIDENTIFIER NULL,

        -- Fechas
        [FechaIngreso]        DATE             NOT NULL
                                  CONSTRAINT DF_OPT_OrdenTrabajo_FechaIngreso DEFAULT CAST(GETDATE() AS DATE),
        [FechaEntrega]        DATE             NOT NULL,
        [HoraEntrega]         TIME(0)          NULL
                                  CONSTRAINT DF_OPT_OrdenTrabajo_HoraEntrega DEFAULT '12:00:00',

        -- Montos (calculados y persistidos al Finalizar la OT)
        -- MontoTotal = SubTotal - Descuento  |  Saldo = MontoTotal - TotalAbonado
        [SubTotal]            DECIMAL(18,2)    NOT NULL    CONSTRAINT DF_OPT_OT_SubTotal     DEFAULT 0,
        [Descuento]           DECIMAL(18,2)    NOT NULL    CONSTRAINT DF_OPT_OT_Descuento    DEFAULT 0,
        [MontoTotal]          DECIMAL(18,2)    NOT NULL    CONSTRAINT DF_OPT_OT_MontoTotal   DEFAULT 0,
        [TotalAbonado]        DECIMAL(18,2)    NOT NULL    CONSTRAINT DF_OPT_OT_TotalAbonado DEFAULT 0,
        [Saldo]               DECIMAL(18,2)    NOT NULL    CONSTRAINT DF_OPT_OT_Saldo        DEFAULT 0,

        -- Cuotas
        [NumeroCuotas]        INT              NOT NULL    CONSTRAINT DF_OPT_OT_NumeroCuotas DEFAULT 0,
        [FechaInicioCuotas]   DATE             NULL,       -- vencimiento de la primera cuota

        -- Estados
        [EstadoPago]          VARCHAR(15)      NOT NULL
                                  CONSTRAINT DF_OPT_OT_EstadoPago DEFAULT 'Pendiente',
        [EtapaOT]             VARCHAR(20)      NOT NULL
                                  CONSTRAINT DF_OPT_OT_EtapaOT    DEFAULT 'Ingresado',

        [Observacion]         NVARCHAR(500)    NULL,

        -- Auditoría
        [CreatedAt]           DATETIME2        NOT NULL
                                  CONSTRAINT DF_OPT_OT_CreatedAt DEFAULT GETUTCDATE(),
        [CreatedBy]           NVARCHAR(50)     NOT NULL,
        [UpdatedAt]           DATETIME2        NULL,
        [UpdatedBy]           NVARCHAR(50)     NULL,
        [IsDeleted]           BIT              NOT NULL    CONSTRAINT DF_OPT_OT_IsDeleted DEFAULT 0,

        -- ── Constraints ──────────────────────────────────────────────────────
        CONSTRAINT PK_OPT_OrdenTrabajo
            PRIMARY KEY CLUSTERED ([OTId] ASC),

        CONSTRAINT CK_OPT_OT_TipoFacturacion
            CHECK ([TipoFacturacion] IN ('Particular', 'Empresa')),

        CONSTRAINT CK_OPT_OT_EstadoPago
            CHECK ([EstadoPago] IN ('Pendiente', 'Pagado')),

        CONSTRAINT CK_OPT_OT_EtapaOT
            CHECK ([EtapaOT] IN ('Ingresado','EnProceso','Montaje','Laboratorio','Calidad','Despacho','Entregado')),

        CONSTRAINT CK_OPT_OT_Descuento
            CHECK ([Descuento] >= 0),

        CONSTRAINT CK_OPT_OT_Montos
            CHECK ([SubTotal] >= 0 AND [MontoTotal] >= 0 AND [TotalAbonado] >= 0 AND [Saldo] >= 0),

        CONSTRAINT CK_OPT_OT_NumeroCuotas
            CHECK ([NumeroCuotas] >= 0),

        -- EmpresaClienteId solo es válido cuando TipoFacturacion = 'Empresa'
        CONSTRAINT CK_OPT_OT_EmpresaRequerida
            CHECK ([TipoFacturacion] = 'Particular' OR [EmpresaClienteId] IS NOT NULL),

        -- ── Foreign keys ─────────────────────────────────────────────────────
        CONSTRAINT FK_OPT_OT_Sucursal
            FOREIGN KEY ([idSucursal])
            REFERENCES [dbo].[OPT_Sucursal] ([idSucursal]),

        CONSTRAINT FK_OPT_OT_Cliente
            FOREIGN KEY ([ClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId]),

        CONSTRAINT FK_OPT_OT_EmpresaCliente
            FOREIGN KEY ([EmpresaClienteId])
            REFERENCES [dbo].[OPT_Cliente] ([ClienteId]),

        CONSTRAINT FK_OPT_OT_Atencion
            FOREIGN KEY ([AtencionId])
            REFERENCES [dbo].[OPT_Atencion] ([AtencionId]),

        CONSTRAINT FK_OPT_OT_RecetaCristales
            FOREIGN KEY ([RecetaCristalesId])
            REFERENCES [dbo].[OPT_RecetaCristales] ([RecetaCristalesId])
    );

    -- NumeroOT único por tenant (excluye eliminadas)
    CREATE UNIQUE NONCLUSTERED INDEX UQ_OPT_OT_NumeroOT
        ON [dbo].[OPT_OrdenTrabajo] ([TenantId], [NumeroOT])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_OT_TenantSucursal
        ON [dbo].[OPT_OrdenTrabajo] ([TenantId], [idSucursal])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_OT_Cliente
        ON [dbo].[OPT_OrdenTrabajo] ([TenantId], [ClienteId])
        WHERE [IsDeleted] = 0;

    CREATE NONCLUSTERED INDEX IX_OPT_OT_Atencion
        ON [dbo].[OPT_OrdenTrabajo] ([AtencionId])
        WHERE [AtencionId] IS NOT NULL AND [IsDeleted] = 0;

    PRINT 'CREATE OPT_OrdenTrabajo OK';
END
ELSE
    PRINT 'OPT_OrdenTrabajo ya existe — sin cambios';
GO

-- =============================================================================
-- 2. OPT_OrdenTrabajoLinea — productos / servicios
-- =============================================================================
IF OBJECT_ID(N'[dbo].[OPT_OrdenTrabajoLinea]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_OrdenTrabajoLinea]
    (
        [LineaId]       UNIQUEIDENTIFIER NOT NULL
                            CONSTRAINT DF_OPT_OTLinea_LineaId DEFAULT NEWSEQUENTIALID(),
        [OTId]          UNIQUEIDENTIFIER NOT NULL,
        [TenantId]      UNIQUEIDENTIFIER NOT NULL,
        [ProductoId]    UNIQUEIDENTIFIER NOT NULL,   -- Producto o Servicio del catálogo
        [Cantidad]      INT              NOT NULL    CONSTRAINT DF_OPT_OTLinea_Cantidad DEFAULT 1,
        [ValorUnitario] DECIMAL(18,2)    NOT NULL,   -- precio libre (no toma el precio del catálogo)
        [Comentario]    NVARCHAR(250)    NULL,
        [IsDeleted]     BIT              NOT NULL    CONSTRAINT DF_OPT_OTLinea_IsDeleted DEFAULT 0,

        CONSTRAINT PK_OPT_OrdenTrabajoLinea
            PRIMARY KEY CLUSTERED ([LineaId] ASC),

        CONSTRAINT CK_OPT_OTLinea_Cantidad
            CHECK ([Cantidad] > 0),

        CONSTRAINT CK_OPT_OTLinea_ValorUnitario
            CHECK ([ValorUnitario] >= 0),

        CONSTRAINT FK_OPT_OTLinea_OT
            FOREIGN KEY ([OTId])
            REFERENCES [dbo].[OPT_OrdenTrabajo] ([OTId])
            ON DELETE CASCADE,

        CONSTRAINT FK_OPT_OTLinea_Producto
            FOREIGN KEY ([ProductoId])
            REFERENCES [dbo].[OPT_Producto] ([ProductoId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_OTLinea_OT
        ON [dbo].[OPT_OrdenTrabajoLinea] ([OTId])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_OrdenTrabajoLinea OK';
END
ELSE
    PRINT 'OPT_OrdenTrabajoLinea ya existe — sin cambios';
GO

-- =============================================================================
-- 3. OPT_OrdenTrabajoPago — abonos (al crear) + pagos posteriores unificados
--    EsAbono = 1 → registrado durante el ingreso de la OT
--    EsAbono = 0 → pago posterior desde el módulo de Caja
-- =============================================================================
IF OBJECT_ID(N'[dbo].[OPT_OrdenTrabajoPago]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_OrdenTrabajoPago]
    (
        [PagoId]        UNIQUEIDENTIFIER NOT NULL
                            CONSTRAINT DF_OPT_OTPago_PagoId DEFAULT NEWSEQUENTIALID(),
        [OTId]          UNIQUEIDENTIFIER NOT NULL,
        [TenantId]      UNIQUEIDENTIFIER NOT NULL,
        [FormaPagoId]   INT              NOT NULL,
        [Monto]         DECIMAL(18,2)    NOT NULL,
        [FechaPago]     DATE             NOT NULL,
        [EsAbono]       BIT              NOT NULL    CONSTRAINT DF_OPT_OTPago_EsAbono DEFAULT 0,
        [Observacion]   NVARCHAR(200)    NULL,
        [CreatedAt]     DATETIME2        NOT NULL
                            CONSTRAINT DF_OPT_OTPago_CreatedAt DEFAULT GETUTCDATE(),
        [CreatedBy]     NVARCHAR(50)     NOT NULL,
        [IsDeleted]     BIT              NOT NULL    CONSTRAINT DF_OPT_OTPago_IsDeleted DEFAULT 0,

        CONSTRAINT PK_OPT_OrdenTrabajoPago
            PRIMARY KEY CLUSTERED ([PagoId] ASC),

        CONSTRAINT CK_OPT_OTPago_Monto
            CHECK ([Monto] > 0),

        CONSTRAINT FK_OPT_OTPago_OT
            FOREIGN KEY ([OTId])
            REFERENCES [dbo].[OPT_OrdenTrabajo] ([OTId])
            ON DELETE CASCADE,

        CONSTRAINT FK_OPT_OTPago_FormaPago
            FOREIGN KEY ([FormaPagoId])
            REFERENCES [dbo].[OPT_FormaPago] ([FormaPagoId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_OTPago_OT
        ON [dbo].[OPT_OrdenTrabajoPago] ([OTId])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_OrdenTrabajoPago OK';
END
ELSE
    PRINT 'OPT_OrdenTrabajoPago ya existe — sin cambios';
GO

-- =============================================================================
-- 4. OPT_OrdenTrabajoCuota — plan de cuotas generado sobre el saldo
--    Generadas al Finalizar la OT: ValorCuota = ROUND(Saldo / NumeroCuotas, 0)
--    La última cuota absorbe el centavo residual.
--    El pago de cuotas se gestiona desde el módulo de Caja.
-- =============================================================================
IF OBJECT_ID(N'[dbo].[OPT_OrdenTrabajoCuota]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_OrdenTrabajoCuota]
    (
        [CuotaId]           UNIQUEIDENTIFIER NOT NULL
                                CONSTRAINT DF_OPT_OTCuota_CuotaId DEFAULT NEWSEQUENTIALID(),
        [OTId]              UNIQUEIDENTIFIER NOT NULL,
        [TenantId]          UNIQUEIDENTIFIER NOT NULL,
        [Numero]            INT              NOT NULL,   -- 1, 2, 3…
        [ValorCuota]        DECIMAL(18,2)    NOT NULL,
        [FechaVencimiento]  DATE             NOT NULL,   -- FechaInicio + (Numero - 1) meses
        [FechaPago]         DATE             NULL,       -- completado desde módulo Caja
        [Estado]            VARCHAR(15)      NOT NULL
                                CONSTRAINT DF_OPT_OTCuota_Estado DEFAULT 'Pendiente',
        [IsDeleted]         BIT              NOT NULL    CONSTRAINT DF_OPT_OTCuota_IsDeleted DEFAULT 0,

        CONSTRAINT PK_OPT_OrdenTrabajoCuota
            PRIMARY KEY CLUSTERED ([CuotaId] ASC),

        CONSTRAINT CK_OPT_OTCuota_ValorCuota
            CHECK ([ValorCuota] > 0),

        CONSTRAINT CK_OPT_OTCuota_Estado
            CHECK ([Estado] IN ('Pendiente', 'Pagada')),

        CONSTRAINT CK_OPT_OTCuota_Numero
            CHECK ([Numero] > 0),

        CONSTRAINT FK_OPT_OTCuota_OT
            FOREIGN KEY ([OTId])
            REFERENCES [dbo].[OPT_OrdenTrabajo] ([OTId])
            ON DELETE CASCADE
    );

    -- Acceso por OT ordenado por número de cuota
    CREATE NONCLUSTERED INDEX IX_OPT_OTCuota_OT_Numero
        ON [dbo].[OPT_OrdenTrabajoCuota] ([OTId], [Numero])
        WHERE [IsDeleted] = 0;

    PRINT 'CREATE OPT_OrdenTrabajoCuota OK';
END
ELSE
    PRINT 'OPT_OrdenTrabajoCuota ya existe — sin cambios';
GO

-- =============================================================================
-- 5. OPT_OrdenTrabajoBitacora — historial de etapas físicas (inmutable)
--    Sin IsDeleted: cada cambio de etapa queda registrado permanentemente.
--    Etapas: Ingresado → EnProceso → Montaje → Laboratorio → Calidad → Despacho → Entregado
-- =============================================================================
IF OBJECT_ID(N'[dbo].[OPT_OrdenTrabajoBitacora]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OPT_OrdenTrabajoBitacora]
    (
        [BitacoraId]    UNIQUEIDENTIFIER NOT NULL
                            CONSTRAINT DF_OPT_OTBitacora_BitacoraId DEFAULT NEWSEQUENTIALID(),
        [OTId]          UNIQUEIDENTIFIER NOT NULL,
        [TenantId]      UNIQUEIDENTIFIER NOT NULL,
        [Etapa]         VARCHAR(20)      NOT NULL,
        [Fecha]         DATETIME2        NOT NULL
                            CONSTRAINT DF_OPT_OTBitacora_Fecha DEFAULT GETUTCDATE(),
        [Responsable]   NVARCHAR(100)    NOT NULL,
        [Observacion]   NVARCHAR(500)    NULL,

        CONSTRAINT PK_OPT_OrdenTrabajoBitacora
            PRIMARY KEY CLUSTERED ([BitacoraId] ASC),

        CONSTRAINT CK_OPT_OTBitacora_Etapa
            CHECK ([Etapa] IN ('Ingresado','EnProceso','Montaje','Laboratorio','Calidad','Despacho','Entregado')),

        -- Sin ON DELETE CASCADE — la bitácora es histórica y no debe eliminarse
        CONSTRAINT FK_OPT_OTBitacora_OT
            FOREIGN KEY ([OTId])
            REFERENCES [dbo].[OPT_OrdenTrabajo] ([OTId])
    );

    CREATE NONCLUSTERED INDEX IX_OPT_OTBitacora_OT_Fecha
        ON [dbo].[OPT_OrdenTrabajoBitacora] ([OTId], [Fecha] DESC);

    PRINT 'CREATE OPT_OrdenTrabajoBitacora OK';
END
ELSE
    PRINT 'OPT_OrdenTrabajoBitacora ya existe — sin cambios';
GO

PRINT '=== 029 — OPT_OrdenTrabajo: completado ===';
GO
