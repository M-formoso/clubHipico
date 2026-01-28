from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta

from app.core.deps import get_db, get_current_active_user
from app.models.usuario import Usuario
from app.models.caballo import Caballo, EstadoCaballoEnum
from app.models.cliente import Cliente
from app.models.evento import Evento
from app.models.pago import Pago, EstadoPagoEnum

router = APIRouter()


@router.get("/dashboard")
async def obtener_dashboard(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene estadísticas para el dashboard principal.
    """
    # Contar caballos activos
    total_caballos = db.query(Caballo).filter(
        Caballo.estado == EstadoCaballoEnum.ACTIVO
    ).count()

    # Contar clientes activos
    total_clientes = db.query(Cliente).filter(
        Cliente.activo == True
    ).count()

    # Eventos del mes actual
    hoy = date.today()
    inicio_mes = date(hoy.year, hoy.month, 1)
    if hoy.month == 12:
        fin_mes = date(hoy.year + 1, 1, 1) - timedelta(days=1)
    else:
        fin_mes = date(hoy.year, hoy.month + 1, 1) - timedelta(days=1)

    eventos_mes = db.query(Evento).filter(
        Evento.fecha_inicio >= inicio_mes,
        Evento.fecha_inicio <= fin_mes
    ).count()

    # Pagos pendientes
    pagos_pendientes = db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE
    ).count()

    # Ingresos del mes
    ingresos_mes = db.query(func.sum(Pago.monto)).filter(
        Pago.fecha_pago >= inicio_mes,
        Pago.fecha_pago <= fin_mes,
        Pago.estado == EstadoPagoEnum.PAGADO
    ).scalar() or 0

    return {
        "caballos_activos": total_caballos,
        "clientes_activos": total_clientes,
        "eventos_mes": eventos_mes,
        "pagos_pendientes": pagos_pendientes,
        "ingresos_mes": float(ingresos_mes)
    }
