from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from app.models.historial_medico import TipoHistorialEnum


class HistorialMedicoBase(BaseModel):
    """Schema base de Historial Médico"""
    tipo: TipoHistorialEnum
    fecha: date
    veterinario: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = Field(None, max_length=1000)
    medicamento: Optional[str] = Field(None, max_length=255)
    dosis: Optional[str] = Field(None, max_length=100)
    proxima_aplicacion: Optional[date] = None
    costo: Optional[Decimal] = Field(None, ge=0)
    documentos: Optional[List[str]] = None


class HistorialMedicoCreate(HistorialMedicoBase):
    """Schema para crear Historial Médico"""
    caballo_id: UUID4


class HistorialMedicoUpdate(BaseModel):
    """Schema para actualizar Historial Médico"""
    tipo: Optional[TipoHistorialEnum] = None
    fecha: Optional[date] = None
    veterinario: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = Field(None, max_length=1000)
    medicamento: Optional[str] = Field(None, max_length=255)
    dosis: Optional[str] = Field(None, max_length=100)
    proxima_aplicacion: Optional[date] = None
    costo: Optional[Decimal] = Field(None, ge=0)
    documentos: Optional[List[str]] = None


class HistorialMedicoSchema(HistorialMedicoBase):
    """Schema de respuesta de Historial Médico"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
