-- ============================================
-- GCD Database Schema
-- MySQL Database Structure
-- ============================================

-- Drop tables if exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS campaign_actions;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS channel_actions;
DROP TABLE IF EXISTS medium_channels;
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS user_mediums;
DROP TABLE IF EXISTS mediums;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS AND ROLES
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEDIUMS (must be before user_mediums)
-- ============================================

CREATE TABLE mediums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_mediums (
    user_id INT NOT NULL,
    medium_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, medium_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    billing_address VARCHAR(255),
    billing_postal_code VARCHAR(20),
    billing_city VARCHAR(100),
    billing_province VARCHAR(100),
    billing_country VARCHAR(100),
    tax_number VARCHAR(50),
    iban VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CHANNELS AND ACTIONS (Many-to-Many)
-- ============================================

CREATE TABLE channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE medium_channels (
    medium_id INT NOT NULL,
    channel_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (medium_id, channel_id),
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE channel_actions (
    channel_id INT NOT NULL,
    action_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, action_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CAMPAIGNS
-- ============================================

CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INT NOT NULL,
    contact_id INT NOT NULL,
    medium_id INT NOT NULL,
    
    -- Billing information
    contract_file VARCHAR(255),
    contract_link VARCHAR(500),
    total_amount DECIMAL(10, 2),
    number_of_installments INT,
    currency VARCHAR(10) DEFAULT 'EUR',
    billing_zone VARCHAR(100),
    
    -- Other fields
    comments TEXT,
    completed BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    FOREIGN KEY (medium_id) REFERENCES mediums(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_company (company_id),
    INDEX idx_created_by (created_by),
    INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CAMPAIGN ACTIONS (Actions assigned to campaigns)
-- ============================================

CREATE TABLE campaign_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    action_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE RESTRICT,
    
    INDEX idx_campaign (campaign_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    link VARCHAR(255),
    read_status BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_read (read_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('comercial'),
    ('post-venta'),
    ('analista');

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT INTO users (name, surname, email, password) VALUES 
    ('Admin', 'User', 'admin@gcd.com', '$2b$10$rQZ5ZqJ5ZqJ5ZqJ5ZqJ5ZuKZqJ5ZqJ5ZqJ5ZqJ5ZqJ5ZqJ5ZqJ5Zq');

-- Assign admin role to default user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Insert example mediums
INSERT INTO mediums (name) VALUES 
    ('aviNews Latam'),
    ('aviNews Internacional'),
    ('PigNews');

-- Insert global channels
INSERT INTO channels (name) VALUES 
    ('Redes Sociales'),
    ('Newsletter'),
    ('Eventos'),
    ('Revista Digital');

-- Assign channels to mediums (many-to-many)
-- aviNews Latam uses all channels
INSERT INTO medium_channels (medium_id, channel_id) VALUES 
    (1, 1), -- aviNews Latam -> Redes Sociales
    (1, 2), -- aviNews Latam -> Newsletter
    (1, 3), -- aviNews Latam -> Eventos
    (1, 4); -- aviNews Latam -> Revista Digital

-- aviNews Internacional uses Redes Sociales and Newsletter
INSERT INTO medium_channels (medium_id, channel_id) VALUES 
    (2, 1), -- aviNews Internacional -> Redes Sociales
    (2, 2); -- aviNews Internacional -> Newsletter

-- PigNews uses Redes Sociales, Newsletter and Eventos
INSERT INTO medium_channels (medium_id, channel_id) VALUES 
    (3, 1), -- PigNews -> Redes Sociales
    (3, 2), -- PigNews -> Newsletter
    (3, 3); -- PigNews -> Eventos

-- Insert global actions
INSERT INTO actions (name) VALUES 
    ('Post en RRSS'),
    ('Video en RRSS'),
    ('Story en Instagram'),
    ('Mención en Newsletter'),
    ('Banner en Newsletter'),
    ('Patrocinio Bronce'),
    ('Patrocinio Plata'),
    ('Patrocinio Oro'),
    ('Stand'),
    ('Artículo Patrocinado'),
    ('Banner en Revista');

-- Assign actions to channels (many-to-many)
-- Redes Sociales actions
INSERT INTO channel_actions (channel_id, action_id) VALUES 
    (1, 1), -- Redes Sociales -> Post en RRSS
    (1, 2), -- Redes Sociales -> Video en RRSS
    (1, 3); -- Redes Sociales -> Story en Instagram

-- Newsletter actions
INSERT INTO channel_actions (channel_id, action_id) VALUES 
    (2, 4), -- Newsletter -> Mención en Newsletter
    (2, 5); -- Newsletter -> Banner en Newsletter

-- Eventos actions
INSERT INTO channel_actions (channel_id, action_id) VALUES 
    (3, 6), -- Eventos -> Patrocinio Bronce
    (3, 7), -- Eventos -> Patrocinio Plata
    (3, 8), -- Eventos -> Patrocinio Oro
    (3, 9); -- Eventos -> Stand

-- Revista Digital actions
INSERT INTO channel_actions (channel_id, action_id) VALUES 
    (4, 10), -- Revista Digital -> Artículo Patrocinado
    (4, 11); -- Revista Digital -> Banner en Revista

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- Get all users with their roles
-- SELECT u.*, GROUP_CONCAT(r.name) as roles
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN roles r ON ur.role_id = r.id
-- GROUP BY u.id;

-- Get campaigns with company and creator info
-- SELECT c.*, co.name as company_name, u.name as creator_name
-- FROM campaigns c
-- JOIN companies co ON c.company_id = co.id
-- JOIN users u ON c.created_by = u.id;

-- Get mediums with their channels
-- SELECT m.id, m.name as medium_name, GROUP_CONCAT(c.name) as channels
-- FROM mediums m
-- LEFT JOIN medium_channels mc ON m.id = mc.medium_id
-- LEFT JOIN channels c ON mc.channel_id = c.id
-- GROUP BY m.id;

-- Get channels with their actions
-- SELECT ch.id, ch.name as channel_name, GROUP_CONCAT(a.name) as actions
-- FROM channels ch
-- LEFT JOIN channel_actions ca ON ch.id = ca.channel_id
-- LEFT JOIN actions a ON ca.action_id = a.id
-- GROUP BY ch.id;

-- Get campaign actions with full details
-- SELECT ca.*, c.name as campaign_name, a.name as action_name
-- FROM campaign_actions ca
-- JOIN campaigns c ON ca.campaign_id = c.id
-- JOIN actions a ON ca.action_id = a.id;
