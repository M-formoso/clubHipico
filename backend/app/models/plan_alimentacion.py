from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class PlanAlimentacion(Base):
    """Modelo de Plan de Alimentación"""
    __tablename__ = "plan_alimentacion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Información del plan
    tipo_alimento = Column(String(255), nullable=True)
    cantidad_diaria = Column(String(100), nullable=True)
    horarios = Column(JSONB, nullable=True)  # ["07:00", "14:00", "20:00"]
    suplementos = Column(String(500), nullable=True)
    restricciones = Column(String(500), nullable=True)

    # Auditoría
    updated_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="plan_alimentacion")

    def __repr__(self):
        return f"<PlanAlimentacion caballo_id={self.caballo_id}>"
