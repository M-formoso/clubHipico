# Sistema de Gestión para Club Ecuestre

## 📋 Información del Proyecto

**Nombre:** Sistema de Gestión Club Ecuestre  
**Versión:** 1.0.0  
**Usuarios estimados:** ~100 (empleados + clientes)  
**Tipo:** Sistema de gestión integral  
**Entorno:** Web responsive (desktop + mobile)

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.104+
- **Lenguaje:** Python 3.11+
- **ORM:** SQLAlchemy 2.0
- **Migraciones:** Alembic
- **Validación:** Pydantic v2
- **Autenticación:** python-jose (JWT) + passlib
- **Base de Datos:** PostgreSQL 15+
- **Workers:** Celery + Redis
- **Storage:** Cloudinary (imágenes)
- **Testing:** Pytest + pytest-asyncio

### Frontend
- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript 5+
- **Styling:** Tailwind CSS
- **Componentes UI:** shadcn/ui + lucide-react
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod
- **Tablas:** TanStack Table
- **Router:** React Router v6
- **HTTP Client:** Axios
los colores a usar para botones y demas spn el beige y gris 



### Infraestructura
- **Containerización:** Docker + Docker Compose
- **Proxy Reverso:** Nginx (producción)
- **Deploy:** VPS (Railway/DigitalOcean)
- **Monitoreo:** Sentry
- **CI/CD:** GitHub Actions (opcional)

### Desarrollo
- **Linting:** Ruff (Python) + ESLint (TypeScript)
- **Formatting:** Black + Prettier
- **Pre-commit:** husky + lint-staged
- **Version Control:** Git + GitHub

---

## 📁 Estructura del Proyecto (Monorepo)

```
club-ecuestre/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Header, Sidebar, Footer
│   │   │   ├── caballos/        # Componentes módulo caballos
│   │   │   ├── clientes/        # Componentes módulo clientes
│   │   │   ├── eventos/         # Componentes módulo eventos
│   │   │   ├── empleados/       # Componentes módulo empleados
│   │   │   ├── alertas/         # Componentes de notificaciones
│   │   │   └── shared/          # Componentes compartidos
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Dashboards por rol
│   │   │   ├── caballos/        # CRUD caballos
│   │   │   ├── clientes/        # CRUD clientes
│   │   │   ├── eventos/         # CRUD eventos
│   │   │   ├── empleados/       # CRUD empleados
│   │   │   ├── pagos/           # Gestión de pagos
│   │   │   ├── reportes/        # Reportes y analytics
│   │   │   └── configuracion/   # Settings del sistema
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API calls
│   │   ├── stores/              # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utilidades
│   │   ├── constants/           # Constantes
│   │   └── lib/                 # Config shadcn/ui
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── caballos.py
│   │   │   │   │   ├── clientes.py
│   │   │   │   │   ├── eventos.py
│   │   │   │   │   ├── empleados.py
│   │   │   │   │   ├── pagos.py
│   │   │   │   │   ├── alertas.py
│   │   │   │   │   ├── reportes.py
│   │   │   │   │   └── upload.py
│   │   │   │   └── api.py       # Router principal
│   │   ├── core/
│   │   │   ├── config.py        # Settings con Pydantic
│   │   │   ├── security.py      # JWT, hashing
│   │   │   ├── deps.py          # Dependencies FastAPI
│   │   │   └── celery_app.py    # Celery config
│   │   ├── db/
│   │   │   ├── base.py          # Base SQLAlchemy
│   │   │   ├── session.py       # DB session
│   │   │   └── init_db.py       # Datos iniciales
│   │   ├── models/
│   │   │   ├── base.py          # Base model
│   │   │   ├── usuario.py
│   │   │   ├── caballo.py
│   │   │   ├── cliente.py
│   │   │   ├── evento.py
│   │   │   ├── empleado.py
│   │   │   ├── pago.py
│   │   │   ├── alerta.py
│   │   │   └── asociaciones.py  # Tablas intermedias
│   │   ├── schemas/
│   │   │   ├── usuario.py       # Pydantic schemas
│   │   │   ├── caballo.py
│   │   │   ├── cliente.py
│   │   │   ├── evento.py
│   │   │   ├── empleado.py
│   │   │   ├── pago.py
│   │   │   ├── alerta.py
│   │   │   └── common.py        # Schemas compartidos
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── caballo_service.py
│   │   │   ├── cliente_service.py
│   │   │   ├── evento_service.py
│   │   │   ├── empleado_service.py
│   │   │   ├── pago_service.py
│   │   │   ├── alerta_service.py
│   │   │   ├── reporte_service.py
│   │   │   └── upload_service.py
│   │   ├── tasks/               # Celery tasks
│   │   │   ├── alertas.py       # Envío de alertas
│   │   │   ├── emails.py        # Envío de emails
│   │   │   └── reportes.py      # Generación reportes
│   │   ├── utils/
│   │   │   ├── email.py
│   │   │   ├── validators.py
│   │   │   └── helpers.py
│   │   └── main.py              # App FastAPI
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/
│   │   ├── api/
│   │   ├── services/
│   │   └── conftest.py
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   └── pyproject.toml
│
├── docs/
│   ├── agent.md                 # Instrucciones para Claude Code
│   ├── skills/
│   │   ├── fastapi-crud.md      # Skill: Generar CRUDs
│   │   ├── react-forms.md       # Skill: Formularios React
│   │   ├── database-design.md   # Skill: Diseño BD
│   │   ├── auth-flow.md         # Skill: Autenticación
│   │   └── docker-setup.md      # Skill: Docker config
│   ├── api-documentation.md     # Docs de la API
│   ├── database-schema.md       # Esquema de BD
│   └── deployment.md            # Guía de deployment
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🗂️ Módulos del Sistema

### 1. Autenticación y Usuarios

**Descripción:** Sistema de login, roles y permisos

**Roles:**
- **Super Admin:** Acceso total al sistema
- **Administrador:** Gestión completa del club
- **Empleado:** Acceso limitado según función (veterinario, instructor, cuidador)
- **Cliente:** Panel personal con info de sus caballos y servicios

**Funcionalidades:**
- ✅ Registro de usuarios con validación de email
- ✅ Login con JWT (access token + refresh token)
- ✅ Recuperación de contraseña por email
- ✅ Cambio de contraseña
- ✅ Gestión de permisos por rol
- ✅ Logs de actividad de usuarios
- ✅ Sesiones activas y cierre de sesión múltiple

**Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
PUT    /api/v1/auth/change-password
```

