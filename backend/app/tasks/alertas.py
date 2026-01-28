from celery import shared_task
from app.db.session import SessionLocal
from app.services import historial_medico_service, pago_service, evento_service, alerta_service
from app.schemas.alerta import AlertaCreate
from app.models.alerta import TipoAlertaEnum, PrioridadAlertaEnum
from datetime import date, timedelta


@shared_task
def verificar_vacunas_vencidas():
    """
    Tarea que se ejecuta diariamente para verificar vacunas próximas a vencer
    y crear alertas para los administradores.
    """
    db = SessionLocal()
    try:
        # Obtener vacunas que vencen en los próximos 7 días
        vacunas_proximas = historial_medico_service.obtener_proximas_vacunas(db, dias=7)

        for vacuna in vacunas_proximas:
            # Verificar si ya existe una alerta para esta vacuna
            alerta_data = AlertaCreate(
                tipo=TipoAlertaEnum.VACUNA,
                prioridad=PrioridadAlertaEnum.ALTA,
                titulo=f"Vacuna próxima a vencer - {vacuna.caballo.nombre}",
                mensaje=f"La vacuna '{vacuna.descripcion or vacuna.medicamento}' del caballo {vacuna.caballo.nombre} vence el {vacuna.proxima_aplicacion}",
                fecha_evento=vacuna.proxima_aplicacion,
                entidad_relacionada_tipo="caballo",
                entidad_relacionada_id=vacuna.caballo_id
            )

            # Crear alerta para todos los administradores
            alerta_service.crear_para_admins(db, alerta_data)

        db.commit()
        return f"Procesadas {len(vacunas_proximas)} vacunas próximas a vencer"

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
        # Obtener herrajes que vencen en los próximos 7 días
        herrajes_proximos = historial_medico_service.obtener_proximos_herrajes(db, dias=7)

        for herraje in herrajes_proximos:
            alerta_data = AlertaCreate(
                tipo=TipoAlertaEnum.HERRAJE,
                prioridad=PrioridadAlertaEnum.MEDIA,
                titulo=f"Herraje próximo - {herraje.caballo.nombre}",
                mensaje=f"El herraje del caballo {herraje.caballo.nombre} debe realizarse el {herraje.proxima_aplicacion}",
                fecha_evento=herraje.proxima_aplicacion,
                entidad_relacionada_tipo="caballo",
                entidad_relacionada_id=herraje.caballo_id
            )

            alerta_service.crear_para_admins(db, alerta_data)

        db.commit()
        return f"Procesados {len(herrajes_proximos)} herrajes pendientes"

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
        # Obtener pagos vencidos
        pagos_vencidos = pago_service.obtener_pagos_vencidos(db)

        for pago in pagos_vencidos:
            dias_vencido = (date.today() - pago.fecha_vencimiento).days

            # Determinar prioridad según días de vencimiento
            if dias_vencido > 30:
                prioridad = PrioridadAlertaEnum.CRITICA
            elif dias_vencido > 15:
                prioridad = PrioridadAlertaEnum.ALTA
            else:
                prioridad = PrioridadAlertaEnum.MEDIA

            alerta_data = AlertaCreate(
                tipo=TipoAlertaEnum.PAGO,
                prioridad=prioridad,
                titulo=f"Pago vencido - {pago.cliente.nombre} {pago.cliente.apellido}",
                mensaje=f"Pago de '{pago.concepto}' por ${pago.monto} vencido hace {dias_vencido} días",
                fecha_evento=pago.fecha_vencimiento,
                entidad_relacionada_tipo="pago",
                entidad_relacionada_id=pago.id
            )

            alerta_service.crear_para_admins(db, alerta_data)

        db.commit()
        return f"Procesados {len(pagos_vencidos)} pagos vencidos"

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
        # Obtener eventos de mañana (próximas 24 horas)
        eventos_proximos = evento_service.obtener_eventos_proximos(db, dias=1)

        for evento in eventos_proximos:
            # Obtener inscripciones confirmadas
            inscripciones = evento_service.obtener_inscripciones_evento(db, evento.id)

            for inscripcion in inscripciones:
                if inscripcion.cliente.usuario_id:
                    alerta_data = AlertaCreate(
                        tipo=TipoAlertaEnum.EVENTO,
                        prioridad=PrioridadAlertaEnum.MEDIA,
                        titulo=f"Recordatorio: {evento.titulo}",
                        mensaje=f"Tienes un evento programado mañana a las {evento.fecha_inicio.strftime('%H:%M')}. Ubicación: {evento.ubicacion or 'Por definir'}",
                        fecha_evento=evento.fecha_inicio.date(),
                        entidad_relacionada_tipo="evento",
                        entidad_relacionada_id=evento.id,
                        usuario_id=inscripcion.cliente.usuario_id
                    )

                    alerta_service.crear(db, alerta_data)

        db.commit()
        return f"Enviados recordatorios para {len(eventos_proximos)} eventos"

    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()
