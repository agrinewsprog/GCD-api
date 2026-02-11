-- ============================================
-- SEED DATA: Newsletter Types para aviNews
-- ============================================

-- IMPORTANTE: Ajustar medium_id según tu base de datos
-- Verifica primero: SELECT id, name FROM mediums WHERE name LIKE '%avi%';

-- Variables (ajustar según tu BD)
SET @aviNews_medium_id = (SELECT id FROM mediums WHERE name = 'aviNews' LIMIT 1);
SET @nutriNews_medium_id = (SELECT id FROM mediums WHERE name = 'nutriNews' LIMIT 1);

-- Si no existen los medios, crearlos (opcional)
INSERT IGNORE INTO mediums (name, created_at, updated_at) VALUES 
('aviNews', NOW(), NOW()),
('nutriNews', NOW(), NOW());

-- Refrescar variables
SET @aviNews_medium_id = (SELECT id FROM mediums WHERE name = 'aviNews' LIMIT 1);
SET @nutriNews_medium_id = (SELECT id FROM mediums WHERE name = 'nutriNews' LIMIT 1);

-- ============================================
-- aviNews ESPAÑA
-- ============================================
INSERT INTO newsletter_types (medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset) VALUES
-- Miércoles de primera semana cada mes
(@aviNews_medium_id, 'Spain', 'News aviNews España', 'Wednesday', '1', 'monthly', 0),

-- Miércoles de segunda semana cada mes
(@aviNews_medium_id, 'Spain', 'News ovoNews', 'Wednesday', '2', 'monthly', 0),
(@aviNews_medium_id, 'Spain', 'News PoultryPro', 'Wednesday', '2', 'monthly', 0),

-- Miércoles de tercera semana cada mes
(@aviNews_medium_id, 'Spain', 'News On Air', 'Wednesday', '3', 'monthly', 0),

-- Miércoles de cuarta semana cada mes
(@aviNews_medium_id, 'Spain', 'News MeatPro', 'Wednesday', '4', 'monthly', 0),

-- Miércoles de cuarta semana cada 2 meses (meses pares: 2,4,6,8,10,12)
(@aviNews_medium_id, 'Spain', 'Incubanews', 'Wednesday', '4', 'bimonthly', 0);

-- ============================================
-- aviNews INTERNATIONAL
-- ============================================
INSERT INTO newsletter_types (medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset) VALUES
-- Jueves de primera semana cada mes
(@aviNews_medium_id, 'International', 'News aviNews International', 'Thursday', '1', 'monthly', 0),

-- Jueves de segunda semana cada mes
(@aviNews_medium_id, 'International', 'ovoNews', 'Thursday', '2', 'monthly', 0),
(@aviNews_medium_id, 'International', 'PoultryPro', 'Thursday', '2', 'monthly', 0),

-- Jueves de tercera semana cada mes
(@aviNews_medium_id, 'International', 'On Air', 'Thursday', '3', 'monthly', 0),

-- Jueves de cuarta semana cada mes
(@aviNews_medium_id, 'International', 'meatpro', 'Thursday', '4', 'monthly', 0),

-- Jueves de cuarta semana cada 2 meses (meses pares)
(@aviNews_medium_id, 'International', 'incubanews', 'Thursday', '4', 'bimonthly', 0);

-- ============================================
-- nutriNews ESPAÑA (Ejemplo con día diferente)
-- ============================================
-- Descomenta si quieres agregar nutriNews
-- INSERT INTO newsletter_types (medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset) VALUES
-- (@nutriNews_medium_id, 'Spain', 'News nutriNews España', 'Thursday', '1', 'monthly', 0);

-- Verificar inserción
SELECT 
  nt.id,
  m.name as medium_name,
  nt.region,
  nt.name as newsletter_name,
  nt.day_of_week,
  CONCAT('Semana ', nt.week_of_month) as week,
  nt.frequency
FROM newsletter_types nt
JOIN mediums m ON nt.medium_id = m.id
ORDER BY m.name, nt.region, nt.week_of_month, nt.name;