---

### 2. Gestión de Caballos

**Descripción:** CRUD completo de caballos con historial médico y alimentación

**Funcionalidades:**
- ✅ Registro de caballos (nombre, raza, edad, sexo, color, características)
- ✅ Asignación a propietario (cliente)
- ✅ Historial médico (vacunas, desparasitaciones, tratamientos, visitas veterinario)
- ✅ Plan de alimentación (tipo, cantidad, horarios)
- ✅ Herraje (fecha última, próxima, observaciones)
- ✅ Fotos del caballo (múltiples imágenes)
- ✅ Estado del caballo (activo, retirado, en tratamiento, fallecido)
- ✅ Asignación de box/establo
- ✅ Seguimiento de peso y condición corporal
- ✅ Alertas automáticas (próxima vacuna, herraje, desparasitación)
- ✅ Búsqueda y filtros avanzados
- ✅ Exportar listados a PDF/Excel

**Endpoints:**
```
GET    /api/v1/caballos              # Listar con filtros
POST   /api/v1/caballos              # Crear
GET    /api/v1/caballos/{id}         # Ver detalle
PUT    /api/v1/caballos/{id}         # Actualizar
DELETE /api/v1/caballos/{id}         # Eliminar (soft delete)
POST   /api/v1/caballos/{id}/fotos   # Subir fotos
GET    /api/v1/caballos/{id}/historial-medico
POST   /api/v1/caballos/{id}/historial-medico
GET    /api/v1/caballos/{id}/alimentacion
PUT    /api/v1/caballos/{id}/alimentacion
```

---

### 3. Gestión de Clientes

**Descripción:** CRUD de clientes/socios del club

**Funcionalidades:**
- ✅ Registro de clientes (datos personales, contacto)
- ✅ Tipos de cliente (socio pleno, pensionista, alumno clases)
- ✅ Asignación de caballos a cliente
- ✅ Historial de pagos
- ✅ Contratos digitales (subida de PDF)
- ✅ Documentos del cliente (DNI, certificados médicos, etc.)
- ✅ Estado de cuenta (debe, al día, crédito)
- ✅ Notas y observaciones
- ✅ Historial de clases/eventos participados
- ✅ Contactos de emergencia
- ✅ Búsqueda y filtros
- ✅ Envío de emails masivos o individuales

**Endpoints:**
```
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/{id}
PUT    /api/v1/clientes/{id}
DELETE /api/v1/clientes/{id}
GET    /api/v1/clientes/{id}/caballos
GET    /api/v1/clientes/{id}/pagos
GET    /api/v1/clientes/{id}/historial
POST   /api/v1/clientes/{id}/documentos
```

---

### 4. Gestión de Empleados

**Descripción:** CRUD de empleados del club

**Funcionalidades:**
- ✅ Registro de empleados (datos personales)
- ✅ Roles/Funciones (veterinario, instructor, cuidador, administrativo, mantenimiento)
- ✅ Horarios de trabajo
- ✅ Salario y forma de pago
- ✅ Documentación (contratos, certificados)
- ✅ Tareas asignadas
- ✅ Asistencia y puntualidad (registro)
- ✅ Evaluaciones de desempeño
- ✅ Permisos y vacaciones
- ✅ Contactos de emergencia

**Endpoints:**
```
GET    /api/v1/empleados
POST   /api/v1/empleados
GET    /api/v1/empleados/{id}
PUT    /api/v1/empleados/{id}
DELETE /api/v1/empleados/{id}
GET    /api/v1/empleados/{id}/horarios
PUT    /api/v1/empleados/{id}/horarios
GET    /api/v1/empleados/{id}/asistencias
POST   /api/v1/empleados/{id}/asistencias
```

---

### 5. Gestión de Eventos

**Descripción:** Calendario de eventos, clases, competencias, actividades

**Funcionalidades:**
- ✅ Tipos de eventos (clases grupales, clases privadas, competencias, salidas, eventos sociales)
- ✅ Calendario visual (diario, semanal, mensual)
- ✅ Creación de eventos recurrentes (ej: clases todos los martes)
- ✅ Asignación de instructor
- ✅ Asignación de participantes (clientes)
- ✅ Asignación de caballos
- ✅ Capacidad máxima de participantes
- ✅ Inscripciones online (clientes pueden anotarse)
- ✅ Lista de espera
- ✅ Cancelaciones y reprogramaciones
- ✅ Asistencia (registro presente/ausente)
- ✅ Costo del evento
- ✅ Estado del evento (programado, en curso, finalizado, cancelado)
- ✅ Notificaciones automáticas (recordatorios 24hs antes)
- ✅ Comentarios y feedback post-evento

**Endpoints:**
```
GET    /api/v1/eventos               # Listar con filtros
POST   /api/v1/eventos               # Crear
GET    /api/v1/eventos/{id}
PUT    /api/v1/eventos/{id}
DELETE /api/v1/eventos/{id}
POST   /api/v1/eventos/{id}/inscribirse
DELETE /api/v1/eventos/{id}/desinscribirse
PUT    /api/v1/eventos/{id}/asistencia
GET    /api/v1/eventos/calendario    # Vista calendario
```

---

### 6. Gestión de Pagos

**Descripción:** Control de pagos de pensión, clases, servicios

**Funcionalidades:**
- ✅ Tipos de pago (pensión mensual, clase individual, clase paquete, evento, servicio extra)
- ✅ Registro manual de pagos
- ✅ Métodos de pago (efectivo, transferencia, tarjeta, cheque)
- ✅ Generación de recibos en PDF
- ✅ Estados (pendiente, pagado, vencido, cancelado)
- ✅ Pagos parciales
- ✅ Descuentos y promociones
- ✅ Mora por pagos atrasados
- ✅ Historial completo por cliente
- ✅ Recordatorios automáticos de vencimientos
- ✅ Dashboard financiero (ingresos del mes, pendientes, morosos)
- ✅ Exportar movimientos a Excel
- ✅ Conciliación de pagos

