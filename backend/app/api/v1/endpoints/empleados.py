from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.empleado import EmpleadoSchema, EmpleadoCreate, EmpleadoUpdate
from app.services import empleado_service

router = APIRouter()


@router.get("/", response_model=List[EmpleadoSchema])
async def listar_empleados(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los empleados con paginación."""
    return empleado_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo
    )


@router.get("/buscar", response_model=List[EmpleadoSchema])
async def buscar_empleados(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Busca empleados por nombre o apellido."""
    return empleado_service.buscar(db, termino=q, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=EmpleadoSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_empleado(
    empleado: EmpleadoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo empleado."""
    return empleado_service.crear(db, empleado)


@router.get("/{empleado_id}", response_model=EmpleadoSchema)
async def obtener_empleado(
    empleado_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un empleado específico por ID."""
    empleado = empleado_service.obtener_por_id(db, empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return empleado


@router.put("/{empleado_id}", response_model=EmpleadoSchema)
async def actualizar_empleado(
    empleado_id: UUID,
    empleado_update: EmpleadoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un empleado existente."""
    empleado = empleado_service.actualizar(db, empleado_id, empleado_update)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return empleado


@router.delete("/{empleado_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_empleado(
    empleado_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un empleado (soft delete)."""
    empleado = empleado_service.eliminar(db, empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return None
