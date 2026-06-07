-- ============================================================
-- Script 030: OPT_TipoPrevision
-- Catálogo de tipos de previsión de salud (compartido, sin tenant).
-- Prerequisito: scripts 000–029 ejecutados.
-- ============================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'OPT_TipoPrevision'
)
BEGIN
    CREATE TABLE OPT_TipoPrevision (
        idTipoPrevision INT IDENTITY(1,1) PRIMARY KEY,
        Descripcion     NVARCHAR(100) NOT NULL
    );

    INSERT INTO OPT_TipoPrevision (Descripcion) VALUES
        (N'Particular'),
        (N'FONASA'),
        (N'ISAPRE'),
        (N'DIPRECA'),
        (N'CAPREDENA'),
        (N'FF.AA./Carabineros'),
        (N'Sin previsión');
END
GO
