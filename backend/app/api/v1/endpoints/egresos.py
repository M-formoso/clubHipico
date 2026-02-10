from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.models.egreso import TipoEgresoEnum
from app.schemas.egreso import EgresoSchema, EgresoCreate, EgresoUpdate
from app.services import egreso_service

router = APIRouter()


@router.get("/", response_model=List[EgresoSchema])
async def listar_egresos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tipo: Optional[TipoEgresoEnum] = Query(None),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los egresos con paginación y filtros."""
    return egreso_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        tipo=tipo,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta
    )


@router.post(
    "/",
    response_model=EgresoSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_egreso(
    egreso: EgresoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo egreso."""
    return egreso_service.crear(db, egreso, current_user.id)


@router.get("/{egreso_id}", response_model=EgresoSchema)
async def obtener_egreso(
    egreso_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un egreso específico por ID."""
    egreso = egreso_service.obtener_por_id(db, egreso_id)
    if not egreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egreso no encontrado"
        )
    return egreso


@router.put("/{egreso_id}", response_model=EgresoSchema)
async def actualizar_egreso(
    egreso_id: UUID,
    egreso_update: EgresoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un egreso existente."""
    egreso = egreso_service.actualizar(db, egreso_id, egreso_update)
    if not egreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egreso no encontrado"
        )
    return egreso


@router.delete("/{egreso_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_egreso(
    egreso_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un egreso."""
    egreso = egreso_service.eliminar(db, egreso_id)
    if not egreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egreso no encontrado"
        )
    return None
