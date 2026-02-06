from sqlalchemy import Column, String, Integer, Date, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base import Base


class SexoCaballoEnum(str, enum.Enum):
    """Sexo del caballo"""
    MACHO = "macho"
    HEMBRA = "hembra"
    CASTRADO = "castrado"


class EstadoCaballoEnum(str, enum.Enum):
    """Estado del caballo"""
    ACTIVO = "activo"
    RETIRADO = "retirado"
    EN_TRATAMIENTO = "en_tratamiento"
    FALLECIDO = "fallecido"


class ManejoEnum(str, enum.Enum):
    """Tipo de manejo diario"""
    BOX = "box"
    BOX_PIQUETE = "box_piquete"
    PIQUETE = "piquete"
    PALENQUE = "palenque"
    CROSS_TIE = "cross_tie"


class TipoTrabajoEnum(str, enum.Enum):
    """Tipo de trabajo diario"""
    CAMINADOR = "caminador"
    CUERDA = "cuerda"
    MANGA = "manga"
    MONTADO = "montado"


class CategoriaSanitariaEnum(str, enum.Enum):
    """Categoría del plan sanitario según Haras Club 2026"""
    A = "A"
    B = "B"


class Caballo(Base):
    """Modelo de Caballo"""
    __tablename__ = "caballos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # ========== DATOS BÁSICOS OBLIGATORIOS ==========
    nombre = Column(String(100), nullable=False, index=True)
    numero_chip = Column(String(50), nullable=False, unique=True, index=True)  # OBLIGATORIO
    id_fomento = Column(String(50), nullable=True, unique=True, index=True)
    edad = Column(Integer, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    pedigree = Column(Text, nullable=True)  # Información del pedigree

    # Datos adicionales básicos
    raza = Column(String(100), nullable=True)
    sexo = Column(SQLEnum(SexoCaballoEnum), nullable=True)
    color = Column(String(50), nullable=True)

    # Medidas
    altura = Column(Numeric(5, 2), nullable=True)  # en metros (hasta 999.99)
    peso = Column(Numeric(6, 2), nullable=True)    # en kg

    # Propietario
    propietario_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="SET NULL"), nullable=True)

    # Ubicación y estado
    box_asignado = Column(String(50), nullable=True)
    estado = Column(SQLEnum(EstadoCaballoEnum), default=EstadoCaballoEnum.ACTIVO, nullable=False)

    # Plan sanitario
    categoria_sanitaria = Column(SQLEnum(CategoriaSanitariaEnum), nullable=True)  # A o B según plan Haras Club 2026

    # ========== QR CODE ==========
    qr_code = Column(Text, nullable=True)  # QR code en base64 o URL

    # ========== ALIMENTACIÓN ==========
    grano_balanceado = Column(String(200), nullable=True)
    suplementos = Column(String(500), nullable=True)
    cantidad_comidas_dia = Column(Integer, nullable=True)
    detalles_alimentacion = Column(Text, nullable=True)

    # ========== MANEJO DIARIO ==========
    tipo_manejo = Column(SQLEnum(ManejoEnum), nullable=True)  # box, box_piquete, etc.

    # ========== TRABAJO DIARIO ==========
    dias_trabajo = Column(String(100), nullable=True)  # "L,M,X,J,V" o similar
    dias_descanso = Column(String(100), nullable=True)  # "S,D" o similar
    jinete_asignado = Column(String(100), nullable=True)
    tiempo_trabajo_diario = Column(Integer, nullable=True)  # en minutos

    # Tipos de trabajo (JSONB para flexibilidad)
    trabajo_config = Column(JSONB, nullable=True)  # {caminador: true, cuerda: false, manga: true, montado: true}

    # ========== OTROS DETALLES ==========
    embocadura_1 = Column(String(200), nullable=True)
    embocadura_2 = Column(String(200), nullable=True)
    cuidados_especiales = Column(Text, nullable=True)

    # ========== INFO GENERAL ==========
    caracteristicas = Column(Text, nullable=True)
    otra_info_1 = Column(Text, nullable=True)
    otra_info_2 = Column(Text, nullable=True)

    # Foto principal
    foto_principal = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    propietario = relationship("Cliente", back_populates="caballos")
    fotos = relationship("FotoCaballo", back_populates="caballo", cascade="all, delete-orphan")
    historial_medico = relationship("HistorialMedico", back_populates="caballo", cascade="all, delete-orphan")
    vacunas = relationship("VacunaRegistro", back_populates="caballo", cascade="all, delete-orphan")
    herrajes = relationship("HerrjeRegistro", back_populates="caballo", cascade="all, delete-orphan")
    antiparasitarios = relationship("AntiparasitarioRegistro", back_populates="caballo", cascade="all, delete-orphan")
    plan_alimentacion = relationship("PlanAlimentacion", back_populates="caballo", uselist=False, cascade="all, delete-orphan")
    inscripciones = relationship("InscripcionEvento", back_populates="caballo", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Caballo {self.nombre} - Chip: {self.numero_chip}>"


class FotoCaballo(Base):
    """Modelo de Foto de Caballo - Múltiples fotos por caballo"""
    __tablename__ = "fotos_caballo"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    descripcion = Column(String(255), nullable=True)
    es_principal = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="fotos")

    def __repr__(self):
        return f"<FotoCaballo {self.caballo_id}>"


