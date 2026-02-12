-- ============================================
-- Add quantity field to campaign_actions
-- Allows multiple instances of the same action
-- ============================================

USE gcd_db;

-- Add quantity column (INT, default 1, NOT NULL)
ALTER TABLE campaign_actions 
ADD COLUMN quantity INT NOT NULL DEFAULT 1 
AFTER action_id;

-- Add check constraint to ensure quantity is at least 1
ALTER TABLE campaign_actions 
ADD CONSTRAINT chk_quantity_positive CHECK (quantity >= 1);
