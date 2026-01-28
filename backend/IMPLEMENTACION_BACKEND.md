# Guía de Implementación Backend - Usuarios y Alertas

## Estado Actual

### ✅ COMPLETADO

**Modelos (SQLAlchemy)**
- ✅ `app/models/usuario.py` - Actualizado con campo `permisos` JSONB
- ✅ `app/models/alerta.py` - Actualizado con 3 modelos:
  - `Alerta` - Alertas individuales
  - `TipoAlertaConfig` - Configuración de tipos de alertas
  - `ConfiguracionAlertasUsuario` - Preferencias de usuario

### 🔨 PENDIENTE DE IMPLEMENTAR

## 1. Schemas Pydantic

### Crear/Actualizar `app/schemas/usuario.py`

Agregar a los schemas existentes:

```python
from typing import Dict, Any

class PermisoModulo(BaseModel):
    modulo: str
    ver: bool = False
    crear: bool = False
    editar: bool = False
    eliminar: bool = False

class PermisosUsuario(BaseModel):
    dashboard: PermisoModulo
    caballos: PermisoModulo
    clientes: PermisoModulo
    eventos: PermisoModulo
    usuarios: PermisoModulo
    pagos: PermisoModulo
    reportes: PermisoModulo
    alertas: PermisoModulo
    configuracion: PermisoModulo

# Actualizar UsuarioSchema
class UsuarioSchema(UsuarioBase):
    id: UUID4
    rol: RolEnum
    activo: bool
    permisos: Optional[Dict[str, Any]] = None  # JSONB
    ultimo_acceso: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Actualizar UsuarioCreate
class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6)
    rol: RolEnum = RolEnum.CLIENTE
    permisos: Optional[Dict[str, Any]] = None

# Actualizar UsuarioUpdate
class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    rol: Optional[RolEnum] = None
    activo: Optional[bool] = None
    permisos: Optional[Dict[str, Any]] = None
```

### Crear `app/schemas/alerta.py`

