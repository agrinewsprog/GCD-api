-- ============================================
-- Remove unique constraint to allow multiple instances
-- of the same action (e.g., multiple newsletters)
-- ============================================

USE gcd_db;

-- Drop the unique constraint that prevents duplicate campaign_id + medium_id + channel_id + action_id
ALTER TABLE campaign_actions 
DROP INDEX unique_campaign_action;

-- This allows creating multiple records for the same action type
-- For example: 3 different newsletters for the same campaign
