from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date, timedelta, datetime
import qrcode
from io import BytesIO
import base64
import copy

from app.models.caballo import (
    Caballo,
    FotoCaballo,
    EstadoCaballoEnum,
    VacunaRegistro,
    RevisionDentalRegistro,
    EstudioMedicoRegistro,
    HerrjeRegistro,
    AntiparasitarioRegistro
)
from app.schemas.caballo import (
    CaballoCreate,
    CaballoUpdate,
    FotoCaballoCreate,
    FotoCaballoUpdate,
    VacunaRegistroCreate,
    VacunaRegistroUpdate,
    RevisionDentalCreate,
    RevisionDentalUpdate,
    EstudioMedicoCreate,
    EstudioMedicoUpdate,
    HerrajeRegistroCreate,
    HerrajeRegistroUpdate,
    AntiparasitarioRegistroCreate,
    AntiparasitarioRegistroUpdate
)


# ========== UTILIDADES ==========

def generar_qr_caballo(caballo_id: UUID) -> str:
    """
    Genera un código QR único para el caballo.
    Retorna el QR en formato base64 data URL para almacenar directamente.

    Args:
        caballo_id: UUID del caballo

    Returns:
        str: Data URL del QR en formato base64 (data:image/png;base64,...)
    """
    # URL que apuntará a la ficha del caballo
    url = f"https://clubecuestre.com/caballos/{caballo_id}/ficha"

    # Crear QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Generar imagen
    img = qr.make_image(fill_color="black", back_color="white")

    # Convertir a base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    # Retornar como data URL
    return f"data:image/png;base64,{img_base64}"


def calcular_proxima_fecha(fecha_aplicacion: date, frecuencia_dias: int) -> date:
    """
    Calcula la próxima fecha de aplicación basado en la frecuencia.

    Args:
        fecha_aplicacion: Fecha de la aplicación actual
        frecuencia_dias: Frecuencia en días

    Returns:
        date: Próxima fecha calculada
    """
    return fecha_aplicacion + timedelta(days=frecuencia_dias)


# ========== CABALLO CRUD ==========

def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False,
    propietario_id: Optional[UUID] = None
) -> List[Caballo]:
    """Obtiene lista de caballos con paginación."""
    query = db.query(Caballo)

    if activo_solo:
        query = query.filter(Caballo.estado == EstadoCaballoEnum.ACTIVO)

    if propietario_id:
        query = query.filter(Caballo.propietario_id == propietario_id)

    return query.offset(skip).limit(limit).all()


def obtener_por_id(db: Session, caballo_id: UUID) -> Optional[Caballo]:
    """Obtiene un caballo por ID."""
    return db.query(Caballo).filter(Caballo.id == caballo_id).first()


def crear(db: Session, caballo_data: CaballoCreate) -> Caballo:
    """
    Crea un nuevo caballo con generación automática de QR.

    Args:
        db: Sesión de base de datos
        caballo_data: Datos del caballo a crear

    Returns:
        Caballo: Caballo creado

    Raises:
        HTTPException: Si el numero_chip o id_fomento ya existen
    """
    # Verificar si numero_chip ya existe
    existing = db.query(Caballo).filter(
        Caballo.numero_chip == caballo_data.numero_chip
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un caballo con el número de chip {caballo_data.numero_chip}"
        )

    # Verificar id_fomento si se proporciona
    if caballo_data.id_fomento:
        existing_fomento = db.query(Caballo).filter(
            Caballo.id_fomento == caballo_data.id_fomento
        ).first()

        if existing_fomento:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un caballo con el ID de fomento {caballo_data.id_fomento}"
            )

    # Crear caballo (sin QR aún) - exclude_unset para no enviar campos opcionales no proporcionados
    db_caballo = Caballo(**caballo_data.model_dump(exclude_unset=True))
    # Asegurar que el estado sea ACTIVO por defecto
    if not hasattr(db_caballo, 'estado') or db_caballo.estado is None:
        db_caballo.estado = EstadoCaballoEnum.ACTIVO

    try:
        db.add(db_caballo)
        db.flush()  # Flush para obtener el ID sin hacer commit

        # Generar QR code con el ID del caballo
        db_caballo.qr_code = generar_qr_caballo(db_caballo.id)

        db.commit()
        db.refresh(db_caballo)

        return db_caballo

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de integridad al crear el caballo: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el caballo: {str(e)}"
        )


