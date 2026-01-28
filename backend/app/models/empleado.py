from sqlalchemy import Column, String, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class FuncionEmpleadoEnum(str, enum.Enum):
    """Funciones de empleados"""
    VETERINARIO = "veterinario"
    INSTRUCTOR = "instructor"
    CUIDADOR = "cuidador"
    ADMINISTRATIVO = "administrativo"
    MANTENIMIENTO = "mantenimiento"


class Empleado(Base):
    """Modelo de Empleado"""
    __tablename__ = "empleados"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=True)

    # Datos personales
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(500), nullable=True)

    # Datos laborales
    funcion = Column(SQLEnum(FuncionEmpleadoEnum), nullable=False)
    fecha_ingreso = Column(Date, nullable=True)
    salario = Column(Numeric(10, 2), nullable=True)

    # Estado
    activo = Column(Boolean, default=True, nullable=False)

    # Multimedia
    foto_perfil = Column(String(500), nullable=True)

    # Datos adicionales
    contacto_emergencia = Column(JSONB, nullable=True)  # {"nombre": "...", "telefono": "...", "relacion": "..."}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="empleado")
    eventos_como_instructor = relationship("Evento", back_populates="instructor", foreign_keys="Evento.instructor_id")

    def __repr__(self):
        return f"<Empleado {self.nombre} {self.apellido} - {self.funcion}>"
