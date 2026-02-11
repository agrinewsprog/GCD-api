-- Create comercial users: Diego Carrasco and Laura Guitart
-- Date: 2026-02-11

USE gcd_db;

INSERT INTO users (name, surname, email, password) VALUES 
('Diego', 'Carrasco', 'corporate@grupoagrinews.com', '$2b$10$jcwJppIoN/S7BoT8o7uzUe2EOGUrKK3lJDnEl4eRAob.8HJsy.t0a'),
('Laura', 'Guitart', 'l.guitart@grupoagrinews.com', '$2b$10$XK4miZDqVke9sd/knc63Qe2IO7wSYztc55i9sTGhzjPc2IXyqAVI2');

-- Assign comercial role to both users
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, 2 FROM users u WHERE u.email IN ('corporate@grupoagrinews.com', 'l.guitart@grupoagrinews.com');