def actualizar(
    db: Session,
    caballo_id: UUID,
    caballo_update: CaballoUpdate
) -> Optional[Caballo]:
    """
    Actualiza un caballo existente.

    Args:
        db: Sesión de base de datos
        caballo_id: ID del caballo
        caballo_update: Datos a actualizar

    Returns:
        Optional[Caballo]: Caballo actualizado o None si no existe
    """
    db_caballo = obtener_por_id(db, caballo_id)
    if not db_caballo:
        return None

    # Verificar unicidad de numero_chip si se actualiza
    if caballo_update.numero_chip and caballo_update.numero_chip != db_caballo.numero_chip:
        existing = db.query(Caballo).filter(
            Caballo.numero_chip == caballo_update.numero_chip,
            Caballo.id != caballo_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un caballo con el número de chip {caballo_update.numero_chip}"
            )

    # Verificar unicidad de id_fomento si se actualiza
    if caballo_update.id_fomento and caballo_update.id_fomento != db_caballo.id_fomento:
        existing = db.query(Caballo).filter(
            Caballo.id_fomento == caballo_update.id_fomento,
            Caballo.id != caballo_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un caballo con el ID de fomento {caballo_update.id_fomento}"
            )

    update_data = caballo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_caballo, field, value)

    db.commit()
    db.refresh(db_caballo)
    return db_caballo


def eliminar(db: Session, caballo_id: UUID) -> Optional[Caballo]:
    """Elimina un caballo (soft delete marcando como retirado)."""
    db_caballo = obtener_por_id(db, caballo_id)
    if not db_caballo:
        return None

    # Soft delete
    db_caballo.estado = EstadoCaballoEnum.RETIRADO
    db.commit()
    db.refresh(db_caballo)
    return db_caballo


def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[Caballo]:
    """Busca caballos por nombre o raza."""
    return db.query(Caballo).filter(
        (Caballo.nombre.ilike(f"%{termino}%")) |
        (Caballo.raza.ilike(f"%{termino}%"))
    ).offset(skip).limit(limit).all()


# ========== FOTOS ==========

def agregar_foto(db: Session, foto_data: FotoCaballoCreate) -> FotoCaballo:
    """
    Agrega una foto al caballo.
    Si es la primera foto, se marca automáticamente como principal.

    Args:
        db: Sesión de base de datos
        foto_data: Datos de la foto

    Returns:
        FotoCaballo: Foto creada
    """
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == foto_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    # Verificar si es la primera foto
    fotos_existentes = db.query(FotoCaballo).filter(
        FotoCaballo.caballo_id == foto_data.caballo_id
    ).count()

    # Si es la primera foto y no se especificó es_principal, marcarlo como principal
    es_primera_foto = fotos_existentes == 0
    data_dict = foto_data.model_dump()
    if es_primera_foto and not data_dict.get('es_principal', False):
        data_dict['es_principal'] = True

    # Si se marca como principal, desmarcar las demás
    if data_dict.get('es_principal', False):
        db.query(FotoCaballo).filter(
            FotoCaballo.caballo_id == foto_data.caballo_id,
            FotoCaballo.es_principal == True
        ).update({"es_principal": False})

    # Crear foto
    db_foto = FotoCaballo(**data_dict)
    db.add(db_foto)
    db.commit()
    db.refresh(db_foto)

    return db_foto


