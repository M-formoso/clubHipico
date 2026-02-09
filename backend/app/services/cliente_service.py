from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from decimal import Decimal

from app.models.cliente import Cliente, EstadoCuentaEnum
from app.schemas.cliente import ClienteCreate, ClienteUpdate


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False
) -> List[Cliente]:
    """Obtiene lista de clientes con paginación."""
    query = db.query(Cliente)

    if activo_solo:
        query = query.filter(Cliente.activo == True)

    return query.offset(skip).limit(limit).all()


def obtener_por_id(db: Session, cliente_id: UUID) -> Optional[Cliente]:
    """Obtiene un cliente por ID."""
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()


def crear(db: Session, cliente_data: ClienteCreate) -> Cliente:
    """Crea un nuevo cliente."""
    try:
        db_cliente = Cliente(**cliente_data.model_dump())
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos. Verifique que el DNI o email no estén duplicados."
        )


def actualizar(
    db: Session,
    cliente_id: UUID,
    cliente_update: ClienteUpdate
) -> Optional[Cliente]:
    """Actualiza un cliente existente."""
    db_cliente = obtener_por_id(db, cliente_id)
    if not db_cliente:
        return None

    update_data = cliente_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cliente, field, value)

    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def eliminar(db: Session, cliente_id: UUID) -> Optional[Cliente]:
    """Elimina un cliente (soft delete marcando como inactivo)."""
    db_cliente = obtener_por_id(db, cliente_id)
    if not db_cliente:
        return None

    # Soft delete
    db_cliente.activo = False
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[Cliente]:
    """Busca clientes por nombre, apellido o email."""
    return db.query(Cliente).filter(
        (Cliente.nombre.ilike(f"%{termino}%")) |
        (Cliente.apellido.ilike(f"%{termino}%")) |
        (Cliente.email.ilike(f"%{termino}%")),
        Cliente.activo == True
    ).offset(skip).limit(limit).all()


def obtener_morosos(db: Session) -> List[Cliente]:
    """Obtiene clientes con estado moroso."""
    return db.query(Cliente).filter(
        Cliente.estado_cuenta == EstadoCuentaEnum.MOROSO,
        Cliente.activo == True
    ).all()


def actualizar_saldo(db: Session, cliente_id: UUID, monto: float) -> Cliente:
    """Actualiza el saldo de un cliente."""
    db_cliente = obtener_por_id(db, cliente_id)
    if not db_cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )

    db_cliente.saldo += Decimal(str(monto))

    # Actualizar estado de cuenta según el saldo
    if db_cliente.saldo < 0:
        db_cliente.estado_cuenta = EstadoCuentaEnum.DEBE
    elif db_cliente.saldo == 0:
        db_cliente.estado_cuenta = EstadoCuentaEnum.AL_DIA

    db.commit()
    db.refresh(db_cliente)
    return db_cliente
