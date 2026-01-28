from sqlalchemy import Column, String, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class TipoAlertaEnum(str, enum.Enum):
    """Tipos de alerta"""
    VACUNA = "vacuna"
    HERRAJE = "herraje"
    PAGO = "pago"
    EVENTO = "evento"
    CUMPLEAÑOS = "cumpleaños"
    CONTRATO = "contrato"
    STOCK = "stock"
    TAREA = "tarea"
    MANTENIMIENTO = "mantenimiento"
    VETERINARIA = "veterinaria"
    OTRO = "otro"


class PrioridadAlertaEnum(str, enum.Enum):
    """Prioridad de la alerta"""
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class FrecuenciaAlertaEnum(str, enum.Enum):
    """Frecuencia de envío de alertas"""
    UNICA = "unica"
    DIARIA = "diaria"
    SEMANAL = "semanal"
    MENSUAL = "mensual"
    CADA_X_DIAS = "cada_x_dias"


class Alerta(Base):
    """Modelo de Alerta individual"""
    __tablename__ = "alertas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True)
    tipo_alerta_id = Column(UUID(as_uuid=True), ForeignKey("tipos_alerta.id", ondelete="SET NULL"), nullable=True)

    # Información de la alerta
    tipo = Column(SQLEnum(TipoAlertaEnum), nullable=False)
    prioridad = Column(SQLEnum(PrioridadAlertaEnum), default=PrioridadAlertaEnum.MEDIA, nullable=False)
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=False)

    # Estado
    leida = Column(Boolean, default=False, nullable=False)

    # Fechas
    fecha_evento = Column(DateTime, nullable=True)  # Fecha del evento que genera la alerta
    fecha_vencimiento = Column(DateTime, nullable=True)  # Cuándo expira la alerta

    # Entidad relacionada (para hacer link)
    entidad_relacionada_tipo = Column(String(50), nullable=True)  # 'caballo', 'cliente', 'pago', etc.
    entidad_relacionada_id = Column(UUID(as_uuid=True), nullable=True)

    # Acciones disponibles y datos adicionales (JSONB para flexibilidad)
    acciones_disponibles = Column(JSONB, nullable=True)  # [{ "tipo": "ver_detalle", "etiqueta": "...", "url": "..." }]
    datos_adicionales = Column(JSONB, nullable=True)  # Cualquier metadata extra

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="alertas")
    tipo_alerta = relationship("TipoAlertaConfig", back_populates="alertas")

    def __repr__(self):
        return f"<Alerta {self.tipo} - {self.prioridad} - {self.titulo}>"


class TipoAlertaConfig(Base):
    """Configuración de tipos de alerta (plantillas)"""
    __tablename__ = "tipos_alerta"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    tipo = Column(SQLEnum(TipoAlertaEnum), nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    # Prioridad por defecto
    prioridad_default = Column(SQLEnum(PrioridadAlertaEnum), default=PrioridadAlertaEnum.MEDIA, nullable=False)

    # Frecuencia y repetición
    frecuencia = Column(SQLEnum(FrecuenciaAlertaEnum), default=FrecuenciaAlertaEnum.UNICA, nullable=False)
    dias_anticipacion = Column(Integer, nullable=True)  # Días antes del evento
    intervalo_dias = Column(Integer, nullable=True)  # Para frecuencia 'cada_x_dias'
    hora_envio = Column(String(5), nullable=True)  # HH:MM formato 24h

    # Destinatarios (almacenados como arrays de strings/UUIDs)
    enviar_a_roles = Column(ARRAY(String), nullable=True)  # ['admin', 'super_admin']
    enviar_a_usuarios = Column(ARRAY(UUID(as_uuid=True)), nullable=True)  # [uuid1, uuid2]
    enviar_a_responsables = Column(Boolean, default=False, nullable=False)

    # Canales de envío
    canal_sistema = Column(Boolean, default=True, nullable=False)
    canal_email = Column(Boolean, default=False, nullable=False)
    canal_push = Column(Boolean, default=False, nullable=False)

    # Plantillas de mensaje
    plantilla_titulo = Column(String(500), nullable=True)  # Con variables {nombre}, {fecha}, etc.
    plantilla_mensaje = Column(Text, nullable=True)

    # Condiciones de activación (JSONB para flexibilidad)
    # [{ "campo": "dias_hasta_vencimiento", "operador": "menor_igual", "valor": 7 }]
    condiciones = Column(JSONB, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    alertas = relationship("Alerta", back_populates="tipo_alerta")

    def __repr__(self):
        return f"<TipoAlertaConfig {self.nombre} - {self.tipo}>"


class ConfiguracionAlertasUsuario(Base):
    """Configuración de alertas por usuario"""
    __tablename__ = "configuracion_alertas_usuario"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Canales habilitados
    alertas_sistema = Column(Boolean, default=True, nullable=False)
    alertas_email = Column(Boolean, default=False, nullable=False)
    alertas_push = Column(Boolean, default=False, nullable=False)

    # Preferencias por tipo (JSONB)
    tipos_alertas = Column(JSONB, nullable=True)  # { "vacuna": true, "pago": true, ... }

    # Horarios permitidos
    horario_inicio = Column(String(5), nullable=True)  # HH:MM
    horario_fin = Column(String(5), nullable=True)  # HH:MM
    dias_semana = Column(ARRAY(Integer), nullable=True)  # [0,1,2,3,4,5,6]

    # Agrupación
    agrupar_alertas = Column(Boolean, default=False, nullable=False)
    intervalo_agrupacion = Column(Integer, nullable=True)  # Minutos

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ConfiguracionAlertasUsuario usuario_id={self.usuario_id}>"
