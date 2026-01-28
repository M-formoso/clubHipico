from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date, timedelta

from app.models.historial_medico import HistorialMedico, TipoHistorialEnum
from app.schemas.historial_medico import HistorialMedicoCreate, HistorialMedicoUpdate


def obtener_por_caballo(db: Session, caballo_id: UUID) -> List[HistorialMedico]:
    """Obtiene todo el historial médico de un caballo."""
    return db.query(HistorialMedico).filter(
        HistorialMedico.caballo_id == caballo_id
    ).order_by(HistorialMedico.fecha.desc()).all()


def obtener_por_id(db: Session, historial_id: UUID) -> Optional[HistorialMedico]:
    """Obtiene un registro de historial médico por ID."""
    return db.query(HistorialMedico).filter(HistorialMedico.id == historial_id).first()


def crear(db: Session, historial_data: HistorialMedicoCreate) -> HistorialMedico:
    """Crea un nuevo registro de historial médico."""
    db_historial = HistorialMedico(**historial_data.model_dump())
    db.add(db_historial)
    db.commit()
    db.refresh(db_historial)
    return db_historial


def actualizar(
    db: Session,
    historial_id: UUID,
    historial_update: HistorialMedicoUpdate
) -> Optional[HistorialMedico]:
    """Actualiza un registro de historial médico."""
    db_historial = obtener_por_id(db, historial_id)
    if not db_historial:
        return None

    update_data = historial_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_historial, field, value)

    db.commit()
    db.refresh(db_historial)
    return db_historial


def eliminar(db: Session, historial_id: UUID) -> Optional[HistorialMedico]:
    """Elimina un registro de historial médico."""
    db_historial = obtener_por_id(db, historial_id)
    if db_historial:
        db.delete(db_historial)
        db.commit()
    return db_historial


def obtener_proximas_vacunas(db: Session, dias: int = 30) -> List[HistorialMedico]:
    """Obtiene vacunas que vencen en los próximos X días."""
    fecha_limite = date.today() + timedelta(days=dias)

    return db.query(HistorialMedico).filter(
        HistorialMedico.tipo == TipoHistorialEnum.VACUNA,
        HistorialMedico.proxima_aplicacion != None,
        HistorialMedico.proxima_aplicacion <= fecha_limite,
        HistorialMedico.proxima_aplicacion >= date.today()
    ).all()


def obtener_proximos_herrajes(db: Session, dias: int = 30) -> List[HistorialMedico]:
    """Obtiene herrajes que vencen en los próximos X días."""
    fecha_limite = date.today() + timedelta(days=dias)

    return db.query(HistorialMedico).filter(
        HistorialMedico.tipo == TipoHistorialEnum.HERRAJE,
        HistorialMedico.proxima_aplicacion != None,
        HistorialMedico.proxima_aplicacion <= fecha_limite,
        HistorialMedico.proxima_aplicacion >= date.today()
    ).all()
