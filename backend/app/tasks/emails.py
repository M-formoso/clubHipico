from celery import shared_task
from app.core.config import settings


@shared_task
def enviar_email_bienvenida(email: str, nombre: str):
    """
    Envía email de bienvenida a un nuevo usuario.
    TODO: Implementar con aiosmtplib
    """
    # Placeholder para implementación futura
    print(f"Enviando email de bienvenida a {email}")
    return f"Email enviado a {email}"


@shared_task
def enviar_email_alerta(email: str, titulo: str, mensaje: str):
    """
    Envía email de alerta a un usuario.
    TODO: Implementar con aiosmtplib
    """
    # Placeholder para implementación futura
    print(f"Enviando alerta por email a {email}: {titulo}")
    return f"Alerta enviada a {email}"


@shared_task
def enviar_email_pago_vencido(email: str, concepto: str, monto: float):
    """
    Envía email recordatorio de pago vencido.
    TODO: Implementar con aiosmtplib
    """
    # Placeholder para implementación futura
    print(f"Enviando recordatorio de pago a {email}: {concepto} - ${monto}")
    return f"Recordatorio enviado a {email}"
