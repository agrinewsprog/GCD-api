-- Create magazine_editions table
CREATE TABLE IF NOT EXISTS magazine_editions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medium_id INT NOT NULL,
  publication_date DATE NOT NULL,
  status ENUM('draft', 'active', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
  UNIQUE KEY unique_medium_publication (medium_id, publication_date),
  INDEX idx_medium_id (medium_id),
  INDEX idx_publication_date (publication_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add magazine_edition_id to campaign_actions
ALTER TABLE campaign_actions 
ADD COLUMN magazine_edition_id INT NULL AFTER newsletter_schedule_id,
ADD FOREIGN KEY (magazine_edition_id) REFERENCES magazine_editions(id) ON DELETE SET NULL;
