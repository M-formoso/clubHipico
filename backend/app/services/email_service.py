import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from typing import List, Optional
import asyncio

from app.core.config import settings

# Setup Jinja2 environment for email templates
template_dir = Path(__file__).parent.parent / "templates" / "emails"
template_dir.mkdir(parents=True, exist_ok=True)

jinja_env = Environment(
    loader=FileSystemLoader(str(template_dir)),
    autoescape=select_autoescape(['html', 'xml'])
)


async def enviar_email(
    destinatario: str,
    asunto: str,
    contenido_html: str,
    contenido_texto: Optional[str] = None
) -> bool:
    """
    Envía un email usando SMTP configurado.

    Args:
        destinatario: Email del destinatario
        asunto: Asunto del email
        contenido_html: Contenido en HTML
        contenido_texto: Contenido en texto plano (opcional)

    Returns:
        bool: True si se envió correctamente, False en caso contrario
    """
    try:
        # Crear mensaje
        message = MIMEMultipart('alternative')
        message['Subject'] = asunto
        message['From'] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        message['To'] = destinatario

        # Agregar versión texto plano si existe
        if contenido_texto:
            part_texto = MIMEText(contenido_texto, 'plain', 'utf-8')
            message.attach(part_texto)

        # Agregar versión HTML
        part_html = MIMEText(contenido_html, 'html', 'utf-8')
        message.attach(part_html)

        # Enviar email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True
        )

        return True

    except Exception as e:
        print(f"Error enviando email a {destinatario}: {e}")
        return False


async def enviar_emails_multiples(
    destinatarios: List[str],
    asunto: str,
    contenido_html: str,
    contenido_texto: Optional[str] = None
) -> dict:
    """
    Envía el mismo email a múltiples destinatarios.

    Args:
        destinatarios: Lista de emails
        asunto: Asunto del email
        contenido_html: Contenido en HTML
        contenido_texto: Contenido en texto plano (opcional)

    Returns:
        dict: {"exitosos": int, "fallidos": int}
    """
    tareas = [
        enviar_email(dest, asunto, contenido_html, contenido_texto)
        for dest in destinatarios
    ]

    resultados = await asyncio.gather(*tareas, return_exceptions=True)

    exitosos = sum(1 for r in resultados if r is True)
    fallidos = len(resultados) - exitosos

    return {"exitosos": exitosos, "fallidos": fallidos}


def renderizar_template(nombre_template: str, **contexto) -> str:
    """
    Renderiza un template de Jinja2 con el contexto proporcionado.

    Args:
        nombre_template: Nombre del archivo de template (ej: "bienvenida.html")
        **contexto: Variables para el template

    Returns:
        str: HTML renderizado
    """
    try:
        template = jinja_env.get_template(nombre_template)
        return template.render(**contexto)
    except Exception as e:
        print(f"Error renderizando template {nombre_template}: {e}")
        # Retornar un template básico en caso de error
        return f"""
        <html>
            <body>
                <h1>{contexto.get('titulo', 'Notificación')}</h1>
                <p>{contexto.get('mensaje', 'Este es un mensaje del Sistema Club Hípico.')}</p>
            </body>
        </html>
        """


# ============================================================================
# FUNCIONES ESPECÍFICAS POR TIPO DE EMAIL
# ============================================================================

async def enviar_email_bienvenida(email: str, nombre: str) -> bool:
    """Envía email de bienvenida a un nuevo usuario."""
    asunto = f"Bienvenido al Sistema Club Hípico, {nombre}"

    contenido_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4a5568;">¡Bienvenido al Club Hípico!</h1>
                <p>Hola <strong>{nombre}</strong>,</p>
                <p>Tu cuenta ha sido creada exitosamente en nuestro sistema.</p>
                <p>Ya puedes acceder a todas las funcionalidades disponibles según tu rol.</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f7fafc; border-left: 4px solid #4299e1;">
                    <p style="margin: 0;"><strong>¿Necesitas ayuda?</strong></p>
                    <p style="margin: 5px 0 0 0;">Contacta al administrador del sistema para cualquier consulta.</p>
                </div>
                <p>Saludos cordiales,<br>
                <strong>Equipo Club Hípico</strong></p>
            </div>
        </body>
    </html>
    """

    contenido_texto = f"""
    ¡Bienvenido al Club Hípico!

    Hola {nombre},

    Tu cuenta ha sido creada exitosamente en nuestro sistema.
    Ya puedes acceder a todas las funcionalidades disponibles según tu rol.

    ¿Necesitas ayuda?
    Contacta al administrador del sistema para cualquier consulta.

    Saludos cordiales,
    Equipo Club Hípico
    """

    return await enviar_email(email, asunto, contenido_html, contenido_texto)


async def enviar_email_alerta(
    email: str,
    titulo: str,
    mensaje: str,
    prioridad: str = "media",
    tipo: str = "general"
) -> bool:
    """Envía email de alerta a un usuario."""
    asunto = f"🔔 Alerta: {titulo}"

    # Definir color según prioridad
    colores = {
        "baja": "#48bb78",
        "media": "#ed8936",
        "alta": "#f56565",
        "critica": "#c53030"
    }
    color = colores.get(prioridad, "#4299e1")

    contenido_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: {color}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
                    <h2 style="margin: 0;">🔔 Nueva Alerta</h2>
                </div>
                <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
                    <h3 style="color: #2d3748; margin-top: 0;">{titulo}</h3>
                    <p style="font-size: 16px;">{mensaje}</p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
                        <p style="margin: 0; font-size: 14px; color: #718096;">
                            <strong>Prioridad:</strong> <span style="text-transform: capitalize;">{prioridad}</span><br>
                            <strong>Tipo:</strong> <span style="text-transform: capitalize;">{tipo}</span>
                        </p>
                    </div>
                    <p style="font-size: 14px; color: #718096;">
                        Puedes ver más detalles ingresando al sistema.
                    </p>
                </div>
                <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">
                    Equipo Club Hípico
                </p>
            </div>
        </body>
    </html>
    """

    contenido_texto = f"""
    🔔 NUEVA ALERTA

    {titulo}

    {mensaje}

    Prioridad: {prioridad}
    Tipo: {tipo}

    Puedes ver más detalles ingresando al sistema.

    Equipo Club Hípico
    """

    return await enviar_email(email, asunto, contenido_html, contenido_texto)