```python
from pydantic import BaseModel, UUID4, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.models.alerta import (
    TipoAlertaEnum,
    PrioridadAlertaEnum,
    FrecuenciaAlertaEnum
)

# ========== ALERTAS ==========

class AlertaBase(BaseModel):
    tipo: TipoAlertaEnum
    prioridad: PrioridadAlertaEnum = PrioridadAlertaEnum.MEDIA
    titulo: str = Field(..., max_length=255)
    mensaje: str

class AlertaCreate(AlertaBase):
    tipo_alerta_id: Optional[UUID4] = None
    usuario_id: Optional[UUID4] = None
    fecha_evento: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    entidad_relacionada_tipo: Optional[str] = None
    entidad_relacionada_id: Optional[UUID4] = None
    acciones_disponibles: Optional[List[Dict[str, Any]]] = None
    datos_adicionales: Optional[Dict[str, Any]] = None

class AlertaUpdate(BaseModel):
    leida: Optional[bool] = None
    fecha_vencimiento: Optional[datetime] = None

class AlertaSchema(AlertaBase):
    id: UUID4
    tipo_alerta_id: Optional[UUID4] = None
    usuario_id: Optional[UUID4] = None
    leida: bool
    fecha_evento: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    entidad_relacionada_tipo: Optional[str] = None
    entidad_relacionada_id: Optional[UUID4] = None
    acciones_disponibles: Optional[List[Dict[str, Any]]] = None
    datos_adicionales: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ========== TIPOS DE ALERTA ==========

class TipoAlertaConfigBase(BaseModel):
    nombre: str = Field(..., max_length=255)
    tipo: TipoAlertaEnum
    descripcion: Optional[str] = None
    prioridad_default: PrioridadAlertaEnum = PrioridadAlertaEnum.MEDIA
    frecuencia: FrecuenciaAlertaEnum = FrecuenciaAlertaEnum.UNICA

class TipoAlertaConfigCreate(TipoAlertaConfigBase):
    dias_anticipacion: Optional[int] = None
    intervalo_dias: Optional[int] = None
    hora_envio: Optional[str] = None  # HH:MM
    enviar_a_roles: Optional[List[str]] = None
    enviar_a_usuarios: Optional[List[UUID4]] = None
    enviar_a_responsables: bool = False
    canal_sistema: bool = True
    canal_email: bool = False
    canal_push: bool = False
    plantilla_titulo: Optional[str] = None
    plantilla_mensaje: Optional[str] = None
    condiciones: Optional[List[Dict[str, Any]]] = None

class TipoAlertaConfigUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None
    prioridad_default: Optional[PrioridadAlertaEnum] = None
    frecuencia: Optional[FrecuenciaAlertaEnum] = None
    dias_anticipacion: Optional[int] = None
    intervalo_dias: Optional[int] = None
    hora_envio: Optional[str] = None
    enviar_a_roles: Optional[List[str]] = None
    enviar_a_usuarios: Optional[List[UUID4]] = None
    enviar_a_responsables: Optional[bool] = None
    canal_sistema: Optional[bool] = None
    canal_email: Optional[bool] = None
    canal_push: Optional[bool] = None
    plantilla_titulo: Optional[str] = None
    plantilla_mensaje: Optional[str] = None
    condiciones: Optional[List[Dict[str, Any]]] = None

class TipoAlertaConfigSchema(TipoAlertaConfigBase):
    id: UUID4
    activo: bool
    dias_anticipacion: Optional[int] = None
    intervalo_dias: Optional[int] = None
    hora_envio: Optional[str] = None
    enviar_a_roles: Optional[List[str]] = None
    enviar_a_usuarios: Optional[List[UUID4]] = None
    enviar_a_responsables: bool
    canal_sistema: bool
    canal_email: bool
    canal_push: bool
    plantilla_titulo: Optional[str] = None
    plantilla_mensaje: Optional[str] = None
    condiciones: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ========== ESTADÍSTICAS ==========

class EstadisticasAlertas(BaseModel):
    total_alertas: int
    alertas_no_leidas: int
    alertas_por_prioridad: Dict[str, int]
    alertas_por_tipo: Dict[str, int]
    alertas_vencidas: int
    alertas_hoy: int
    alertas_esta_semana: int
```

## 2. Servicios (Lógica de Negocio)

### Crear `app/services/usuario_service.py`

```python
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash
from typing import Optional, List
from uuid import UUID

class UsuarioService:

    @staticmethod
    def get_usuarios(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        activo_solo: bool = False,
        rol: Optional[str] = None,
        funcion: Optional[str] = None
    ) -> List[Usuario]:
        query = db.query(Usuario)

        if activo_solo:
            query = query.filter(Usuario.activo == True)
        if rol:
            query = query.filter(Usuario.rol == rol)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_usuario_by_id(db: Session, usuario_id: UUID) -> Optional[Usuario]:
        return db.query(Usuario).filter(Usuario.id == usuario_id).first()

    @staticmethod
    def get_usuario_by_email(db: Session, email: str) -> Optional[Usuario]:
        return db.query(Usuario).filter(Usuario.email == email).first()

    @staticmethod
    def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
        password_hash = get_password_hash(usuario.password)

        db_usuario = Usuario(
            email=usuario.email,
            password_hash=password_hash,
            rol=usuario.rol,
            permisos=usuario.permisos
        )

        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario

    @staticmethod
    def update_usuario(
        db: Session,
        usuario_id: UUID,
        usuario_update: UsuarioUpdate
    ) -> Optional[Usuario]:
        db_usuario = UsuarioService.get_usuario_by_id(db, usuario_id)
        if not db_usuario:
            return None

        update_data = usuario_update.dict(exclude_unset=True)

        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_usuario, field, value)

        db.commit()
        db.refresh(db_usuario)
        return db_usuario

    @staticmethod
    def delete_usuario(db: Session, usuario_id: UUID) -> bool:
        db_usuario = UsuarioService.get_usuario_by_id(db, usuario_id)
        if not db_usuario:
            return False

        db.delete(db_usuario)
        db.commit()
        return True

    @staticmethod
    def update_permisos(db: Session, usuario_id: UUID, permisos: dict) -> Optional[Usuario]:
        db_usuario = UsuarioService.get_usuario_by_id(db, usuario_id)
        if not db_usuario:
            return None

        db_usuario.permisos = permisos
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
```