def marcar_foto_como_principal(db: Session, foto_id: UUID) -> FotoCaballo:
    """
    Marca una foto como principal y desmarca las demás del mismo caballo.

    Args:
        db: Sesión de base de datos
        foto_id: ID de la foto

    Returns:
        FotoCaballo: Foto actualizada
    """
    foto = db.query(FotoCaballo).filter(FotoCaballo.id == foto_id).first()

    if not foto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto no encontrada"
        )

    # Desmarcar todas las fotos del caballo
    db.query(FotoCaballo).filter(
        FotoCaballo.caballo_id == foto.caballo_id,
        FotoCaballo.es_principal == True
    ).update({"es_principal": False})

    # Marcar esta como principal
    foto.es_principal = True

    db.commit()
    db.refresh(foto)

    return foto


def obtener_fotos(db: Session, caballo_id: UUID) -> List[FotoCaballo]:
    """Obtiene todas las fotos de un caballo."""
    return db.query(FotoCaballo).filter(FotoCaballo.caballo_id == caballo_id).all()


def eliminar_foto(db: Session, foto_id: UUID) -> Optional[FotoCaballo]:
    """Elimina una foto de caballo."""
    db_foto = db.query(FotoCaballo).filter(FotoCaballo.id == foto_id).first()
    if db_foto:
        db.delete(db_foto)
        db.commit()
    return db_foto


# ========== VACUNAS ==========

def registrar_vacuna(db: Session, vacuna_data: VacunaRegistroCreate) -> VacunaRegistro:
    """
    Registra una vacuna y calcula automáticamente la próxima fecha si se proporciona frecuencia.

    Args:
        db: Sesión de base de datos
        vacuna_data: Datos de la vacuna

    Returns:
        VacunaRegistro: Vacuna registrada
    """
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == vacuna_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    # Calcular próxima fecha si se proporciona frecuencia
    data_dict = vacuna_data.model_dump()
    if vacuna_data.frecuencia_dias and not vacuna_data.proxima_fecha:
        data_dict['proxima_fecha'] = calcular_proxima_fecha(
            vacuna_data.fecha,
            vacuna_data.frecuencia_dias
        )

    vacuna = VacunaRegistro(**data_dict)
    db.add(vacuna)
    db.commit()
    db.refresh(vacuna)

    return vacuna


def actualizar_vacuna(
    db: Session,
    vacuna_id: UUID,
    vacuna_data: VacunaRegistroUpdate
) -> VacunaRegistro:
    """Actualiza un registro de vacuna"""
    vacuna = db.query(VacunaRegistro).filter(VacunaRegistro.id == vacuna_id).first()

    if not vacuna:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de vacuna no encontrado"
        )

    # Actualizar campos
    update_data = vacuna_data.model_dump(exclude_unset=True)

    # Recalcular próxima fecha si cambia la fecha o frecuencia
    if ('fecha' in update_data or 'frecuencia_dias' in update_data) and vacuna.frecuencia_dias:
        nueva_fecha = update_data.get('fecha', vacuna.fecha)
        nueva_frecuencia = update_data.get('frecuencia_dias', vacuna.frecuencia_dias)
        update_data['proxima_fecha'] = calcular_proxima_fecha(nueva_fecha, nueva_frecuencia)

    for field, value in update_data.items():
        setattr(vacuna, field, value)

    db.commit()
    db.refresh(vacuna)

    return vacuna


def listar_vacunas_caballo(db: Session, caballo_id: UUID) -> List[VacunaRegistro]:
    """Lista todas las vacunas de un caballo"""
    return db.query(VacunaRegistro).filter(
        VacunaRegistro.caballo_id == caballo_id
    ).order_by(VacunaRegistro.fecha.desc()).all()


def eliminar_vacuna(db: Session, vacuna_id: UUID) -> None:
    """Elimina un registro de vacuna"""
    vacuna = db.query(VacunaRegistro).filter(VacunaRegistro.id == vacuna_id).first()

    if not vacuna:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de vacuna no encontrado"
        )

    db.delete(vacuna)
    db.commit()


# ========== HERRAJES ==========

def registrar_herraje(db: Session, herraje_data: HerrajeRegistroCreate) -> HerrjeRegistro:
    """Registra un herraje"""
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == herraje_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    herraje = HerrjeRegistro(**herraje_data.model_dump())
    db.add(herraje)
    db.commit()
    db.refresh(herraje)

    return herraje


