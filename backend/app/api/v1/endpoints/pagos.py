from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.models.pago import EstadoPagoEnum
from app.schemas.pago import PagoSchema, PagoCreate, PagoUpdate, RegistrarPagoRequest
from app.services import pago_service

router = APIRouter()


@router.get("/", response_model=List[PagoSchema])
async def listar_pagos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    cliente_id: Optional[UUID] = Query(None),
    estado: Optional[EstadoPagoEnum] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los pagos con paginación."""
    return pago_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        cliente_id=cliente_id,
        estado=estado
    )


@router.get("/pendientes", response_model=List[PagoSchema])
async def obtener_pagos_pendientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene todos los pagos pendientes."""
    return pago_service.obtener_pagos_pendientes(db)


@router.get("/vencidos", response_model=List[PagoSchema])
async def obtener_pagos_vencidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene todos los pagos vencidos."""
    return pago_service.obtener_pagos_vencidos(db)


@router.post(
    "/",
    response_model=PagoSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_pago(
    pago: PagoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo pago."""
    return pago_service.crear(db, pago, current_user.id)


@router.get("/{pago_id}", response_model=PagoSchema)
async def obtener_pago(
    pago_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un pago específico por ID."""
    pago = pago_service.obtener_por_id(db, pago_id)
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    return pago


@router.put("/{pago_id}", response_model=PagoSchema)
async def actualizar_pago(
    pago_id: UUID,
    pago_update: PagoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un pago existente."""
    pago = pago_service.actualizar(db, pago_id, pago_update)
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    return pago


@router.post("/{pago_id}/registrar", response_model=PagoSchema)
async def registrar_pago(
    pago_id: UUID,
    pago_request: RegistrarPagoRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra el pago de una deuda pendiente."""
    return pago_service.registrar_pago(db, pago_id, pago_request)


@router.delete("/{pago_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_pago(
    pago_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un pago (marca como cancelado)."""
    pago = pago_service.eliminar(db, pago_id)
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    return None