**Endpoints:**
```
GET    /api/v1/pagos
POST   /api/v1/pagos                 # Registrar pago
GET    /api/v1/pagos/{id}
PUT    /api/v1/pagos/{id}
DELETE /api/v1/pagos/{id}
GET    /api/v1/pagos/pendientes
GET    /api/v1/pagos/vencidos
GET    /api/v1/pagos/cliente/{cliente_id}
GET    /api/v1/pagos/{id}/recibo     # Generar PDF
```

---

### 7. Sistema de Alertas

**Descripción:** Notificaciones automáticas para eventos importantes

**Tipos de alertas:**
- 🔔 Vencimiento de vacunas (caballos)
- 🔔 Próximo herraje
- 🔔 Desparasitación pendiente
- 🔔 Pagos vencidos (clientes)
- 🔔 Recordatorio de eventos (24hs antes)
- 🔔 Cumpleaños de caballos/clientes
- 🔔 Renovación de contratos
- 🔔 Certificados médicos vencidos
- 🔔 Stock bajo de alimentos/medicamentos
- 🔔 Tareas pendientes (empleados)

**Funcionalidades:**
- ✅ Alertas en tiempo real en la app
- ✅ Notificaciones por email
- ✅ Centro de notificaciones (ver todas, marcar leídas)
- ✅ Configuración de preferencias de notificaciones (por usuario)
- ✅ Alertas programadas (Celery tasks)
- ✅ Prioridad de alertas (baja, media, alta, crítica)
- ✅ Snooze de alertas (posponer)

**Endpoints:**
```
GET    /api/v1/alertas               # Mis alertas
GET    /api/v1/alertas/no-leidas
PUT    /api/v1/alertas/{id}/leer
PUT    /api/v1/alertas/marcar-todas-leidas
DELETE /api/v1/alertas/{id}
GET    /api/v1/alertas/configuracion
PUT    /api/v1/alertas/configuracion
```

---

### 8. Reportes y Analytics

**Descripción:** Reportes gerenciales y estadísticas del club

**Reportes disponibles:**
- 📊 **Financieros:**
  - Ingresos mensuales/anuales
  - Pagos pendientes y mora
  - Comparativa de ingresos (mes a mes)
  - Desglose por tipo de servicio
  
- 📊 **Operativos:**
  - Ocupación de boxes/establos
  - Asistencia a clases
  - Caballos por estado (activos, en tratamiento, etc.)
  - Empleados por función
  
- 📊 **Clientes:**
  - Clientes activos vs inactivos
  - Nuevos clientes por mes
  - Clientes morosos
  - Retención de clientes
  
- 📊 **Caballos:**
  - Próximas vacunaciones
  - Próximos herrajes
  - Distribución por edad/raza
  - Historial médico consolidado
  
- 📊 **Eventos:**
  - Eventos realizados vs programados
  - Tasa de asistencia
  - Eventos más populares

**Funcionalidades:**
- ✅ Filtros por fecha
- ✅ Gráficos interactivos (Chart.js)
- ✅ Exportar a PDF
- ✅ Exportar a Excel
- ✅ Dashboards personalizados por rol
- ✅ KPIs principales en homepage

**Endpoints:**
```
GET    /api/v1/reportes/financiero
GET    /api/v1/reportes/ocupacion
GET    /api/v1/reportes/clientes
GET    /api/v1/reportes/caballos
GET    /api/v1/reportes/eventos
GET    /api/v1/reportes/dashboard    # KPIs generales
POST   /api/v1/reportes/export       # Exportar personalizado
```

---

### 9. Configuración del Sistema

**Descripción:** Parámetros generales y administración

**Funcionalidades:**
- ✅ Datos del club (nombre, logo, dirección, teléfono, email)
- ✅ Configuración de precios (pensión, clases, servicios)
- ✅ Gestión de boxes/establos (nombre, capacidad, estado)
- ✅ Catálogo de servicios
- ✅ Configuración de emails (templates, SMTP)
- ✅ Gestión de roles y permisos
- ✅ Backup y restauración de datos
- ✅ Logs del sistema
- ✅ Términos y condiciones
- ✅ Política de privacidad

**Endpoints:**
```
GET    /api/v1/config/general
PUT    /api/v1/config/general
GET    /api/v1/config/precios
PUT    /api/v1/config/precios
GET    /api/v1/config/boxes
POST   /api/v1/config/boxes
GET    /api/v1/config/servicios
POST   /api/v1/config/servicios
```

---

### 10. Panel del Cliente (Portal Cliente)

**Descripción:** Vista específica para clientes del club

**Funcionalidades:**
- ✅ Ver mis caballos (info, fotos, estado)
- ✅ Historial médico de mis caballos
- ✅ Próximas clases/eventos inscritos
- ✅ Inscribirse a clases disponibles
- ✅ Ver estado de cuenta
- ✅ Historial de pagos
- ✅ Descargar recibos
- ✅ Actualizar mis datos personales
- ✅ Ver notificaciones importantes
- ✅ Contactar con el club (mensajes)

**Endpoints:**
```
GET    /api/v1/cliente-portal/mis-caballos
GET    /api/v1/cliente-portal/mis-eventos
GET    /api/v1/cliente-portal/mis-pagos
GET    /api/v1/cliente-portal/estado-cuenta
PUT    /api/v1/cliente-portal/perfil
POST   /api/v1/cliente-portal/contacto
```

---

## 📚 Skills para Claude Code

Los siguientes archivos deben crearse en `docs/skills/` para que el agente los consuma cuando necesite realizar tareas específicas.

### 📄 docs/skills/fastapi-crud.md

```markdown
# Skill: Generar CRUD completo en FastAPI

## Objetivo
Generar un módulo CRUD completo siguiendo las mejores prácticas de FastAPI con SQLAlchemy.

## Pasos para generar un CRUD

### 1. Modelo SQLAlchemy (models/{nombre}.py)

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid
from datetime import datetime

class NombreModelo(Base):
    __tablename__ = "nombre_tabla"
    
    # Campos obligatorios
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Campos personalizados
    nombre = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)
    
    # Relaciones (si aplica)
    # propietario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    # propietario = relationship("Usuario", back_populates="items")
```

### 2. Schemas Pydantic (schemas/{nombre}.py)

