from pydantic import BaseModel, Field, UUID4
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from decimal import Decimal
from app.models.caballo import SexoCaballoEnum, EstadoCaballoEnum, ManejoEnum, TipoTrabajoEnum, CategoriaSanitariaEnum


# ========== CABALLO ==========

class CaballoBase(BaseModel):
    """Schema base de Caballo"""
    nombre: str = Field(..., min_length=1, max_length=100)
    raza: Optional[str] = Field(None, max_length=100)
    edad: Optional[int] = Field(None, ge=0, le=50)
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[SexoCaballoEnum] = None
    color: Optional[str] = Field(None, max_length=50)
    altura: Optional[Decimal] = Field(None, ge=0, le=300)  # Altura en centímetros (máx 300cm = 3m)
    peso: Optional[Decimal] = Field(None, ge=0, le=2000)  # Peso en kilogramos (máx 2000kg)
    box_asignado: Optional[str] = Field(None, max_length=50)
    caracteristicas: Optional[str] = None


class CaballoCreate(CaballoBase):
    """Schema para crear Caballo"""
    # Campos OBLIGATORIOS
    numero_chip: str = Field(..., min_length=1, max_length=50)

    # Campos opcionales
    id_fomento: Optional[str] = Field(None, max_length=50)
    pedigree: Optional[str] = None
    propietario_id: Optional[UUID4] = None

    # Alimentación
    grano_balanceado: Optional[str] = Field(None, max_length=200)
    suplementos: Optional[str] = Field(None, max_length=500)
    cantidad_comidas_dia: Optional[int] = Field(None, ge=1, le=10)
    detalles_alimentacion: Optional[str] = None

    # Manejo
    tipo_manejo: Optional[ManejoEnum] = None

    # Trabajo
    dias_trabajo: Optional[str] = Field(None, max_length=100)
    dias_descanso: Optional[str] = Field(None, max_length=100)
    jinete_asignado: Optional[str] = Field(None, max_length=100)
    tiempo_trabajo_diario: Optional[int] = Field(None, ge=0, le=480)  # máx 8 horas
    trabajo_config: Optional[Dict[str, Any]] = None

    # Otros detalles
    embocadura_1: Optional[str] = Field(None, max_length=200)
    embocadura_2: Optional[str] = Field(None, max_length=200)
    cuidados_especiales: Optional[str] = None
    otra_info_1: Optional[str] = None
    otra_info_2: Optional[str] = None
    foto_principal: Optional[str] = None

    # Plan sanitario
    categoria_sanitaria: Optional[CategoriaSanitariaEnum] = None


class CaballoUpdate(BaseModel):
    """Schema para actualizar Caballo"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    numero_chip: Optional[str] = Field(None, min_length=1, max_length=50)
    id_fomento: Optional[str] = Field(None, max_length=50)
    raza: Optional[str] = Field(None, max_length=100)
    edad: Optional[int] = Field(None, ge=0, le=50)
    fecha_nacimiento: Optional[date] = None
    pedigree: Optional[str] = None
    sexo: Optional[SexoCaballoEnum] = None
    color: Optional[str] = Field(None, max_length=50)
    altura: Optional[Decimal] = Field(None, ge=0, le=300)  # Altura en centímetros
    peso: Optional[Decimal] = Field(None, ge=0, le=2000)  # Peso en kilogramos
    propietario_id: Optional[UUID4] = None
    box_asignado: Optional[str] = Field(None, max_length=50)
    estado: Optional[EstadoCaballoEnum] = None
    caracteristicas: Optional[str] = None

    # Alimentación
    grano_balanceado: Optional[str] = Field(None, max_length=200)
    suplementos: Optional[str] = Field(None, max_length=500)
    cantidad_comidas_dia: Optional[int] = Field(None, ge=1, le=10)
    detalles_alimentacion: Optional[str] = None

    # Manejo
    tipo_manejo: Optional[ManejoEnum] = None

    # Trabajo
    dias_trabajo: Optional[str] = Field(None, max_length=100)
    dias_descanso: Optional[str] = Field(None, max_length=100)
    jinete_asignado: Optional[str] = Field(None, max_length=100)
    tiempo_trabajo_diario: Optional[int] = Field(None, ge=0, le=480)
    trabajo_config: Optional[Dict[str, Any]] = None

    # Otros detalles
    embocadura_1: Optional[str] = Field(None, max_length=200)
    embocadura_2: Optional[str] = Field(None, max_length=200)
    cuidados_especiales: Optional[str] = None
    otra_info_1: Optional[str] = None
    otra_info_2: Optional[str] = None
    foto_principal: Optional[str] = None

    # Plan sanitario
    categoria_sanitaria: Optional[CategoriaSanitariaEnum] = None


class CaballoSchema(CaballoBase):
    """Schema de respuesta de Caballo"""
    id: UUID4
    numero_chip: str
    id_fomento: Optional[str] = None
    pedigree: Optional[str] = None
    propietario_id: Optional[UUID4] = None
    estado: EstadoCaballoEnum
    qr_code: Optional[str] = None

    # Alimentación
    grano_balanceado: Optional[str] = None
    suplementos: Optional[str] = None
    cantidad_comidas_dia: Optional[int] = None
    detalles_alimentacion: Optional[str] = None

    # Manejo
    tipo_manejo: Optional[ManejoEnum] = None

    # Trabajo
    dias_trabajo: Optional[str] = None
    dias_descanso: Optional[str] = None
    jinete_asignado: Optional[str] = None
    tiempo_trabajo_diario: Optional[int] = None
    trabajo_config: Optional[Dict[str, Any]] = None

    # Otros detalles
    embocadura_1: Optional[str] = None
    embocadura_2: Optional[str] = None
    cuidados_especiales: Optional[str] = None
    otra_info_1: Optional[str] = None
    otra_info_2: Optional[str] = None

    # Plan sanitario
    categoria_sanitaria: Optional[CategoriaSanitariaEnum] = None
    foto_principal: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== FOTOS ==========

class FotoCaballoBase(BaseModel):
    """Schema base de Foto Caballo"""
    url: str
    descripcion: Optional[str] = Field(None, max_length=255)
    es_principal: bool = False


class FotoCaballoCreate(FotoCaballoBase):
    """Schema para crear Foto Caballo"""
    caballo_id: UUID4


class FotoCaballoUpdate(BaseModel):
    """Schema para actualizar Foto Caballo"""
    descripcion: Optional[str] = Field(None, max_length=255)
    es_principal: Optional[bool] = None


class FotoCaballoSchema(FotoCaballoBase):
    """Schema de respuesta de Foto Caballo"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ========== VACUNAS ==========