### Crear `app/services/alerta_service.py`

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.alerta import Alerta, TipoAlertaConfig
from app.schemas.alerta import AlertaCreate, TipoAlertaConfigCreate, TipoAlertaConfigUpdate
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

class AlertaService:

    # ========== ALERTAS ==========

    @staticmethod
    def get_alertas(
        db: Session,
        usuario_id: Optional[UUID] = None,
        tipo: Optional[str] = None,
        prioridad: Optional[str] = None,
        leida: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Alerta]:
        query = db.query(Alerta)

        if usuario_id:
            query = query.filter(Alerta.usuario_id == usuario_id)
        if tipo:
            query = query.filter(Alerta.tipo == tipo)
        if prioridad:
            query = query.filter(Alerta.prioridad == prioridad)
        if leida is not None:
            query = query.filter(Alerta.leida == leida)

        return query.order_by(Alerta.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_alertas_no_leidas(db: Session, usuario_id: UUID) -> List[Alerta]:
        return db.query(Alerta).filter(
            Alerta.usuario_id == usuario_id,
            Alerta.leida == False
        ).order_by(Alerta.created_at.desc()).all()

    @staticmethod
    def get_alerta_by_id(db: Session, alerta_id: UUID) -> Optional[Alerta]:
        return db.query(Alerta).filter(Alerta.id == alerta_id).first()

    @staticmethod
    def create_alerta(db: Session, alerta: AlertaCreate) -> Alerta:
        db_alerta = Alerta(**alerta.dict())
        db.add(db_alerta)
        db.commit()
        db.refresh(db_alerta)
        return db_alerta

    @staticmethod
    def marcar_leida(db: Session, alerta_id: UUID) -> Optional[Alerta]:
        db_alerta = AlertaService.get_alerta_by_id(db, alerta_id)
        if not db_alerta:
            return None

        db_alerta.leida = True
        db.commit()
        db.refresh(db_alerta)
        return db_alerta

    @staticmethod
    def marcar_todas_leidas(db: Session, usuario_id: UUID) -> int:
        count = db.query(Alerta).filter(
            Alerta.usuario_id == usuario_id,
            Alerta.leida == False
        ).update({"leida": True})
        db.commit()
        return count

    @staticmethod
    def delete_alerta(db: Session, alerta_id: UUID) -> bool:
        db_alerta = AlertaService.get_alerta_by_id(db, alerta_id)
        if not db_alerta:
            return False

        db.delete(db_alerta)
        db.commit()
        return True

    @staticmethod
    def posponer_alerta(db: Session, alerta_id: UUID, dias: int) -> Optional[Alerta]:
        db_alerta = AlertaService.get_alerta_by_id(db, alerta_id)
        if not db_alerta:
            return None

        if db_alerta.fecha_vencimiento:
            db_alerta.fecha_vencimiento += timedelta(days=dias)
        else:
            db_alerta.fecha_vencimiento = datetime.utcnow() + timedelta(days=dias)

        db.commit()
        db.refresh(db_alerta)
        return db_alerta

    @staticmethod
    def get_estadisticas(db: Session, usuario_id: UUID) -> Dict[str, Any]:
        alertas = db.query(Alerta).filter(Alerta.usuario_id == usuario_id).all()

        hoy = datetime.utcnow().date()
        inicio_semana = hoy - timedelta(days=hoy.weekday())

        return {
            "total_alertas": len(alertas),
            "alertas_no_leidas": sum(1 for a in alertas if not a.leida),
            "alertas_por_prioridad": {
                "baja": sum(1 for a in alertas if a.prioridad.value == "baja"),
                "media": sum(1 for a in alertas if a.prioridad.value == "media"),
                "alta": sum(1 for a in alertas if a.prioridad.value == "alta"),
                "critica": sum(1 for a in alertas if a.prioridad.value == "critica"),
            },
            "alertas_por_tipo": {
                tipo.value: sum(1 for a in alertas if a.tipo == tipo)
                for tipo in set(a.tipo for a in alertas)
            },
            "alertas_vencidas": sum(1 for a in alertas if a.fecha_vencimiento and a.fecha_vencimiento.date() < hoy),
            "alertas_hoy": sum(1 for a in alertas if a.created_at.date() == hoy),
            "alertas_esta_semana": sum(1 for a in alertas if a.created_at.date() >= inicio_semana),
        }

    # ========== TIPOS DE ALERTA ==========

    @staticmethod
    def get_tipos_alerta(db: Session) -> List[TipoAlertaConfig]:
        return db.query(TipoAlertaConfig).all()

    @staticmethod
    def get_tipo_alerta_by_id(db: Session, tipo_id: UUID) -> Optional[TipoAlertaConfig]:
        return db.query(TipoAlertaConfig).filter(TipoAlertaConfig.id == tipo_id).first()

    @staticmethod
    def create_tipo_alerta(db: Session, tipo: TipoAlertaConfigCreate) -> TipoAlertaConfig:
        db_tipo = TipoAlertaConfig(**tipo.dict())
        db.add(db_tipo)
        db.commit()
        db.refresh(db_tipo)
        return db_tipo

    @staticmethod
    def update_tipo_alerta(
        db: Session,
        tipo_id: UUID,
        tipo_update: TipoAlertaConfigUpdate
    ) -> Optional[TipoAlertaConfig]:
        db_tipo = AlertaService.get_tipo_alerta_by_id(db, tipo_id)
        if not db_tipo:
            return None

        update_data = tipo_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tipo, field, value)

        db.commit()
        db.refresh(db_tipo)
        return db_tipo

    @staticmethod
    def delete_tipo_alerta(db: Session, tipo_id: UUID) -> bool:
        db_tipo = AlertaService.get_tipo_alerta_by_id(db, tipo_id)
        if not db_tipo:
            return False

        db.delete(db_tipo)
        db.commit()
        return True

    @staticmethod
    def toggle_tipo_alerta(db: Session, tipo_id: UUID, activo: bool) -> Optional[TipoAlertaConfig]:
        db_tipo = AlertaService.get_tipo_alerta_by_id(db, tipo_id)
        if not db_tipo:
            return None

        db_tipo.activo = activo
        db.commit()
        db.refresh(db_tipo)
        return db_tipo
