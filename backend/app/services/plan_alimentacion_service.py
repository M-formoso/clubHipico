from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.models.plan_alimentacion import PlanAlimentacion
from app.schemas.plan_alimentacion import PlanAlimentacionCreate, PlanAlimentacionUpdate


def obtener_por_caballo(db: Session, caballo_id: UUID) -> Optional[PlanAlimentacion]:
    """Obtiene el plan de alimentación de un caballo."""
    return db.query(PlanAlimentacion).filter(
        PlanAlimentacion.caballo_id == caballo_id
    ).first()


def crear(db: Session, plan_data: PlanAlimentacionCreate, usuario_id: UUID) -> PlanAlimentacion:
    """Crea un plan de alimentación para un caballo."""
    db_plan = PlanAlimentacion(
        **plan_data.model_dump(),
        updated_by=usuario_id
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def actualizar(
    db: Session,
    caballo_id: UUID,
    plan_update: PlanAlimentacionUpdate,
    usuario_id: UUID
) -> Optional[PlanAlimentacion]:
    """Actualiza el plan de alimentación de un caballo."""
    db_plan = obtener_por_caballo(db, caballo_id)
    if not db_plan:
        return None

    update_data = plan_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_plan, field, value)

    db_plan.updated_by = usuario_id
    db.commit()
    db.refresh(db_plan)
    return db_plan


def eliminar(db: Session, caballo_id: UUID) -> Optional[PlanAlimentacion]:
    """Elimina el plan de alimentación de un caballo."""
    db_plan = obtener_por_caballo(db, caballo_id)
    if db_plan:
        db.delete(db_plan)
        db.commit()
    return db_plan
