"""
Script para inicializar la base de datos con datos por defecto.
"""
# Importar todos los modelos para que SQLAlchemy los reconozca
from app.models import usuario, empleado, cliente, caballo, historial_medico, plan_alimentacion, evento, pago, alerta, configuracion

from app.db.session import SessionLocal
from app.db.init_db import init_db


def main():
    print("Inicializando base de datos...")
    db = SessionLocal()
    try:
        init_db(db)
        print("✅ Base de datos inicializada correctamente")
    except Exception as e:
        print(f"❌ Error al inicializar base de datos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
