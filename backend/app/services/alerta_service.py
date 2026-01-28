from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.models.alerta import Alerta
from app.models.usuario import Usuario, RolEnum
from app.schemas.alerta import AlertaCreate, AlertaUpdate


def obtener_por_usuario(
    db: Session,
    usuario_id: UUID,
    solo_no_leidas: bool = False
) -> List[Alerta]:
    """Obtiene alertas de un usuario."""
    query = db.query(Alerta).filter(Alerta.usuario_id == usuario_id)

    if solo_no_leidas:
        query = query.filter(Alerta.leida == False)

    return query.order_by(Alerta.created_at.desc()).all()


def obtener_por_id(db: Session, alerta_id: UUID) -> Optional[Alerta]:
    """Obtiene una alerta por ID."""
    return db.query(Alerta).filter(Alerta.id == alerta_id).first()


def crear(db: Session, alerta_data: AlertaCreate) -> Alerta:
    """Crea una nueva alerta."""
    db_alerta = Alerta(**alerta_data.model_dump())
    db.add(db_alerta)
    db.commit()
    db.refresh(db_alerta)
    return db_alerta


def crear_para_admins(db: Session, alerta_data: AlertaCreate) -> List[Alerta]:
    """Crea una alerta para todos los administradores."""
    # Obtener todos los admins
    admins = db.query(Usuario).filter(
        Usuario.rol.in_([RolEnum.ADMIN, RolEnum.SUPER_ADMIN]),
        Usuario.activo == True
    ).all()

    alertas = []
    for admin in admins:
        db_alerta = Alerta(
            **alerta_data.model_dump(exclude={'usuario_id'}),
            usuario_id=admin.id
        )
        db.add(db_alerta)
        alertas.append(db_alerta)

    db.commit()
    return alertas


def marcar_como_leida(db: Session, alerta_id: UUID) -> Optional[Alerta]:
    """Marca una alerta como leída."""
    db_alerta = obtener_por_id(db, alerta_id)
    if db_alerta:
        db_alerta.leida = True
        db.commit()
        db.refresh(db_alerta)
    return db_alerta


def marcar_todas_como_leidas(db: Session, usuario_id: UUID) -> int:
    """Marca todas las alertas de un usuario como leídas."""
    count = db.query(Alerta).filter(
        Alerta.usuario_id == usuario_id,
        Alerta.leida == False
    ).update({"leida": True})
    db.commit()
    return count


def eliminar(db: Session, alerta_id: UUID) -> Optional[Alerta]:
    """Elimina una alerta."""
    db_alerta = obtener_por_id(db, alerta_id)
    if db_alerta:
        db.delete(db_alerta)
        db.commit()
    return db_alerta


def contar_no_leidas(db: Session, usuario_id: UUID) -> int:
    """Cuenta las alertas no leídas de un usuario."""
    return db.query(Alerta).filter(
        Alerta.usuario_id == usuario_id,
        Alerta.leida == False
    ).count()
