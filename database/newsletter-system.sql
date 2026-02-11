-- ============================================
-- SISTEMA DE NEWSLETTERS PREDEFINIDOS
-- ============================================

-- 1. Tabla de tipos de newsletter (definición base)
CREATE TABLE IF NOT EXISTS newsletter_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medium_id INT NOT NULL,
  region VARCHAR(50) NOT NULL COMMENT 'Spain, International, Brazil, etc.',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre del newsletter: aviNews España, ovoNews, etc.',
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
  week_of_month ENUM('1','2','3','4','5') NOT NULL COMMENT '1=primera semana, 2=segunda, etc.',
  frequency ENUM('monthly','bimonthly','quarterly') DEFAULT 'monthly',
  frequency_offset INT DEFAULT 0 COMMENT 'Para bimonthly: 0=meses pares, 1=meses impares',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
  UNIQUE KEY unique_newsletter (medium_id, region, name),
  INDEX idx_medium_region (medium_id, region),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de fechas programadas (generadas para todo el año)
CREATE TABLE IF NOT EXISTS newsletter_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  newsletter_type_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE COMMENT 'FALSE cuando se asigna a una campaña',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (newsletter_type_id) REFERENCES newsletter_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_schedule (newsletter_type_id, scheduled_date),
  INDEX idx_date (scheduled_date),
  INDEX idx_available (is_available, scheduled_date),
  INDEX idx_type_available (newsletter_type_id, is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Modificar tabla campaign_actions para vincular con newsletters
ALTER TABLE campaign_actions 
ADD COLUMN newsletter_schedule_id INT NULL AFTER end_date,
ADD CONSTRAINT fk_newsletter_schedule 
  FOREIGN KEY (newsletter_schedule_id) 
  REFERENCES newsletter_schedules(id) 
  ON DELETE SET NULL;

-- 4. Agregar índice para mejorar rendimiento
ALTER TABLE campaign_actions 
ADD INDEX idx_newsletter_schedule (newsletter_schedule_id);

-- Comentarios sobre el diseño:
-- - newsletter_types: Define los tipos de newsletter con sus reglas de envío
-- - newsletter_schedules: Contiene todas las fechas calculadas para el año
-- - campaign_actions: Se vincula con un schedule específico
-- - is_available: Controla que no se asigne la misma fecha dos veces