# ========== VACUNAS Y ANÁLISIS ==========

class VacunaRegistro(Base):
    """Registro de vacunas y análisis del caballo"""
    __tablename__ = "vacunas_registros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    # Tipo de vacuna/análisis
    tipo = Column(String(100), nullable=False)  # anemia, influenza, encéfalomielitis, etc.

    # Detalles
    fecha = Column(Date, nullable=False)
    veterinario = Column(String(200), nullable=True)
    marca = Column(String(200), nullable=True)
    frecuencia_dias = Column(Integer, nullable=True)  # Cada cuántos días debe repetirse
    proxima_fecha = Column(Date, nullable=True)  # Fecha calculada para próxima dosis

    # Observaciones
    observaciones = Column(Text, nullable=True)

    # Si fue aplicada o es una programación futura
    aplicada = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="vacunas")

    def __repr__(self):
        return f"<VacunaRegistro {self.tipo} - {self.fecha}>"


class RevisionDentalRegistro(Base):
    """Registro de revisiones dentales"""
    __tablename__ = "revisiones_dentales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    fecha = Column(Date, nullable=False)
    veterinario = Column(String(200), nullable=True)
    observaciones = Column(Text, nullable=True)
    proxima_revision = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo")

    def __repr__(self):
        return f"<RevisionDental {self.fecha}>"


class EstudioMedicoRegistro(Base):
    """Registro de estudios médicos (radiografías, ecografías, etc.)"""
    __tablename__ = "estudios_medicos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    tipo = Column(String(100), nullable=False)  # radiografía, ecografía, resonancia, etc.
    fecha = Column(Date, nullable=False)
    veterinario = Column(String(200), nullable=True)
    zona_estudiada = Column(String(200), nullable=True)  # miembro anterior derecho, etc.
    diagnostico = Column(Text, nullable=True)
    archivo_url = Column(String(500), nullable=True)  # URL del archivo/imagen
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo")

    def __repr__(self):
        return f"<EstudioMedico {self.tipo} - {self.fecha}>"


# ========== HERRAJE ==========

class HerrjeRegistro(Base):
    """Registro de herrajes del caballo"""
    __tablename__ = "herrajes_registros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    fecha = Column(Date, nullable=False)
    herrador = Column(String(200), nullable=True)
    observaciones = Column(Text, nullable=True)
    proximo_herraje = Column(Date, nullable=True)  # Fecha estimada próximo herraje
    costo = Column(Numeric(10, 2), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="herrajes")

    def __repr__(self):
        return f"<HerrjeRegistro {self.fecha}>"


# ========== ANTIPARASITARIOS ==========

class AntiparasitarioRegistro(Base):
    """Registro de antiparasitarios aplicados"""
    __tablename__ = "antiparasitarios_registros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caballo_id = Column(UUID(as_uuid=True), ForeignKey("caballos.id", ondelete="CASCADE"), nullable=False)

    fecha = Column(Date, nullable=False)
    marca = Column(String(200), nullable=True)
    drogas = Column(String(500), nullable=True)  # Ivermectina, Moxidectina, etc.
    dosis = Column(String(100), nullable=True)
    proxima_aplicacion = Column(Date, nullable=True)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    caballo = relationship("Caballo", back_populates="antiparasitarios")

    def __repr__(self):
        return f"<AntiparasitarioRegistro {self.fecha}>"
