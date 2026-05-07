-- ============================================================================
-- OPT SaaS – Datos iniciales: Comunas de Chile
-- Script:  009_comunas_datos.sql
-- Fuente:  INE – División político-administrativa 2020 (346 comunas)
-- IDs:     Explícitos (IDENTITY_INSERT ON) para coincidir con
--          frontend/src/app/core/data/regiones-comunas.data.ts
-- Idempotente: solo inserta si la tabla está vacía.
-- ============================================================================

USE [dbOPT];
GO

IF EXISTS (SELECT 1 FROM [dbo].[OPT_Comuna])
BEGIN
    PRINT 'OPT_Comuna ya tiene datos — se omite la inserción.';
    -- Para re-ejecutar en ambiente de desarrollo, limpiar primero:
    -- DELETE FROM [dbo].[OPT_Cliente];   -- (quitar FK dependientes)
    -- DELETE FROM [dbo].[OPT_Comuna];
    -- DBCC CHECKIDENT('[dbo].[OPT_Comuna]', RESEED, 0);
END
ELSE
BEGIN
    SET IDENTITY_INSERT [dbo].[OPT_Comuna] ON;

   -- =======================================================================
-- Script para INSERTAR las comunas de Chile en SQL SERVER
-- Basado en la división político-administrativa oficial (16 regiones, 56 provincias, 346 comunas)
-- Fuente: SUBDERE / CUT 2018 (actualizado con creación de la Región de Ñuble)
-- =======================================================================



-- =======================================================================
-- 2. Inserción de comunas de Chile
-- =======================================================================
-- Se usa SET IDENTITY_INSERT ON solo si deseas insertar valores específicos en idComuna
-- En este caso, dejamos que SQL Server autoincremente el idComuna.

-- -----------------------------------------------------------------------
-- REGIÓN I: TARAPACÁ (idRegion = 2 según tu archivo)
-- -----------------------------------------------------------------------
-- Provincia de Iquique
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Iquique', '01101', 2, 'SYSTEM'),
('Alto Hospicio', '01107', 2, 'SYSTEM');

