from celery import shared_task
from app.core.config import settings
from app.services import email_service
import asyncio


def run_async(coro):
    """Helper para ejecutar funciones async en Celery"""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)


@shared_task
def enviar_email_bienvenida(email: str, nombre: str):
    """Envía email de bienvenida a un nuevo usuario."""
    try:
        resultado = run_async(email_service.enviar_email_bienvenida(email, nombre))
        if resultado:
            return f"Email de bienvenida enviado a {email}"
        else:
            return f"Error enviando email a {email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task
def enviar_email_alerta(
    email: str,
    titulo: str,
    mensaje: str,
    prioridad: str = "media",
    tipo: str = "general"
):
    """Envía email de alerta a un usuario."""
    try:
        resultado = run_async(
            email_service.enviar_email_alerta(email, titulo, mensaje, prioridad, tipo)
        )
        if resultado:
            return f"Email de alerta enviado a {email}"
        else:
            return f"Error enviando email a {email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task
def enviar_email_pago_vencido(
    email: str,
    nombre_cliente: str,
    concepto: str,
    monto: float,
    dias_vencido: int
):
    """Envía email recordatorio de pago vencido."""
    try:
        resultado = run_async(
            email_service.enviar_email_pago_vencido(
                email, nombre_cliente, concepto, monto, dias_vencido
            )
        )
        if resultado:
            return f"Recordatorio de pago enviado a {email}"
        else:
            return f"Error enviando email a {email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task
def enviar_email_recordatorio_evento(
    email: str,
    nombre_cliente: str,
    titulo_evento: str,
    fecha_evento: str,
    hora_evento: str,
    ubicacion: str = "Por definir"
):
    """Envía email recordatorio de evento."""
    try:
        resultado = run_async(
            email_service.enviar_email_recordatorio_evento(
                email, nombre_cliente, titulo_evento,
                fecha_evento, hora_evento, ubicacion
            )
        )
        if resultado:
            return f"Recordatorio de evento enviado a {email}"
        else:
            return f"Error enviando email a {email}"
    except Exception as e:
        return f"Error: {str(e)}"
