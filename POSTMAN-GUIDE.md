# 📬 Cómo usar la colección de Postman

## 1️⃣ Importar archivos en Postman

### Importar la colección:

1. Abre Postman
2. Clic en **Import** (arriba a la izquierda)
3. Arrastra o selecciona el archivo: `GCD-API.postman_collection.json`

### Importar el environment:

1. En Postman, ve a **Environments** (icono de engranaje arriba a la derecha)
2. Clic en **Import**
3. Selecciona el archivo: `GCD-Local.postman_environment.json`
4. Selecciona el environment "GCD Local" en el dropdown (arriba a la derecha)

## 2️⃣ Flujo de prueba recomendado

### Paso 1: Login

```
POST {{baseUrl}}/auth/login
```

Body:

```json
{
  "email": "admin@gcd.com",
  "password": "admin123"
}
```

✅ Automáticamente guarda el token en el environment

### Paso 2: Verificar usuario actual

```
GET {{baseUrl}}/auth/me
```

Headers automáticos: `Authorization: Bearer {{token}}`

### Paso 3: Crear empresa

```
POST {{baseUrl}}/companies
```

Body:

```json
{
  "name": "Acme Corporation",
  "billing_address": "Calle Principal 123",
  "billing_postal_code": "28001",
  "billing_city": "Madrid",
  "billing_province": "Madrid",
  "billing_country": "España",
  "tax_number": "B12345678",
  "iban": "ES7921000813610123456789"
}
```

✅ Automáticamente guarda el `companyId` en el environment

### Paso 4: Listar empresas

```
GET {{baseUrl}}/companies
```

### Paso 5: Crear contacto

```
POST {{baseUrl}}/contacts
```

Body:

```json
{
  "company_id": {{companyId}},
  "name": "Juan",
  "surname": "García",
  "email": "juan.garcia@acme.com",
  "phone": "+34 600 123 456"
}
```

✅ Automáticamente guarda el `contactId` en el environment

### Paso 6: Listar contactos de una empresa

```
GET {{baseUrl}}/contacts?company_id={{companyId}}
```

## 3️⃣ Variables del Environment

Las siguientes variables se guardan automáticamente:

- `token` - JWT token después del login
- `userId` - ID del usuario logueado
- `companyId` - ID de la última empresa creada
- `contactId` - ID del último contacto creado
- `mediumId` - ID del último medio creado
- `channelId` - ID del último canal creado
- `actionId` - ID de la última acción creada

Puedes usarlas en cualquier request con: `{{nombreVariable}}`

## 4️⃣ Roles y Permisos

### Admin

- ✅ Todo (crear, leer, actualizar, eliminar)

### Comercial

- ✅ Ver empresas y contactos
- ✅ Crear y editar empresas y contactos
- ❌ Eliminar empresas y contactos

### Post-venta y Analista

- ✅ Ver empresas y contactos
- ❌ Crear, editar o eliminar

## 5️⃣ Endpoints disponibles

### Auth

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuario actual

### Companies

- `GET /api/companies` - Listar todas
- `GET /api/companies/:id` - Ver una
- `POST /api/companies` - Crear
- `PUT /api/companies/:id` - Actualizar
- `DELETE /api/companies/:id` - Eliminar

### Contacts

- `GET /api/contacts` - Listar todos
- `GET /api/contacts?company_id=X` - Filtrar por empresa
- `GET /api/contacts/:id` - Ver uno
- `POST /api/contacts` - Crear
- `PUT /api/contacts/:id` - Actualizar
- `DELETE /api/contacts/:id` - Eliminar

### Mediums

- `GET /api/mediums` - Listar todos
- `GET /api/mediums/:id` - Ver uno (con sus canales)
- `POST /api/mediums` - Crear
- `PUT /api/mediums/:id` - Actualizar
- `DELETE /api/mediums/:id` - Eliminar
- `POST /api/mediums/:id/channels` - Asignar canales
- `DELETE /api/mediums/:id/channels/:channelId` - Quitar canal

### Channels

- `GET /api/channels` - Listar todos
- `GET /api/channels/:id` - Ver uno (con sus acciones)
- `POST /api/channels` - Crear
- `PUT /api/channels/:id` - Actualizar
- `DELETE /api/channels/:id` - Eliminar
- `POST /api/channels/:id/actions` - Asignar acciones
- `DELETE /api/channels/:id/actions/:actionId` - Quitar acción

### Actions

- `GET /api/actions` - Listar todas
- `GET /api/actions/:id` - Ver una
- `POST /api/actions` - Crear
- `PUT /api/actions/:id` - Actualizar
- `DELETE /api/actions/:id` - Eliminar

### Health

- `GET /api/health` - Estado del servidor

## 6️⃣ Códigos de respuesta

- `200` - OK
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - No autenticado (falta token o es inválido)
- `403` - Sin permisos (rol insuficiente)
- `404` - No encontrado
- `409` - Conflicto (ej: email ya existe)
- `500` - Error del servidor

## 7️⃣ Troubleshooting

### "Cannot connect to server"

- Verifica que el servidor esté corriendo: `npm run dev`
- Comprueba que MySQL esté activo: `docker ps`

### "Invalid token" (401)

- Ejecuta el Login nuevamente para obtener un token fresco

### "Access denied" (403)

- Tu usuario no tiene el rol necesario para esa acción

### "Company not found" (404)

- Primero crea una empresa con POST /companies
- O verifica que el `companyId` en el environment sea correcto
