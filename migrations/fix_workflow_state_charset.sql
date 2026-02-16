-- Cambiar el ENUM de workflow_state para evitar problemas con ñ
-- De: 'enviado_diseño' a 'enviado_diseno'

ALTER TABLE campaign_actions
MODIFY COLUMN workflow_state 
ENUM('por_enviar', 'enviado_diseno', 'en_edicion', 'cambios', 'publicado') 
DEFAULT 'por_enviar' 
COMMENT 'Estado del flujo de trabajo';

-- Actualizar registros existentes que puedan tener el valor antiguo
UPDATE campaign_actions 
SET workflow_state = 'enviado_diseno' 
WHERE workflow_state = 'enviado_diseño';
