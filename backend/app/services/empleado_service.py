from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.empleado import Empleado
from app.schemas.empleado import EmpleadoCreate, EmpleadoUpdate


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False
) -> List[Empleado]:
    """Obtiene lista de empleados con paginación."""
    query = db.query(Empleado)

    if activo_solo:
        query = query.filter(Empleado.activo == True)

    return query.offset(skip).limit(limit).all()


def obtener_por_id(db: Session, empleado_id: UUID) -> Optional[Empleado]:
    """Obtiene un empleado por ID."""
    return db.query(Empleado).filter(Empleado.id == empleado_id).first()


def crear(db: Session, empleado_data: EmpleadoCreate) -> Empleado:
    """Crea un nuevo empleado."""
    try:
        db_empleado = Empleado(**empleado_data.model_dump())
        db.add(db_empleado)
        db.commit()
        db.refresh(db_empleado)
        return db_empleado
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos. Verifique que el DNI no esté duplicado."
        )


def actualizar(
    db: Session,
    empleado_id: UUID,
    empleado_update: EmpleadoUpdate
) -> Optional[Empleado]:
    """Actualiza un empleado existente."""
    db_empleado = obtener_por_id(db, empleado_id)
    if not db_empleado:
        return None

    update_data = empleado_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_empleado, field, value)

    db.commit()
    db.refresh(db_empleado)
    return db_empleado


def eliminar(db: Session, empleado_id: UUID) -> Optional[Empleado]:
    """Elimina un empleado (soft delete marcando como inactivo)."""
    db_empleado = obtener_por_id(db, empleado_id)
    if not db_empleado:
        return None

    # Soft delete
    db_empleado.activo = False
    db.commit()
    db.refresh(db_empleado)
    return db_empleado


def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[Empleado]:
    """Busca empleados por nombre o apellido."""
    return db.query(Empleado).filter(
        (Empleado.nombre.ilike(f"%{termino}%")) |
        (Empleado.apellido.ilike(f"%{termino}%")),
        Empleado.activo == True
    ).offset(skip).limit(limit).all()


def obtener_por_funcion(db: Session, funcion: str) -> List[Empleado]:
    """Obtiene empleados por función."""
    return db.query(Empleado).filter(
        Empleado.funcion == funcion,
        Empleado.activo == True
    ).all()
