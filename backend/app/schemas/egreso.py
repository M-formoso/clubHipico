from pydantic import BaseModel, Field, UUID4
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.egreso import TipoEgresoEnum


class EgresoBase(BaseModel):
    """Schema base de Egreso"""
    concepto: str = Field(..., min_length=1, max_length=255)
    tipo: TipoEgresoEnum
    monto: Decimal = Field(..., gt=0)
    fecha_egreso: date
    proveedor: Optional[str] = Field(None, max_length=255)
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=500)


class EgresoCreate(EgresoBase):
    """Schema para crear Egreso"""
    pass


class EgresoUpdate(BaseModel):
    """Schema para actualizar Egreso"""
    concepto: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[TipoEgresoEnum] = None
    monto: Optional[Decimal] = Field(None, gt=0)
    fecha_egreso: Optional[date] = None
    proveedor: Optional[str] = Field(None, max_length=255)
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=500)
    comprobante_url: Optional[str] = None


class EgresoSchema(EgresoBase):
    """Schema de respuesta de Egreso"""
    id: UUID4
    comprobante_url: Optional[str] = None
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
