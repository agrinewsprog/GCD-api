-- ============================================
-- Query para verificar datos en producción
-- ============================================

USE gcd_db;

-- 1. Verificar estructura de campaign_actions
SHOW COLUMNS FROM campaign_actions;

-- 2. Ver últimas acciones de campaña con newsletters
SELECT 
    ca.id,
    ca.campaign_id,
    c.name as campaign_name,
    ca.action_id,
    a.name as action_name,
    ca.quantity,
    ca.start_date,
    ca.end_date,
    ca.newsletter_schedule_id,
    ca.magazine_edition_id,
    ca.created_at
FROM campaign_actions ca
JOIN campaigns c ON ca.campaign_id = c.id
JOIN actions a ON ca.action_id = a.id
WHERE ca.newsletter_schedule_id IS NOT NULL
ORDER BY ca.created_at DESC
LIMIT 20;

-- 3. Verificar si existen newsletter_schedules
SELECT COUNT(*) as total_schedules FROM newsletter_schedules;

-- 4. Ver newsletter_schedules con sus fechas
SELECT 
    ns.id,
    ns.newsletter_type_id,
    ns.scheduled_date,
    nt.name as newsletter_name,
    ns.is_available
FROM newsletter_schedules ns
JOIN newsletter_types nt ON ns.newsletter_type_id = nt.id
LIMIT 10;
