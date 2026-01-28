from sqlalchemy import Column, String, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoClienteEnum(str, enum.Enum):
    """Tipos de cliente"""
    SOCIO_PLENO = "socio_pleno"
    PENSIONISTA = "pensionista"
    ALUMNO = "alumno"


class EstadoCuentaEnum(str, enum.Enum):
    """Estado de cuenta del cliente"""
    AL_DIA = "al_dia"
    DEBE = "debe"
    MOROSO = "moroso"


class Cliente(Base):
    """Modelo de Cliente"""
    __tablename__ = "clientes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), unique=True, nullable=True)

    # Datos personales
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    telefono = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    direccion = Column(String(500), nullable=True)

    # Tipo y estado
    tipo_cliente = Column(SQLEnum(TipoClienteEnum), nullable=False)
    estado_cuenta = Column(SQLEnum(EstadoCuentaEnum), default=EstadoCuentaEnum.AL_DIA, nullable=False)
    saldo = Column(Numeric(10, 2), default=0, nullable=False)

    # Fechas
    fecha_alta = Column(Date, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    # Información adicional
    notas = Column(String(1000), nullable=True)
    contacto_emergencia = Column(JSONB, nullable=True)  # {"nombre": "...", "telefono": "...", "relacion": "..."}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="cliente")
    caballos = relationship("Caballo", back_populates="propietario", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="cliente", cascade="all, delete-orphan")
    inscripciones = relationship("InscripcionEvento", back_populates="cliente", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Cliente {self.nombre} {self.apellido} - {self.tipo_cliente}>"