def actualizar_herraje(
    db: Session,
    herraje_id: UUID,
    herraje_data: HerrajeRegistroUpdate
) -> HerrjeRegistro:
    """Actualiza un registro de herraje"""
    herraje = db.query(HerrjeRegistro).filter(HerrjeRegistro.id == herraje_id).first()

    if not herraje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de herraje no encontrado"
        )

    update_data = herraje_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(herraje, field, value)

    db.commit()
    db.refresh(herraje)

    return herraje


def listar_herrajes_caballo(db: Session, caballo_id: UUID) -> List[HerrjeRegistro]:
    """Lista todos los herrajes de un caballo"""
    return db.query(HerrjeRegistro).filter(
        HerrjeRegistro.caballo_id == caballo_id
    ).order_by(HerrjeRegistro.fecha.desc()).all()


def eliminar_herraje(db: Session, herraje_id: UUID) -> None:
    """Elimina un registro de herraje"""
    herraje = db.query(HerrjeRegistro).filter(HerrjeRegistro.id == herraje_id).first()

    if not herraje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de herraje no encontrado"
        )

    db.delete(herraje)
    db.commit()


# ========== ANTIPARASITARIOS ==========

def registrar_antiparasitario(
    db: Session,
    antiparasitario_data: AntiparasitarioRegistroCreate
) -> AntiparasitarioRegistro:
    """Registra una aplicación de antiparasitario"""
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == antiparasitario_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    antiparasitario = AntiparasitarioRegistro(**antiparasitario_data.model_dump())
    db.add(antiparasitario)
    db.commit()
    db.refresh(antiparasitario)

    return antiparasitario


def actualizar_antiparasitario(
    db: Session,
    antiparasitario_id: UUID,
    antiparasitario_data: AntiparasitarioRegistroUpdate
) -> AntiparasitarioRegistro:
    """Actualiza un registro de antiparasitario"""
    antiparasitario = db.query(AntiparasitarioRegistro).filter(
        AntiparasitarioRegistro.id == antiparasitario_id
    ).first()

    if not antiparasitario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de antiparasitario no encontrado"
        )

    update_data = antiparasitario_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(antiparasitario, field, value)

    db.commit()
    db.refresh(antiparasitario)

    return antiparasitario


def listar_antiparasitarios_caballo(db: Session, caballo_id: UUID) -> List[AntiparasitarioRegistro]:
    """Lista todos los antiparasitarios de un caballo"""
    return db.query(AntiparasitarioRegistro).filter(
        AntiparasitarioRegistro.caballo_id == caballo_id
    ).order_by(AntiparasitarioRegistro.fecha.desc()).all()


def eliminar_antiparasitario(db: Session, antiparasitario_id: UUID) -> None:
    """Elimina un registro de antiparasitario"""
    antiparasitario = db.query(AntiparasitarioRegistro).filter(
        AntiparasitarioRegistro.id == antiparasitario_id
    ).first()

    if not antiparasitario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de antiparasitario no encontrado"
        )

    db.delete(antiparasitario)
    db.commit()


# ========== REVISIONES DENTALES ==========

def registrar_revision_dental(
    db: Session,
    revision_data: RevisionDentalCreate
) -> RevisionDentalRegistro:
    """Registra una revisión dental"""
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == revision_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    revision = RevisionDentalRegistro(**revision_data.model_dump())
    db.add(revision)
    db.commit()
    db.refresh(revision)

    return revision


def actualizar_revision_dental(
    db: Session,
    revision_id: UUID,
    revision_data: RevisionDentalUpdate
) -> RevisionDentalRegistro:
    """Actualiza una revisión dental"""
    revision = db.query(RevisionDentalRegistro).filter(
        RevisionDentalRegistro.id == revision_id
    ).first()

    if not revision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revisión dental no encontrada"
        )

    update_data = revision_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(revision, field, value)

    db.commit()
    db.refresh(revision)

    return revision