class VacunaRegistroBase(BaseModel):
    """Schema base de Vacuna"""
    tipo: str = Field(..., max_length=100)
    fecha: date
    veterinario: Optional[str] = Field(None, max_length=200)
    marca: Optional[str] = Field(None, max_length=200)
    frecuencia_dias: Optional[int] = Field(None, ge=1)
    proxima_fecha: Optional[date] = None
    observaciones: Optional[str] = None
    aplicada: bool = True


class VacunaRegistroCreate(VacunaRegistroBase):
    """Schema para crear Vacuna"""
    caballo_id: UUID4


class VacunaRegistroUpdate(BaseModel):
    """Schema para actualizar Vacuna"""
    tipo: Optional[str] = Field(None, max_length=100)
    fecha: Optional[date] = None
    veterinario: Optional[str] = Field(None, max_length=200)
    marca: Optional[str] = Field(None, max_length=200)
    frecuencia_dias: Optional[int] = Field(None, ge=1)
    proxima_fecha: Optional[date] = None
    observaciones: Optional[str] = None
    aplicada: Optional[bool] = None


class VacunaRegistroSchema(VacunaRegistroBase):
    """Schema de respuesta de Vacuna"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== REVISIÓN DENTAL ==========

class RevisionDentalBase(BaseModel):
    """Schema base de Revisión Dental"""
    fecha: date
    veterinario: Optional[str] = Field(None, max_length=200)
    observaciones: Optional[str] = None
    proxima_revision: Optional[date] = None


class RevisionDentalCreate(RevisionDentalBase):
    """Schema para crear Revisión Dental"""
    caballo_id: UUID4


class RevisionDentalUpdate(BaseModel):
    """Schema para actualizar Revisión Dental"""
    fecha: Optional[date] = None
    veterinario: Optional[str] = Field(None, max_length=200)
    observaciones: Optional[str] = None
    proxima_revision: Optional[date] = None


class RevisionDentalSchema(RevisionDentalBase):
    """Schema de respuesta de Revisión Dental"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ========== ESTUDIOS MÉDICOS ==========

class EstudioMedicoBase(BaseModel):
    """Schema base de Estudio Médico"""
    tipo: str = Field(..., max_length=100)
    fecha: date
    veterinario: Optional[str] = Field(None, max_length=200)
    zona_estudiada: Optional[str] = Field(None, max_length=200)
    diagnostico: Optional[str] = None
    archivo_url: Optional[str] = Field(None, max_length=500)
    observaciones: Optional[str] = None


class EstudioMedicoCreate(EstudioMedicoBase):
    """Schema para crear Estudio Médico"""
    caballo_id: UUID4


class EstudioMedicoUpdate(BaseModel):
    """Schema para actualizar Estudio Médico"""
    tipo: Optional[str] = Field(None, max_length=100)
    fecha: Optional[date] = None
    veterinario: Optional[str] = Field(None, max_length=200)
    zona_estudiada: Optional[str] = Field(None, max_length=200)
    diagnostico: Optional[str] = None
    archivo_url: Optional[str] = Field(None, max_length=500)
    observaciones: Optional[str] = None


