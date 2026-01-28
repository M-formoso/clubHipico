from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.usuario import RolEnum


class UsuarioBase(BaseModel):
    """Schema base de Usuario"""
    email: EmailStr


class UsuarioCreate(UsuarioBase):
    """Schema para crear Usuario"""
    password: str = Field(..., min_length=6, max_length=100)
    rol: RolEnum = RolEnum.CLIENTE
    permisos: Optional[Dict[str, Any]] = None


class UsuarioUpdate(BaseModel):
    """Schema para actualizar Usuario"""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    rol: Optional[RolEnum] = None
    activo: Optional[bool] = None
    permisos: Optional[Dict[str, Any]] = None


class UsuarioSchema(UsuarioBase):
    """Schema de respuesta de Usuario"""
    id: UUID4
    rol: RolEnum
    activo: bool
    permisos: Optional[Dict[str, Any]] = None
    ultimo_acceso: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UsuarioInDB(UsuarioSchema):
    """Schema de Usuario con password hash (solo para uso interno)"""
    password_hash: str


# Auth Schemas
class Token(BaseModel):
    """Schema de respuesta de token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional["UsuarioSchema"] = None


class TokenPayload(BaseModel):
    """Payload del token JWT"""
    sub: str  # user_id
    exp: Optional[int] = None
    type: Optional[str] = None


class LoginRequest(BaseModel):
    """Schema para login"""
    username: str  # Puede ser email o DNI
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "usuario@example.com",
                "password": "password123"
            }
        }


class ChangePasswordRequest(BaseModel):
    """Schema para cambio de contraseña"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class ResetPasswordRequest(BaseModel):
    """Schema para resetear contraseña"""
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    """Schema para confirmar reset de contraseña"""
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)
