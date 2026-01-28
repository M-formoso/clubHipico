from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class TimestampMixin(BaseModel):
    """Mixin para campos de timestamp"""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResponseMessage(BaseModel):
    """Schema para mensajes de respuesta"""
    message: str
    detail: Optional[str] = None


class PaginationParams(BaseModel):
    """Parámetros de paginación"""
    skip: int = 0
    limit: int = 100

    class Config:
        json_schema_extra = {
            "example": {
                "skip": 0,
                "limit": 100
            }
        }
