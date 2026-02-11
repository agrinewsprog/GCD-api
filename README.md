# GCD API Backend

API REST para el sistema de gestión de campañas GCD.

## ✅ Estado Actual del Proyecto

### Completado:

- ✅ Base de datos MySQL configurada con Docker
- ✅ 11 tablas relacionadas creadas
- ✅ Datos iniciales cargados (roles, medios, canales, acciones)
- ✅ Estructura del proyecto Node.js + TypeScript
- ✅ Configuración de Express con middleware
- ✅ Sistema de autenticación JWT (pendiente corrección de TypeScript)
- ✅ Endpoints de autenticación (login, register, me)

### Por completar:

- ⚠️ Corrección de errores de TypeScript en controladores
- ⬜ CRUDs para: Companies, Contacts, Mediums, Channels, Actions
- ⬜ CRUD de Campaigns con permisos
- ⬜ Sistema de notificaciones
- ⬜ Envío de emails
- ⬜ Upload de archivos (contratos)

## 🗄️ Base de Datos

**Conexión Docker:**

- Host: `localhost`
- Puerto: `3307`
- Database: `gcd_db`
- Usuario: `root`
- Contraseña: `root123`

## 📦 Instalación

```bash
npm install
npm run dev
```

## 🔌 Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuario actual (requiere token)

## 🔐 Roles

- `1` admin
- `2` comercial
- `3` post-venta
- `4` analista

Usuario por defecto: `admin@gcd.com` / `admin123`