def listar_revisiones_dentales_caballo(db: Session, caballo_id: UUID) -> List[RevisionDentalRegistro]:
    """Lista todas las revisiones dentales de un caballo"""
    return db.query(RevisionDentalRegistro).filter(
        RevisionDentalRegistro.caballo_id == caballo_id
    ).order_by(RevisionDentalRegistro.fecha.desc()).all()


def eliminar_revision_dental(db: Session, revision_id: UUID) -> None:
    """Elimina una revisión dental"""
    revision = db.query(RevisionDentalRegistro).filter(
        RevisionDentalRegistro.id == revision_id
    ).first()

    if not revision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revisión dental no encontrada"
        )

    db.delete(revision)
    db.commit()


# ========== ESTUDIOS MÉDICOS ==========

def registrar_estudio_medico(
    db: Session,
    estudio_data: EstudioMedicoCreate
) -> EstudioMedicoRegistro:
    """Registra un estudio médico"""
    # Verificar que el caballo existe
    caballo = db.query(Caballo).filter(Caballo.id == estudio_data.caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    estudio = EstudioMedicoRegistro(**estudio_data.model_dump())
    db.add(estudio)
    db.commit()
    db.refresh(estudio)

    return estudio


def actualizar_estudio_medico(
    db: Session,
    estudio_id: UUID,
    estudio_data: EstudioMedicoUpdate
) -> EstudioMedicoRegistro:
    """Actualiza un estudio médico"""
    estudio = db.query(EstudioMedicoRegistro).filter(
        EstudioMedicoRegistro.id == estudio_id
    ).first()

    if not estudio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio médico no encontrado"
        )

    update_data = estudio_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(estudio, field, value)

    db.commit()
    db.refresh(estudio)

    return estudio


def listar_estudios_medicos_caballo(db: Session, caballo_id: UUID) -> List[EstudioMedicoRegistro]:
    """Lista todos los estudios médicos de un caballo"""
    return db.query(EstudioMedicoRegistro).filter(
        EstudioMedicoRegistro.caballo_id == caballo_id
    ).order_by(EstudioMedicoRegistro.fecha.desc()).all()


def eliminar_estudio_medico(db: Session, estudio_id: UUID) -> None:
    """Elimina un estudio médico"""
    estudio = db.query(EstudioMedicoRegistro).filter(
        EstudioMedicoRegistro.id == estudio_id
    ).first()

    if not estudio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio médico no encontrado"
        )

    db.delete(estudio)
    db.commit()


# ========== PLAN SANITARIO ==========

