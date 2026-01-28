from sqlalchemy import Column, String, Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoHistorialEnum(str, enum.Enum):
    """Tipos de historial médico"""
    VACUNA = "vacuna"
    DESPARASITACION = "desparasitacion"
    TRATAMIENTO = "tratamiento"
    CIRUGIA = "cirugia"
    REVISION = "revision"
    HERRAJE = "herraje"
    OTRO = "otro"


class HistorialMedico(Base):
    """Modelo de Historial Médico"""
    __tablename__ = "historial_medico"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    # Información del evento médico
    tipo = Column(SQLEnum(TipoHistorialEnum), nullable=False)
    fecha = Column(Date, nullable=False)
    veterinario = Column(String(255), nullable=True)
    descripcion = Column(String(1000), nullable=True)

    # Medicamentos/Tratamiento
    medicamento = Column(String(255), nullable=True)
    dosis = Column(String(100), nullable=True)

    # Seguimiento
    proxima_aplicacion = Column(Date, nullable=True)

    # Costo
    costo = Column(Numeric(10, 2), nullable=True)

    # Documentos adjuntos (URLs)
    documentos = Column(JSONB, nullable=True)  # ["url1", "url2", ...]

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="historial_medico")

    def __repr__(self):
        return f"<HistorialMedico {self.tipo} - {self.fecha}>"
