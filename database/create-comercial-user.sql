-- Crear usuario comercial de prueba
-- IMPORTANTE: Este script requiere que ejecutes primero el hash de la contraseña
-- 
-- Puedes generar el hash ejecutando en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('comercial123', 10, (err, hash) => console.log(hash));
--
-- O usar la API de registro:
-- POST http://localhost:3000/api/auth/register
-- {
--   "name": "Carlos",
--   "surname": "Comercial", 
--   "email": "comercial@gcd.com",
--   "password": "comercial123",
--   "roles": [2]
-- }
--
-- Donde roles[2] es el ID del rol 'comercial'

-- Hash de 'comercial123' generado con bcrypt (10 rounds)
-- NOTA: Este hash es un ejemplo y podría no funcionar. Se recomienda usar la API.
INSERT INTO users (name, surname, email, password, created_at, updated_at)
VALUES ('Carlos', 'Comercial', 'comercial@gcd.com', '$2b$10$YourHashHere', NOW(), NOW());

-- Obtener el ID del usuario recién creado
SET @comercial_user_id = LAST_INSERT_ID();

-- Obtener el ID del rol comercial (generalmente es 2)
SET @comercial_role_id = (SELECT id FROM roles WHERE name = 'comercial');

-- Asignar rol comercial al usuario
INSERT INTO user_roles (user_id, role_id)
VALUES (@comercial_user_id, @comercial_role_id);

SELECT 'Usuario comercial creado' as resultado;
