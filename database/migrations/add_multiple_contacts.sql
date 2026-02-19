-- Migration: Add support for multiple contacts per campaign
-- Date: 2026-02-19

-- 1. Create campaign_contacts table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id INT NOT NULL AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  contact_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_campaign_contact (campaign_id, contact_id),
  KEY idx_campaign_id (campaign_id),
  KEY idx_contact_id (contact_id),
  CONSTRAINT campaign_contacts_ibfk_1 FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
  CONSTRAINT campaign_contacts_ibfk_2 FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Migrate existing data from campaigns.contact_id to campaign_contacts
INSERT INTO campaign_contacts (campaign_id, contact_id, is_primary)
SELECT id, contact_id, TRUE
FROM campaigns
WHERE contact_id IS NOT NULL;

-- 3. Make contact_id nullable in campaigns (for backward compatibility during transition)
-- Note: We keep the column for now but it will be deprecated
ALTER TABLE campaigns MODIFY contact_id INT NULL;

-- Add a comment to indicate deprecated status
ALTER TABLE campaigns MODIFY contact_id INT NULL COMMENT 'DEPRECATED: Use campaign_contacts table instead';
