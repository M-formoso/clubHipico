from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.evento import (
    EventoSchema,
    EventoCreate,
    EventoUpdate,
    InscripcionEventoSchema,
    InscripcionEventoCreate,
    InscripcionEventoUpdate
)
from app.services import evento_service

router = APIRouter()


@router.get("/", response_model=List[EventoSchema])
async def listar_eventos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los eventos con paginación."""
    return evento_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin
    )


@router.post(
    "/",
    response_model=EventoSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_evento(
    evento: EventoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo evento."""
    return evento_service.crear(db, evento, current_user.id)


@router.get("/{evento_id}", response_model=EventoSchema)
async def obtener_evento(
    evento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un evento específico por ID."""
    evento = evento_service.obtener_por_id(db, evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    return evento


@router.put("/{evento_id}", response_model=EventoSchema)
async def actualizar_evento(
    evento_id: UUID,
    evento_update: EventoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un evento existente."""
    evento = evento_service.actualizar(db, evento_id, evento_update)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    return evento


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_evento(
    evento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un evento (marca como cancelado)."""
    evento = evento_service.eliminar(db, evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    return None


# Inscripciones
@router.get("/{evento_id}/inscripciones", response_model=List[InscripcionEventoSchema])
async def obtener_inscripciones_evento(
    evento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene todas las inscripciones de un evento."""
    return evento_service.obtener_inscripciones_evento(db, evento_id)


@router.post("/inscripciones", response_model=InscripcionEventoSchema, status_code=status.HTTP_201_CREATED)
async def inscribir_cliente(
    inscripcion: InscripcionEventoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Inscribe un cliente a un evento."""
    return evento_service.inscribir_cliente(db, inscripcion)


@router.delete("/inscripciones/{inscripcion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def desinscribir_cliente(
    inscripcion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Desinscribe un cliente de un evento."""
    inscripcion = evento_service.desinscribir_cliente(db, inscripcion_id)
    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada"
        )
    return None


@router.put("/inscripciones/{inscripcion_id}/asistencia", response_model=InscripcionEventoSchema)
async def marcar_asistencia(
    inscripcion_id: UUID,
    asistio: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Marca la asistencia de un participante."""
    inscripcion = evento_service.actualizar_asistencia(db, inscripcion_id, asistio)
    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada"
        )
    return inscripcion
