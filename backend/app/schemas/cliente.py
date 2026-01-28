from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from app.models.cliente import TipoClienteEnum, EstadoCuentaEnum


class ClienteBase(BaseModel):
    """Schema base de Cliente"""
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    dni: Optional[str] = Field(None, max_length=20)
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(None, max_length=500)
    tipo_cliente: TipoClienteEnum
    notas: Optional[str] = Field(None, max_length=1000)
    contacto_emergencia: Optional[Dict[str, Any]] = None


class ClienteCreate(ClienteBase):
    """Schema para crear Cliente"""
    usuario_id: Optional[UUID4] = None
    fecha_alta: Optional[date] = None


class ClienteUpdate(BaseModel):
    """Schema para actualizar Cliente"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    dni: Optional[str] = Field(None, max_length=20)
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(None, max_length=500)
    tipo_cliente: Optional[TipoClienteEnum] = None
    estado_cuenta: Optional[EstadoCuentaEnum] = None
    saldo: Optional[Decimal] = None
    activo: Optional[bool] = None
    notas: Optional[str] = Field(None, max_length=1000)
    contacto_emergencia: Optional[Dict[str, Any]] = None


class ClienteSchema(ClienteBase):
    """Schema de respuesta de Cliente"""
    id: UUID4
    usuario_id: Optional[UUID4] = None
    estado_cuenta: EstadoCuentaEnum
    saldo: Decimal
    fecha_alta: Optional[date] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
