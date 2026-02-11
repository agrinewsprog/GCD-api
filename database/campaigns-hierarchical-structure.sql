-- ============================================
-- Campaign Hierarchical Structure
-- Change campaigns to support multiple mediums with channels and actions
-- ============================================

USE gcd_db;

-- 1. Drop foreign key constraint first, then remove medium_id from campaigns table
ALTER TABLE campaigns DROP FOREIGN KEY campaigns_ibfk_3;
ALTER TABLE campaigns DROP COLUMN medium_id;

-- 2. Create campaign_mediums junction table
CREATE TABLE IF NOT EXISTS campaign_mediums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    medium_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_medium (campaign_id, medium_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_medium_id (medium_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Modify campaign_actions to include hierarchical structure
-- Drop the old table and recreate with new structure
DROP TABLE IF EXISTS campaign_actions;

CREATE TABLE campaign_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    medium_id INT NOT NULL,
    channel_id INT NOT NULL,
    action_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_action (campaign_id, medium_id, channel_id, action_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
