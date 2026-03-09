from sqlalchemy import Column, String, Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
import enum

from app.db.base import Base


class TipoComprobanteEnum(str, enum.Enum):
    """Tipos de comprobante"""
    FACTURA = "factura"
    RECIBO = "recibo"
    NOTA_CREDITO = "nota_credito"
    NOTA_DEBITO = "nota_debito"
    PRESUPUESTO = "presupuesto"


class EstadoComprobanteEnum(str, enum.Enum):
    """Estado del comprobante"""
    BORRADOR = "borrador"
    EMITIDO = "emitido"
    PAGADO_PARCIAL = "pagado_parcial"
    PAGADO_TOTAL = "pagado_total"
    ANULADO = "anulado"
    VENCIDO = "vencido"


class Comprobante(Base):
    """Modelo de Comprobante - Facturas, Recibos, Notas de Crédito/Débito"""
    __tablename__ = "comprobantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Numeración automática
    tipo = Column(SQLEnum(TipoComprobanteEnum), nullable=False)
    numero = Column(Integer, nullable=False)  # Número secuencial por tipo
    punto_venta = Column(Integer, default=1, nullable=False)  # Punto de venta
    numero_completo = Column(String(20), nullable=False, unique=True)  # Ej: "F-0001-00000123"

    # Cliente
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)

    # Fechas
    fecha_emision = Column(Date, default=date.today, nullable=False)
    fecha_vencimiento = Column(Date, nullable=True)

    # Montos
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)
    descuento_porcentaje = Column(Numeric(5, 2), default=0)
    descuento_monto = Column(Numeric(12, 2), default=0)
    iva_porcentaje = Column(Numeric(5, 2), default=0)  # 0%, 10.5%, 21%, etc.
    iva_monto = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), nullable=False)
    monto_pagado = Column(Numeric(12, 2), default=0)  # Para pagos parciales
    saldo_pendiente = Column(Numeric(12, 2), nullable=False)  # total - monto_pagado

    # Estado
    estado = Column(SQLEnum(EstadoComprobanteEnum), default=EstadoComprobanteEnum.BORRADOR, nullable=False)

    # Información adicional
    concepto_general = Column(String(255), nullable=True)  # Descripción general
    observaciones = Column(Text, nullable=True)
    condicion_pago = Column(String(100), nullable=True)  # "Contado", "30 días", etc.

    # Comprobante relacionado (para notas de crédito/débito)
    comprobante_relacionado_id = Column(UUID(as_uuid=True), ForeignKey("comprobantes.id", ondelete="SET NULL"), nullable=True)

    # Archivos
    pdf_url = Column(String(500), nullable=True)

    # Auditoría
    created_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    anulado_por = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_anulacion = Column(DateTime, nullable=True)
    motivo_anulacion = Column(String(255), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    cliente = relationship("Cliente", back_populates="comprobantes")
    items = relationship("ComprobanteItem", back_populates="comprobante", cascade="all, delete-orphan")
    pagos_asociados = relationship("PagoComprobante", back_populates="comprobante", cascade="all, delete-orphan")
    comprobante_relacionado = relationship("Comprobante", remote_side=[id], backref="comprobantes_derivados")

    def __repr__(self):
        return f"<Comprobante {self.numero_completo} - ${self.total}>"

    def calcular_totales(self):
        """Recalcula subtotal, IVA y total basado en los items"""
        self.subtotal = sum(item.subtotal for item in self.items)
        self.descuento_monto = self.subtotal * (self.descuento_porcentaje / 100)
        base_imponible = self.subtotal - self.descuento_monto
        self.iva_monto = base_imponible * (self.iva_porcentaje / 100)
        self.total = base_imponible + self.iva_monto
        self.saldo_pendiente = self.total - self.monto_pagado

    def actualizar_estado_pago(self):
        """Actualiza el estado según el monto pagado"""
        if self.estado == EstadoComprobanteEnum.ANULADO:
            return

        if self.monto_pagado >= self.total:
            self.estado = EstadoComprobanteEnum.PAGADO_TOTAL
            self.saldo_pendiente = 0
        elif self.monto_pagado > 0:
            self.estado = EstadoComprobanteEnum.PAGADO_PARCIAL
            self.saldo_pendiente = self.total - self.monto_pagado
        elif self.fecha_vencimiento and self.fecha_vencimiento < date.today():
            self.estado = EstadoComprobanteEnum.VENCIDO
        else:
            self.estado = EstadoComprobanteEnum.EMITIDO


class ComprobanteItem(Base):
    """Items/líneas de un comprobante"""
    __tablename__ = "comprobante_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comprobante_id = Column(UUID(as_uuid=True), ForeignKey("comprobantes.id", ondelete="CASCADE"), nullable=False)

    # Detalle del item
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Numeric(10, 2), default=1, nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    descuento_porcentaje = Column(Numeric(5, 2), default=0)
    subtotal = Column(Numeric(12, 2), nullable=False)  # cantidad * precio_unitario - descuento

    # Categoría/tipo del servicio
    tipo_servicio = Column(String(50), nullable=True)  # pension, clase, evento, etc.

    # Orden de visualización
    orden = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    comprobante = relationship("Comprobante", back_populates="items")

    def __repr__(self):
        return f"<ComprobanteItem {self.descripcion} x{self.cantidad}>"

    def calcular_subtotal(self):
        """Calcula el subtotal del item"""
        base = self.cantidad * self.precio_unitario
        descuento = base * (self.descuento_porcentaje / 100)
        self.subtotal = base - descuento


class PagoComprobante(Base):
    """Asociación entre Pagos y Comprobantes (para pagos parciales)"""
    __tablename__ = "pagos_comprobantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pago_id = Column(UUID(as_uuid=True), ForeignKey("pagos.id", ondelete="CASCADE"), nullable=False)
    comprobante_id = Column(UUID(as_uuid=True), ForeignKey("comprobantes.id", ondelete="CASCADE"), nullable=False)

    # Monto aplicado de este pago a este comprobante
    monto_aplicado = Column(Numeric(12, 2), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    pago = relationship("Pago", back_populates="comprobantes_asociados")
    comprobante = relationship("Comprobante", back_populates="pagos_asociados")

    def __repr__(self):
        return f"<PagoComprobante {self.pago_id} -> {self.comprobante_id}: ${self.monto_aplicado}>"


class MovimientoCuenta(Base):
    """Movimientos de cuenta corriente del cliente"""
    __tablename__ = "movimientos_cuenta"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)

    # Tipo de movimiento
    tipo = Column(String(20), nullable=False)  # "debito" o "credito"

    # Referencia al documento que origina el movimiento
    comprobante_id = Column(UUID(as_uuid=True), ForeignKey("comprobantes.id", ondelete="SET NULL"), nullable=True)
    pago_id = Column(UUID(as_uuid=True), ForeignKey("pagos.id", ondelete="SET NULL"), nullable=True)

    # Descripción y monto
    descripcion = Column(String(255), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)

    # Saldo después del movimiento
    saldo_anterior = Column(Numeric(12, 2), nullable=False)
    saldo_posterior = Column(Numeric(12, 2), nullable=False)

    # Fecha del movimiento
    fecha = Column(Date, default=date.today, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    cliente = relationship("Cliente", back_populates="movimientos_cuenta")
    comprobante = relationship("Comprobante")
    pago = relationship("Pago")

    def __repr__(self):
        signo = "+" if self.tipo == "credito" else "-"
        return f"<MovimientoCuenta {signo}${self.monto} - {self.descripcion}>"
