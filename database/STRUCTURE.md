# GCD Database Structure

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ surname         │
│ email           │
│ password        │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ Many to Many
         │
┌────────┴────────┐       ┌──────────────┐
│   USER_ROLES    │───────│    ROLES     │
├─────────────────┤       ├──────────────┤
│ user_id (FK)    │       │ id (PK)      │
│ role_id (FK)    │       │ name         │
└─────────────────┘       └──────────────┘
                          (admin, comercial,
                           post-venta, analista)


┌──────────────────┐         ┌──────────────────┐
│    COMPANIES     │─────┐   │    CONTACTS      │
├──────────────────┤     │   ├──────────────────┤
│ id (PK)          │     └──→│ id (PK)          │
│ name             │         │ company_id (FK)  │
│ billing_address  │         │ name             │
│ billing_postal.. │         │ surname          │
│ billing_city     │         │ email            │
│ billing_province │         │ phone            │
│ billing_country  │         └──────────────────┘
│ tax_number       │
│ iban             │
└────────┬─────────┘
         │
         │
         │
┌────────┴─────────┐
│    CAMPAIGNS     │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ company_id (FK)  │───┐
│ contact_id (FK)  │   │
│ medium_id (FK)   │───┼───────┐
│                  │   │       │
│ contract_file    │   │       │
│ total_amount     │   │       │
│ num_installments │   │       │
│ currency         │   │       │
│ billing_zone     │   │       │
│                  │   │       │
│ comments         │   │       │
│ completed        │   │       │
│ created_by (FK)  │───┼───┐   │
└────────┬─────────┘   │   │   │
         │             │   │   │
         │             │   │   │
         │             │   │   │
┌────────┴──────────┐  │   │   │
│ CAMPAIGN_ACTIONS  │  │   │   │
├───────────────────┤  │   │   │
│ id (PK)           │  │   │   │
│ campaign_id (FK)  │  │   │   │
│ action_id (FK)    │──┼───┼───┼────┐
│ status            │  │   │   │    │
│ notes             │  │   │   │    │
└───────────────────┘  │   │   │    │
                       │   │   │    │
                       │   │   │    │
         ┌─────────────┘   │   │    │
         │                 │   │    │
┌────────┴─────────┐       │   │    │
│  NOTIFICATIONS   │       │   │    │
├──────────────────┤       │   │    │
│ id (PK)          │       │   │    │
│ user_id (FK)     │───────┘   │    │
│ title            │             │    │
│ message          │             │    │
│ type             │             │    │
│ link             │             │    │
│ read_status      │             │    │
│ read_at          │             │    │
│ sent_email       │             │    │
└──────────────────┘             │    │
                                 │    │
                                 │    │
         ┌───────────────────────┘    │
         │                            │
┌────────┴─────────┐                  │
│     MEDIUMS      │                  │
├──────────────────┤                  │
│ id (PK)          │                  │
│ name             │                  │
└────────┬─────────┘                  │
         │                            │
         │                            │
┌────────┴─────────┐                  │
│    CHANNELS      │                  │
├──────────────────┤                  │
│ id (PK)          │                  │
│ medium_id (FK)   │                  │
│ name             │                  │
└────────┬─────────┘                  │
         │                            │
         │                            │
┌────────┴─────────┐                  │
│     ACTIONS      │←─────────────────┘
├──────────────────┤
│ id (PK)          │
│ channel_id (FK)  │
│ name             │
└──────────────────┘
```

## Hierarchy Examples

### Medium → Channel → Action

```
aviNews Latam (Medium)
├── Redes Sociales (Channel)
│   ├── Post en RRSS (Action)
│   ├── Video en RRSS (Action)
│   └── Story en Instagram (Action)
├── Newsletter (Channel)
│   ├── Mención en Newsletter (Action)
│   └── Banner en Newsletter (Action)
├── Eventos (Channel)
│   ├── Patrocinio Bronce (Action)
│   ├── Patrocinio Plata (Action)
│   ├── Patrocinio Oro (Action)
│   └── Stand (Action)
└── Revista Digital (Channel)
    ├── Artículo Patrocinado (Action)
    └── Banner en Revista (Action)
```

## Key Relationships

1. **Users ↔ Roles**: Many-to-Many (un usuario puede tener múltiples roles)
2. **Companies → Contacts**: One-to-Many (una empresa tiene muchos contactos)
3. **Mediums → Channels**: One-to-Many (un medio tiene muchos canales)
4. **Channels → Actions**: One-to-Many (un canal tiene muchas acciones)
5. **Campaigns**:
   - Pertenece a una Company
   - Tiene un Contact
   - Usa un Medium
   - Creada por un User (created_by)
6. **Campaign_Actions**: Une Campaigns con Actions (con estado propio)
7. **Notifications**: Pertenecen a un User

## Permission Logic

- **Admin**: Puede ver todas las campañas y crearlas
- **Comercial**: Puede crear campañas pero solo ver las suyas (created_by)
- **Post-venta**: Permisos por definir según flujo
- **Analista**: Permisos por definir según flujo