```python
from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional

# Base schema con campos comunes
class NombreBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    activo: bool = True

# Schema para creación (sin ID, sin timestamps)
class NombreCreate(NombreBase):
    pass

# Schema para actualización (todos los campos opcionales)
class NombreUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    activo: Optional[bool] = None

# Schema para respuesta (incluye ID y timestamps)
class NombreSchema(NombreBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Para SQLAlchemy 2.0
```

### 3. Service (services/{nombre}_service.py)

```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.{nombre} import NombreModelo
from app.schemas.{nombre} import NombreCreate, NombreUpdate

def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False
) -> List[NombreModelo]:
    """Obtiene lista de items con paginación."""
    query = db.query(NombreModelo)
    
    if activo_solo:
        query = query.filter(NombreModelo.activo == True)
    
    return query.offset(skip).limit(limit).all()

def obtener_por_id(db: Session, id: UUID) -> Optional[NombreModelo]:
    """Obtiene un item por ID."""
    return db.query(NombreModelo).filter(NombreModelo.id == id).first()

def crear(db: Session, item_data: NombreCreate, usuario_id: UUID) -> NombreModelo:
    """Crea un nuevo item."""
    try:
        db_item = NombreModelo(**item_data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos"
        )

def actualizar(
    db: Session,
    id: UUID,
    item_update: NombreUpdate
) -> Optional[NombreModelo]:
    """Actualiza un item existente."""
    db_item = obtener_por_id(db, id)
    if not db_item:
        return None
    
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def eliminar(db: Session, id: UUID) -> Optional[NombreModelo]:
    """Elimina un item (soft delete marcando como inactivo)."""
    db_item = obtener_por_id(db, id)
    if not db_item:
        return None
    
    # Soft delete
    db_item.activo = False
    db.commit()
    db.refresh(db_item)
    return db_item

def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[NombreModelo]:
    """Busca items por nombre."""
    return db.query(NombreModelo).filter(
        NombreModelo.nombre.ilike(f"%{termino}%"),
        NombreModelo.activo == True
    ).offset(skip).limit(limit).all()
```

### 4. Endpoints (api/v1/endpoints/{nombre}.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.{nombre} import NombreSchema, NombreCreate, NombreUpdate
from app.services import {nombre}_service

router = APIRouter()

@router.get("/", response_model=List[NombreSchema])
async def listar_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los items con paginación."""
    return {nombre}_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo
    )

@router.get("/buscar", response_model=List[NombreSchema])
async def buscar_items(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Busca items por nombre."""
    return {nombre}_service.buscar(db, termino=q, skip=skip, limit=limit)

