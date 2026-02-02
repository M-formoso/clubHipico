"""
Script para crear datos iniciales de prueba en la base de datos.
Ejecutar con: python -m app.scripts.create_initial_data
"""

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.usuario import Usuario, RolEnum
from app.models.empleado import Empleado, FuncionEmpleadoEnum
from app.models.cliente import Cliente, TipoClienteEnum, EstadoCuentaEnum
from app.models.alerta import TipoAlertaConfig, TipoAlertaEnum, PrioridadAlertaEnum, FrecuenciaAlertaEnum
from app.core.security import get_password_hash
from datetime import date
import uuid


def _obtener_permisos_por_defecto(rol: RolEnum):
    """Retorna los permisos por defecto según el rol."""
    if rol == RolEnum.SUPER_ADMIN:
        return {
            "dashboard": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "empleados": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "pagos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "usuarios": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "alertas": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "reportes": {"ver": True, "crear": True, "editar": True, "eliminar": True}
        }
    elif rol == RolEnum.ADMIN:
        return {
            "dashboard": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "empleados": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "pagos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "usuarios": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "reportes": {"ver": True, "crear": True, "editar": True, "eliminar": False}
        }
    elif rol == RolEnum.EMPLEADO:
        return {
            "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "empleados": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "pagos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "usuarios": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "reportes": {"ver": True, "crear": False, "editar": False, "eliminar": False}
        }
    else:  # CLIENTE
        return {
            "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "caballos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "clientes": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "empleados": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "eventos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "pagos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "usuarios": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "reportes": {"ver": False, "crear": False, "editar": False, "eliminar": False}
        }


