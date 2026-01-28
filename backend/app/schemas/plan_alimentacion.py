from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime


class PlanAlimentacionBase(BaseModel):
    """Schema base de Plan de Alimentación"""
    tipo_alimento: Optional[str] = Field(None, max_length=255)
    cantidad_diaria: Optional[str] = Field(None, max_length=100)
    horarios: Optional[List[str]] = None  # ["07:00", "14:00", "20:00"]
    suplementos: Optional[str] = Field(None, max_length=500)
    restricciones: Optional[str] = Field(None, max_length=500)


class PlanAlimentacionCreate(PlanAlimentacionBase):
    """Schema para crear Plan de Alimentación"""
    caballo_id: UUID4


class PlanAlimentacionUpdate(PlanAlimentacionBase):
    """Schema para actualizar Plan de Alimentación"""
    pass


class PlanAlimentacionSchema(PlanAlimentacionBase):
    """Schema de respuesta de Plan de Alimentación"""
    id: UUID4
    caballo_id: UUID4
    updated_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