@router.post(
    "/",
    response_model=NombreSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_item(
    item: NombreCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo item."""
    return {nombre}_service.crear(db, item, current_user.id)

@router.get("/{id}", response_model=NombreSchema)
async def obtener_item(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un item específico por ID."""
    item = {nombre}_service.obtener_por_id(db, id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return item

@router.put("/{id}", response_model=NombreSchema)
async def actualizar_item(
    id: UUID,
    item_update: NombreUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un item existente."""
    item = {nombre}_service.actualizar(db, id, item_update)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return item

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_item(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un item (soft delete)."""
    item = {nombre}_service.eliminar(db, id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return None
```

### 5. Registrar router en api.py

```python
from app.api.v1.endpoints import {nombre}

api_router.include_router(
    {nombre}.router,
    prefix="/{nombre}s",
    tags=["{Nombre}s"]
)
```

### 6. Tests básicos (tests/api/test_{nombre}.py)

```python
import pytest
from uuid import uuid4

def test_crear_item(client, auth_headers, db):
    response = client.post(
        "/api/v1/{nombre}s/",
        json={"nombre": "Test Item"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["nombre"] == "Test Item"

def test_listar_items(client, auth_headers):
    response = client.get("/api/v1/{nombre}s/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_obtener_item_inexistente(client, auth_headers):
    fake_id = str(uuid4())
    response = client.get(f"/api/v1/{nombre}s/{fake_id}", headers=auth_headers)
    assert response.status_code == 404

def test_actualizar_item(client, auth_headers, db, item_fixture):
    response = client.put(
        f"/api/v1/{nombre}s/{item_fixture.id}",
        json={"nombre": "Updated Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Updated Name"

def test_eliminar_item(client, auth_headers, item_fixture):
    response = client.delete(
        f"/api/v1/{nombre}s/{item_fixture.id}",
        headers=auth_headers
    )
    assert response.status_code == 204
```

## Checklist

- [ ] Modelo SQLAlchemy creado con campos correctos
- [ ] Schemas Pydantic (Base, Create, Update, Schema)
- [ ] Service con todas las operaciones CRUD
- [ ] Endpoints FastAPI con validaciones
- [ ] Router registrado en api.py
- [ ] Tests básicos implementados
- [ ] Migración Alembic creada y aplicada
```

### 📄 docs/skills/react-forms.md

```markdown
# Skill: Crear formularios React con React Hook Form + Zod

## Objetivo
Crear formularios type-safe con validación robusta usando React Hook Form y Zod.

## Patrón completo

### 1. Definir schema de validación Zod

```typescript
// types/caballo.ts
import { z } from 'zod';

export const caballoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  raza: z.string().min(1, "La raza es requerida"),
  edad: z.number().min(0).max(50),
  sexo: z.enum(['macho', 'hembra', 'castrado']),
  propietarioId: z.string().uuid().optional(),
  descripcion: z.string().optional(),
});

export type CaballoFormData = z.infer<typeof caballoSchema>;
```

### 2. Componente de formulario

```typescript
// components/caballos/CaballoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { caballoSchema, CaballoFormData } from '@/types/caballo';
import { caballoService } from '@/services/caballoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CaballoFormProps {
  initialData?: CaballoFormData;
  caballoId?: string;
}

export function CaballoForm({ initialData, caballoId }: CaballoFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const form = useForm<CaballoFormData>({
    resolver: zodResolver(caballoSchema),
    defaultValues: initialData || {
      nombre: '',
      raza: '',
      edad: 0,
      sexo: 'macho',
      descripcion: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CaballoFormData) => {
      if (caballoId) {
        return caballoService.update(caballoId, data);
      }
      return caballoService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Éxito',
        description: `Caballo ${caballoId ? 'actualizado' : 'creado'} correctamente`,
      });
      navigate('/caballos');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Ocurrió un error',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del caballo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="raza"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raza *</FormLabel>
              <FormControl>
                <Input placeholder="Raza del caballo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="edad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded p-2">
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                  <option value="castrado">Castrado</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/caballos')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3. Página de creación

```typescript
// pages/caballos/create.tsx
import { CaballoForm } from '@/components/caballos/CaballoForm';

export function CreateCaballoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Nuevo Caballo</h1>
      <div className="max-w-2xl">
        <CaballoForm />
      </div>
    </div>
  );
}
```

### 4. Página de edición

```typescript
// pages/caballos/[id].tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { caballoService } from '@/services/caballoService';
import { CaballoForm } from '@/components/caballos/CaballoForm';

export function EditCaballoPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: caballo, isLoading } = useQuery({
    queryKey: ['caballos', id],
    queryFn: () => caballoService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (!caballo) return <div>Caballo no encontrado</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Editar Caballo</h1>
      <div className="max-w-2xl">
        <CaballoForm initialData={caballo} caballoId={id} />
      </div>
    </div>
  );
}
```

## Checklist

- [ ] Schema Zod definido con validaciones
- [ ] Tipo TypeScript inferido del schema
- [ ] Formulario con React Hook Form + zodResolver
- [ ] Todos los campos con FormField
- [ ] Mensajes de error visibles
- [ ] Mutation con React Query
- [ ] Toast notifications
- [ ] Loading states
- [ ] Navegación al guardar
- [ ] Botón cancelar
```

### 📄 docs/skills/database-design.md

```markdown
# Skill: Diseño de base de datos PostgreSQL

## Principios

1. **Normalización**: Hasta 3NF mínimo
2. **UUIDs**: Usar UUID v4 para IDs
3. **Timestamps**: created_at y updated_at en todas las tablas
4. **Soft deletes**: Campo `activo` en lugar de DELETE
5. **Foreign keys**: Siempre con ON DELETE y ON UPDATE
6. **Índices**: En columnas frecuentemente consultadas
7. **JSONB**: Para datos semi-estructurados

## Plantilla de tabla

```sql
CREATE TABLE nombre_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos específicos de la tabla
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Foreign keys (si aplica)
    propietario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_nombre_activo UNIQUE(nombre) WHERE activo = TRUE
);

-- Índices
CREATE INDEX idx_nombre_tabla_propietario ON nombre_tabla(propietario_id);
CREATE INDEX idx_nombre_tabla_activo ON nombre_tabla(activo) WHERE activo = TRUE;
CREATE INDEX idx_nombre_tabla_created ON nombre_tabla(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_nombre_tabla_updated_at
    BEFORE UPDATE ON nombre_tabla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Tipos de relaciones

### One-to-Many
```sql
-- Un cliente tiene muchos caballos
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE caballos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    propietario_id UUID REFERENCES clientes(id) ON DELETE SET NULL
);
```

### Many-to-Many
```sql
-- Muchos clientes pueden inscribirse en muchos eventos
CREATE TABLE inscripciones_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_inscripcion UNIQUE(cliente_id, evento_id)
);
```

### Self-referencing
```sql
-- Empleados con supervisor
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    supervisor_id UUID REFERENCES empleados(id) ON DELETE SET NULL
);
```

## ENUMs en PostgreSQL

```sql
CREATE TYPE rol_usuario AS ENUM ('super_admin', 'admin', 'empleado', 'cliente');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'pagado', 'vencido', 'cancelado');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'cliente'
);
```

## JSONB para datos flexibles

```sql
CREATE TABLE configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descripcion TEXT
);

-- Ejemplo de insert
INSERT INTO configuracion (clave, valor, descripcion)
VALUES (
    'precios_servicios',
    '{"pension_mensual": 15000, "clase_individual": 3000, "clase_grupal": 2000}'::jsonb,
    'Precios de los servicios del club'
);

-- Query JSONB
SELECT valor->>'pension_mensual' AS pension
FROM configuracion
WHERE clave = 'precios_servicios';
```

## Función para updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

## Migraciones Alembic

```python
"""Agregar tabla caballos

Revision ID: abc123
Revises: xyz789
Create Date: 2024-01-15 10:30:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'caballos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('raza', sa.String(100)),
        sa.Column('edad', sa.Integer()),
        sa.Column('propietario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clientes.id', ondelete='SET NULL')),
        sa.Column('activo', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'))
    )
    
    op.create_index('idx_caballos_propietario', 'caballos', ['propietario_id'])
    op.create_index('idx_caballos_activo', 'caballos', ['activo'], postgresql_where=sa.text('activo = true'))

def downgrade():
    op.drop_index('idx_caballos_activo')
    op.drop_index('idx_caballos_propietario')
    op.drop_table('caballos')
```

## Checklist diseño de BD

- [ ] IDs son UUID v4
- [ ] Timestamps en todas las tablas
- [ ] Campo `activo` para soft deletes
- [ ] Foreign keys con ON DELETE/UPDATE
- [ ] Índices en columnas frecuentes
- [ ] ENUMs para valores fijos
- [ ] JSONB para datos flexibles
- [ ] Constraints de unicidad donde corresponda
- [ ] Trigger para updated_at
- [ ] Migración Alembic creada
```

### 📄 docs/skills/auth-flow.md

```markdown
# Skill: Implementar flujo de autenticación completo

## Componentes del sistema de auth

1. **Hashing de passwords** (passlib)
2. **JWT tokens** (access + refresh)
3. **Dependencies FastAPI** (get_current_user)
4. **Permisos por rol**
5. **Frontend: interceptor Axios**
6. **Almacenamiento de tokens**

## Backend - Implementación completa

### 1. Configuración (core/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. Utilidades de seguridad (core/security.py)

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que el password coincida con el hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera hash del password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Crea JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decodifica y valida un JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 3. Dependencies (core/deps.py)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario, RolEnum
from uuid import UUID

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Obtiene el usuario actual desde el JWT."""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    user = db.query(Usuario).filter(Usuario.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return user

async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """Verifica que el usuario esté activo."""
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user

async def require_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:

### Tablas Principales

#### usuarios
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- rol: ENUM ('super_admin', 'admin', 'empleado', 'cliente')
- activo: BOOLEAN DEFAULT TRUE
- ultimo_acceso: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### empleados
```sql
- id: UUID (PK)
- usuario_id: UUID (FK usuarios) UNIQUE
- nombre: VARCHAR(100) NOT NULL
- apellido: VARCHAR(100) NOT NULL
- dni: VARCHAR(20) UNIQUE
- fecha_nacimiento: DATE
- telefono: VARCHAR(20)
- direccion: TEXT
- funcion: ENUM ('veterinario', 'instructor', 'cuidador', 'admin', 'mantenimiento')
- fecha_ingreso: DATE
- salario: DECIMAL(10,2)
- activo: BOOLEAN DEFAULT TRUE
- foto_perfil: VARCHAR(500)
- contacto_emergencia: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### clientes
```sql
- id: UUID (PK)
- usuario_id: UUID (FK usuarios) UNIQUE NULL
- nombre: VARCHAR(100) NOT NULL
- apellido: VARCHAR(100) NOT NULL
- dni: VARCHAR(20) UNIQUE
- fecha_nacimiento: DATE
- telefono: VARCHAR(20)
- email: VARCHAR(255)
- direccion: TEXT
- tipo_cliente: ENUM ('socio_pleno', 'pensionista', 'alumno')
- estado_cuenta: ENUM ('al_dia', 'debe', 'moroso')
- saldo: DECIMAL(10,2) DEFAULT 0
- fecha_alta: DATE
- activo: BOOLEAN DEFAULT TRUE
- notas: TEXT
- contacto_emergencia: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### caballos
```sql
- id: UUID (PK)
- nombre: VARCHAR(100) NOT NULL
- raza: VARCHAR(100)
- edad: INTEGER
- fecha_nacimiento: DATE
- sexo: ENUM ('macho', 'hembra', 'castrado')
- color: VARCHAR(50)
- altura: DECIMAL(4,2)  -- en metros
- peso: DECIMAL(6,2)  -- en kg
- propietario_id: UUID (FK clientes) NULL
- box_asignado: VARCHAR(50)
- estado: ENUM ('activo', 'retirado', 'en_tratamiento', 'fallecido')
- caracteristicas: TEXT
- foto_principal: VARCHAR(500)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### fotos_caballo
```sql
- id: UUID (PK)
- caballo_id: UUID (FK caballos)
- url: VARCHAR(500) NOT NULL
- descripcion: VARCHAR(255)
- created_at: TIMESTAMP
```

#### historial_medico
```sql
- id: UUID (PK)
- caballo_id: UUID (FK caballos)
- tipo: ENUM ('vacuna', 'desparasitacion', 'tratamiento', 'cirugia', 'revision', 'otro')
- fecha: DATE NOT NULL
- veterinario: VARCHAR(255)
- descripcion: TEXT
- medicamento: VARCHAR(255)
- dosis: VARCHAR(100)
- proxima_aplicacion: DATE NULL
- costo: DECIMAL(10,2)
- documentos: JSONB  -- URLs de documentos adjuntos
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### plan_alimentacion
```sql
- id: UUID (PK)
- caballo_id: UUID (FK caballos) UNIQUE
- tipo_alimento: VARCHAR(255)
- cantidad_diaria: VARCHAR(100)
- horarios: JSONB  -- ['07:00', '14:00', '20:00']
- suplementos: TEXT
- restricciones: TEXT
- updated_by: UUID (FK usuarios)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### eventos
```sql
- id: UUID (PK)
- titulo: VARCHAR(255) NOT NULL
- tipo: ENUM ('clase_grupal', 'clase_privada', 'competencia', 'salida', 'evento_social', 'otro')
- descripcion: TEXT
- fecha_inicio: TIMESTAMP NOT NULL
- fecha_fin: TIMESTAMP NOT NULL
- instructor_id: UUID (FK empleados) NULL
- capacidad_maxima: INTEGER
- costo: DECIMAL(10,2) DEFAULT 0
- estado: ENUM ('programado', 'en_curso', 'finalizado', 'cancelado')
- ubicacion: VARCHAR(255)
- es_recurrente: BOOLEAN DEFAULT FALSE
- recurrencia_config: JSONB NULL  -- días, frecuencia, etc
- created_by: UUID (FK usuarios)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### inscripciones_evento
```sql
- id: UUID (PK)
- evento_id: UUID (FK eventos)
- cliente_id: UUID (FK clientes)
- caballo_id: UUID (FK caballos) NULL
- estado: ENUM ('confirmado', 'en_espera', 'cancelado')
- asistio: BOOLEAN NULL
- comentarios: TEXT
- created_at: TIMESTAMP
```

#### pagos
```sql
- id: UUID (PK)
- cliente_id: UUID (FK clientes)
- concepto: VARCHAR(255) NOT NULL
- tipo: ENUM ('pension', 'clase', 'evento', 'servicio_extra', 'otro')
- monto: DECIMAL(10,2) NOT NULL
- metodo_pago: ENUM ('efectivo', 'transferencia', 'tarjeta', 'cheque')
- estado: ENUM ('pendiente', 'pagado', 'vencido', 'cancelado')
- fecha_vencimiento: DATE
- fecha_pago: DATE NULL
- referencia: VARCHAR(100)  -- número de transferencia, etc
- notas: TEXT
- recibo_url: VARCHAR(500) NULL
- created_by: UUID (FK usuarios)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### alertas
```sql
- id: UUID (PK)
- usuario_id: UUID (FK usuarios) NULL  -- NULL = para todos los admins
- tipo: ENUM ('vacuna', 'herraje', 'pago', 'evento', 'cumpleaños', 'contrato', 'stock', 'tarea', 'otro')
- prioridad: ENUM ('baja', 'media', 'alta', 'critica')
- titulo: VARCHAR(255) NOT NULL
- mensaje: TEXT NOT NULL
- leida: BOOLEAN DEFAULT FALSE
- fecha_evento: DATE NULL  -- fecha del evento que genera la alerta
- entidad_relacionada_tipo: VARCHAR(50) NULL  -- 'caballo', 'cliente', 'pago', etc
- entidad_relacionada_id: UUID NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### configuracion
```sql
- id: UUID (PK)
- clave: VARCHAR(100) UNIQUE NOT NULL
- valor: JSONB NOT NULL
- descripcion: TEXT
- updated_by: UUID (FK usuarios)
- updated_at: TIMESTAMP
```

#### boxes
```sql
- id: UUID (PK)
- nombre: VARCHAR(50) NOT NULL
- capacidad: INTEGER DEFAULT 1
- estado: ENUM ('disponible', 'ocupado', 'mantenimiento')
- caracteristicas: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 🤖 Archivos para Claude Code

### 📄 docs/agent.md

Este archivo contiene las instrucciones principales para Claude Code sobre cómo trabajar en el proyecto.

```markdown
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

**Al crear nuevos módulos:**

1. **Backend** - Siempre crear en este orden:
   ```
   1. models/{modulo}.py        # SQLAlchemy model
   2. schemas/{modulo}.py       # Pydantic schemas
   3. services/{modulo}_service.py  # Lógica de negocio
   4. api/v1/endpoints/{modulo}.py  # FastAPI router
   5. tests/api/test_{modulo}.py    # Tests
   ```

2. **Frontend** - Estructura por feature:
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

### 4. Patrones Requeridos

**CRUD Endpoints (FastAPI):**
```python
@router.get("/", response_model=List[CaballoSchema])
async def listar_caballos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    return caballo_service.obtener_todos(db, skip=skip, limit=limit)

@router.post("/", response_model=CaballoSchema, status_code=status.HTTP_201_CREATED)
async def crear_caballo(
    caballo: CaballoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    return caballo_service.crear(db, caballo, current_user.id)

@router.get("/{id}", response_model=CaballoSchema)
async def obtener_caballo(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    caballo = caballo_service.obtener_por_id(db, id)
    if not caballo:
        raise HTTPException(status_code=404, detail="Caballo no encontrado")
    return caballo

@router.put("/{id}", response_model=CaballoSchema)
async def actualizar_caballo(
    id: UUID,
    caballo_update: CaballoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    return caballo_service.actualizar(db, id, caballo_update)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_caballo(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    caballo_service.eliminar(db, id)  # Soft delete
    return None
```

**React Component (TypeScript):**
```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caballoService } from '@/services/caballoService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function CaballoList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: caballos, isLoading, error } = useQuery({
    queryKey: ['caballos'],
    queryFn: caballoService.getAll
  });
  
  const deleteMutation = useMutation({
    mutationFn: caballoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: "Éxito",
        description: "Caballo eliminado correctamente"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {/* Render logic */}
    </div>
  );
}
```

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

### 7. Testing

**Backend - Mínimo requerido:**
```python
# tests/api/test_caballos.py
def test_crear_caballo(client, auth_headers, db):
    response = client.post(
        "/api/v1/caballos/",
        json={"nombre": "Thunder", "raza": "Árabe", "edad": 5},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["nombre"] == "Thunder"

def test_listar_caballos_requiere_auth(client):
    response = client.get("/api/v1/caballos/")
    assert response.status_code == 401
```

---

## Casos de Uso Frecuentes

### Crear un nuevo módulo completo

**Ejemplo: Módulo de "Inventario de Alimentos"**

1. **Modelo (backend/app/models/inventario.py):**
```python
from sqlalchemy import Column, String, Integer, Decimal, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import uuid

class Inventario(Base):
    __tablename__ = "inventario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    cantidad = Column(Decimal(10, 2), nullable=False)
    unidad = Column(String(20), nullable=False)
    stock_minimo = Column(Decimal(10, 2), default=0)
    precio_unitario = Column(Decimal(10, 2))
    proveedor = Column(String(255))
    ubicacion = Column(String(100))
    created_at = Column(DateTime, server_default="now()")
    updated_at = Column(DateTime, server_default="now()", onupdate="now()")
```

2. **Schemas (backend/app/schemas/inventario.py):**
```python
from pydantic import BaseModel, UUID4
from decimal import Decimal
from datetime import datetime

class InventarioBase(BaseModel):
    nombre: str
    tipo: str
    cantidad: Decimal
    unidad: str
    stock_minimo: Decimal = 0
    precio_unitario: Decimal | None = None
    proveedor: str | None = None
    ubicacion: str | None = None

class InventarioCreate(InventarioBase):
    pass

class InventarioUpdate(BaseModel):
    nombre: str | None = None
    cantidad: Decimal | None = None
    stock_minimo: Decimal | None = None
    precio_unitario: Decimal | None = None

class InventarioSchema(InventarioBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

3. **Service (backend/app/services/inventario_service.py):**
```python
from sqlalchemy.orm import Session
from app.models.inventario import Inventario
from app.schemas.inventario import InventarioCreate, InventarioUpdate
from uuid import UUID

def obtener_todos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Inventario).offset(skip).limit(limit).all()

def obtener_por_id(db: Session, id: UUID):
    return db.query(Inventario).filter(Inventario.id == id).first()

def crear(db: Session, inventario: InventarioCreate):
    db_inventario = Inventario(**inventario.model_dump())
    db.add(db_inventario)
    db.commit()
    db.refresh(db_inventario)
    return db_inventario

def actualizar(db: Session, id: UUID, inventario_update: InventarioUpdate):
    db_inventario = obtener_por_id(db, id)
    if not db_inventario:
        return None
    
    update_data = inventario_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_inventario, field, value)
    
    db.commit()
    db.refresh(db_inventario)
    return db_inventario

def eliminar(db: Session, id: UUID):
    db_inventario = obtener_por_id(db, id)
    if db_inventario:
        db.delete(db_inventario)
        db.commit()
    return db_inventario

def obtener_stock_bajo(db: Session):
    return db.query(Inventario).filter(
        Inventario.cantidad <= Inventario.stock_minimo
    ).all()
```

4. **Endpoint (backend/app/api/v1/endpoints/inventario.py):**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.inventario import InventarioSchema, InventarioCreate, InventarioUpdate
from app.services import inventario_service

router = APIRouter()

@router.get("/", response_model=List[InventarioSchema])
async def listar_inventario(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    return inventario_service.obtener_todos(db, skip=skip, limit=limit)

@router.get("/stock-bajo", response_model=List[InventarioSchema])
async def obtener_stock_bajo(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    return inventario_service.obtener_stock_bajo(db)

@router.post("/", response_model=InventarioSchema, status_code=status.HTTP_201_CREATED)
async def crear_item_inventario(
    inventario: InventarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    return inventario_service.crear(db, inventario)

@router.get("/{id}", response_model=InventarioSchema)
async def obtener_item_inventario(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    item = inventario_service.obtener_por_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item

@router.put("/{id}", response_model=InventarioSchema)
async def actualizar_item_inventario(
    id: UUID,
    inventario_update: InventarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    item = inventario_service.actualizar(db, id, inventario_update)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_item_inventario(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    item = inventario_service.eliminar(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return None
```

5. **Frontend Service (frontend/src/services/inventarioService.ts):**
```typescript
import api from './api';
import { Inventario, InventarioCreate, InventarioUpdate } from '@/types/inventario';

export const inventarioService = {
  getAll: async (): Promise<Inventario[]> => {
    const { data } = await api.get('/inventario/');
    return data;
  },

  getById: async (id: string): Promise<Inventario> => {
    const { data } = await api.get(`/inventario/${id}`);
    return data;
  },

  getStockBajo: async (): Promise<Inventario[]> => {
    const { data } = await api.get('/inventario/stock-bajo');
    return data;
  },

  create: async (inventario: InventarioCreate): Promise<Inventario> => {
    const { data } = await api.post('/inventario/', inventario);
    return data;
  },

  update: async (id: string, inventario: InventarioUpdate): Promise<Inventario> => {
    const { data } = await api.put(`/inventario/${id}`, inventario);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventario/${id}`);
  }
};
```

---

## Tareas Celery (Alertas Automáticas)

**Ejemplo: Alerta de stock bajo**

```python
# backend/app/tasks/inventario.py
from celery import shared_task
from app.db.session import SessionLocal
from app.services import inventario_service, alerta_service
from app.models.usuario import Usuario, RolEnum

