from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class RolEnum(str, enum.Enum):
    """Roles de usuario en el sistema"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EMPLEADO = "empleado"
    CLIENTE = "cliente"


class Usuario(Base):
    """Modelo de Usuario con sistema de permisos granulares"""
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(SQLEnum(RolEnum), nullable=False, default=RolEnum.CLIENTE)
    activo = Column(Boolean, default=True, nullable=False)

    # Permisos granulares por módulo (JSONB para flexibilidad)
    # Estructura: { "dashboard": { "ver": true, "crear": false, ... }, ... }
    permisos = Column(JSONB, nullable=True)

    # Información adicional del usuario
    ultimo_acceso = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    empleado = relationship("Empleado", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    cliente = relationship("Cliente", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="usuario", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Usuario {self.email} - {self.rol}>"
