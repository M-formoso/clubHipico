# Import all models here so that Base has them before being imported by Alembic
from app.db.base import Base
from app.models.usuario import Usuario
from app.models.empleado import Empleado
from app.models.cliente import Cliente
from app.models.caballo import Caballo
from app.models.historial_medico import HistorialMedico
from app.models.plan_alimentacion import PlanAlimentacion
from app.models.evento import Evento
from app.models.pago import Pago
from app.models.alerta import Alerta
from app.models.configuracion import Configuracion

__all__ = [
    "Base",
    "Usuario",
    "Empleado",
    "Cliente",
    "Caballo",
    "HistorialMedico",
    "PlanAlimentacion",
    "Evento",
    "Pago",
    "Alerta",
    "Configuracion",
]
