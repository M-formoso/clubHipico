from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class Box(Base):
    """Modelo de Box/Establo"""
    __tablename__ = "boxes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(50), nullable=False, unique=True)
    capacidad = Column(String(20), default="1", nullable=False)
    estado = Column(String(20), default="disponible", nullable=False)  # disponible, ocupado, mantenimiento
    caracteristicas = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Box {self.nombre}>"


class Configuracion(Base):
    """Modelo de Configuración del Sistema"""
    __tablename__ = "configuracion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clave = Column(String(100), unique=True, nullable=False)
    valor = Column(JSONB, nullable=False)
    descripcion = Column(String(500), nullable=True)

    # Auditoría
    updated_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Configuracion {self.clave}>"
