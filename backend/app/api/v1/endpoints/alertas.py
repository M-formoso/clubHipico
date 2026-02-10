from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import (
    get_db,
    get_current_active_user,
    require_admin,
    require_alertas_ver,
    require_alertas_crear
)
from app.models.usuario import Usuario
from app.schemas.alerta import AlertaSchema, AlertaCreate, AlertaUpdate
from app.schemas.common import ResponseMessage
from app.services import alerta_service

router = APIRouter()


@router.get("/", response_model=List[AlertaSchema])
async def obtener_mis_alertas(
    solo_no_leidas: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Obtiene las alertas del usuario actual."""
    return alerta_service.obtener_por_usuario(
        db,
        current_user.id,
        solo_no_leidas=solo_no_leidas
    )


@router.get("/no-leidas", response_model=List[AlertaSchema])
async def obtener_alertas_no_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Obtiene las alertas no leídas del usuario actual."""
    return alerta_service.obtener_por_usuario(
        db,
        current_user.id,
        solo_no_leidas=True
    )


@router.get("/no-leidas/count", response_model=dict)
async def contar_alertas_no_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Cuenta las alertas no leídas del usuario actual."""
    count = alerta_service.contar_no_leidas(db, current_user.id)
    return {"count": count}


@router.get("/{alerta_id}", response_model=AlertaSchema)
async def obtener_alerta_por_id(
    alerta_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Obtiene una alerta específica por ID."""
    alerta = alerta_service.obtener_por_id(db, alerta_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )

    # Verificar que la alerta pertenece al usuario actual o es admin
    if alerta.usuario_id != current_user.id and current_user.rol.value not in ['super_admin', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta alerta"
        )

    return alerta


@router.post(
    "/",
    response_model=AlertaSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_alerta(
    alerta: AlertaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_crear)
):
    """Crea una nueva alerta."""
    return alerta_service.crear(db, alerta)


@router.put("/{alerta_id}/leer", response_model=AlertaSchema)
async def marcar_alerta_como_leida(
    alerta_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Marca una alerta como leída."""
    alerta = alerta_service.marcar_como_leida(db, alerta_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    return alerta


@router.put("/marcar-todas-leidas", response_model=ResponseMessage)
async def marcar_todas_como_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Marca todas las alertas del usuario como leídas."""
    count = alerta_service.marcar_todas_como_leidas(db, current_user.id)
    return ResponseMessage(
        message=f"{count} alertas marcadas como leídas"
    )


@router.delete("/{alerta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_alerta(
    alerta_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_alertas_ver)
):
    """Elimina una alerta."""
    alerta = alerta_service.eliminar(db, alerta_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    return None