def obtener_plan_sanitario(db: Session, caballo_id: UUID, anio: Optional[int] = None):
    """
    Obtiene el plan sanitario del caballo según su categoría.
    Cruza el calendario planificado con los registros reales para mostrar cumplimiento.
    """
    from app.constants import PLAN_SANITARIO_2026
    from app.schemas.caballo import PlanSanitarioResponse, MesPlanSanitario, ActividadPlanSanitario

    # Obtener el caballo
    caballo = db.query(Caballo).filter(Caballo.id == caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    # Si no tiene categoría sanitaria, devolver respuesta vacía
    if not caballo.categoria_sanitaria:
        return PlanSanitarioResponse(
            categoria=None,
            nombre_categoria=None,
            descripcion="Este caballo aún no tiene una categoría sanitaria asignada. Edite el caballo para asignarle una categoría (A o B).",
            calendario=[],
            anio=anio or datetime.now().year
        )

    # Obtener plan de la categoría
    plan = PLAN_SANITARIO_2026.get(caballo.categoria_sanitaria)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Categoría sanitaria inválida: {caballo.categoria_sanitaria}"
        )

    # Año del plan (por defecto año actual)
    if anio is None:
        anio = datetime.now().year

    # Obtener registros del año
    inicio_anio = date(anio, 1, 1)
    fin_anio = date(anio, 12, 31)

    # Vacunas y AIE (análisis)
    vacunas = db.query(VacunaRegistro).filter(
        VacunaRegistro.caballo_id == caballo_id,
        VacunaRegistro.fecha >= inicio_anio,
        VacunaRegistro.fecha <= fin_anio
    ).all()

    # Antiparasitarios (desparasitación)
    antiparasitarios = db.query(AntiparasitarioRegistro).filter(
        AntiparasitarioRegistro.caballo_id == caballo_id,
        AntiparasitarioRegistro.fecha >= inicio_anio,
        AntiparasitarioRegistro.fecha <= fin_anio
    ).all()

    # Construir calendario con estado de cumplimiento
    calendario_response = []

    for mes_data in plan["calendario"]:
        actividades_response = []

        for actividad in mes_data["actividades"]:
            # Buscar si la actividad fue realizada este año en este mes
            realizada = False
            fecha_realizada = None
            proxima_fecha = None

            mes_inicio = date(anio, mes_data["mes"], 1)
            # Último día del mes
            if mes_data["mes"] == 12:
                mes_fin = date(anio, 12, 31)
            else:
                mes_fin = date(anio, mes_data["mes"] + 1, 1) - timedelta(days=1)

            # Verificar según el tipo de actividad
            if actividad["tipo"] in ["vacuna", "analisis"]:
                # Buscar en vacunas
                for vacuna in vacunas:
                    if vacuna.fecha >= mes_inicio and vacuna.fecha <= mes_fin:
                        # Coincide si el nombre de la actividad está en el tipo de vacuna (case-insensitive)
                        nombre_act = actividad["nombre"].lower()
                        tipo_vac = vacuna.tipo.lower()

                        # Mapeo simplificado
                        if ("aie" in nombre_act and "aie" in tipo_vac) or \
                           ("influenza" in nombre_act and "influenza" in tipo_vac) or \
                           ("rabia" in nombre_act or "rabica" in nombre_act) and ("rabia" in tipo_vac or "rabica" in tipo_vac) or \
                           ("adenitis" in nombre_act and "adenitis" in tipo_vac) or \
                           ("quintuple" in nombre_act or "quíntuple" in nombre_act) and ("quintuple" in tipo_vac or "quíntuple" in tipo_vac):
                            realizada = True
                            fecha_realizada = vacuna.fecha
                            proxima_fecha = vacuna.proxima_fecha
                            break

            elif actividad["tipo"] == "desparasitacion":
                # Buscar en antiparasitarios
                for antipar in antiparasitarios:
                    if antipar.fecha >= mes_inicio and antipar.fecha <= mes_fin:
                        realizada = True
                        fecha_realizada = antipar.fecha
                        proxima_fecha = antipar.proxima_aplicacion
                        break

            actividades_response.append(
                ActividadPlanSanitario(
                    tipo=actividad["tipo"],
                    nombre=actividad["nombre"],
                    descripcion=actividad["descripcion"],
                    realizada=realizada,
                    fecha_realizada=fecha_realizada,
                    proxima_fecha=proxima_fecha
                )
            )

        calendario_response.append(
            MesPlanSanitario(
                mes=mes_data["mes"],
                mes_nombre=mes_data["mes_nombre"],
                actividades=actividades_response
            )
        )

    return PlanSanitarioResponse(
        categoria=caballo.categoria_sanitaria,
        nombre_categoria=plan["nombre"],
        descripcion=plan["descripcion"],
        costo_mensual=plan.get("costo_mensual"),
        dosis_anuales=plan.get("dosis_anuales"),
        calendario=calendario_response,
        anio=anio
    )


