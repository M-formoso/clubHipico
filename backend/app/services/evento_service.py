from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import datetime, date

from app.models.evento import Evento, InscripcionEvento, EstadoEventoEnum, EstadoInscripcionEnum
from app.schemas.evento import EventoCreate, EventoUpdate, InscripcionEventoCreate, InscripcionEventoUpdate


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None
) -> List[Evento]:
    """Obtiene lista de eventos con paginación."""
    query = db.query(Evento)

    if fecha_inicio:
        query = query.filter(Evento.fecha_inicio >= fecha_inicio)

    if fecha_fin:
        query = query.filter(Evento.fecha_fin <= fecha_fin)

    return query.order_by(Evento.fecha_inicio.desc()).offset(skip).limit(limit).all()


def obtener_por_id(db: Session, evento_id: UUID) -> Optional[Evento]:
    """Obtiene un evento por ID."""
    return db.query(Evento).filter(Evento.id == evento_id).first()


def crear(db: Session, evento_data: EventoCreate, usuario_id: UUID) -> Evento:
    """Crea un nuevo evento."""
    db_evento = Evento(
        **evento_data.model_dump(),
        created_by=usuario_id
    )
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


def actualizar(
    db: Session,
    evento_id: UUID,
    evento_update: EventoUpdate
) -> Optional[Evento]:
    """Actualiza un evento existente."""
    db_evento = obtener_por_id(db, evento_id)
    if not db_evento:
        return None

    update_data = evento_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evento, field, value)

    db.commit()
    db.refresh(db_evento)
    return db_evento


def eliminar(db: Session, evento_id: UUID) -> Optional[Evento]:
    """Elimina un evento (marcándolo como cancelado)."""
    db_evento = obtener_por_id(db, evento_id)
    if not db_evento:
        return None

    db_evento.estado = EstadoEventoEnum.CANCELADO
    db.commit()
    db.refresh(db_evento)
    return db_evento


def obtener_eventos_proximos(db: Session, dias: int = 7) -> List[Evento]:
    """Obtiene eventos próximos."""
    return db.query(Evento).filter(
        Evento.fecha_inicio >= datetime.now(),
        Evento.fecha_inicio <= datetime.now() + timedelta(days=dias),
        Evento.estado == EstadoEventoEnum.PROGRAMADO
    ).all()


# Inscripciones
def inscribir_cliente(db: Session, inscripcion_data: InscripcionEventoCreate) -> InscripcionEvento:
    """Inscribe un cliente a un evento."""
    # Verificar capacidad
    evento = obtener_por_id(db, inscripcion_data.evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )

    if evento.capacidad_maxima:
        inscripciones_confirmadas = db.query(InscripcionEvento).filter(
            InscripcionEvento.evento_id == inscripcion_data.evento_id,
            InscripcionEvento.estado == EstadoInscripcionEnum.CONFIRMADO
        ).count()

        if inscripciones_confirmadas >= evento.capacidad_maxima:
            # Poner en lista de espera
            inscripcion_data.estado = EstadoInscripcionEnum.EN_ESPERA

    db_inscripcion = InscripcionEvento(**inscripcion_data.model_dump())
    db.add(db_inscripcion)
    db.commit()
    db.refresh(db_inscripcion)
    return db_inscripcion


def desinscribir_cliente(db: Session, inscripcion_id: UUID) -> Optional[InscripcionEvento]:
    """Desinscribe un cliente de un evento."""
    db_inscripcion = db.query(InscripcionEvento).filter(
        InscripcionEvento.id == inscripcion_id
    ).first()

    if db_inscripcion:
        db_inscripcion.estado = EstadoInscripcionEnum.CANCELADO
        db.commit()
        db.refresh(db_inscripcion)

    return db_inscripcion


def obtener_inscripciones_evento(db: Session, evento_id: UUID) -> List[InscripcionEvento]:
    """Obtiene todas las inscripciones de un evento."""
    return db.query(InscripcionEvento).filter(
        InscripcionEvento.evento_id == evento_id
    ).all()


def obtener_inscripciones_cliente(db: Session, cliente_id: UUID) -> List[InscripcionEvento]:
    """Obtiene todas las inscripciones de un cliente."""
    return db.query(InscripcionEvento).filter(
        InscripcionEvento.cliente_id == cliente_id
    ).all()


def actualizar_asistencia(
    db: Session,
    inscripcion_id: UUID,
    asistio: bool
) -> Optional[InscripcionEvento]:
    """Actualiza la asistencia de una inscripción."""
    db_inscripcion = db.query(InscripcionEvento).filter(
        InscripcionEvento.id == inscripcion_id
    ).first()

    if db_inscripcion:
        db_inscripcion.asistio = asistio
        db.commit()
        db.refresh(db_inscripcion)

    return db_inscripcion


from datetime import timedelta
