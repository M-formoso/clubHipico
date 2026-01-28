from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoEventoEnum(str, enum.Enum):
    """Tipos de evento"""
    CLASE_GRUPAL = "clase_grupal"
    CLASE_PRIVADA = "clase_privada"
    COMPETENCIA = "competencia"
    SALIDA = "salida"
    EVENTO_SOCIAL = "evento_social"
    OTRO = "otro"


class EstadoEventoEnum(str, enum.Enum):
    """Estado del evento"""
    PROGRAMADO = "programado"
    EN_CURSO = "en_curso"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class Evento(Base):
    """Modelo de Evento"""
    __tablename__ = "eventos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Información básica
    titulo = Column(String(255), nullable=False)
    tipo = Column(SQLEnum(TipoEventoEnum), nullable=False)
    descripcion = Column(String(1000), nullable=True)

    # Fecha y hora
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)

    # Instructor/Responsable
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("empleados.id", ondelete="SET NULL"), nullable=True)

    # Capacidad
    capacidad_maxima = Column(Integer, nullable=True)

    # Costo
    costo = Column(Numeric(10, 2), default=0, nullable=False)

    # Estado
    estado = Column(SQLEnum(EstadoEventoEnum), default=EstadoEventoEnum.PROGRAMADO, nullable=False)

    # Ubicación
    ubicacion = Column(String(255), nullable=True)

    # Recurrencia
    es_recurrente = Column(Boolean, default=False, nullable=False)
    recurrencia_config = Column(JSONB, nullable=True)  # {"dias": ["lunes", "miércoles"], "frecuencia": "semanal"}

    # Auditoría
    created_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    instructor = relationship("Empleado", back_populates="eventos_como_instructor", foreign_keys=[instructor_id])
    inscripciones = relationship("InscripcionEvento", back_populates="evento", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Evento {self.titulo} - {self.tipo}>"


class EstadoInscripcionEnum(str, enum.Enum):
    """Estado de la inscripción"""
    CONFIRMADO = "confirmado"
    EN_ESPERA = "en_espera"
    CANCELADO = "cancelado"


class InscripcionEvento(Base):
    """Modelo de Inscripción a Evento"""
    __tablename__ = "inscripciones_evento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evento_id = Column(UUID(as_uuid=True), ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="SET NULL"), nullable=True)

    # Estado
    estado = Column(SQLEnum(EstadoInscripcionEnum), default=EstadoInscripcionEnum.CONFIRMADO, nullable=False)

    # Asistencia
    asistio = Column(Boolean, nullable=True)

    # Comentarios
    comentarios = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    evento = relationship("Evento", back_populates="inscripciones")
    cliente = relationship("Cliente", back_populates="inscripciones")
    caballo = relationship("Caballo", back_populates="inscripciones")

    def __repr__(self):
        return f"<InscripcionEvento evento_id={self.evento_id} cliente_id={self.cliente_id}>"