class EstudioMedicoSchema(EstudioMedicoBase):
    """Schema de respuesta de Estudio Médico"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ========== HERRAJES ==========

class HerrajeRegistroBase(BaseModel):
    """Schema base de Herraje"""
    fecha: date
    herrador: Optional[str] = Field(None, max_length=200)
    observaciones: Optional[str] = None
    proximo_herraje: Optional[date] = None
    costo: Optional[Decimal] = Field(None, ge=0)


class HerrajeRegistroCreate(HerrajeRegistroBase):
    """Schema para crear Herraje"""
    caballo_id: UUID4


class HerrajeRegistroUpdate(BaseModel):
    """Schema para actualizar Herraje"""
    fecha: Optional[date] = None
    herrador: Optional[str] = Field(None, max_length=200)
    observaciones: Optional[str] = None
    proximo_herraje: Optional[date] = None
    costo: Optional[Decimal] = Field(None, ge=0)


class HerrajeRegistroSchema(HerrajeRegistroBase):
    """Schema de respuesta de Herraje"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ========== ANTIPARASITARIOS ==========

class AntiparasitarioRegistroBase(BaseModel):
    """Schema base de Antiparasitario"""
    fecha: date
    marca: Optional[str] = Field(None, max_length=200)
    drogas: Optional[str] = Field(None, max_length=500)
    dosis: Optional[str] = Field(None, max_length=100)
    proxima_aplicacion: Optional[date] = None
    observaciones: Optional[str] = None


class AntiparasitarioRegistroCreate(AntiparasitarioRegistroBase):
    """Schema para crear Antiparasitario"""
    caballo_id: UUID4


class AntiparasitarioRegistroUpdate(BaseModel):
    """Schema para actualizar Antiparasitario"""
    fecha: Optional[date] = None
    marca: Optional[str] = Field(None, max_length=200)
    drogas: Optional[str] = Field(None, max_length=500)
    dosis: Optional[str] = Field(None, max_length=100)
    proxima_aplicacion: Optional[date] = None
    observaciones: Optional[str] = None


class AntiparasitarioRegistroSchema(AntiparasitarioRegistroBase):
    """Schema de respuesta de Antiparasitario"""
    id: UUID4
    caballo_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ========== ESQUEMA COMPLETO CON RELACIONES ==========

class CaballoCompleto(CaballoSchema):
    """Schema de Caballo con todas sus relaciones"""
    fotos: List[FotoCaballoSchema] = []
    vacunas: List[VacunaRegistroSchema] = []
    herrajes: List[HerrajeRegistroSchema] = []
    antiparasitarios: List[AntiparasitarioRegistroSchema] = []

    class Config:
        from_attributes = True


# ========== PLAN SANITARIO ==========

class ActividadPlanSanitario(BaseModel):
    """Actividad del plan sanitario"""
    tipo: str  # vacuna, desparasitacion, analisis
    nombre: str
    descripcion: str
    realizada: bool  # Si ya fue realizada este año
    fecha_realizada: Optional[date] = None  # Fecha en que se realizó
    proxima_fecha: Optional[date] = None  # Próxima vez que debe hacerse


class MesPlanSanitario(BaseModel):
    """Mes del plan sanitario"""
    mes: int
    mes_nombre: str
    actividades: List[ActividadPlanSanitario]


class PlanSanitarioResponse(BaseModel):
    """Respuesta con el plan sanitario del caballo"""
    categoria: Optional[str] = None  # A, B, o None si no tiene categoría
    nombre_categoria: Optional[str] = None
    descripcion: Optional[str] = None
    costo_mensual: Optional[int] = None  # Costo mensual del plan
    dosis_anuales: Optional[Dict[str, int]] = None  # Dosis anuales por tipo
    calendario: List[MesPlanSanitario] = []
    anio: int  # Año del plan


class ActividadPendiente(BaseModel):
    """Actividad pendiente del plan sanitario"""
    mes: int
    mes_nombre: str
    tipo: str
    nombre: str
    descripcion: str
    dias_vencido: Optional[int] = None  # Días desde que venció (positivo = vencido)


class EstadisticasPlanSanitario(BaseModel):
    """Estadísticas de cumplimiento del plan sanitario"""
    categoria: Optional[str] = None
    tiene_plan: bool
    costo_mensual: Optional[int] = None
    costo_anual: Optional[int] = None
    anio: int
    total_actividades: int
    actividades_realizadas: int
    actividades_pendientes: int
    porcentaje_cumplimiento: float
    proximas_actividades: List[ActividadPendiente]
    actividades_vencidas: List[ActividadPendiente]
