from pydantic import BaseModel, Field, UUID4
from typing import Optional, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from app.models.empleado import FuncionEmpleadoEnum


class EmpleadoBase(BaseModel):
    """Schema base de Empleado"""
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    dni: Optional[str] = Field(None, max_length=20)
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = Field(None, max_length=500)
    funcion: FuncionEmpleadoEnum
    fecha_ingreso: Optional[date] = None
    salario: Optional[Decimal] = None
    foto_perfil: Optional[str] = None
    contacto_emergencia: Optional[Dict[str, Any]] = None


class EmpleadoCreate(EmpleadoBase):
    """Schema para crear Empleado"""
    usuario_id: Optional[UUID4] = None


class EmpleadoUpdate(BaseModel):
    """Schema para actualizar Empleado"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    dni: Optional[str] = Field(None, max_length=20)
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = Field(None, max_length=500)
    funcion: Optional[FuncionEmpleadoEnum] = None
    fecha_ingreso: Optional[date] = None
    salario: Optional[Decimal] = None
    activo: Optional[bool] = None
    foto_perfil: Optional[str] = None
    contacto_emergencia: Optional[Dict[str, Any]] = None


class EmpleadoSchema(EmpleadoBase):
    """Schema de respuesta de Empleado"""
    id: UUID4
    usuario_id: Optional[UUID4] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
