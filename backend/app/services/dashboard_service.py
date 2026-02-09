from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import date, datetime, timedelta
from typing import Dict, Any, List

from app.models.caballo import Caballo, EstadoCaballoEnum
from app.models.cliente import Cliente, EstadoCuentaEnum
from app.models.empleado import Empleado
from app.models.evento import Evento, InscripcionEvento, EstadoEventoEnum
from app.models.pago import Pago, EstadoPagoEnum
from app.models.alerta import Alerta


def obtener_estadisticas_generales(db: Session) -> Dict[str, Any]:
    """
    Obtiene estadísticas generales del sistema.

    Returns:
        Dict con contadores generales
    """
    return {
        "total_caballos": db.query(Caballo).filter(Caballo.estado == EstadoCaballoEnum.ACTIVO).count(),
        "total_clientes": db.query(Cliente).filter(Cliente.activo == True).count(),
        "total_empleados": db.query(Empleado).filter(Empleado.activo == True).count(),
        "total_eventos_mes": db.query(Evento).filter(
            and_(
                Evento.fecha_inicio >= date.today().replace(day=1),
                Evento.fecha_inicio < (date.today().replace(day=1) + timedelta(days=32)).replace(day=1)
            )
        ).count(),
    }


def obtener_estadisticas_pagos(db: Session) -> Dict[str, Any]:
    """
    Obtiene estadísticas sobre pagos.

    Returns:
        Dict con estadísticas de pagos
    """
    # Pagos del mes actual
    inicio_mes = date.today().replace(day=1)
    fin_mes = (inicio_mes + timedelta(days=32)).replace(day=1)

    pagos_mes = db.query(Pago).filter(
        and_(
            Pago.created_at >= inicio_mes,
            Pago.created_at < fin_mes
        )
    ).all()

    # Calcular totales
    total_mes = sum(float(p.monto) for p in pagos_mes if p.estado == EstadoPagoEnum.PAGADO)
    pendiente_mes = sum(float(p.monto) for p in pagos_mes if p.estado == EstadoPagoEnum.PENDIENTE)

    # Pagos vencidos
    pagos_vencidos = db.query(Pago).filter(
        and_(
            Pago.fecha_vencimiento < date.today(),
            Pago.estado.in_([EstadoPagoEnum.PENDIENTE, EstadoPagoEnum.VENCIDO])
        )
    ).count()

    return {
        "total_cobrado_mes": total_mes,
        "total_pendiente_mes": pendiente_mes,
        "cantidad_pagos_mes": len(pagos_mes),
        "cantidad_pagos_vencidos": pagos_vencidos,
    }


def obtener_estadisticas_clientes(db: Session) -> Dict[str, Any]:
    """
    Obtiene estadísticas sobre clientes.

    Returns:
        Dict con estadísticas de clientes
    """
    # Clientes por estado de cuenta
    clientes_al_dia = db.query(Cliente).filter(
        and_(
            Cliente.activo == True,
            Cliente.estado_cuenta == EstadoCuentaEnum.AL_DIA
        )
    ).count()

    clientes_morosos = db.query(Cliente).filter(
        and_(
            Cliente.activo == True,
            Cliente.estado_cuenta == EstadoCuentaEnum.MOROSO
        )
    ).count()

    clientes_debe = db.query(Cliente).filter(
        and_(
            Cliente.activo == True,
            Cliente.estado_cuenta == EstadoCuentaEnum.DEBE
        )
    ).count()

    return {
        "clientes_al_dia": clientes_al_dia,
        "clientes_morosos": clientes_morosos,
        "clientes_debe": clientes_debe,
    }


def obtener_estadisticas_eventos(db: Session) -> Dict[str, Any]:
    """
    Obtiene estadísticas sobre eventos.

    Returns:
        Dict con estadísticas de eventos
    """
    hoy = date.today()
    fin_semana = hoy + timedelta(days=7)

    # Eventos de esta semana
    eventos_semana = db.query(Evento).filter(
        and_(
            Evento.fecha_inicio >= hoy,
            Evento.fecha_inicio <= fin_semana,
            Evento.estado == EstadoEventoEnum.PROGRAMADO
        )
    ).count()

    # Eventos hoy
    eventos_hoy = db.query(Evento).filter(
        and_(
            func.date(Evento.fecha_inicio) == hoy,
            Evento.estado == EstadoEventoEnum.PROGRAMADO
        )
    ).count()

    return {
        "eventos_hoy": eventos_hoy,
        "eventos_semana": eventos_semana,
    }


