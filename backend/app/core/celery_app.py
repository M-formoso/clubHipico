from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "club_ecuestre",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.alertas",
        "app.tasks.emails",
        "app.tasks.reportes",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
)

# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    # Verificar vacunas vencidas - Todos los días a las 8 AM
    "verificar-vacunas-diario": {
        "task": "app.tasks.alertas.verificar_vacunas_vencidas",
        "schedule": crontab(hour=8, minute=0),
    },
    # Verificar herrajes pendientes - Todos los días a las 8 AM
    "verificar-herrajes-diario": {
        "task": "app.tasks.alertas.verificar_herrajes_pendientes",
        "schedule": crontab(hour=8, minute=0),
    },
    # Verificar pagos vencidos - Todos los días a las 9 AM
    "verificar-pagos-vencidos-diario": {
        "task": "app.tasks.alertas.verificar_pagos_vencidos",
        "schedule": crontab(hour=9, minute=0),
    },
    # Recordatorios de eventos - Todos los días a las 10 AM
    "recordatorios-eventos-diario": {
        "task": "app.tasks.alertas.enviar_recordatorios_eventos",
        "schedule": crontab(hour=10, minute=0),
    },
}
