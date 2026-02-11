-- ============================================
-- MIGRATION SCRIPT: Many-to-Many Relationships
-- ============================================
-- This script migrates the existing structure from:
--   mediums -> channels -> actions (hierarchical)
-- To:
--   mediums <-> channels <-> actions (many-to-many)
--
-- WARNING: Back up your database before running this!
-- ============================================

USE gcd_db;

-- Step 1: Create new tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS medium_channels (
    medium_id INT NOT NULL,
    channel_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (medium_id, channel_id),
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS channel_actions (
    channel_id INT NOT NULL,
    action_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, action_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Migrate existing channel-medium relationships
INSERT INTO medium_channels (medium_id, channel_id)
SELECT medium_id, id FROM channels
WHERE medium_id IS NOT NULL;

-- Step 3: Migrate existing action-channel relationships
INSERT INTO channel_actions (channel_id, action_id)
SELECT channel_id, id FROM actions
WHERE channel_id IS NOT NULL;

-- Step 4: Remove foreign key constraints from old structure
ALTER TABLE channels DROP FOREIGN KEY channels_ibfk_1;
ALTER TABLE actions DROP FOREIGN KEY actions_ibfk_1;

-- Step 5: Remove old foreign key columns and indexes
ALTER TABLE channels 
    DROP INDEX idx_medium,
    DROP COLUMN medium_id;

ALTER TABLE actions 
    DROP INDEX idx_channel,
    DROP COLUMN channel_id;

-- Step 6: Add UNIQUE constraint to names (optional but recommended)
ALTER TABLE mediums MODIFY name VARCHAR(255) NOT NULL UNIQUE;
ALTER TABLE channels MODIFY name VARCHAR(255) NOT NULL UNIQUE;
ALTER TABLE actions MODIFY name VARCHAR(255) NOT NULL UNIQUE;

-- Step 7: Verify the migration
SELECT 'Mediums count:' as info, COUNT(*) as count FROM mediums
UNION ALL
SELECT 'Channels count:' as info, COUNT(*) as count FROM channels
UNION ALL
SELECT 'Actions count:' as info, COUNT(*) as count FROM actions
UNION ALL
SELECT 'Medium-Channel relationships:' as info, COUNT(*) as count FROM medium_channels
UNION ALL
SELECT 'Channel-Action relationships:' as info, COUNT(*) as count FROM channel_actions;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
