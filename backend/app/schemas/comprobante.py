from pydantic import BaseModel, Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from enum import Enum


class TipoComprobanteEnum(str, Enum):
    FACTURA = "factura"
    RECIBO = "recibo"
    NOTA_CREDITO = "nota_credito"
    NOTA_DEBITO = "nota_debito"
    PRESUPUESTO = "presupuesto"


class EstadoComprobanteEnum(str, Enum):
    BORRADOR = "borrador"
    EMITIDO = "emitido"
    PAGADO_PARCIAL = "pagado_parcial"
    PAGADO_TOTAL = "pagado_total"
    ANULADO = "anulado"
    VENCIDO = "vencido"


# ============ COMPROBANTE ITEM ============

class ComprobanteItemBase(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=255)
    cantidad: Decimal = Field(default=Decimal("1"), gt=0)
    precio_unitario: Decimal = Field(..., gt=0)
    descuento_porcentaje: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    tipo_servicio: Optional[str] = Field(None, max_length=50)
    orden: int = Field(default=0)


class ComprobanteItemCreate(ComprobanteItemBase):
    pass


class ComprobanteItemUpdate(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=1, max_length=255)
    cantidad: Optional[Decimal] = Field(None, gt=0)
    precio_unitario: Optional[Decimal] = Field(None, gt=0)
    descuento_porcentaje: Optional[Decimal] = Field(None, ge=0, le=100)
    tipo_servicio: Optional[str] = Field(None, max_length=50)
    orden: Optional[int] = None


class ComprobanteItemSchema(ComprobanteItemBase):
    id: UUID
    comprobante_id: UUID
    subtotal: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# ============ COMPROBANTE ============

class ComprobanteBase(BaseModel):
    tipo: TipoComprobanteEnum
    cliente_id: UUID
    fecha_emision: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    descuento_porcentaje: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    iva_porcentaje: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    concepto_general: Optional[str] = Field(None, max_length=255)
    observaciones: Optional[str] = None
    condicion_pago: Optional[str] = Field(None, max_length=100)


class ComprobanteCreate(ComprobanteBase):
    items: List[ComprobanteItemCreate] = Field(..., min_length=1)
    emitir: bool = Field(default=False, description="Si es True, emite el comprobante inmediatamente")


class ComprobanteUpdate(BaseModel):
    fecha_vencimiento: Optional[date] = None
    descuento_porcentaje: Optional[Decimal] = Field(None, ge=0, le=100)
    iva_porcentaje: Optional[Decimal] = Field(None, ge=0, le=100)
    concepto_general: Optional[str] = Field(None, max_length=255)
    observaciones: Optional[str] = None
    condicion_pago: Optional[str] = Field(None, max_length=100)


class ComprobanteSchema(ComprobanteBase):
    id: UUID
    numero: int
    punto_venta: int
    numero_completo: str
    subtotal: Decimal
    descuento_monto: Decimal
    iva_monto: Decimal
    total: Decimal
    monto_pagado: Decimal
    saldo_pendiente: Decimal
    estado: EstadoComprobanteEnum
    comprobante_relacionado_id: Optional[UUID] = None
    pdf_url: Optional[str] = None
    created_by: Optional[UUID] = None
    anulado_por: Optional[UUID] = None
    fecha_anulacion: Optional[datetime] = None
    motivo_anulacion: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[ComprobanteItemSchema] = []

    class Config:
        from_attributes = True


class ComprobanteConCliente(ComprobanteSchema):
    cliente: Optional[dict] = None  # Incluye datos del cliente


class ComprobanteListSchema(BaseModel):
    """Schema simplificado para listados"""
    id: UUID
    numero_completo: str
    tipo: TipoComprobanteEnum
    cliente_id: UUID
    cliente_nombre: Optional[str] = None
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    total: Decimal
    monto_pagado: Decimal
    saldo_pendiente: Decimal
    estado: EstadoComprobanteEnum
    created_at: datetime

    class Config:
        from_attributes = True


# ============ OPERACIONES ESPECIALES ============

class EmitirComprobanteRequest(BaseModel):
    """Para emitir un comprobante en borrador"""
    pass


class AnularComprobanteRequest(BaseModel):
    """Para anular un comprobante"""
    motivo: str = Field(..., min_length=1, max_length=255)


class AplicarPagoRequest(BaseModel):
    """Para aplicar un pago a un comprobante"""
    pago_id: UUID
    monto: Decimal = Field(..., gt=0)


class NotaCreditoDebitoRequest(BaseModel):
    """Para crear nota de crédito/débito desde un comprobante"""
    tipo: TipoComprobanteEnum
    motivo: str = Field(..., min_length=1, max_length=255)
    items: Optional[List[ComprobanteItemCreate]] = None  # Si es None, usa los items del original
    monto_parcial: Optional[Decimal] = None  # Para notas parciales


# ============ PAGO COMPROBANTE ============

class PagoComprobanteSchema(BaseModel):
    id: UUID
    pago_id: UUID
    comprobante_id: UUID
    monto_aplicado: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# ============ MOVIMIENTO CUENTA ============

class MovimientoCuentaSchema(BaseModel):
    id: UUID
    cliente_id: UUID
    tipo: str  # "debito" o "credito"
    comprobante_id: Optional[UUID] = None
    pago_id: Optional[UUID] = None
    descripcion: str
    monto: Decimal
    saldo_anterior: Decimal
    saldo_posterior: Decimal
    fecha: date
    created_at: datetime

    class Config:
        from_attributes = True


class EstadoCuentaResponse(BaseModel):
    """Respuesta del estado de cuenta de un cliente"""
    cliente_id: UUID
    cliente_nombre: str
    saldo_actual: Decimal
    total_facturado: Decimal
    total_pagado: Decimal
    comprobantes_pendientes: int
    movimientos: List[MovimientoCuentaSchema]


# ============ REPORTES ============

class ReporteVentasResponse(BaseModel):
    """Reporte de ventas/facturación"""
    fecha_inicio: date
    fecha_fin: date
    total_facturado: Decimal
    total_cobrado: Decimal
    total_pendiente: Decimal
    cantidad_comprobantes: int
    por_tipo: dict  # {"factura": {"cantidad": 10, "total": 1000}, ...}
    por_estado: dict


class ReporteCobranzasResponse(BaseModel):
    """Reporte de cobranzas"""
    fecha_inicio: date
    fecha_fin: date
    total_cobrado: Decimal
    cantidad_pagos: int
    por_metodo: dict  # {"efectivo": 1000, "transferencia": 500, ...}
    por_tipo: dict


class ReporteDeudoresResponse(BaseModel):
    """Reporte de deudores"""
    fecha_corte: date
    total_deuda: Decimal
    cantidad_deudores: int
    deudores: List[dict]  # [{"cliente_id": ..., "nombre": ..., "deuda": ..., "antiguedad_dias": ...}]
