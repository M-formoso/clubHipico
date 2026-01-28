from pydantic import BaseModel, Field, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.alerta import TipoAlertaEnum, PrioridadAlertaEnum, FrecuenciaAlertaEnum


# ========== ALERTAS ==========

class AlertaBase(BaseModel):
    """Schema base de Alerta"""
    tipo: TipoAlertaEnum
    prioridad: PrioridadAlertaEnum = PrioridadAlertaEnum.MEDIA
    titulo: str = Field(..., min_length=1, max_length=255)
    mensaje: str


class AlertaCreate(AlertaBase):
    """Schema para crear Alerta"""
    tipo_alerta_id: Optional[UUID4] = None
    usuario_id: Optional[UUID4] = None
    fecha_evento: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    entidad_relacionada_tipo: Optional[str] = Field(None, max_length=50)
    entidad_relacionada_id: Optional[UUID4] = None
    acciones_disponibles: Optional[List[Dict[str, Any]]] = None
    datos_adicionales: Optional[Dict[str, Any]] = None


class AlertaUpdate(BaseModel):
    """Schema para actualizar Alerta"""
    leida: Optional[bool] = None
    fecha_vencimiento: Optional[datetime] = None


class AlertaSchema(AlertaBase):
    """Schema de respuesta de Alerta"""
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
    """Schema base de TipoAlertaConfig"""
    nombre: str = Field(..., max_length=255)
    tipo: TipoAlertaEnum
    descripcion: Optional[str] = None
    prioridad_default: PrioridadAlertaEnum = PrioridadAlertaEnum.MEDIA
    frecuencia: FrecuenciaAlertaEnum = FrecuenciaAlertaEnum.UNICA


class TipoAlertaConfigCreate(TipoAlertaConfigBase):
    """Schema para crear TipoAlertaConfig"""
    dias_anticipacion: Optional[int] = None
    intervalo_dias: Optional[int] = None
    hora_envio: Optional[str] = None
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
    """Schema para actualizar TipoAlertaConfig"""
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
    """Schema de respuesta de TipoAlertaConfig"""
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
    """Estadísticas de alertas"""
    total_alertas: int
    alertas_no_leidas: int
    alertas_por_prioridad: Dict[str, int]
    alertas_por_tipo: Dict[str, int]
    alertas_vencidas: int
    alertas_hoy: int
    alertas_esta_semana: int


# ========== CONFIGURACIÓN USUARIO ==========

class ConfiguracionAlertasBase(BaseModel):
    """Schema base de ConfiguracionAlertasUsuario"""
    alertas_sistema: bool = True
    alertas_email: bool = False
    alertas_push: bool = False
    tipos_alertas: Optional[Dict[str, bool]] = None
    horario_inicio: Optional[str] = None
    horario_fin: Optional[str] = None
    dias_semana: Optional[List[int]] = None
    agrupar_alertas: bool = False
    intervalo_agrupacion: Optional[int] = None


class ConfiguracionAlertasSchema(ConfiguracionAlertasBase):
    """Schema de respuesta de ConfiguracionAlertasUsuario"""
    id: UUID4
    usuario_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
