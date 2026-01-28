from pydantic import BaseModel, Field, UUID4
from typing import Dict, Any, Optional
from datetime import datetime


class BoxBase(BaseModel):
    """Schema base de Box"""
    nombre: str = Field(..., min_length=1, max_length=50)
    capacidad: str = Field(default="1", max_length=20)
    estado: str = Field(default="disponible", max_length=20)
    caracteristicas: Optional[str] = Field(None, max_length=500)


class BoxCreate(BoxBase):
    """Schema para crear Box"""
    pass


class BoxUpdate(BaseModel):
    """Schema para actualizar Box"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=50)
    capacidad: Optional[str] = Field(None, max_length=20)
    estado: Optional[str] = Field(None, max_length=20)
    caracteristicas: Optional[str] = Field(None, max_length=500)


class BoxSchema(BoxBase):
    """Schema de respuesta de Box"""
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Configuración Schemas
class ConfiguracionBase(BaseModel):
    """Schema base de Configuración"""
    clave: str = Field(..., min_length=1, max_length=100)
    valor: Dict[str, Any]
    descripcion: Optional[str] = Field(None, max_length=500)


class ConfiguracionCreate(ConfiguracionBase):
    """Schema para crear Configuración"""
    pass


class ConfiguracionUpdate(BaseModel):
    """Schema para actualizar Configuración"""
    valor: Dict[str, Any]
    descripcion: Optional[str] = Field(None, max_length=500)


class ConfiguracionSchema(ConfiguracionBase):
    """Schema de respuesta de Configuración"""
    id: UUID4
    updated_by: Optional[UUID4] = None
    updated_at: datetime

    class Config:
        from_attributes = True
