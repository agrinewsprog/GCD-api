-- Add start_date and end_date to campaign_actions table
-- These dates will be set by the user when assigning actions to a campaign

ALTER TABLE campaign_actions
ADD COLUMN start_date DATE NULL AFTER action_id,
ADD COLUMN end_date DATE NULL AFTER start_date;
