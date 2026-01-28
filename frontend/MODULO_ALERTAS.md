# Módulo de Alertas y Notificaciones

## Resumen

Se ha implementado un **sistema completo de alertas y notificaciones** con gestión de tipos personalizables, destinatarios, frecuencias, canales de envío y visualización en tiempo real mediante campana de notificaciones.

## Características Principales

### 🔔 Sistema de Notificaciones en Tiempo Real
- **Campana de notificaciones** en el header con badge contador
- **Panel desplegable (popover)** con las últimas alertas no leídas
- **Auto-refresh** cada 30 segundos
- **Acciones rápidas**: marcar leída, eliminar desde el panel
- Navegación directa a la entidad relacionada

### 📋 Tipos de Alertas Personalizables

11 tipos de alertas predefinidos:
- Vacuna
- Herraje
- Pago
- Evento
- Cumpleaños
- Contrato
- Stock
- Tarea
- Mantenimiento
- Veterinaria
- Otro

### ⚙️ Configuración Granular

Cada tipo de alerta puede configurar:

#### Frecuencia y Timing
- Única, diaria, semanal, mensual o cada X días
- Días de anticipación al evento
- Hora específica de envío (HH:MM)

#### Destinatarios
- Por roles (super_admin, admin, empleado, cliente)
- Usuarios específicos (por ID)
- Responsables de la entidad relacionada

#### Canales de Envío
- Sistema (campana de notificaciones)
- Email
- Push notifications (preparado para el futuro)

#### Plantillas Personalizadas
- Plantilla de título con variables: `{nombre}`, `{fecha}`, etc.
- Plantilla de mensaje personalizable

#### Condiciones de Activación
Sistema de reglas condicionales:
- Campo a evaluar
- Operador (igual, mayor, menor, entre, contiene)
- Valor(es) de comparación

### 🎯 Niveles de Prioridad

4 niveles con colores distintivos:
- **Crítica** 🔴 (roja)
- **Alta** 🟠 (naranja)
- **Media** 🟡 (amarilla)
- **Baja** 🔵 (azul)

## Archivos Creados

### Tipos y Modelos
**`src/types/alerta.ts`** (actualizado)
- `Alerta`: Alerta individual
- `TipoAlertaConfig`: Configuración de tipo de alerta
- `AccionAlerta`: Acciones disponibles desde la alerta
- `CondicionAlerta`: Condiciones para activar alertas
- `ConfiguracionAlertas`: Preferencias del usuario
- `EstadisticasAlertas`: Estadísticas agregadas
- `FiltrosAlertas`: Filtros de búsqueda

### Servicios
**`src/services/alertaService.ts`** (actualizado)

Endpoints organizados en 3 secciones:

#### Alertas
- `getMisAlertas(filtros)` - Mis alertas con filtros
- `getAll(filtros)` - Todas (admin)
- `getById(id)` - Detalle
- `getNoLeidas()` - No leídas
- `create(alerta)` - Crear manual
- `marcarLeida(id)` - Marcar leída
- `marcarTodasLeidas()` - Marcar todas
- `delete(id)` - Eliminar
- `posponer(id, dias)` - Posponer
- `getEstadisticas()` - Estadísticas

#### Tipos de Alerta
- `getTiposAlerta()` - Listar tipos
- `getTipoAlertaById(id)` - Detalle de tipo
- `createTipoAlerta(tipo)` - Crear tipo
- `updateTipoAlerta(id, tipo)` - Actualizar tipo
- `deleteTipoAlerta(id)` - Eliminar tipo
- `toggleTipoAlerta(id, activo)` - Activar/desactivar
- `enviarPrueba(tipoId)` - Enviar alerta de prueba

#### Configuración Usuario
- `getConfiguracion()` - Obtener config
- `updateConfiguracion(config)` - Actualizar config

### Hooks
**`src/hooks/useAlertas.ts`**

Hooks React Query organizados:

#### Alertas
- `useAlertas(filtros)` - Lista con filtros
- `useAlertasNoLeidas()` - No leídas (auto-refresh 30s)
- `useAlerta(id)` - Detalle
- `useEstadisticasAlertas()` - Estadísticas
- `useMarcarLeida()` - Marcar leída
- `useMarcarTodasLeidas()` - Marcar todas
- `useCreateAlerta()` - Crear
- `useDeleteAlerta()` - Eliminar
- `usePostponerAlerta()` - Posponer

