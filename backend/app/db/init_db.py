from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.usuario import Usuario, RolEnum
from app.models.configuracion import Configuracion
import uuid


def init_db(db: Session) -> None:
    """
    Inicializa la base de datos con datos por defecto.

    Args:
        db: Sesión de base de datos
    """

    # Verificar si ya existe un super admin
    super_admin = db.query(Usuario).filter(Usuario.rol == RolEnum.SUPER_ADMIN).first()

    if not super_admin:
        # Crear super admin por defecto
        super_admin = Usuario(
            email="admin@clubecuestre.com",
            password_hash=get_password_hash("admin123"),  # CAMBIAR EN PRODUCCIÓN
            rol=RolEnum.SUPER_ADMIN,
            activo=True
        )
        db.add(super_admin)
        db.commit()
        print("✅ Super Admin creado: admin@clubecuestre.com / admin123")

    # Configuraciones por defecto
    configuraciones_default = [
        {
            "clave": "precios_servicios",
            "valor": {
                "pension_mensual": 150000,
                "clase_individual": 30000,
                "clase_grupal": 20000,
                "salida_campo": 25000
            },
            "descripcion": "Precios de los servicios del club"
        },
        {
            "clave": "datos_club",
            "valor": {
                "nombre": "Club Ecuestre",
                "direccion": "",
                "telefono": "",
                "email": "info@clubecuestre.com",
                "horario": "Lunes a Domingo 8:00 - 18:00"
            },
            "descripcion": "Datos generales del club"
        },
        {
            "clave": "notificaciones_email",
            "valor": {
                "alertas_vacunas": True,
                "alertas_pagos": True,
                "alertas_eventos": True,
                "recordatorios_clases": True
            },
            "descripcion": "Configuración de notificaciones por email"
        }
    ]

    for config_data in configuraciones_default:
        config_existe = db.query(Configuracion).filter(
            Configuracion.clave == config_data["clave"]
        ).first()

        if not config_existe:
            config = Configuracion(**config_data)
            db.add(config)

    db.commit()
    print("✅ Configuraciones iniciales creadas")
