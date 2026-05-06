-- ============================================================================
-- OPT SaaS - Datos Iniciales
-- Catálogos y datos de ejemplo
-- ============================================================================

USE [dbOPT];
GO

-- ============================================================================
-- Regiones de Chile (16 regiones) — idempotente: solo inserta si la tabla está vacía
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[OPT_Region])
BEGIN
    INSERT INTO [dbo].[OPT_Region] ([Region], [Codigo], [CreatedBy]) VALUES
        ('Arica y Parinacota',                          'XV',   'SYSTEM'),
        ('Tarapacá',                                    'I',    'SYSTEM'),
        ('Antofagasta',                                 'II',   'SYSTEM'),
        ('Atacama',                                     'III',  'SYSTEM'),
        ('Coquimbo',                                    'IV',   'SYSTEM'),
        ('Valparaíso',                                  'V',    'SYSTEM'),
        ('Metropolitana de Santiago',                   'RM',   'SYSTEM'),
        ('Libertador General Bernardo OHiggins',        'VI',   'SYSTEM'),
        ('Maule',                                       'VII',  'SYSTEM'),
        ('Ñuble',                                       'XVI',  'SYSTEM'),
        ('Biobío',                                      'VIII', 'SYSTEM'),
        ('La Araucanía',                                'IX',   'SYSTEM'),
        ('Los Ríos',                                    'XIV',  'SYSTEM'),
        ('Los Lagos',                                   'X',    'SYSTEM'),
        ('Aysén del General Carlos Ibáñez del Campo',   'XI',   'SYSTEM'),
        ('Magallanes y de la Antártica Chilena',        'XII',  'SYSTEM');
    PRINT 'Datos iniciales de regiones insertados exitosamente.';
END
ELSE
BEGIN
    PRINT 'Regiones ya existentes — se omite la inserción.';
END
GO

-- ============================================================================
-- Tenant de ejemplo (demo) — idempotente: solo inserta si no existe
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[OPT_Tenant] WHERE [RutEmpresa] = '76123456-7')
BEGIN
    INSERT INTO [dbo].[OPT_Tenant] ([Nombre], [RutEmpresa], [Direccion], [Email], [Telefono], [CreatedBy]) VALUES
        ('Óptica Demo S.A.', '76123456-7', 'Av. Principal 1234, Santiago', 'contacto@opticademo.cl', '+56 2 2345 6789', 'SYSTEM');
    PRINT 'Tenant de ejemplo insertado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Tenant de ejemplo ya existe — se omite la inserción.';
END
GO
