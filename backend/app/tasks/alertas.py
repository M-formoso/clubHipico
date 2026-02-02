from celery import shared_task
from app.db.session import SessionLocal
from app.services import pago_service, evento_service, alerta_service
from app.services import caballo_service
from app.schemas.alerta import AlertaCreate
from app.models.alerta import TipoAlertaEnum, PrioridadAlertaEnum
from app.models.pago import EstadoPagoEnum
from datetime import date, datetime, timedelta
from sqlalchemy import and_


@shared_task
def verificar_vacunas_vencidas():
    """
    Tarea que se ejecuta diariamente para verificar vacunas próximas a vencer
    y crear alertas para los administradores.
    """
    db = SessionLocal()
    try:
        from app.models.caballo import VacunaRegistro

        # Obtener vacunas que vencen en los próximos 7 días
        fecha_limite = date.today() + timedelta(days=7)
        vacunas_proximas = db.query(VacunaRegistro).filter(
            and_(
                VacunaRegistro.proxima_aplicacion.isnot(None),
                VacunaRegistro.proxima_aplicacion <= fecha_limite,
                VacunaRegistro.proxima_aplicacion >= date.today()
            )
        ).all()

        alertas_creadas = 0
        for vacuna in vacunas_proximas:
            try:
                alerta_data = AlertaCreate(
                    tipo=TipoAlertaEnum.VACUNA,
                    prioridad=PrioridadAlertaEnum.ALTA,
                    titulo=f"Vacuna próxima a vencer - {vacuna.caballo.nombre if vacuna.caballo else 'Caballo'}",
                    mensaje=f"La vacuna '{vacuna.tipo or 'Vacuna'}' vence el {vacuna.proxima_aplicacion.strftime('%d/%m/%Y')}",
                    fecha_evento=datetime.combine(vacuna.proxima_aplicacion, datetime.min.time()),
                    entidad_relacionada_tipo="caballo",
                    entidad_relacionada_id=vacuna.caballo_id
                )

                # Crear alerta para todos los administradores
                alerta_service.crear_para_admins(db, alerta_data)
                alertas_creadas += 1
            except Exception as e:
                print(f"Error creando alerta para vacuna {vacuna.id}: {e}")
                continue

        db.commit()
        return f"Procesadas {len(vacunas_proximas)} vacunas, creadas {alertas_creadas} alertas"

    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()


@shared_task
def verificar_herrajes_pendientes():
    """
    Tarea que se ejecuta diariamente para verificar herrajes pendientes
    y crear alertas para los administradores.
    """
    db = SessionLocal()
    try:
        from app.models.caballo import HerrjeRegistro

        # Obtener herrajes que vencen en los próximos 3 días
        fecha_limite = date.today() + timedelta(days=3)
        herrajes_proximos = db.query(HerrjeRegistro).filter(
            and_(
                HerrjeRegistro.proxima_fecha.isnot(None),
                HerrjeRegistro.proxima_fecha <= fecha_limite,
                HerrjeRegistro.proxima_fecha >= date.today()
            )
        ).all()

        alertas_creadas = 0
        for herraje in herrajes_proximos:
            try:
                alerta_data = AlertaCreate(
                    tipo=TipoAlertaEnum.HERRAJE,
                    prioridad=PrioridadAlertaEnum.MEDIA,
                    titulo=f"Herraje próximo - {herraje.caballo.nombre if herraje.caballo else 'Caballo'}",
                    mensaje=f"El herraje debe realizarse el {herraje.proxima_fecha.strftime('%d/%m/%Y')}",
                    fecha_evento=datetime.combine(herraje.proxima_fecha, datetime.min.time()),
                    entidad_relacionada_tipo="caballo",
                    entidad_relacionada_id=herraje.caballo_id
                )

                alerta_service.crear_para_admins(db, alerta_data)
                alertas_creadas += 1
            except Exception as e:
                print(f"Error creando alerta para herraje {herraje.id}: {e}")
                continue

        db.commit()
        return f"Procesados {len(herrajes_proximos)} herrajes, creadas {alertas_creadas} alertas"

    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()