#### Tipos de Alerta
- `useTiposAlerta()` - Listar tipos
- `useTipoAlerta(id)` - Detalle
- `useCreateTipoAlerta()` - Crear
- `useUpdateTipoAlerta()` - Actualizar
- `useDeleteTipoAlerta()` - Eliminar
- `useToggleTipoAlerta()` - Toggle activo
- `useEnviarAlertaPrueba()` - Enviar prueba

#### Configuración
- `useConfiguracionAlertas()` - Obtener
- `useUpdateConfiguracionAlertas()` - Actualizar

### Componentes UI

**`src/components/ui/popover.tsx`** (nuevo)
- Componente Popover de Radix UI estilizado

**`src/components/alertas/NotificationBell.tsx`** (nuevo)
- Campana de notificaciones con badge
- Panel desplegable con últimas 5 alertas
- Acciones: marcar leída, eliminar, ver todas
- Ordenamiento por prioridad y fecha
- Navegación a entidad relacionada

### Páginas

**`src/pages/alertas/AlertasListPage.tsx`** (nuevo)
- Lista completa de alertas
- **Estadísticas**: Total, no leídas, hoy, esta semana
- **Filtros**: Tipo, prioridad, estado (leídas/no leídas)
- **Acciones**: Marcar todas leídas
- **Diseño**: Cards con indicador visual para no leídas
- Ordenamiento inteligente (no leídas primero)

**`src/pages/alertas/AlertaDetailPage.tsx`** (nuevo)
- Vista detallada de alerta
- Información completa del mensaje
- Badges de prioridad, tipo y estado
- Botón para ver entidad relacionada
- Datos adicionales (metadata)
- Auto-marca como leída al visualizar

**`src/pages/alertas/TiposAlertaPage.tsx`** (nuevo)
- Lista de tipos de alerta configurados
- Tabla con información clave
- Toggle activo/inactivo rápido
- Canales de envío visibles
- Acciones: editar, eliminar

### Integración

**`src/components/layout/Header.tsx`** (actualizado)
- Integrado `NotificationBell`
- Removido código legacy de alertas

**`src/App.tsx`** (actualizado)
- Rutas agregadas:
  - `/alertas` - Lista
  - `/alertas/:id` - Detalle
  - `/alertas/tipos` - Gestión de tipos

## Uso del Módulo

### Ver Notificaciones

1. Click en la campana en el header
2. Ver panel con últimas alertas
3. Click en alerta para ver detalle
4. Acciones rápidas: marcar leída, eliminar

### Gestionar Alertas

1. Ir a `/alertas`
2. Ver estadísticas generales
3. Filtrar por tipo, prioridad o estado
4. Click en alerta para ver detalle completo
5. Marcar todas como leídas con un click

### Configurar Tipos de Alerta

1. Ir a `/alertas` → "Gestionar Tipos"
2. Ver lista de tipos configurados
3. Activar/desactivar tipos con checkbox
4. Crear nuevo tipo con "Nuevo Tipo"
5. Editar tipo existente

### Crear Tipo de Alerta (Ejemplo)

```typescript
{
  nombre: "Vacuna Próxima a Vencer",
  tipo: "vacuna",
  descripcion: "Alerta para vacunas próximas a vencer",
  prioridad_default: "alta",
  frecuencia: "diaria",
  dias_anticipacion: 7,
  hora_envio: "09:00",
  enviar_a_roles: ["admin", "veterinario"],
  enviar_a_responsables: true,
  canal_sistema: true,
  canal_email: true,
  plantilla_titulo: "Vacuna de {nombre_caballo} vence en {dias_restantes} días",
  plantilla_mensaje: "La vacuna {tipo_vacuna} del caballo {nombre_caballo} vence el {fecha_vencimiento}",
  condiciones: [
    {
      campo: "dias_hasta_vencimiento",
      operador: "menor_igual",
      valor: 7
    }
  ]
}
```

## Flujo de Alertas

### 1. Generación Automática (Backend)
```
Evento Trigger → Evaluar Condiciones → Buscar Tipos Activos →
Generar Alertas → Enviar por Canales Configurados
```

### 2. Notificación en Sistema
```
Backend crea alerta → Frontend poll cada 30s →
Badge se actualiza → Usuario ve campana → Click → Panel → Detalle
```

