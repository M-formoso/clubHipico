from pydantic import BaseModel, Field, UUID4
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.pago import TipoPagoEnum, MetodoPagoEnum, EstadoPagoEnum


class PagoBase(BaseModel):
    """Schema base de Pago"""
    concepto: str = Field(..., min_length=1, max_length=255)
    tipo: TipoPagoEnum
    monto: Decimal = Field(..., gt=0)
    fecha_vencimiento: Optional[date] = None
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=500)


class PagoCreate(PagoBase):
    """Schema para crear Pago"""
    cliente_id: UUID4
    metodo_pago: Optional[MetodoPagoEnum] = None


class PagoUpdate(BaseModel):
    """Schema para actualizar Pago"""
    concepto: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[TipoPagoEnum] = None
    monto: Optional[Decimal] = Field(None, gt=0)
    metodo_pago: Optional[MetodoPagoEnum] = None
    estado: Optional[EstadoPagoEnum] = None
    fecha_vencimiento: Optional[date] = None
    fecha_pago: Optional[date] = None
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=500)
    recibo_url: Optional[str] = None


class PagoSchema(PagoBase):
    """Schema de respuesta de Pago"""
    id: UUID4
    cliente_id: UUID4
    metodo_pago: Optional[MetodoPagoEnum] = None
    estado: EstadoPagoEnum
    fecha_pago: Optional[date] = None
    recibo_url: Optional[str] = None
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RegistrarPagoRequest(BaseModel):
    """Schema para registrar un pago"""
    metodo_pago: MetodoPagoEnum
    fecha_pago: date
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=500)
