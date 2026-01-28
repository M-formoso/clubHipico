# Agent Instructions - Sistema Club Ecuestre

## Contexto del Proyecto

Estás trabajando en un **Sistema de Gestión para un Club Ecuestre** que administra:
- Gestión de caballos (salud, alimentación, herraje)
- Clientes y socios del club
- Empleados (veterinarios, instructores, cuidadores)
- Eventos (clases, competencias, actividades)
- Pagos y finanzas
- Sistema de alertas automáticas
- Reportes gerenciales

**Usuarios del sistema:** ~100 (empleados + clientes)
**Acceso:** Web responsive (desktop + mobile)

---

## Stack Tecnológico

### Backend
- Python 3.11+ con FastAPI 0.104+
- PostgreSQL 15+ como base de datos
- SQLAlchemy 2.0 como ORM
- Alembic para migraciones
- Pydantic v2 para validación
- JWT con python-jose para autenticación
- Celery + Redis para tareas asíncronas (alertas, emails)
- Pytest para testing

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui para componentes
- **Esquema de colores:** Beige y gris como colores principales
- Zustand para state management
- TanStack Query para data fetching
- React Hook Form + Zod para formularios
- TanStack Table para tablas
- React Router v6

### Infraestructura
- Monorepo con Docker Compose
- Nginx como proxy reverso (producción)
- Cloudinary para storage de imágenes

---

## Principios de Desarrollo

### 1. Arquitectura

**Backend:**
- Sigue arquitectura en capas: Endpoints → Services → Models
- NUNCA pongas lógica de negocio en los endpoints
- Usa dependency injection de FastAPI
- Todos los endpoints deben tener validación Pydantic
- Usa transacciones de BD cuando sea necesario
- Implementa soft deletes (marcar como inactivo, no eliminar)

**Frontend:**
- Componentes pequeños y reutilizables
- Custom hooks para lógica compartida
- Mantén separación: components / pages / services / stores
- Usa TypeScript SIEMPRE, no uses `any`
- Implementa loading states y error handling
- **Usa colores beige y gris para botones y elementos de UI**

### 2. Convenciones de Código

**Python:**
```python
# Nombres descriptivos
def obtener_caballos_por_cliente(cliente_id: UUID) -> List[CaballoSchema]:
    pass

# Type hints SIEMPRE
def crear_pago(
    db: Session,
    cliente_id: UUID,
    pago_data: PagoCreate
) -> Pago:
    pass

# Docstrings para funciones públicas
def enviar_alerta_vacuna(caballo: Caballo) -> None:
    """
    Envía alerta de vencimiento de vacuna.

    Args:
        caballo: Instancia del modelo Caballo

    Returns:
        None

    Raises:
        EmailError: Si falla el envío del email
    """
    pass
```

**TypeScript:**
```typescript
// Interfaces descriptivas
interface CaballoFormData {
  nombre: string;
  raza: string;
  edad: number;
  propietarioId: string;
}

// Tipos exportados
export type { CaballoFormData };

// Funciones con tipos explícitos
const crearCaballo = async (data: CaballoFormData): Promise<Caballo> => {
  // ...
}
```

### 3. Estructura de Archivos

**Frontend** - Estructura por feature:
```
src/
├── components/{modulo}/
│   ├── {Modulo}List.tsx
│   ├── {Modulo}Form.tsx
│   ├── {Modulo}Detail.tsx
│   └── index.ts
├── pages/{modulo}/
│   ├── index.tsx
│   ├── create.tsx
│   └── [id].tsx
├── services/{modulo}Service.ts
└── types/{modulo}.ts
```

### 4. Esquema de Colores

**Colores principales (Beige y Gris):**
```typescript
// tailwind.config.js - Configuración personalizada
colors: {
  beige: {
    50: '#faf8f5',
    100: '#f5f1ea',
    200: '#e8dfd0',
    300: '#d9c9b0',
    400: '#c9b091',
    500: '#b89771', // Principal
    600: '#a07d5d',
    700: '#7d6149',
    800: '#5a4536',
    900: '#372923',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Principal
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
}
```

