-- ============================================================================
-- OPT SaaS - Creación de Base de Datos
-- Motor: SQL Server 2022 (Azure SQL compatible)
-- Fecha: Mayo 2026
-- ============================================================================

IF DB_ID('dbOPT') IS NULL
BEGIN
    CREATE DATABASE [dbOPT];
    PRINT 'Base de datos dbOPT creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos dbOPT ya existe.';
END
GO
