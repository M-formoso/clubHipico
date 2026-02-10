from sqlalchemy import Column, String, Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoEgresoEnum(str, enum.Enum):
    """Tipos de egreso"""
    ALIMENTACION = "alimentacion"
    VETERINARIO = "veterinario"
    HERRERO = "herrero"
    MANTENIMIENTO = "mantenimiento"
    SERVICIOS = "servicios"
    SALARIOS = "salarios"
    SUMINISTROS = "suministros"
    EQUIPAMIENTO = "equipamiento"
    OTRO = "otro"


class Egreso(Base):
    """Modelo de Egreso (Gastos)"""
    __tablename__ = "egresos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Información del egreso
    concepto = Column(String(255), nullable=False)
    tipo = Column(SQLEnum(TipoEgresoEnum), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)

    # Fechas
    fecha_egreso = Column(Date, nullable=False)

    # Proveedor/Beneficiario
    proveedor = Column(String(255), nullable=True)
    referencia = Column(String(100), nullable=True)  # Número de factura, etc.
    notas = Column(String(500), nullable=True)
    comprobante_url = Column(String(500), nullable=True)

    # Auditoría
    created_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Egreso {self.concepto} - ${self.monto}>"