def create_initial_users(db: Session):
    """Crea usuarios iniciales si no existen"""

    # 0. Usuario Super Admin (primero)
    super_admin_email = "superadmin@clubecuestre.com"
    super_admin_user = db.query(Usuario).filter(Usuario.email == super_admin_email).first()

    if not super_admin_user:
        print(f"Creando usuario SUPER ADMIN: {super_admin_email}")
        super_admin_user = Usuario(
            id=uuid.uuid4(),
            email=super_admin_email,
            password_hash=get_password_hash("SuperAdmin123!"),
            rol=RolEnum.SUPER_ADMIN,
            activo=True,
            permisos=_obtener_permisos_por_defecto(RolEnum.SUPER_ADMIN)
        )
        db.add(super_admin_user)
        db.commit()
        db.refresh(super_admin_user)

        # Crear empleado asociado al super admin
        empleado_super_admin = Empleado(
            usuario_id=super_admin_user.id,
            nombre="Super",
            apellido="Administrador",
            dni="00000000",
            funcion=FuncionEmpleadoEnum.ADMINISTRATIVO,
            fecha_ingreso=date.today(),
            activo=True
        )
        db.add(empleado_super_admin)
        print(f"✓ SUPER ADMIN creado - Email: {super_admin_email} | DNI: 00000000 | Password: SuperAdmin123!")
    else:
        print(f"✓ SUPER ADMIN ya existe: {super_admin_email}")

    # 1. Usuario Admin
    admin_email = "admin@clubecuestre.com"
    admin_user = db.query(Usuario).filter(Usuario.email == admin_email).first()

    if not admin_user:
        print(f"Creando usuario admin: {admin_email}")
        admin_user = Usuario(
            id=uuid.uuid4(),
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            rol=RolEnum.ADMIN,
            activo=True,
            permisos=_obtener_permisos_por_defecto(RolEnum.ADMIN)
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Crear empleado asociado al admin
        empleado_admin = Empleado(
            usuario_id=admin_user.id,
            nombre="Administrador",
            apellido="Sistema",
            dni="99999999",
            funcion=FuncionEmpleadoEnum.ADMINISTRATIVO,
            fecha_ingreso=date.today(),
            activo=True
        )
        db.add(empleado_admin)
        print(f"✓ Admin creado - Email: {admin_email} | DNI: 99999999 | Password: admin123")
    else:
        print(f"✓ Admin ya existe: {admin_email}")

    # 2. Usuario Empleado de prueba
    empleado_email = "empleado@clubecuestre.com"
    empleado_user = db.query(Usuario).filter(Usuario.email == empleado_email).first()

    if not empleado_user:
        print(f"Creando usuario empleado: {empleado_email}")
        empleado_user = Usuario(
            id=uuid.uuid4(),
            email=empleado_email,
            password_hash=get_password_hash("password"),
            rol=RolEnum.EMPLEADO,
            activo=True,
            permisos=_obtener_permisos_por_defecto(RolEnum.EMPLEADO)
        )
        db.add(empleado_user)
        db.commit()
        db.refresh(empleado_user)

        # Crear empleado asociado
        empleado = Empleado(
            usuario_id=empleado_user.id,
            nombre="Juan",
            apellido="Pérez",
            dni="12345678",
            funcion=FuncionEmpleadoEnum.INSTRUCTOR,
            fecha_ingreso=date(2024, 1, 15),
            activo=True
        )
        db.add(empleado)
        print(f"✓ Empleado creado - Email: {empleado_email} | DNI: 12345678 | Password: password")
    else:
        print(f"✓ Empleado ya existe: {empleado_email}")

    # 3. Usuario Cliente de prueba
    cliente_email = "cliente@test.com"
    cliente_user = db.query(Usuario).filter(Usuario.email == cliente_email).first()

    if not cliente_user:
        print(f"Creando usuario cliente: {cliente_email}")
        cliente_user = Usuario(
            id=uuid.uuid4(),
            email=cliente_email,
            password_hash=get_password_hash("cliente123"),
            rol=RolEnum.CLIENTE,
            activo=True,
            permisos=_obtener_permisos_por_defecto(RolEnum.CLIENTE)
        )
        db.add(cliente_user)
        db.commit()
        db.refresh(cliente_user)

        # Crear cliente asociado
        cliente = Cliente(
            usuario_id=cliente_user.id,
            nombre="María",
            apellido="García",
            dni="87654321",
            email=cliente_email,
            tipo_cliente=TipoClienteEnum.SOCIO_PLENO,
            estado_cuenta=EstadoCuentaEnum.AL_DIA,
            fecha_alta=date(2024, 1, 20),
            activo=True
        )
        db.add(cliente)
        print(f"✓ Cliente creado - Email: {cliente_email} | DNI: 87654321 | Password: cliente123")
    else:
        print(f"✓ Cliente ya existe: {cliente_email}")

    db.commit()


def create_tipos_alerta(db: Session):
    """Crea tipos de alerta por defecto si no existen"""

    tipos_alerta_defaults = [
        {
            "nombre": "Vacuna Próxima",
            "tipo": TipoAlertaEnum.VACUNA,
            "descripcion": "Alerta cuando una vacuna está próxima a vencer",
            "prioridad_default": PrioridadAlertaEnum.ALTA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 7,
            "hora_envio": "09:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Vacuna próxima: {caballo_nombre}",
            "plantilla_mensaje": "La vacuna {vacuna_tipo} del caballo {caballo_nombre} vence el {fecha_vencimiento}."
        },
        {
            "nombre": "Herraje Próximo",
            "tipo": TipoAlertaEnum.HERRAJE,
            "descripcion": "Alerta cuando un herraje está próximo a realizarse",
            "prioridad_default": PrioridadAlertaEnum.MEDIA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 3,
            "hora_envio": "09:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": False,
            "plantilla_titulo": "Herraje próximo: {caballo_nombre}",
            "plantilla_mensaje": "El herraje del caballo {caballo_nombre} está programado para el {fecha_herraje}."
        },
        {
            "nombre": "Pago Vencido",
            "tipo": TipoAlertaEnum.PAGO,
            "descripcion": "Alerta cuando un pago está vencido",
            "prioridad_default": PrioridadAlertaEnum.CRITICA,
            "frecuencia": FrecuenciaAlertaEnum.DIARIA,
            "dias_anticipacion": 0,
            "hora_envio": "10:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Pago vencido: {cliente_nombre}",
            "plantilla_mensaje": "El cliente {cliente_nombre} tiene un pago vencido desde {fecha_vencimiento}. Monto: ${monto}."
        },
        {
            "nombre": "Pago Próximo a Vencer",
            "tipo": TipoAlertaEnum.PAGO,
            "descripcion": "Alerta cuando un pago está próximo a vencer",
            "prioridad_default": PrioridadAlertaEnum.ALTA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 5,
            "hora_envio": "10:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Pago próximo a vencer: {cliente_nombre}",
            "plantilla_mensaje": "El pago de {cliente_nombre} vence el {fecha_vencimiento}. Monto: ${monto}."
        },
        {
            "nombre": "Evento Próximo",
            "tipo": TipoAlertaEnum.EVENTO,
            "descripcion": "Recordatorio de evento próximo",
            "prioridad_default": PrioridadAlertaEnum.MEDIA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 1,
            "hora_envio": "18:00",
            "enviar_a_roles": ["admin", "super_admin", "empleado"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Evento mañana: {evento_nombre}",
            "plantilla_mensaje": "Recordatorio: El evento {evento_nombre} es mañana a las {hora_inicio}."
        },
        {
            "nombre": "Cumpleaños Caballo",
            "tipo": TipoAlertaEnum.CUMPLEAÑOS,
            "descripcion": "Cumpleaños de un caballo",
            "prioridad_default": PrioridadAlertaEnum.BAJA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 0,
            "hora_envio": "08:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": False,
            "plantilla_titulo": "Cumpleaños: {caballo_nombre}",
            "plantilla_mensaje": "Hoy {caballo_nombre} cumple {edad} años. ¡Feliz cumpleaños!"
        },
        {
            "nombre": "Cumpleaños Cliente",
            "tipo": TipoAlertaEnum.CUMPLEAÑOS,
            "descripcion": "Cumpleaños de un cliente",
            "prioridad_default": PrioridadAlertaEnum.BAJA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 0,
            "hora_envio": "08:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Cumpleaños: {cliente_nombre}",
            "plantilla_mensaje": "Hoy es el cumpleaños de {cliente_nombre}. ¡Saludos!"
        },
        {
            "nombre": "Revisión Veterinaria",
            "tipo": TipoAlertaEnum.VETERINARIA,
            "descripcion": "Alerta para revisión veterinaria programada",
            "prioridad_default": PrioridadAlertaEnum.ALTA,
            "frecuencia": FrecuenciaAlertaEnum.UNICA,
            "dias_anticipacion": 3,
            "hora_envio": "09:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "enviar_a_responsables": True,
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Revisión veterinaria: {caballo_nombre}",
            "plantilla_mensaje": "El caballo {caballo_nombre} tiene revisión veterinaria programada para el {fecha_revision}."
        },
        {
            "nombre": "Mantenimiento de Instalaciones",
            "tipo": TipoAlertaEnum.MANTENIMIENTO,
            "descripcion": "Recordatorio de mantenimiento programado",
            "prioridad_default": PrioridadAlertaEnum.MEDIA,
            "frecuencia": FrecuenciaAlertaEnum.SEMANAL,
            "dias_anticipacion": 1,
            "hora_envio": "07:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "canal_sistema": True,
            "canal_email": False,
            "plantilla_titulo": "Mantenimiento programado: {area}",
            "plantilla_mensaje": "Mantenimiento de {area} programado para {fecha_mantenimiento}."
        },
        {
            "nombre": "Stock Bajo",
            "tipo": TipoAlertaEnum.STOCK,
            "descripcion": "Alerta de stock bajo en inventario",
            "prioridad_default": PrioridadAlertaEnum.ALTA,
            "frecuencia": FrecuenciaAlertaEnum.DIARIA,
            "hora_envio": "08:00",
            "enviar_a_roles": ["admin", "super_admin"],
            "canal_sistema": True,
            "canal_email": True,
            "plantilla_titulo": "Stock bajo: {producto_nombre}",
            "plantilla_mensaje": "El producto {producto_nombre} tiene stock bajo. Cantidad actual: {cantidad}."
        }
    ]

    print("\nCreando tipos de alerta por defecto...")
    for tipo_data in tipos_alerta_defaults:
        # Verificar si ya existe por nombre y tipo
        existing = db.query(TipoAlertaConfig).filter(
            TipoAlertaConfig.nombre == tipo_data["nombre"],
            TipoAlertaConfig.tipo == tipo_data["tipo"]
        ).first()

        if not existing:
            tipo_alerta = TipoAlertaConfig(**tipo_data)
            db.add(tipo_alerta)
            print(f"  ✓ Creado: {tipo_data['nombre']}")
        else:
            print(f"  - Ya existe: {tipo_data['nombre']}")

    db.commit()
    print("✓ Tipos de alerta creados exitosamente")


def main():
    """Función principal"""
    print("\n" + "="*60)
    print("CREANDO DATOS INICIALES DE PRUEBA")
    print("="*60 + "\n")

    db = SessionLocal()
    try:
        create_initial_users(db)
        create_tipos_alerta(db)
        print("\n" + "="*60)
        print("✓ DATOS INICIALES CREADOS EXITOSAMENTE")
        print("="*60)
        print("\nCredenciales de acceso:")
        print("-" * 60)
        print("0. SUPER ADMIN:")
        print("   - DNI: 00000000")
        print("   - Email: superadmin@clubecuestre.com")
        print("   - Password: SuperAdmin123!")
        print("\n1. Admin:")
        print("   - DNI: 99999999")
        print("   - Email: admin@clubecuestre.com")
        print("   - Password: admin123")
        print("\n2. Empleado:")
        print("   - DNI: 12345678")
        print("   - Email: empleado@clubecuestre.com")
        print("   - Password: password")
        print("\n3. Cliente:")
        print("   - DNI: 87654321")
        print("   - Email: cliente@test.com")
        print("   - Password: cliente123")
        print("-" * 60 + "\n")
    except Exception as e:
        print(f"\n❌ Error al crear datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