**Uso en componentes:**
- Botones primarios: `bg-beige-500 hover:bg-beige-600`
- Botones secundarios: `bg-gray-500 hover:bg-gray-600`
- Fondos: `bg-gray-50` o `bg-beige-50`
- Textos: `text-gray-900` o `text-gray-700`
- Bordes: `border-gray-300`

### 5. Seguridad

**CRÍTICO - Siempre implementar:**
- ✅ Validación de permisos en TODOS los endpoints
- ✅ Sanitización de inputs (Pydantic ya lo hace)
- ✅ SQL Injection protection (SQLAlchemy ORM lo maneja)
- ✅ CORS configurado correctamente
- ✅ Passwords hasheados con passlib
- ✅ JWT con expiración (access: 30min, refresh: 7 días)
- ✅ Rate limiting en endpoints sensibles
- ✅ Logs de acciones críticas (crear, modificar, eliminar)

### 6. Performance

**Backend:**
- Usa `select` con `options(joinedload())` para evitar N+1 queries
- Implementa paginación SIEMPRE (skip/limit)
- Usa índices en columnas frecuentemente consultadas
- Cache con Redis para datos que no cambian seguido

**Frontend:**
- React Query para caching automático
- Lazy loading de componentes pesados
- Optimistic updates en mutaciones
- Debounce en búsquedas (300ms)

---

## Módulos del Sistema

### 1. Autenticación y Usuarios
- Roles: Super Admin, Administrador, Empleado, Cliente
- Login con JWT (access + refresh tokens)
- Recuperación de contraseña
- Gestión de permisos por rol

### 2. Gestión de Caballos
- CRUD completo de caballos
- Historial médico (vacunas, desparasitaciones, tratamientos)
- Plan de alimentación
- Herraje
- Fotos del caballo
- Alertas automáticas

### 3. Gestión de Clientes
- CRUD de clientes/socios
- Tipos de cliente (socio pleno, pensionista, alumno)
- Historial de pagos
- Documentos digitales
- Estado de cuenta

### 4. Gestión de Empleados
- CRUD de empleados
- Roles/Funciones
- Horarios de trabajo
- Salarios
- Asistencia

### 5. Gestión de Eventos
- Calendario de eventos
- Tipos: clases, competencias, salidas
- Inscripciones online
- Asistencia
- Recordatorios automáticos

### 6. Gestión de Pagos
- Registro de pagos
- Generación de recibos
- Estados: pendiente, pagado, vencido
- Dashboard financiero
- Recordatorios de vencimientos

### 7. Sistema de Alertas
- Notificaciones en tiempo real
- Alertas por email
- Centro de notificaciones
- Configuración de preferencias

### 8. Reportes y Analytics
- Reportes financieros
- Reportes operativos
- Estadísticas de clientes
- Estadísticas de caballos
- Gráficos interactivos

---

## Comandos Útiles

```bash
# Frontend
cd frontend
npm install
npm run dev
npm run build

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Docker
docker-compose up -d
docker-compose logs -f backend
docker-compose down

# Tests
pytest
pytest tests/api/test_caballos.py -v
```

---

## Recordatorios Finales

### ✅ Siempre hacer:
- Validar inputs con Pydantic/Zod
- Manejar errores apropiadamente
- Logs en acciones críticas
- Type safety en TypeScript
- Usar colores beige y gris en la UI
- Implementar loading states
- Commits descriptivos

### ❌ Nunca hacer:
- Hardcodear credenciales
- Usar `any` en TypeScript
- Queries directas en endpoints (usar services)
- Eliminar datos sin soft delete
- Exponer errores del servidor al cliente
- Ignorar el esquema de colores definido

---

## Skills Disponibles

Para tareas específicas, consulta los siguientes skills en `docs/skills/`:

1. **fastapi-crud.md** - Generar CRUDs completos en FastAPI
2. **react-forms.md** - Crear formularios React con validation
3. **database-design.md** - Diseño de base de datos PostgreSQL
4. **auth-flow.md** - Implementar autenticación completa
5. **docker-setup.md** - Configuración de Docker
