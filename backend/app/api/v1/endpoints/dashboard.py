from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.models.usuario import Usuario
from app.services import dashboard_service

router = APIRouter()


@router.get("/")
async def obtener_dashboard(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene todos los datos del dashboard incluyendo:
    - Estadísticas generales (caballos, clientes, empleados, eventos)
    - Estadísticas de pagos (cobrado, pendiente, vencidos)
    - Estadísticas de clientes (al día, morosos, debe)
    - Estadísticas de eventos (hoy, esta semana)
    - Alertas recientes del usuario
    - Próximos eventos
    - Pagos críticos (más vencidos)
    """
    return dashboard_service.obtener_dashboard_completo(db, str(current_user.id))


@router.get("/estadisticas/generales")
async def obtener_estadisticas_generales(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene estadísticas generales del sistema:
    - Total de caballos activos
    - Total de clientes activos
    - Total de empleados activos
    - Total de eventos del mes
    """
    return dashboard_service.obtener_estadisticas_generales(db)


@router.get("/estadisticas/pagos")
async def obtener_estadisticas_pagos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene estadísticas sobre pagos:
    - Total cobrado este mes
    - Total pendiente este mes
    - Cantidad de pagos del mes
    - Cantidad de pagos vencidos
    """
    return dashboard_service.obtener_estadisticas_pagos(db)


@router.get("/estadisticas/clientes")
async def obtener_estadisticas_clientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene estadísticas sobre clientes:
    - Clientes al día
    - Clientes morosos
    - Clientes que deben
    """
    return dashboard_service.obtener_estadisticas_clientes(db)


@router.get("/estadisticas/eventos")
async def obtener_estadisticas_eventos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene estadísticas sobre eventos:
    - Eventos hoy
    - Eventos esta semana
    """
    return dashboard_service.obtener_estadisticas_eventos(db)


@router.get("/proximos-eventos")
async def obtener_proximos_eventos(
    limite: int = 5,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene los próximos eventos programados.

    Args:
        limite: Cantidad máxima de eventos a retornar (default: 5)
    """
    return dashboard_service.obtener_proximos_eventos(db, limite)


@router.get("/pagos-criticos")
async def obtener_pagos_criticos(
    limite: int = 5,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene los pagos pendientes más críticos (más vencidos).

    Args:
        limite: Cantidad máxima de pagos a retornar (default: 5)
    """
    return dashboard_service.obtener_pagos_pendientes_criticos(db, limite)
