UPDATE users SET password = '$2b$10$xjqjuAN.hsbF8rbhSmrqj.v/KqY7yr4K.EW904zSNDHU6uYwWh1Iy' WHERE email = 'admin@gcd.com';
SELECT id, name, email, password FROM users WHERE email = 'admin@gcd.com';
