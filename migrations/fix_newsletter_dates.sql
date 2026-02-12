-- ============================================
-- Actualizar fechas de newsletters existentes
-- Este script actualiza start_date y end_date de campaign_actions
-- basándose en las fechas de newsletter_schedules
-- ============================================

USE gcd_db;

-- Ver cuántas acciones de newsletter tienen fecha NULL
SELECT COUNT(*) as sin_fechas
FROM campaign_actions
WHERE newsletter_schedule_id IS NOT NULL
AND (start_date IS NULL OR end_date IS NULL);

-- Actualizar las fechas de newsletters basándose en newsletter_schedules
UPDATE campaign_actions ca
JOIN newsletter_schedules ns ON ca.newsletter_schedule_id = ns.id
SET 
    ca.start_date = ns.scheduled_date,
    ca.end_date = ns.scheduled_date
WHERE ca.newsletter_schedule_id IS NOT NULL
AND (ca.start_date IS NULL OR ca.end_date IS NULL);

-- Verificar que se actualizaron
SELECT 
    ca.id,
    ca.campaign_id,
    ca.action_id,
    ca.start_date,
    ca.end_date,
    ca.newsletter_schedule_id,
    ns.scheduled_date
FROM campaign_actions ca
JOIN newsletter_schedules ns ON ca.newsletter_schedule_id = ns.id
WHERE ca.newsletter_schedule_id IS NOT NULL
ORDER BY ca.created_at DESC
LIMIT 20;

-- También actualizar fechas de magazines si es necesario
UPDATE campaign_actions ca
JOIN magazine_editions me ON ca.magazine_edition_id = me.id
SET 
    ca.start_date = me.publication_date,
    ca.end_date = me.publication_date
WHERE ca.magazine_edition_id IS NOT NULL
AND (ca.start_date IS NULL OR ca.end_date IS NULL);

SELECT '✅ Fechas actualizadas correctamente' as status;