def obtener_alertas_recientes(db: Session, usuario_id: str, limite: int = 5) -> List[Dict[str, Any]]:
    """
    Obtiene las alertas más recientes de un usuario.

    Args:
        db: Sesión de base de datos
        usuario_id: ID del usuario
        limite: Cantidad máxima de alertas a retornar

    Returns:
        Lista de alertas
    """
    alertas = db.query(Alerta).filter(
        Alerta.usuario_id == usuario_id
    ).order_by(Alerta.created_at.desc()).limit(limite).all()

    return [
        {
            "id": str(alerta.id),
            "tipo": alerta.tipo.value,
            "prioridad": alerta.prioridad.value,
            "titulo": alerta.titulo,
            "mensaje": alerta.mensaje,
            "leida": alerta.leida,
            "fecha_evento": alerta.fecha_evento.isoformat() if alerta.fecha_evento else None,
            "created_at": alerta.created_at.isoformat(),
        }
        for alerta in alertas
    ]


def obtener_proximos_eventos(db: Session, limite: int = 5) -> List[Dict[str, Any]]:
    """
    Obtiene los próximos eventos programados.

    Args:
        db: Sesión de base de datos
        limite: Cantidad máxima de eventos a retornar

    Returns:
        Lista de eventos
    """
    eventos = db.query(Evento).filter(
        and_(
            Evento.fecha_inicio >= datetime.now(),
            Evento.estado == EstadoEventoEnum.PROGRAMADO
        )
    ).order_by(Evento.fecha_inicio).limit(limite).all()

    return [
        {
            "id": str(evento.id),
            "titulo": evento.titulo,
            "tipo": evento.tipo.value,
            "fecha_inicio": evento.fecha_inicio.isoformat(),
            "fecha_fin": evento.fecha_fin.isoformat(),
            "ubicacion": evento.ubicacion,
            "capacidad_maxima": evento.capacidad_maxima,
            "inscritos": db.query(InscripcionEvento).filter(
                InscripcionEvento.evento_id == evento.id
            ).count(),
        }
        for evento in eventos
    ]


def obtener_pagos_pendientes_criticos(db: Session, limite: int = 5) -> List[Dict[str, Any]]:
    """
    Obtiene los pagos pendientes más críticos (más vencidos).

    Args:
        db: Sesión de base de datos
        limite: Cantidad máxima de pagos a retornar

    Returns:
        Lista de pagos
    """
    pagos = db.query(Pago).filter(
        and_(
            Pago.fecha_vencimiento < date.today(),
            Pago.estado.in_([EstadoPagoEnum.PENDIENTE, EstadoPagoEnum.VENCIDO])
        )
    ).order_by(Pago.fecha_vencimiento).limit(limite).all()

    return [
        {
            "id": str(pago.id),
            "concepto": pago.concepto,
            "monto": float(pago.monto),
            "fecha_vencimiento": pago.fecha_vencimiento.isoformat(),
            "dias_vencido": (date.today() - pago.fecha_vencimiento).days,
            "cliente": {
                "id": str(pago.cliente.id),
                "nombre": f"{pago.cliente.nombre} {pago.cliente.apellido}",
            } if pago.cliente else None,
        }
        for pago in pagos
    ]


def obtener_dashboard_completo(db: Session, usuario_id: str) -> Dict[str, Any]:
    """
    Obtiene todos los datos del dashboard en una sola consulta.

    Args:
        db: Sesión de base de datos
        usuario_id: ID del usuario actual

    Returns:
        Dict con todos los datos del dashboard
    """
    return {
        "estadisticas_generales": obtener_estadisticas_generales(db),
        "estadisticas_pagos": obtener_estadisticas_pagos(db),
        "estadisticas_clientes": obtener_estadisticas_clientes(db),
        "estadisticas_eventos": obtener_estadisticas_eventos(db),
        "alertas_recientes": obtener_alertas_recientes(db, usuario_id),
        "proximos_eventos": obtener_proximos_eventos(db),
        "pagos_criticos": obtener_pagos_pendientes_criticos(db),
    }