@shared_task
def verificar_pagos_vencidos():
    """
    Tarea que se ejecuta diariamente para verificar pagos vencidos
    y crear alertas para los administradores.
    """
    db = SessionLocal()
    try:
        from app.models.pago import Pago

        # Obtener pagos vencidos o pendientes
        pagos_vencidos = db.query(Pago).filter(
            and_(
                Pago.fecha_vencimiento.isnot(None),
                Pago.fecha_vencimiento < date.today(),
                Pago.estado.in_([EstadoPagoEnum.PENDIENTE, EstadoPagoEnum.VENCIDO])
            )
        ).all()

        alertas_creadas = 0
        for pago in pagos_vencidos:
            try:
                dias_vencido = (date.today() - pago.fecha_vencimiento).days

                # Determinar prioridad según días de vencimiento
                if dias_vencido > 30:
                    prioridad = PrioridadAlertaEnum.CRITICA
                elif dias_vencido > 15:
                    prioridad = PrioridadAlertaEnum.ALTA
                else:
                    prioridad = PrioridadAlertaEnum.MEDIA

                cliente_nombre = f"{pago.cliente.nombre} {pago.cliente.apellido}" if pago.cliente else "Cliente"

                alerta_data = AlertaCreate(
                    tipo=TipoAlertaEnum.PAGO,
                    prioridad=prioridad,
                    titulo=f"Pago vencido - {cliente_nombre}",
                    mensaje=f"Pago de '{pago.concepto}' por ${pago.monto} vencido hace {dias_vencido} días",
                    fecha_evento=datetime.combine(pago.fecha_vencimiento, datetime.min.time()),
                    entidad_relacionada_tipo="pago",
                    entidad_relacionada_id=pago.id
                )

                alerta_service.crear_para_admins(db, alerta_data)
                alertas_creadas += 1
            except Exception as e:
                print(f"Error creando alerta para pago {pago.id}: {e}")
                continue

        db.commit()
        return f"Procesados {len(pagos_vencidos)} pagos vencidos, creadas {alertas_creadas} alertas"

    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()


@shared_task
def enviar_recordatorios_eventos():
    """
    Tarea que se ejecuta diariamente para enviar recordatorios de eventos
    programados para las próximas 24 horas.
    """
    db = SessionLocal()
    try:
        from app.models.evento import Evento, InscripcionEvento, EstadoEventoEnum, EstadoInscripcionEnum

        # Obtener eventos de mañana (próximas 24-48 horas)
        fecha_inicio = datetime.now() + timedelta(hours=24)
        fecha_fin = datetime.now() + timedelta(hours=48)

        eventos_proximos = db.query(Evento).filter(
            and_(
                Evento.fecha_inicio >= fecha_inicio,
                Evento.fecha_inicio <= fecha_fin,
                Evento.estado == EstadoEventoEnum.PROGRAMADO
            )
        ).all()

        alertas_creadas = 0
        for evento in eventos_proximos:
            try:
                # Obtener inscripciones confirmadas
                inscripciones = db.query(InscripcionEvento).filter(
                    and_(
                        InscripcionEvento.evento_id == evento.id,
                        InscripcionEvento.estado == EstadoInscripcionEnum.CONFIRMADO
                    )
                ).all()

                for inscripcion in inscripciones:
                    try:
                        if inscripcion.cliente and inscripcion.cliente.usuario_id:
                            alerta_data = AlertaCreate(
                                tipo=TipoAlertaEnum.EVENTO,
                                prioridad=PrioridadAlertaEnum.MEDIA,
                                titulo=f"Recordatorio: {evento.titulo}",
                                mensaje=f"Tienes un evento programado mañana a las {evento.fecha_inicio.strftime('%H:%M')}. Ubicación: {evento.ubicacion or 'Por definir'}",
                                fecha_evento=evento.fecha_inicio,
                                entidad_relacionada_tipo="evento",
                                entidad_relacionada_id=evento.id,
                                usuario_id=inscripcion.cliente.usuario_id
                            )

                            alerta_service.crear(db, alerta_data)
                            alertas_creadas += 1
                    except Exception as e:
                        print(f"Error creando alerta para inscripción {inscripcion.id}: {e}")
                        continue

            except Exception as e:
                print(f"Error procesando evento {evento.id}: {e}")
                continue

        db.commit()
        return f"Procesados {len(eventos_proximos)} eventos, creadas {alertas_creadas} alertas"

    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()