@shared_task
def verificar_stock_bajo():
    """
    Tarea que se ejecuta diariamente para verificar stock bajo
    y crear alertas para los administradores.
    """
    db = SessionLocal()
    try:
        items_bajo_stock = inventario_service.obtener_stock_bajo(db)
        
        if not items_bajo_stock:
            return "No hay items con stock bajo"
        
        # Obtener todos los administradores
        admins = db.query(Usuario).filter(
            Usuario.rol.in_([RolEnum.SUPER_ADMIN, RolEnum.ADMIN])
        ).all()
        
        for item in items_bajo_stock:
            for admin in admins:
                alerta_service.crear(
                    db=db,
                    usuario_id=admin.id,
                    tipo='stock',
                    prioridad='alta',
                    titulo=f'Stock bajo: {item.nombre}',
                    mensaje=f'El stock de {item.nombre} está por debajo del mínimo ({item.cantidad} {item.unidad})',
                    entidad_relacionada_tipo='inventario',
                    entidad_relacionada_id=item.id
                )
        
        db.commit()
        return f"Alertas creadas para {len(items_bajo_stock)} items"
        
    finally:
        db.close()

# Configurar en celery_app.py para que se ejecute diariamente
from celery.schedules import crontab

app.conf.beat_schedule = {
    'verificar-stock-bajo-diario': {
        'task': 'app.tasks.inventario.verificar_stock_bajo',
        'schedule': crontab(hour=8, minute=0),  # Todos los días a las 8 AM
    },
}
```

---

## Migraciones Alembic

**Crear una nueva migración:**
```bash
# Desde el directorio backend/
alembic revision --autogenerate -m "descripción del cambio"
alembic upgrade head
```

**Ejemplo de migración manual:**
```python
# alembic/versions/xxxx_agregar_campo_notas_caballo.py
def upgrade():
    op.add_column('caballos', sa.Column('notas_especiales', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('caballos', 'notas_especiales')
```

---

## Permisos y Autorización

**Decoradores de permisos:**

```python
# backend/app/core/deps.py
from fastapi import Depends, HTTPException, status
from app.models.usuario import Usuario, RolEnum

async def require_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user

async def require_super_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    if current_user.rol != RolEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super administradores pueden realizar esta acción"
        )
    return current_user

async def require_empleado_or_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    if current_user.rol == RolEnum.CLIENTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso solo para empleados o administradores"
        )
    return current_user
