from pydantic import BaseModel, Field, UUID4
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models.evento import TipoEventoEnum, EstadoEventoEnum, EstadoInscripcionEnum


class EventoBase(BaseModel):
    """Schema base de Evento"""
    titulo: str = Field(..., min_length=1, max_length=255)
    tipo: TipoEventoEnum
    descripcion: Optional[str] = Field(None, max_length=1000)
    fecha_inicio: datetime
    fecha_fin: datetime
    capacidad_maxima: Optional[int] = Field(None, gt=0)
    costo: Decimal = Field(default=0, ge=0)
    ubicacion: Optional[str] = Field(None, max_length=255)
    es_recurrente: bool = False
    recurrencia_config: Optional[Dict[str, Any]] = None


class EventoCreate(EventoBase):
    """Schema para crear Evento"""
    instructor_id: Optional[UUID4] = None


class EventoUpdate(BaseModel):
    """Schema para actualizar Evento"""
    titulo: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[TipoEventoEnum] = None
    descripcion: Optional[str] = Field(None, max_length=1000)
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    instructor_id: Optional[UUID4] = None
    capacidad_maxima: Optional[int] = Field(None, gt=0)
    costo: Optional[Decimal] = Field(None, ge=0)
    estado: Optional[EstadoEventoEnum] = None
    ubicacion: Optional[str] = Field(None, max_length=255)
    es_recurrente: Optional[bool] = None
    recurrencia_config: Optional[Dict[str, Any]] = None


class EventoSchema(EventoBase):
    """Schema de respuesta de Evento"""
    id: UUID4
    instructor_id: Optional[UUID4] = None
    estado: EstadoEventoEnum
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Inscripción Schemas
class InscripcionEventoBase(BaseModel):
    """Schema base de Inscripción"""
    comentarios: Optional[str] = Field(None, max_length=500)


class InscripcionEventoCreate(InscripcionEventoBase):
    """Schema para crear Inscripción"""
    evento_id: UUID4
    cliente_id: UUID4
    caballo_id: Optional[UUID4] = None


class InscripcionEventoUpdate(BaseModel):
    """Schema para actualizar Inscripción"""
    estado: Optional[EstadoInscripcionEnum] = None
    asistio: Optional[bool] = None
    comentarios: Optional[str] = Field(None, max_length=500)


class InscripcionEventoSchema(InscripcionEventoBase):
    """Schema de respuesta de Inscripción"""
    id: UUID4
    evento_id: UUID4
    cliente_id: UUID4
    caballo_id: Optional[UUID4] = None
    estado: EstadoInscripcionEnum
    asistio: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True