def obtener_estadisticas_plan_sanitario(db: Session, caballo_id: UUID, anio: Optional[int] = None):
    """
    Obtiene estadísticas de cumplimiento del plan sanitario del caballo.
    Calcula actividades pendientes, vencidas y porcentaje de cumplimiento.
    """
    from app.constants import PLAN_SANITARIO_2026
    from app.schemas.caballo import EstadisticasPlanSanitario, ActividadPendiente

    # Obtener el caballo
    caballo = db.query(Caballo).filter(Caballo.id == caballo_id).first()
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    # Si no tiene categoría sanitaria
    if not caballo.categoria_sanitaria:
        return EstadisticasPlanSanitario(
            categoria=None,
            tiene_plan=False,
            costo_mensual=None,
            costo_anual=None,
            anio=anio or datetime.now().year,
            total_actividades=0,
            actividades_realizadas=0,
            actividades_pendientes=0,
            porcentaje_cumplimiento=0.0,
            proximas_actividades=[],
            actividades_vencidas=[]
        )

    # Obtener plan
    plan = PLAN_SANITARIO_2026.get(caballo.categoria_sanitaria)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Categoría sanitaria inválida: {caballo.categoria_sanitaria}"
        )

    if anio is None:
        anio = datetime.now().year

    # Obtener plan sanitario completo para analizar
    plan_completo = obtener_plan_sanitario(db, caballo_id, anio)

    # Calcular totales
    total_actividades = 0
    actividades_realizadas = 0
    proximas_actividades = []
    actividades_vencidas = []

    mes_actual = datetime.now().month if anio == datetime.now().year else 1
    dia_actual = datetime.now().day if anio == datetime.now().year else 1

    for mes_data in plan_completo.calendario:
        for actividad in mes_data.actividades:
            total_actividades += 1

            if actividad.realizada:
                actividades_realizadas += 1
            else:
                # Calcular si está vencida o pendiente
                if anio == datetime.now().year:
                    if mes_data.mes < mes_actual:
                        # Mes pasado, actividad vencida
                        # Calcular días vencidos aproximadamente
                        fecha_estimada = date(anio, mes_data.mes, 15)  # Medio del mes
                        dias_vencido = (date.today() - fecha_estimada).days

                        actividades_vencidas.append(
                            ActividadPendiente(
                                mes=mes_data.mes,
                                mes_nombre=mes_data.mes_nombre,
                                tipo=actividad.tipo,
                                nombre=actividad.nombre,
                                descripcion=actividad.descripcion,
                                dias_vencido=dias_vencido
                            )
                        )
                    elif mes_data.mes == mes_actual:
                        # Mes actual, puede estar vencida o pendiente dependiendo del día
                        # La consideramos pendiente si aún no pasó el mes
                        proximas_actividades.append(
                            ActividadPendiente(
                                mes=mes_data.mes,
                                mes_nombre=mes_data.mes_nombre,
                                tipo=actividad.tipo,
                                nombre=actividad.nombre,
                                descripcion=actividad.descripcion,
                                dias_vencido=None
                            )
                        )
                    else:
                        # Mes futuro, pendiente
                        proximas_actividades.append(
                            ActividadPendiente(
                                mes=mes_data.mes,
                                mes_nombre=mes_data.mes_nombre,
                                tipo=actividad.tipo,
                                nombre=actividad.nombre,
                                descripcion=actividad.descripcion,
                                dias_vencido=None
                            )
                        )
                else:
                    # Año distinto al actual, todas son pendientes
                    proximas_actividades.append(
                        ActividadPendiente(
                            mes=mes_data.mes,
                            mes_nombre=mes_data.mes_nombre,
                            tipo=actividad.tipo,
                            nombre=actividad.nombre,
                            descripcion=actividad.descripcion,
                            dias_vencido=None
                        )
                    )

    actividades_pendientes = total_actividades - actividades_realizadas
    porcentaje_cumplimiento = (actividades_realizadas / total_actividades * 100) if total_actividades > 0 else 0.0

    costo_mensual = plan.get("costo_mensual")
    costo_anual = costo_mensual * 12 if costo_mensual else None

    # Ordenar próximas actividades por mes
    proximas_actividades.sort(key=lambda x: x.mes)

    # Limitar a las próximas 5 actividades
    proximas_actividades = proximas_actividades[:5]

    return EstadisticasPlanSanitario(
        categoria=caballo.categoria_sanitaria,
        tiene_plan=True,
        costo_mensual=costo_mensual,
        costo_anual=costo_anual,
        anio=anio,
        total_actividades=total_actividades,
        actividades_realizadas=actividades_realizadas,
        actividades_pendientes=actividades_pendientes,
        porcentaje_cumplimiento=round(porcentaje_cumplimiento, 1),
        proximas_actividades=proximas_actividades,
        actividades_vencidas=actividades_vencidas
    )