```

**Uso en endpoints:**
```python
@router.delete("/{id}")
async def eliminar_caballo(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)  # Solo admins
):
    ...
```

---

## Frontend - Componentes Reutilizables

**Tabla genérica con TanStack Table:**

```typescript
// components/shared/DataTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender
} from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginación */}
      <div>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </button>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

---

## Recordatorios Finales

### ✅ Siempre hacer:
- Validar inputs con Pydantic/Zod
- Manejar errores apropiadamente
- Logs en acciones críticas
- Tests para endpoints nuevos
- Type safety en TypeScript
- Documentar funciones complejas
- Commits descriptivos

### ❌ Nunca hacer:
- Hardcodear credenciales
- Usar `any` en TypeScript
- Queries directas en endpoints (usar services)
- Eliminar datos sin soft delete
- Exponer errores del servidor al cliente
- Commits con código comentado

---

## Estructura de Commits

```
feat(caballos): agregar endpoint para historial médico
fix(auth): corregir validación de refresh token
refactor(pagos): extraer lógica de cálculo de mora a service
docs(api): actualizar documentación de endpoints de eventos
test(clientes): agregar tests para CRUD completo
chore(deps): actualizar FastAPI a 0.104.1
```

---

## Comandos Útiles

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d
docker-compose logs -f backend
docker-compose exec backend alembic upgrade head
docker-compose down

# Tests
pytest
pytest tests/api/test_caballos.py -v
pytest --cov=app tests/
```

---

## Próximos Pasos

Cuando empieces a trabajar:

1. **Setup inicial:**
   - Crear estructura de carpetas
   - Configurar Docker Compose
   - Configurar variables de entorno
   - Inicializar base de datos

2. **Módulo Auth (prioridad 1):**
   - Models: Usuario
   - Auth endpoints
   - JWT implementation
   - Roles y permisos

3. **Módulos core (prioridad 2):**
   - Caballos
   - Clientes
   - Empleados

4. **Módulos secundarios:**
   - Eventos
   - Pagos
   - Alertas
   - Reportes

---

**¿Tienes dudas sobre algún patrón o necesitas que implemente algo específico?** Pregunta y te daré el código completo.