from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.cliente import ClienteSchema, ClienteCreate, ClienteUpdate
from app.services import cliente_service

router = APIRouter()


@router.get("/", response_model=List[ClienteSchema])
async def listar_clientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los clientes con paginación."""
    return cliente_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo
    )


@router.get("/buscar", response_model=List[ClienteSchema])
async def buscar_clientes(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Busca clientes por nombre, apellido o email."""
    return cliente_service.buscar(db, termino=q, skip=skip, limit=limit)


@router.get("/morosos", response_model=List[ClienteSchema])
async def obtener_clientes_morosos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene lista de clientes morosos."""
    return cliente_service.obtener_morosos(db)


@router.post(
    "/",
    response_model=ClienteSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo cliente."""
    return cliente_service.crear(db, cliente)


@router.get("/{cliente_id}", response_model=ClienteSchema)
async def obtener_cliente(
    cliente_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un cliente específico por ID."""
    cliente = cliente_service.obtener_por_id(db, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    return cliente


@router.put("/{cliente_id}", response_model=ClienteSchema)
async def actualizar_cliente(
    cliente_id: UUID,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un cliente existente."""
    cliente = cliente_service.actualizar(db, cliente_id, cliente_update)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    return cliente


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cliente(
    cliente_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un cliente (soft delete)."""
    cliente = cliente_service.eliminar(db, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    return None