-- Provincia del Tamarugal
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Pozo Almonte', '01401', 2, 'SYSTEM'),
('Camiña', '01402', 2, 'SYSTEM'),
('Colchane', '01403', 2, 'SYSTEM'),
('Huara', '01404', 2, 'SYSTEM'),
('Pica', '01405', 2, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN II: ANTOFAGASTA (idRegion = 3)
-- -----------------------------------------------------------------------
-- Provincia de Antofagasta
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Antofagasta', '02101', 3, 'SYSTEM'),
('Mejillones', '02102', 3, 'SYSTEM'),
('Sierra Gorda', '02103', 3, 'SYSTEM'),
('Taltal', '02104', 3, 'SYSTEM');

-- Provincia de El Loa
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Calama', '02201', 3, 'SYSTEM'),
('Ollagüe', '02202', 3, 'SYSTEM'),
('San Pedro de Atacama', '02203', 3, 'SYSTEM');

-- Provincia de Tocopilla
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Tocopilla', '02301', 3, 'SYSTEM'),
('María Elena', '02302', 3, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN III: ATACAMA (idRegion = 4)
-- -----------------------------------------------------------------------
-- Provincia de Chañaral
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Chañaral', '03101', 4, 'SYSTEM'),
('Diego de Almagro', '03102', 4, 'SYSTEM');

-- Provincia de Copiapó
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Copiapó', '03201', 4, 'SYSTEM'),
('Caldera', '03202', 4, 'SYSTEM'),
('Tierra Amarilla', '03203', 4, 'SYSTEM');

-- Provincia de Huasco
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Vallenar', '03301', 4, 'SYSTEM'),
('Alto del Carmen', '03302', 4, 'SYSTEM'),
('Freirina', '03303', 4, 'SYSTEM'),
('Huasco', '03304', 4, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN IV: COQUIMBO (idRegion = 5)
-- -----------------------------------------------------------------------
-- Provincia de Elqui
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('La Serena', '04101', 5, 'SYSTEM'),
('Coquimbo', '04102', 5, 'SYSTEM'),
('Andacollo', '04103', 5, 'SYSTEM'),
('La Higuera', '04104', 5, 'SYSTEM'),
('Paiguano', '04105', 5, 'SYSTEM'),
('Vicuña', '04106', 5, 'SYSTEM');

-- Provincia de Limarí
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Ovalle', '04201', 5, 'SYSTEM'),
('Combarbalá', '04202', 5, 'SYSTEM'),
('Monte Patria', '04203', 5, 'SYSTEM'),
('Punitaqui', '04204', 5, 'SYSTEM'),
('Río Hurtado', '04205', 5, 'SYSTEM');

-- Provincia de Choapa
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Illapel', '04301', 5, 'SYSTEM'),
('Canela', '04302', 5, 'SYSTEM'),
('Los Vilos', '04303', 5, 'SYSTEM'),
('Salamanca', '04304', 5, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN V: VALPARAÍSO (idRegion = 6)
-- -----------------------------------------------------------------------
-- Provincia de Isla de Pascua
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Isla de Pascua', '05101', 6, 'SYSTEM');

-- Provincia de Los Andes
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Los Andes', '05201', 6, 'SYSTEM'),
('Calle Larga', '05202', 6, 'SYSTEM'),
('Rinconada', '05203', 6, 'SYSTEM'),
('San Esteban', '05204', 6, 'SYSTEM');

-- Provincia de Petorca
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('La Ligua', '05301', 6, 'SYSTEM'),
('Cabildo', '05302', 6, 'SYSTEM'),
('Papudo', '05303', 6, 'SYSTEM'),
('Petorca', '05304', 6, 'SYSTEM'),
('Zapallar', '05305', 6, 'SYSTEM');

-- Provincia de Quillota
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Quillota', '05401', 6, 'SYSTEM'),
('La Calera', '05402', 6, 'SYSTEM'),
('Hijuelas', '05403', 6, 'SYSTEM'),
('La Cruz', '05404', 6, 'SYSTEM'),
('Nogales', '05405', 6, 'SYSTEM');

-- Provincia de San Antonio
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('San Antonio', '05501', 6, 'SYSTEM'),
('Algarrobo', '05502', 6, 'SYSTEM'),
('Cartagena', '05503', 6, 'SYSTEM'),
('El Quisco', '05504', 6, 'SYSTEM'),
('El Tabo', '05505', 6, 'SYSTEM'),
('Santo Domingo', '05506', 6, 'SYSTEM');

-- Provincia de San Felipe de Aconcagua
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('San Felipe', '05601', 6, 'SYSTEM'),
('Llaillay', '05602', 6, 'SYSTEM'),
('Putaendo', '05603', 6, 'SYSTEM'),
('Santa María', '05604', 6, 'SYSTEM'),
('Catemu', '05605', 6, 'SYSTEM'),
('Panquehue', '05606', 6, 'SYSTEM');

-- Provincia de Marga Marga
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Quilpué', '05701', 6, 'SYSTEM'),
('Limache', '05702', 6, 'SYSTEM'),
('Olmué', '05703', 6, 'SYSTEM'),
('Villa Alemana', '05704', 6, 'SYSTEM');

-- Provincia de Valparaíso
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Valparaíso', '05801', 6, 'SYSTEM'),
('Casablanca', '05802', 6, 'SYSTEM'),
('Concón', '05803', 6, 'SYSTEM'),
('Juan Fernández', '05804', 6, 'SYSTEM'),
('Puchuncaví', '05805', 6, 'SYSTEM'),
('Quintero', '05806', 6, 'SYSTEM'),
('Viña del Mar', '05807', 6, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN VI: LIBERTADOR GENERAL BERNARDO O'HIGGINS (idRegion = 8)
-- -----------------------------------------------------------------------
-- Provincia de Cachapoal
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Rancagua', '06101', 8, 'SYSTEM'),
('Codegua', '06102', 8, 'SYSTEM'),
('Coinco', '06103', 8, 'SYSTEM'),
('Coltauco', '06104', 8, 'SYSTEM'),
('Doñihue', '06105', 8, 'SYSTEM'),
('Graneros', '06106', 8, 'SYSTEM'),
('Las Cabras', '06107', 8, 'SYSTEM'),
('Machalí', '06108', 8, 'SYSTEM'),
('Malloa', '06109', 8, 'SYSTEM'),
('Mostazal', '06110', 8, 'SYSTEM'),
('Olivar', '06111', 8, 'SYSTEM'),
('Peumo', '06112', 8, 'SYSTEM'),
('Pichidegua', '06113', 8, 'SYSTEM'),
('Quinta de Tilcoco', '06114', 8, 'SYSTEM'),
('Rengo', '06115', 8, 'SYSTEM'),
('Requínoa', '06116', 8, 'SYSTEM'),
('San Vicente', '06117', 8, 'SYSTEM');

-- Provincia de Cardenal Caro
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Pichilemu', '06201', 8, 'SYSTEM'),
('La Estrella', '06202', 8, 'SYSTEM'),
('Litueche', '06203', 8, 'SYSTEM'),
('Marchihue', '06204', 8, 'SYSTEM'),
('Navidad', '06205', 8, 'SYSTEM'),
('Paredones', '06206', 8, 'SYSTEM');

-- Provincia de Colchagua
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('San Fernando', '06301', 8, 'SYSTEM'),
('Chépica', '06302', 8, 'SYSTEM'),
('Chimbarongo', '06303', 8, 'SYSTEM'),
('Lolol', '06304', 8, 'SYSTEM'),
('Nancagua', '06305', 8, 'SYSTEM'),
('Palmilla', '06306', 8, 'SYSTEM'),
('Peralillo', '06307', 8, 'SYSTEM'),
('Placilla', '06308', 8, 'SYSTEM'),
('Pumanque', '06309', 8, 'SYSTEM'),
('Santa Cruz', '06310', 8, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN VII: MAULE (idRegion = 9)
-- -----------------------------------------------------------------------
-- Provincia de Curicó
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Curicó', '07101', 9, 'SYSTEM'),
('Hualañé', '07102', 9, 'SYSTEM'),
('Licantén', '07103', 9, 'SYSTEM'),
('Molina', '07104', 9, 'SYSTEM'),
('Rauco', '07105', 9, 'SYSTEM'),
('Romeral', '07106', 9, 'SYSTEM'),
('Sagrada Familia', '07107', 9, 'SYSTEM'),
('Teno', '07108', 9, 'SYSTEM'),
('Vichuquén', '07109', 9, 'SYSTEM');

-- Provincia de Talca
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Talca', '07201', 9, 'SYSTEM'),
('San Clemente', '07202', 9, 'SYSTEM'),
('Pelarco', '07203', 9, 'SYSTEM'),
('Pencahue', '07204', 9, 'SYSTEM'),
('Maule', '07205', 9, 'SYSTEM'),
('San Rafael', '07206', 9, 'SYSTEM'),
('Curepto', '07207', 9, 'SYSTEM'),
('Constitución', '07208', 9, 'SYSTEM'),
('Empedrado', '07209', 9, 'SYSTEM'),
('Río Claro', '07210', 9, 'SYSTEM');

-- Provincia de Linares
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Linares', '07301', 9, 'SYSTEM'),
('San Javier', '07302', 9, 'SYSTEM'),
('Parral', '07303', 9, 'SYSTEM'),
('Villa Alegre', '07304', 9, 'SYSTEM'),
('Longaví', '07305', 9, 'SYSTEM'),
('Colbún', '07306', 9, 'SYSTEM'),
('Retiro', '07307', 9, 'SYSTEM'),
('Yerbas Buenas', '07308', 9, 'SYSTEM');

-- Provincia de Cauquenes
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Cauquenes', '07401', 9, 'SYSTEM'),
('Chanco', '07402', 9, 'SYSTEM'),
('Pelluhue', '07403', 9, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN XVI: ÑUBLE (idRegion = 10)
-- -----------------------------------------------------------------------
-- Provincia de Diguillín
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Bulnes', '16101', 10, 'SYSTEM'),
('Chillán', '16102', 10, 'SYSTEM'),
('Chillán Viejo', '16103', 10, 'SYSTEM'),
('El Carmen', '16104', 10, 'SYSTEM'),
('Pemuco', '16105', 10, 'SYSTEM'),
('Pinto', '16106', 10, 'SYSTEM'),
('Quillón', '16107', 10, 'SYSTEM'),
('San Ignacio', '16108', 10, 'SYSTEM'),
('Yungay', '16109', 10, 'SYSTEM');

-- Provincia de Itata
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Cobquecura', '16201', 10, 'SYSTEM'),
('Coelemu', '16202', 10, 'SYSTEM'),
('Ninhue', '16203', 10, 'SYSTEM'),
('Portezuelo', '16204', 10, 'SYSTEM'),
('Quirihue', '16205', 10, 'SYSTEM'),
('Ránquil', '16206', 10, 'SYSTEM'),
('Treguaco', '16207', 10, 'SYSTEM');

-- Provincia de Punilla
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('San Carlos', '16301', 10, 'SYSTEM'),
('Coihueco', '16302', 10, 'SYSTEM'),
('San Nicolás', '16303', 10, 'SYSTEM'),
('Ñiquén', '16304', 10, 'SYSTEM'),
('San Fabián', '16305', 10, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN VIII: BIOBÍO (idRegion = 11)
-- -----------------------------------------------------------------------
-- Provincia de Concepción
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Concepción', '08101', 11, 'SYSTEM'),
('Coronel', '08102', 11, 'SYSTEM'),
('Chiguayante', '08103', 11, 'SYSTEM'),
('Florida', '08104', 11, 'SYSTEM'),
('Hualqui', '08105', 11, 'SYSTEM'),
('Lota', '08106', 11, 'SYSTEM'),
('Penco', '08107', 11, 'SYSTEM'),
('San Pedro de la Paz', '08108', 11, 'SYSTEM'),
('Santa Juana', '08109', 11, 'SYSTEM'),
('Talcahuano', '08110', 11, 'SYSTEM'),
('Tomé', '08111', 11, 'SYSTEM'),
('Hualpén', '08112', 11, 'SYSTEM');

-- Provincia de Biobío
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Los Ángeles', '08201', 11, 'SYSTEM'),
('Antuco', '08202', 11, 'SYSTEM'),
('Cabrero', '08203', 11, 'SYSTEM'),
('Laja', '08204', 11, 'SYSTEM'),
('Mulchén', '08205', 11, 'SYSTEM'),
('Nacimiento', '08206', 11, 'SYSTEM'),
('Negrete', '08207', 11, 'SYSTEM'),
('Quilaco', '08208', 11, 'SYSTEM'),
('Quilleco', '08209', 11, 'SYSTEM'),
('San Rosendo', '08210', 11, 'SYSTEM'),
('Santa Bárbara', '08211', 11, 'SYSTEM'),
('Tucapel', '08212', 11, 'SYSTEM'),
('Alto Biobío', '08213', 11, 'SYSTEM');

-- Provincia de Arauco
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Lebu', '08301', 11, 'SYSTEM'),
('Arauco', '08302', 11, 'SYSTEM'),
('Cañete', '08303', 11, 'SYSTEM'),
('Contulmo', '08304', 11, 'SYSTEM'),
('Curanilahue', '08305', 11, 'SYSTEM'),
('Los Álamos', '08306', 11, 'SYSTEM'),
('Tirúa', '08307', 11, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN IX: LA ARAUCANÍA (idRegion = 12)
-- -----------------------------------------------------------------------
-- Provincia de Cautín
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Temuco', '09101', 12, 'SYSTEM'),
('Carahue', '09102', 12, 'SYSTEM'),
('Cunco', '09103', 12, 'SYSTEM'),
('Curarrehue', '09104', 12, 'SYSTEM'),
('Freire', '09105', 12, 'SYSTEM'),
('Galvarino', '09106', 12, 'SYSTEM'),
('Gorbea', '09107', 12, 'SYSTEM'),
('Lautaro', '09108', 12, 'SYSTEM'),
('Loncoche', '09109', 12, 'SYSTEM'),
('Melipeuco', '09110', 12, 'SYSTEM'),
('Nueva Imperial', '09111', 12, 'SYSTEM'),
('Padre las Casas', '09112', 12, 'SYSTEM'),
('Perquenco', '09113', 12, 'SYSTEM'),
('Pitrufquén', '09114', 12, 'SYSTEM'),
('Pucón', '09115', 12, 'SYSTEM'),
('Saavedra', '09116', 12, 'SYSTEM'),
('Teodoro Schmidt', '09117', 12, 'SYSTEM'),
('Toltén', '09118', 12, 'SYSTEM'),
('Vilcún', '09119', 12, 'SYSTEM'),
('Villarrica', '09120', 12, 'SYSTEM'),
('Cholchol', '09121', 12, 'SYSTEM');

-- Provincia de Malleco
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Angol', '09201', 12, 'SYSTEM'),
('Collipulli', '09202', 12, 'SYSTEM'),
('Curacautín', '09203', 12, 'SYSTEM'),
('Ercilla', '09204', 12, 'SYSTEM'),
('Lonquimay', '09205', 12, 'SYSTEM'),
('Los Sauces', '09206', 12, 'SYSTEM'),
('Lumaco', '09207', 12, 'SYSTEM'),
('Purén', '09208', 12, 'SYSTEM'),
('Renaico', '09209', 12, 'SYSTEM'),
('Traiguén', '09210', 12, 'SYSTEM'),
('Victoria', '09211', 12, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN XIV: LOS RÍOS (idRegion = 13)
-- -----------------------------------------------------------------------
-- Provincia de Valdivia
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Valdivia', '14101', 13, 'SYSTEM'),
('Corral', '14102', 13, 'SYSTEM'),
('Lanco', '14103', 13, 'SYSTEM'),
('Los Lagos', '14104', 13, 'SYSTEM'),
('Máfil', '14105', 13, 'SYSTEM'),
('Mariquina', '14106', 13, 'SYSTEM'),
('Paillaco', '14107', 13, 'SYSTEM'),
('Panguipulli', '14108', 13, 'SYSTEM');

-- Provincia del Ranco
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('La Unión', '14201', 13, 'SYSTEM'),
('Futrono', '14202', 13, 'SYSTEM'),
('Lago Ranco', '14203', 13, 'SYSTEM'),
('Río Bueno', '14204', 13, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN X: LOS LAGOS (idRegion = 14)
-- -----------------------------------------------------------------------
-- Provincia de Llanquihue
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Puerto Montt', '10101', 14, 'SYSTEM'),
('Calbuco', '10102', 14, 'SYSTEM'),
('Cochamó', '10103', 14, 'SYSTEM'),
('Frutillar', '10104', 14, 'SYSTEM'),
('Los Muermos', '10105', 14, 'SYSTEM'),
('Llanquihue', '10106', 14, 'SYSTEM'),
('Maullín', '10107', 14, 'SYSTEM'),
('Puerto Varas', '10108', 14, 'SYSTEM');

-- Provincia de Chiloé
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Castro', '10201', 14, 'SYSTEM'),
('Ancud', '10202', 14, 'SYSTEM'),
('Chonchi', '10203', 14, 'SYSTEM'),
('Curaco de Vélez', '10204', 14, 'SYSTEM'),
('Dalcahue', '10205', 14, 'SYSTEM'),
('Puqueldón', '10206', 14, 'SYSTEM'),
('Queilén', '10207', 14, 'SYSTEM'),
('Quellón', '10208', 14, 'SYSTEM'),
('Quemchi', '10209', 14, 'SYSTEM'),
('Quinchao', '10210', 14, 'SYSTEM');

-- Provincia de Osorno
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Osorno', '10301', 14, 'SYSTEM'),
('Puerto Octay', '10302', 14, 'SYSTEM'),
('Purranque', '10303', 14, 'SYSTEM'),
('Puyehue', '10304', 14, 'SYSTEM'),
('Río Negro', '10305', 14, 'SYSTEM'),
('San Juan de la Costa', '10306', 14, 'SYSTEM'),
('San Pablo', '10307', 14, 'SYSTEM');

-- Provincia de Palena
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Chaitén', '10401', 14, 'SYSTEM'),
('Futaleufú', '10402', 14, 'SYSTEM'),
('Hualaihué', '10403', 14, 'SYSTEM'),
('Palena', '10404', 14, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN XI: AYSÉN (idRegion = 15)
-- -----------------------------------------------------------------------
-- Provincia de Coyhaique
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Coyhaique', '11101', 15, 'SYSTEM'),
('Lago Verde', '11102', 15, 'SYSTEM');

-- Provincia de Aysén
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Puerto Aysén', '11201', 15, 'SYSTEM'),
('Cisnes', '11202', 15, 'SYSTEM'),
('Guaitecas', '11203', 15, 'SYSTEM');

-- Provincia de Capitán Prat
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Cochrane', '11301', 15, 'SYSTEM'),
('O''Higgins', '11302', 15, 'SYSTEM'),
('Tortel', '11303', 15, 'SYSTEM');

-- Provincia de General Carrera
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Chile Chico', '11401', 15, 'SYSTEM'),
('Río Ibáñez', '11402', 15, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN XII: MAGALLANES (idRegion = 16)
-- -----------------------------------------------------------------------
-- Provincia de Magallanes
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Punta Arenas', '12101', 16, 'SYSTEM'),
('Laguna Blanca', '12102', 16, 'SYSTEM'),
('Río Verde', '12103', 16, 'SYSTEM'),
('San Gregorio', '12104', 16, 'SYSTEM');

-- Provincia de la Antártica Chilena
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Cabo de Hornos', '12201', 16, 'SYSTEM'),
('Antártica', '12202', 16, 'SYSTEM');

-- Provincia de Tierra del Fuego
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Porvenir', '12301', 16, 'SYSTEM'),
('Primavera', '12302', 16, 'SYSTEM'),
('Timaukel', '12303', 16, 'SYSTEM');

-- Provincia de Última Esperanza
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Natales', '12401', 16, 'SYSTEM'),
('Torres del Paine', '12402', 16, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN METROPOLITANA DE SANTIAGO (RM) (idRegion = 7)
-- -----------------------------------------------------------------------
-- Provincia de Santiago
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Santiago', '13101', 7, 'SYSTEM'),
('Cerrillos', '13102', 7, 'SYSTEM'),
('Cerro Navia', '13103', 7, 'SYSTEM'),
('Conchalí', '13104', 7, 'SYSTEM'),
('El Bosque', '13105', 7, 'SYSTEM'),
('Estación Central', '13106', 7, 'SYSTEM'),
('Huechuraba', '13107', 7, 'SYSTEM'),
('Independencia', '13108', 7, 'SYSTEM'),
('La Cisterna', '13109', 7, 'SYSTEM'),
('La Florida', '13110', 7, 'SYSTEM'),
('La Granja', '13111', 7, 'SYSTEM'),
('La Pintana', '13112', 7, 'SYSTEM'),
('La Reina', '13113', 7, 'SYSTEM'),
('Las Condes', '13114', 7, 'SYSTEM'),
('Lo Barnechea', '13115', 7, 'SYSTEM'),
('Lo Espejo', '13116', 7, 'SYSTEM'),
('Lo Prado', '13117', 7, 'SYSTEM'),
('Macul', '13118', 7, 'SYSTEM'),
('Maipú', '13119', 7, 'SYSTEM'),
('Ñuñoa', '13120', 7, 'SYSTEM'),
('Pedro Aguirre Cerda', '13121', 7, 'SYSTEM'),
('Peñalolén', '13122', 7, 'SYSTEM'),
('Providencia', '13123', 7, 'SYSTEM'),
('Pudahuel', '13124', 7, 'SYSTEM'),
('Quilicura', '13125', 7, 'SYSTEM'),
('Quinta Normal', '13126', 7, 'SYSTEM'),
('Recoleta', '13127', 7, 'SYSTEM'),
('Renca', '13128', 7, 'SYSTEM'),
('San Joaquín', '13129', 7, 'SYSTEM'),
('San Miguel', '13130', 7, 'SYSTEM'),
('San Ramón', '13131', 7, 'SYSTEM'),
('Vitacura', '13132', 7, 'SYSTEM');

-- Provincia de Cordillera
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Puente Alto', '13201', 7, 'SYSTEM'),
('Pirque', '13202', 7, 'SYSTEM'),
('San José de Maipo', '13203', 7, 'SYSTEM');

-- Provincia de Chacabuco
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Colina', '13301', 7, 'SYSTEM'),
('Lampa', '13302', 7, 'SYSTEM'),
('Tiltil', '13303', 7, 'SYSTEM');

-- Provincia de Maipo
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('San Bernardo', '13401', 7, 'SYSTEM'),
('Buin', '13402', 7, 'SYSTEM'),
('Calera de Tango', '13403', 7, 'SYSTEM'),
('Paine', '13404', 7, 'SYSTEM');

-- Provincia de Melipilla
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Melipilla', '13501', 7, 'SYSTEM'),
('Alhué', '13502', 7, 'SYSTEM'),
('Curacaví', '13503', 7, 'SYSTEM'),
('María Pinto', '13504', 7, 'SYSTEM'),
('San Pedro', '13505', 7, 'SYSTEM');

-- Provincia de Talagante
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Talagante', '13601', 7, 'SYSTEM'),
('El Monte', '13602', 7, 'SYSTEM'),
('Isla de Maipo', '13603', 7, 'SYSTEM'),
('Padre Hurtado', '13604', 7, 'SYSTEM'),
('Peñaflor', '13605', 7, 'SYSTEM');

-- -----------------------------------------------------------------------
-- REGIÓN XV: ARICA Y PARINACOTA (idRegion = 1)
-- -----------------------------------------------------------------------
-- Provincia de Arica
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Arica', '15101', 1, 'SYSTEM'),
('Camarones', '15102', 1, 'SYSTEM');

-- Provincia de Parinacota
INSERT INTO OPT_Comuna (Comuna, Codigo, idRegion, CreatedBy) VALUES
('Putre', '15201', 1, 'SYSTEM'),
('General Lagos', '15202', 1, 'SYSTEM');

-- =======================================================================
-- 4. Verificación de datos insertados
-- =======================================================================

-- Mostrar total de comunas por región (debe sumar 346)
SELECT 
    r.Region,
    COUNT(c.idComuna) AS TotalComunas
FROM OPT_Region r
LEFT JOIN OPT_Comuna c ON r.idRegion = c.idRegion AND c.IsDeleted = 0
WHERE r.IsDeleted = 0
GROUP BY r.Region, r.idRegion
ORDER BY r.idRegion;

-- Mostrar listado completo de comunas (opcional)
-- SELECT c.idComuna, c.Comuna, c.Codigo, r.Region
-- FROM OPT_Comuna c
-- INNER JOIN OPT_Region r ON c.idRegion = r.idRegion AND r.IsDeleted = 0
-- WHERE c.IsDeleted = 0
-- ORDER BY r.idRegion, c.Comuna;

PRINT 'Inserción de comunas completada exitosamente.';
GO

    SET IDENTITY_INSERT [dbo].[OPT_Comuna] OFF;

    -- Resincronizar el IDENTITY al valor máximo insertado
    DBCC CHECKIDENT('[dbo].[OPT_Comuna]', RESEED, 345);

    PRINT 'OPT_Comuna: 345 comunas insertadas exitosamente.';
END
GO
