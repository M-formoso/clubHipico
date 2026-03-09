from sqlalchemy import Column, String, Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoPagoEnum(str, enum.Enum):
    """Tipos de pago"""
    PENSION = "pension"
    CLASE = "clase"
    EVENTO = "evento"
    SERVICIO_EXTRA = "servicio_extra"
    OTRO = "otro"


class MetodoPagoEnum(str, enum.Enum):
    """Métodos de pago"""
    EFECTIVO = "efectivo"
    TRANSFERENCIA = "transferencia"
    TARJETA = "tarjeta"
    CHEQUE = "cheque"
    DEBITO = "debito"
    CREDITO = "credito"
    MERCADO_PAGO = "mercado_pago"


class EstadoPagoEnum(str, enum.Enum):
    """Estado del pago"""
    PENDIENTE = "pendiente"
    PAGADO = "pagado"
    VENCIDO = "vencido"
    CANCELADO = "cancelado"
    APLICADO_PARCIAL = "aplicado_parcial"  # Pago aplicado parcialmente a comprobantes


class Pago(Base):
    """Modelo de Pago"""
    __tablename__ = "pagos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)

    # Numeración de recibo
    numero_recibo = Column(Integer, nullable=True)  # Número secuencial de recibo
    numero_recibo_completo = Column(String(20), nullable=True)  # Ej: "R-0001-00000123"

    # Información del pago
    concepto = Column(String(255), nullable=False)
    tipo = Column(SQLEnum(TipoPagoEnum), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    monto_aplicado = Column(Numeric(12, 2), default=0)  # Monto ya aplicado a comprobantes
    monto_disponible = Column(Numeric(12, 2), nullable=True)  # Monto disponible para aplicar

    # Método y estado
    metodo_pago = Column(SQLEnum(MetodoPagoEnum), nullable=True)
    estado = Column(SQLEnum(EstadoPagoEnum), default=EstadoPagoEnum.PENDIENTE, nullable=False)

    # Fechas
    fecha_vencimiento = Column(Date, nullable=True)
    fecha_pago = Column(Date, nullable=True)

    # Referencias
    referencia = Column(String(100), nullable=True)  # Número de transferencia, etc.
    notas = Column(String(500), nullable=True)
    recibo_url = Column(String(500), nullable=True)

    # Auditoría
    created_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    cliente = relationship("Cliente", back_populates="pagos")
    comprobantes_asociados = relationship("PagoComprobante", back_populates="pago", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Pago {self.concepto} - ${self.monto}>"

    def calcular_monto_disponible(self):
        """Calcula el monto disponible para aplicar a comprobantes"""
        self.monto_disponible = self.monto - self.monto_aplicado
        return self.monto_disponible