```

## 3. Endpoints API

### Crear `app/api/v1/endpoints/usuarios.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api import deps
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioSchema
from app.services.usuario_service import UsuarioService
from app.models.usuario import Usuario

router = APIRouter()

@router.get("/", response_model=List[UsuarioSchema])
def get_usuarios(
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False,
    rol: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener lista de usuarios"""
    usuarios = UsuarioService.get_usuarios(
        db, skip=skip, limit=limit, activo_solo=activo_solo, rol=rol
    )
    return usuarios

@router.get("/{usuario_id}", response_model=UsuarioSchema)
def get_usuario(
    usuario_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener usuario por ID"""
    usuario = UsuarioService.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.post("/", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
def create_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Crear nuevo usuario"""
    # Verificar que email no exista
    if UsuarioService.get_usuario_by_email(db, usuario.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")

    return UsuarioService.create_usuario(db, usuario)

@router.put("/{usuario_id}", response_model=UsuarioSchema)
def update_usuario(
    usuario_id: UUID,
    usuario: UsuarioUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Actualizar usuario"""
    updated = UsuarioService.update_usuario(db, usuario_id, usuario)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(
    usuario_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Eliminar usuario"""
    if not UsuarioService.delete_usuario(db, usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.put("/{usuario_id}/permisos", response_model=UsuarioSchema)
def update_permisos(
    usuario_id: UUID,
    permisos: dict,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Actualizar permisos de usuario"""
    updated = UsuarioService.update_permisos(db, usuario_id, permisos)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated
```

### Crear `app/api/v1/endpoints/alertas.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api import deps
from app.schemas.alerta import (
    AlertaCreate, AlertaSchema, TipoAlertaConfigCreate,
    TipoAlertaConfigUpdate, TipoAlertaConfigSchema, EstadisticasAlertas
)
from app.services.alerta_service import AlertaService
from app.models.usuario import Usuario

router = APIRouter()

# ========== ALERTAS ==========

@router.get("/", response_model=List[AlertaSchema])
def get_mis_alertas(
    tipo: Optional[str] = None,
    prioridad: Optional[str] = None,
    leida: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener mis alertas"""
    return AlertaService.get_alertas(
        db, usuario_id=current_user.id, tipo=tipo,
        prioridad=prioridad, leida=leida, skip=skip, limit=limit
    )

@router.get("/no-leidas", response_model=List[AlertaSchema])
def get_alertas_no_leidas(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener alertas no leídas"""
    return AlertaService.get_alertas_no_leidas(db, current_user.id)

@router.get("/estadisticas", response_model=EstadisticasAlertas)
def get_estadisticas(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener estadísticas de alertas"""
    return AlertaService.get_estadisticas(db, current_user.id)

@router.get("/{alerta_id}", response_model=AlertaSchema)
def get_alerta(
    alerta_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener alerta por ID"""
    alerta = AlertaService.get_alerta_by_id(db, alerta_id)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta

@router.post("/", response_model=AlertaSchema, status_code=status.HTTP_201_CREATED)
def create_alerta(
    alerta: AlertaCreate,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Crear alerta manual"""
    return AlertaService.create_alerta(db, alerta)

@router.put("/{alerta_id}/leer", response_model=AlertaSchema)
def marcar_leida(
    alerta_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Marcar alerta como leída"""
    alerta = AlertaService.marcar_leida(db, alerta_id)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta

@router.put("/marcar-todas-leidas")
def marcar_todas_leidas(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Marcar todas las alertas como leídas"""
    count = AlertaService.marcar_todas_leidas(db, current_user.id)
    return {"message": f"{count} alertas marcadas como leídas"}

@router.put("/{alerta_id}/posponer", response_model=AlertaSchema)
def posponer_alerta(
    alerta_id: UUID,
    dias: int,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Posponer alerta"""
    alerta = AlertaService.posponer_alerta(db, alerta_id, dias)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta

@router.delete("/{alerta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alerta(
    alerta_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Eliminar alerta"""
    if not AlertaService.delete_alerta(db, alerta_id):
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

# ========== TIPOS DE ALERTA ==========

@router.get("/tipos", response_model=List[TipoAlertaConfigSchema])
def get_tipos_alerta(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_active_user)
):
    """Obtener todos los tipos de alerta"""
    return AlertaService.get_tipos_alerta(db)

@router.get("/tipos/{tipo_id}", response_model=TipoAlertaConfigSchema)
def get_tipo_alerta(
    tipo_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Obtener tipo de alerta por ID"""
    tipo = AlertaService.get_tipo_alerta_by_id(db, tipo_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de alerta no encontrado")
    return tipo

@router.post("/tipos", response_model=TipoAlertaConfigSchema, status_code=status.HTTP_201_CREATED)
def create_tipo_alerta(
    tipo: TipoAlertaConfigCreate,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Crear tipo de alerta"""
    return AlertaService.create_tipo_alerta(db, tipo)

@router.put("/tipos/{tipo_id}", response_model=TipoAlertaConfigSchema)
def update_tipo_alerta(
    tipo_id: UUID,
    tipo: TipoAlertaConfigUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Actualizar tipo de alerta"""
    updated = AlertaService.update_tipo_alerta(db, tipo_id, tipo)
    if not updated:
        raise HTTPException(status_code=404, detail="Tipo de alerta no encontrado")
    return updated

@router.delete("/tipos/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tipo_alerta(
    tipo_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Eliminar tipo de alerta"""
    if not AlertaService.delete_tipo_alerta(db, tipo_id):
        raise HTTPException(status_code=404, detail="Tipo de alerta no encontrado")

@router.put("/tipos/{tipo_id}/toggle", response_model=TipoAlertaConfigSchema)
def toggle_tipo_alerta(
    tipo_id: UUID,
    activo: bool,
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_admin_user)
):
    """Activar/desactivar tipo de alerta"""
    tipo = AlertaService.toggle_tipo_alerta(db, tipo_id, activo)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de alerta no encontrado")
    return tipo
```

## 4. Actualizar Rutas Principales

En `app/api/v1/api.py`, agregar:

```python
from app.api.v1.endpoints import usuarios, alertas

api_router.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
api_router.include_router(alertas.router, prefix="/alertas", tags=["alertas"])
```

## 5. Migración Alembic

Crear nueva migración:

```bash
cd backend
alembic revision --autogenerate -m "add usuarios permisos and alertas types"
```

Revisar la migración generada y luego:

```bash
alembic upgrade head
```

## 6. Dependencias (app/api/deps.py)

Asegurarse de tener:

```python
def get_current_admin_user(
    current_user: Usuario = Depends(get_current_active_user),
) -> Usuario:
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos suficientes"
        )
    return current_user
```

## Resumen de Archivos a Crear/Modificar

### Crear:
- ✅ `app/models/usuario.py` - YA ACTUALIZADO
- ✅ `app/models/alerta.py` - YA ACTUALIZADO
- `app/schemas/alerta.py` - NUEVO
- `app/services/usuario_service.py` - NUEVO
- `app/services/alerta_service.py` - NUEVO
- `app/api/v1/endpoints/usuarios.py` - NUEVO
- `app/api/v1/endpoints/alertas.py` - NUEVO

### Modificar:
- `app/schemas/usuario.py` - Agregar campo permisos
- `app/api/v1/api.py` - Incluir routers de usuarios y alertas
- `app/api/deps.py` - Agregar helper get_current_admin_user si no existe

### Ejecutar:
```bash
# 1. Crear migración
alembic revision --autogenerate -m "add permisos and alertas system"

# 2. Aplicar migración
alembic upgrade head

# 3. Reiniciar servidor
uvicorn app.main:app --reload
```

## Testing

Una vez implementado, probar:

```bash
# Usuarios
POST /api/v1/usuarios/
GET /api/v1/usuarios/
GET /api/v1/usuarios/{id}
PUT /api/v1/usuarios/{id}
PUT /api/v1/usuarios/{id}/permisos
DELETE /api/v1/usuarios/{id}

# Alertas
GET /api/v1/alertas/
GET /api/v1/alertas/no-leidas
GET /api/v1/alertas/estadisticas
GET /api/v1/alertas/{id}
POST /api/v1/alertas/
PUT /api/v1/alertas/{id}/leer
PUT /api/v1/alertas/marcar-todas-leidas
DELETE /api/v1/alertas/{id}

# Tipos de Alerta
GET /api/v1/alertas/tipos
POST /api/v1/alertas/tipos
PUT /api/v1/alertas/tipos/{id}
DELETE /api/v1/alertas/tipos/{id}
PUT /api/v1/alertas/tipos/{id}/toggle
```

## Notas Importantes

1. **Permisos JSONB**: PostgreSQL maneja JSONB eficientemente, ideal para permisos flexibles
2. **Validación**: Los schemas Pydantic validan automáticamente los datos
3. **Seguridad**: Todos los endpoints requieren autenticación
4. **Admin Only**: Crear/modificar usuarios y tipos de alerta solo para admins
5. **Soft Delete**: Considerar implementar borrado lógico en vez de físico
6. **Índices**: Agregar índices en campos consultados frecuentemente (usuario_id, leida, tipo)

## Próximos Pasos

1. Implementar generación automática de alertas con Celery
2. Integración con servicio de email (SMTP)
3. WebSockets para notificaciones en tiempo real
4. Sistema de plantillas más robusto con Jinja2
5. API de configuración de alertas por usuario
