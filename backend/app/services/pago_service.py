from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal

from app.models.pago import Pago, EstadoPagoEnum
from app.schemas.pago import PagoCreate, PagoUpdate, RegistrarPagoRequest
from app.services import cliente_service


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    cliente_id: Optional[UUID] = None,
    estado: Optional[EstadoPagoEnum] = None
) -> List[Pago]:
    """Obtiene lista de pagos con paginación."""
    query = db.query(Pago)

    if cliente_id:
        query = query.filter(Pago.cliente_id == cliente_id)

    if estado:
        query = query.filter(Pago.estado == estado)

    return query.order_by(Pago.created_at.desc()).offset(skip).limit(limit).all()


def obtener_por_id(db: Session, pago_id: UUID) -> Optional[Pago]:
    """Obtiene un pago por ID."""
    return db.query(Pago).filter(Pago.id == pago_id).first()


def crear(db: Session, pago_data: PagoCreate, usuario_id: UUID) -> Pago:
    """Crea un nuevo pago."""
    db_pago = Pago(
        **pago_data.model_dump(),
        created_by=usuario_id
    )
    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)

    # Si el pago es pendiente, actualizar saldo del cliente
    if db_pago.estado == EstadoPagoEnum.PENDIENTE:
        cliente_service.actualizar_saldo(db, pago_data.cliente_id, -float(pago_data.monto))

    return db_pago


def actualizar(
    db: Session,
    pago_id: UUID,
    pago_update: PagoUpdate
) -> Optional[Pago]:
    """Actualiza un pago existente."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        return None

    update_data = pago_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pago, field, value)

    db.commit()
    db.refresh(db_pago)
    return db_pago


def eliminar(db: Session, pago_id: UUID) -> Optional[Pago]:
    """Elimina un pago (marcándolo como cancelado)."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        return None

    # Si estaba pendiente, devolver el monto al saldo del cliente
    if db_pago.estado == EstadoPagoEnum.PENDIENTE:
        cliente_service.actualizar_saldo(db, db_pago.cliente_id, float(db_pago.monto))

    db_pago.estado = EstadoPagoEnum.CANCELADO
    db.commit()
    db.refresh(db_pago)
    return db_pago


def registrar_pago(
    db: Session,
    pago_id: UUID,
    pago_request: RegistrarPagoRequest
) -> Pago:
    """Registra el pago de una deuda pendiente."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )

    if db_pago.estado != EstadoPagoEnum.PENDIENTE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden registrar pagos pendientes"
        )

    # Actualizar pago
    db_pago.metodo_pago = pago_request.metodo_pago
    db_pago.fecha_pago = pago_request.fecha_pago
    db_pago.referencia = pago_request.referencia
    db_pago.notas = pago_request.notas or db_pago.notas
    db_pago.estado = EstadoPagoEnum.PAGADO

    # Actualizar saldo del cliente (devolver el monto que se había restado)
    cliente_service.actualizar_saldo(db, db_pago.cliente_id, float(db_pago.monto))

    db.commit()
    db.refresh(db_pago)
    return db_pago


def obtener_pagos_pendientes(db: Session) -> List[Pago]:
    """Obtiene todos los pagos pendientes."""
    return db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE
    ).all()


def obtener_pagos_vencidos(db: Session) -> List[Pago]:
    """Obtiene pagos vencidos."""
    return db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE,
        Pago.fecha_vencimiento < date.today()
    ).all()


def obtener_ingresos_periodo(
    db: Session,
    fecha_inicio: date,
    fecha_fin: date
) -> Decimal:
    """Calcula los ingresos de un período."""
    pagos = db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PAGADO,
        Pago.fecha_pago >= fecha_inicio,
        Pago.fecha_pago <= fecha_fin
    ).all()

    total = sum(pago.monto for pago in pagos)
    return Decimal(total)
