# 🔄 Estructura Many-to-Many - Mediums, Channels & Actions

## 📊 Nueva Arquitectura

Hemos migrado de una estructura jerárquica rígida a una flexible con relaciones **many-to-many**:

### ❌ Estructura Anterior (Jerárquica)

```
Medium → Channel → Action
(cada channel pertenece a UN solo medium)
(cada action pertenece a UN solo channel)
```

### ✅ Nueva Estructura (Many-to-Many)

```
Medium ←→ Channel ←→ Action
(un channel puede usarse en múltiples mediums)
(una action puede usarse en múltiples channels)
```

---

## 🎯 Ventajas de la Nueva Estructura

### 1. **Reutilización**

- Crear "Redes Sociales" una vez y asignarlo a todos los mediums
- Crear "Post en RRSS" una vez y asignarlo a todos los channels que lo necesiten

### 2. **Flexibilidad**

- Cada medium puede tener canales únicos o compartidos
- Puedes agregar un canal nuevo solo para un medium específico

### 3. **Menos Duplicación**

- No necesitas crear 10 veces "Newsletter" si tienes 10 mediums
- Gestión centralizada de catálogos

---

## 🗂️ Ejemplo Práctico

### Datos Actuales Después de la Migración:

**Mediums:**

1. aviNews Latam
2. aviNews Internacional
3. PigNews

**Channels (Globales):**

1. Redes Sociales
2. Newsletter
3. Eventos
4. Revista Digital

**Asignaciones Medium-Channel:**

```
aviNews Latam:
  ✓ Redes Sociales
  ✓ Newsletter
  ✓ Eventos
  ✓ Revista Digital

aviNews Internacional:
  ✓ Redes Sociales
  ✓ Newsletter

PigNews:
  ✓ Redes Sociales
  ✓ Newsletter
  ✓ Eventos
```

**Actions (Globales):**

1. Post en RRSS
2. Video en RRSS
3. Story en Instagram
4. Mención en Newsletter
5. Banner en Newsletter
6. Patrocinio Bronce
7. Patrocinio Plata
8. Patrocinio Oro
9. Stand
10. Artículo Patrocinado
11. Banner en Revista

**Asignaciones Channel-Action:**

```
Redes Sociales:
  ✓ Post en RRSS
  ✓ Video en RRSS
  ✓ Story en Instagram

Newsletter:
  ✓ Mención en Newsletter
  ✓ Banner en Newsletter

Eventos:
  ✓ Patrocinio Bronce
  ✓ Patrocinio Plata
  ✓ Patrocinio Oro
  ✓ Stand

Revista Digital:
  ✓ Artículo Patrocinado
  ✓ Banner en Revista
```

---

## 🛠️ Flujo de Trabajo

### Crear un Nuevo Medium con Canales Existentes

1. **Crear el medium:**

```http
POST /api/mediums
{
  "name": "aviNews España"
}
```

2. **Asignar canales existentes:**

```http
POST /api/mediums/4/channels
{
  "channel_ids": [1, 2, 3]  // Redes Sociales, Newsletter, Eventos
}
```

### Crear un Canal Nuevo y Asignarlo

1. **Crear el canal:**

```http
POST /api/channels
{
  "name": "Podcast"
}
```

2. **Asignar acciones:**

```http
POST /api/channels/5/actions
{
  "action_ids": [1, 2]  // Post en RRSS, Video en RRSS
}
```

3. **Asignar el canal a mediums:**

```http
POST /api/mediums/1/channels
{
  "channel_ids": [1, 2, 3, 4, 5]  // Incluye el nuevo Podcast
}
```

### Crear una Acción Única para un Canal Específico

1. **Crear la acción:**

```http
POST /api/actions
{
  "name": "Entrevista en Directo"
}
```

2. **Asignarla solo al canal Podcast:**

```http
POST /api/channels/5/actions
{
  "action_ids": [1, 2, 12]  // Incluye la nueva acción
}
```

---

## 🔐 Permisos

### Admin

- ✅ Crear, editar, eliminar mediums, channels y actions
- ✅ Asignar/desasignar relaciones

### Comercial, Post-venta, Analista

- ✅ Ver mediums, channels y actions
- ❌ No pueden modificar catálogos

---

## 📋 Tablas de la Base de Datos

### Tablas Principales

- `mediums` - Medios de comunicación
- `channels` - Canales globales
- `actions` - Acciones globales

### Tablas Intermedias (Many-to-Many)

- `medium_channels` - Relación medium ↔ channel
- `channel_actions` - Relación channel ↔ action

---

## 🚀 Próximos Pasos

Una vez que hayas probado los endpoints de Mediums, Channels y Actions, el siguiente paso será:

**Campaigns** - El módulo principal que conectará:

- Companies
- Contacts
- Mediums (para seleccionar el medio)
- Actions (para seleccionar las acciones de la campaña)

---

## 📝 Notas Técnicas

### Cascadas en Eliminación

- Eliminar un **medium** → elimina sus asignaciones en `medium_channels`
- Eliminar un **channel** → elimina asignaciones en `medium_channels` y `channel_actions`
- Eliminar una **action** → solo si NO está en `campaign_actions`

### Validaciones

- Nombres únicos para evitar duplicados
- Verificación de existencia antes de asignar relaciones
- Prevención de eliminación si hay campañas asociadas
