-- ============================================================================
-- OPT SaaS – Migración estado Agenda: Pendiente → Ingresado
-- Script:  025_alter_agenda_estado_ingresado.sql
-- Desc:    Reemplaza 'Pendiente' por 'Ingresado' como estado inicial de citas.
--          Actualiza: DEFAULT constraint, CHECK constraint, filas existentes.
-- ============================================================================

USE [dbOPT];
GO

-- 1. Actualizar filas existentes antes de tocar constraints
UPDATE [dbo].[OPT_Agenda]
SET [Estado] = N'Ingresado'
WHERE [Estado] = N'Pendiente';
PRINT 'Filas actualizadas: Pendiente → Ingresado.';
GO

-- 2. Eliminar CHECK constraint existente
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_OPT_Agenda_Estado'
      AND parent_object_id = OBJECT_ID(N'[dbo].[OPT_Agenda]')
)
BEGIN
    ALTER TABLE [dbo].[OPT_Agenda] DROP CONSTRAINT [CK_OPT_Agenda_Estado];
    PRINT 'CHECK constraint CK_OPT_Agenda_Estado eliminado.';
END
GO

-- 3. Eliminar DEFAULT constraint existente
IF EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE name = N'DF_OPT_Agenda_Estado'
      AND parent_object_id = OBJECT_ID(N'[dbo].[OPT_Agenda]')
)
BEGIN
    ALTER TABLE [dbo].[OPT_Agenda] DROP CONSTRAINT [DF_OPT_Agenda_Estado];
    PRINT 'DEFAULT constraint DF_OPT_Agenda_Estado eliminado.';
END
GO

-- 4. Recrear DEFAULT con 'Ingresado'
ALTER TABLE [dbo].[OPT_Agenda]
    ADD CONSTRAINT [DF_OPT_Agenda_Estado] DEFAULT (N'Ingresado') FOR [Estado];
PRINT 'DEFAULT constraint DF_OPT_Agenda_Estado recreado con Ingresado.';
GO

-- 5. Recrear CHECK con 'Ingresado' en lugar de 'Pendiente'
ALTER TABLE [dbo].[OPT_Agenda]
    ADD CONSTRAINT [CK_OPT_Agenda_Estado] CHECK ([Estado] IN (
        N'Ingresado', N'Confirmada', N'Atendida', N'Cancelada', N'NoShow'
    ));
PRINT 'CHECK constraint CK_OPT_Agenda_Estado recreado con Ingresado.';
GO

PRINT '=== Script 025_alter_agenda_estado_ingresado.sql completado ===';
GO
