from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date
from decimal import Decimal

from app.models.egreso import Egreso, TipoEgresoEnum
from app.schemas.egreso import EgresoCreate, EgresoUpdate


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    tipo: Optional[TipoEgresoEnum] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None
) -> List[Egreso]:
    """Obtiene lista de egresos con paginación y filtros."""
    query = db.query(Egreso)

    if tipo:
        query = query.filter(Egreso.tipo == tipo)

    if fecha_desde:
        query = query.filter(Egreso.fecha_egreso >= fecha_desde)

    if fecha_hasta:
        query = query.filter(Egreso.fecha_egreso <= fecha_hasta)

    return query.order_by(Egreso.fecha_egreso.desc()).offset(skip).limit(limit).all()


def obtener_por_id(db: Session, egreso_id: UUID) -> Optional[Egreso]:
    """Obtiene un egreso por ID."""
    return db.query(Egreso).filter(Egreso.id == egreso_id).first()


def crear(db: Session, egreso_data: EgresoCreate, usuario_id: UUID) -> Egreso:
    """Crea un nuevo egreso."""
    db_egreso = Egreso(
        **egreso_data.model_dump(),
        created_by=usuario_id
    )
    db.add(db_egreso)
    db.commit()
    db.refresh(db_egreso)
    return db_egreso


def actualizar(
    db: Session,
    egreso_id: UUID,
    egreso_update: EgresoUpdate
) -> Optional[Egreso]:
    """Actualiza un egreso existente."""
    db_egreso = obtener_por_id(db, egreso_id)
    if not db_egreso:
        return None

    update_data = egreso_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_egreso, field, value)

    db.commit()
    db.refresh(db_egreso)
    return db_egreso


def eliminar(db: Session, egreso_id: UUID) -> Optional[Egreso]:
    """Elimina un egreso."""
    db_egreso = obtener_por_id(db, egreso_id)
    if not db_egreso:
        return None

    db.delete(db_egreso)
    db.commit()
    return db_egreso


def obtener_total_periodo(
    db: Session,
    fecha_inicio: date,
    fecha_fin: date
) -> Decimal:
    """Calcula el total de egresos de un período."""
    egresos = db.query(Egreso).filter(
        Egreso.fecha_egreso >= fecha_inicio,
        Egreso.fecha_egreso <= fecha_fin
    ).all()

    total = sum(egreso.monto for egreso in egresos)
    return Decimal(total)
