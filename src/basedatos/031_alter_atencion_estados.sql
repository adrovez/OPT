-- 031_alter_atencion_estados.sql
-- Rediseño estados OPT_Atencion:
--   TerminadaServicio → Terminada (sin cobro) o Pagada (con cobro)
--   Nuevos estados: Terminada, Pagada
--   Requiere scripts 000–030 ejecutados previamente

BEGIN TRANSACTION;

-- 1. Drop CHECK constraint existente
ALTER TABLE [dbo].[OPT_Atencion] DROP CONSTRAINT [CK_OPT_Atencion_Estado];

-- 2. Migrar: TerminadaServicio con cobro registrado → Pagada
UPDATE [dbo].[OPT_Atencion]
SET [Estado] = N'Pagada'
WHERE [Estado] = N'TerminadaServicio'
  AND EXISTS (
    SELECT 1 FROM [dbo].[OPT_CobroServicio] cs
    WHERE cs.[AtencionId] = [OPT_Atencion].[AtencionId]
  );

-- 3. Migrar: TerminadaServicio sin cobro → Terminada
UPDATE [dbo].[OPT_Atencion]
SET [Estado] = N'Terminada'
WHERE [Estado] = N'TerminadaServicio';

-- 4. Nuevo CHECK constraint con los 4 estados válidos
ALTER TABLE [dbo].[OPT_Atencion]
ADD CONSTRAINT [CK_OPT_Atencion_Estado]
CHECK ([Estado] IN (N'Abierta', N'Terminada', N'Pagada', N'DerivoOT'));

COMMIT TRANSACTION;
GO
