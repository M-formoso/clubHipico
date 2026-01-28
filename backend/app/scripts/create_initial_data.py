"""
Script para crear datos iniciales de prueba en la base de datos.
Ejecutar con: python -m app.scripts.create_initial_data
"""

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.usuario import Usuario, RolEnum
from app.models.empleado import Empleado, FuncionEmpleadoEnum
from app.models.cliente import Cliente, TipoClienteEnum, EstadoCuentaEnum
from app.core.security import get_password_hash
from datetime import date
import uuid


def create_initial_users(db: Session):
    """Crea usuarios iniciales si no existen"""

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
            activo=True
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
            activo=True
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
            activo=True
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


def main():
    """Función principal"""
    print("\n" + "="*60)
    print("CREANDO DATOS INICIALES DE PRUEBA")
    print("="*60 + "\n")

    db = SessionLocal()
    try:
        create_initial_users(db)
        print("\n" + "="*60)
        print("✓ DATOS INICIALES CREADOS EXITOSAMENTE")
        print("="*60)
        print("\nCredenciales de acceso:")
        print("-" * 60)
        print("1. Admin:")
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