### 3. Acciones del Usuario
```
Ver alerta → Auto-marca leída → Navega a entidad →
Resuelve → Elimina alerta
```

## Integración con Backend

### Endpoints Necesarios

#### Alertas
```
GET    /api/v1/alertas/                 - Mis alertas con filtros
GET    /api/v1/alertas/all              - Todas (admin)
GET    /api/v1/alertas/no-leidas        - No leídas
GET    /api/v1/alertas/:id              - Detalle
GET    /api/v1/alertas/estadisticas     - Estadísticas
POST   /api/v1/alertas/                 - Crear manual
PUT    /api/v1/alertas/:id/leer         - Marcar leída
PUT    /api/v1/alertas/marcar-todas-leidas - Marcar todas
PUT    /api/v1/alertas/:id/posponer     - Posponer
DELETE /api/v1/alertas/:id              - Eliminar
```

#### Tipos de Alerta
```
GET    /api/v1/alertas/tipos            - Listar tipos
GET    /api/v1/alertas/tipos/:id        - Detalle
POST   /api/v1/alertas/tipos            - Crear
PUT    /api/v1/alertas/tipos/:id        - Actualizar
DELETE /api/v1/alertas/tipos/:id        - Eliminar
PUT    /api/v1/alertas/tipos/:id/toggle - Toggle activo
POST   /api/v1/alertas/tipos/:id/prueba - Enviar prueba
```

#### Configuración
```
GET    /api/v1/alertas/configuracion    - Config usuario
PUT    /api/v1/alertas/configuracion    - Actualizar config
```

### Respuesta Ejemplo

```json
{
  "id": "uuid",
  "tipo": "vacuna",
  "prioridad": "alta",
  "titulo": "Vacuna de Thunder vence en 5 días",
  "mensaje": "La vacuna antirrábica del caballo Thunder vence el 2024-01-30",
  "leida": false,
  "fecha_evento": "2024-01-30",
  "entidad_relacionada_tipo": "caballo",
  "entidad_relacionada_id": "caballo-uuid",
  "acciones_disponibles": [
    {
      "tipo": "ver_detalle",
      "etiqueta": "Ver Caballo",
      "url": "/caballos/caballo-uuid"
    }
  ],
  "datos_adicionales": {
    "tipo_vacuna": "Antirrábica",
    "nombre_caballo": "Thunder",
    "dias_restantes": 5
  },
  "created_at": "2024-01-25T10:00:00Z",
  "updated_at": "2024-01-25T10:00:00Z"
}
```

## Próximos Pasos Sugeridos

1. **Formularios de Creación/Edición**: Crear páginas completas para crear y editar tipos de alertas con todas las opciones
2. **Página de Configuración**: Permitir al usuario configurar sus preferencias de alertas
3. **WebSockets**: Implementar notificaciones en tiempo real sin polling
4. **Push Notifications**: Integrar servicio de push notifications (Firebase, OneSignal, etc.)
5. **Historial**: Página para ver todas las alertas (incluyendo leídas y eliminadas)
6. **Templates Avanzados**: Editor visual para plantillas con preview
7. **Reportes**: Análisis de alertas generadas, tasas de lectura, etc.
8. **Snooze Personalizado**: Permitir posponer por diferentes períodos
9. **Categorías**: Agrupar tipos de alertas por categorías
10. **Sonidos**: Configurar sonidos de notificación

## Notas Importantes

- Las alertas se auto-marcan como leídas al visualizarlas
- El polling es cada 30 segundos (configurable en el hook)
- Las alertas se ordenan por prioridad (crítica → baja) y fecha
- El panel muestra solo las 5 más recientes
- Los colores de prioridad son consistentes en toda la app
- Las entidades relacionadas permiten navegación directa
- El sistema soporta metadata adicional flexible

## Variables de Plantilla Soportadas

Ejemplos de variables que pueden usarse en plantillas:
- `{nombre}` - Nombre de la entidad
- `{fecha}` - Fecha del evento
- `{dias_restantes}` - Días hasta el evento
- `{monto}` - Monto (para pagos)
- `{tipo}` - Tipo de entidad
- `{responsable}` - Nombre del responsable

El backend debe procesar estas variables y reemplazarlas con valores reales al generar las alertas.

---

El módulo está completamente funcional en el frontend y listo para integrarse con el backend. La campana de notificaciones aparece en el header y se actualiza automáticamente cada 30 segundos.