async def enviar_email_pago_vencido(
    email: str,
    nombre_cliente: str,
    concepto: str,
    monto: float,
    dias_vencido: int
) -> bool:
    """Envía email recordatorio de pago vencido."""
    asunto = f"Recordatorio: Pago Vencido - {concepto}"

    contenido_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #c53030;">💰 Recordatorio de Pago Vencido</h2>
                <p>Estimado/a <strong>{nombre_cliente}</strong>,</p>
                <p>Le recordamos que tiene un pago pendiente:</p>
                <div style="margin: 20px 0; padding: 20px; background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 5px;">
                    <p style="margin: 0;"><strong>Concepto:</strong> {concepto}</p>
                    <p style="margin: 10px 0;"><strong>Monto:</strong> <span style="font-size: 24px; color: #c53030;">${monto:.2f}</span></p>
                    <p style="margin: 10px 0 0 0;"><strong>Días de vencimiento:</strong> {dias_vencido} días</p>
                </div>
                <p>Por favor, regularice su situación a la brevedad posible.</p>
                <p>Para realizar el pago o consultar cualquier duda, puede contactarse con administración.</p>
                <p style="margin-top: 30px;">Saludos cordiales,<br>
                <strong>Administración Club Hípico</strong></p>
            </div>
        </body>
    </html>
    """

    contenido_texto = f"""
    💰 RECORDATORIO DE PAGO VENCIDO

    Estimado/a {nombre_cliente},

    Le recordamos que tiene un pago pendiente:

    Concepto: {concepto}
    Monto: ${monto:.2f}
    Días de vencimiento: {dias_vencido} días

    Por favor, regularice su situación a la brevedad posible.

    Para realizar el pago o consultar cualquier duda, puede contactarse con administración.

    Saludos cordiales,
    Administración Club Hípico
    """

    return await enviar_email(email, asunto, contenido_html, contenido_texto)


async def enviar_email_recordatorio_evento(
    email: str,
    nombre_cliente: str,
    titulo_evento: str,
    fecha_evento: str,
    hora_evento: str,
    ubicacion: str = "Por definir"
) -> bool:
    """Envía email recordatorio de evento."""
    asunto = f"Recordatorio: {titulo_evento}"

    contenido_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4299e1;">📅 Recordatorio de Evento</h2>
                <p>Hola <strong>{nombre_cliente}</strong>,</p>
                <p>Te recordamos que tienes un evento programado:</p>
                <div style="margin: 20px 0; padding: 20px; background-color: #ebf8ff; border-left: 4px solid #4299e1; border-radius: 5px;">
                    <h3 style="margin: 0 0 15px 0; color: #2c5282;">{titulo_evento}</h3>
                    <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> {fecha_evento}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> {hora_evento}</p>
                    <p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> {ubicacion}</p>
                </div>
                <p>¡Te esperamos!</p>
                <p style="margin-top: 30px;">Saludos cordiales,<br>
                <strong>Equipo Club Hípico</strong></p>
            </div>
        </body>
    </html>
    """

    contenido_texto = f"""
    📅 RECORDATORIO DE EVENTO

    Hola {nombre_cliente},

    Te recordamos que tienes un evento programado:

    {titulo_evento}

    Fecha: {fecha_evento}
    Hora: {hora_evento}
    Ubicación: {ubicacion}

    ¡Te esperamos!

    Saludos cordiales,
    Equipo Club Hípico
    """

    return await enviar_email(email, asunto, contenido_html, contenido_texto)
