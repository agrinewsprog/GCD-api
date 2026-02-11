# GCD Database Setup Guide

## Option 1: MySQL con Docker (Recomendado)

### 1. Crear contenedor MySQL

```bash
docker run --name gcd-mysql -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=gcd_db -p 3306:3306 -d mysql:8.0
```

### 2. Esperar a que MySQL esté listo (30 segundos aprox)

```bash
docker logs gcd-mysql
```

### 3. Cargar el schema

```bash
docker exec -i gcd-mysql mysql -uroot -proot123 gcd_db < database/schema.sql
```

### 4. Conectar a MySQL

```bash
docker exec -it gcd-mysql mysql -uroot -proot123 gcd_db
```

### Comandos útiles Docker:

```bash
# Detener contenedor
docker stop gcd-mysql

# Iniciar contenedor
docker start gcd-mysql

# Eliminar contenedor
docker rm -f gcd-mysql

# Ver logs
docker logs gcd-mysql
```

---

## Option 2: MySQL Instalado localmente

### 1. Instalar MySQL

Descargar desde: https://dev.mysql.com/downloads/installer/

### 2. Crear la base de datos

```bash
mysql -u root -p
```

Dentro de MySQL:

```sql
CREATE DATABASE gcd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gcd_db;
source C:/Users/Samuel/Desktop/proyectos_github/GCD/GCD-api/database/schema.sql;
exit;
```

O desde PowerShell:

```powershell
Get-Content "C:\Users\Samuel\Desktop\proyectos_github\GCD\GCD-api\database\schema.sql" | mysql -u root -p gcd_db
```

---

## Credenciales de Conexión

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gcd_db
DB_USER=root
DB_PASSWORD=root123
```

---

## Usuario por defecto creado

**Email:** admin@gcd.com  
**Password:** admin123  
**Rol:** admin

⚠️ **Nota:** La contraseña en el schema es un hash de ejemplo. Deberás implementar bcrypt en tu API para hash real.

---

## Verificar instalación

```sql
-- Ver todas las tablas
SHOW TABLES;

-- Ver roles creados
SELECT * FROM roles;

-- Ver mediums de ejemplo
SELECT * FROM mediums;

-- Ver estructura de campañas
DESCRIBE campaigns;
```

---

## Datos de prueba

El schema ya incluye:

- ✅ 4 roles (admin, comercial, post-venta, analista)
- ✅ 1 usuario admin
- ✅ 3 mediums de ejemplo
- ✅ 4 canales para aviNews Latam
- ✅ 11 acciones de ejemplo

Para añadir más datos de prueba, puedes ejecutar queries personalizadas.
