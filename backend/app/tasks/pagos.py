from celery import shared_task
from app.db.session import SessionLocal
from app.services import pago_service
import logging

logger = logging.getLogger(__name__)


@shared_task
def actualizar_pagos_vencidos():
    """
    Tarea que se ejecuta diariamente para actualizar pagos pendientes
    que han pasado su fecha de vencimiento a estado VENCIDO.
    """
    db = SessionLocal()
    try:
        count = pago_service.actualizar_pagos_vencidos(db)
        logger.info(f"Actualizar pagos vencidos: {count} pagos actualizados")
        return {"success": True, "pagos_actualizados": count}
    except Exception as e:
        logger.error(f"Error actualizando pagos vencidos: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        db.close()
