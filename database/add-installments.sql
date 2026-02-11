-- ============================================
-- Campaign Installments Enhancement
-- Add installments table and modify campaigns table
-- ============================================

USE gcd_db;

-- Modify campaigns table to use ENUMs for currency and billing_zone
ALTER TABLE campaigns 
    MODIFY COLUMN currency ENUM('EUR', 'USD', 'BRL') DEFAULT 'EUR',
    MODIFY COLUMN billing_zone ENUM('Spain', 'Global', 'Brazil') DEFAULT 'Spain';

-- Create campaign_installments table
CREATE TABLE IF NOT EXISTS campaign_installments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    installment_number INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    paid_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    UNIQUE KEY unique_campaign_installment (campaign_id, installment_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
