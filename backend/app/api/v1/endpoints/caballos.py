from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.caballo import (
    CaballoSchema,
    CaballoCreate,
    CaballoUpdate,
    CaballoCompleto,
    FotoCaballoSchema,
    FotoCaballoCreate,
    VacunaRegistroSchema,
    VacunaRegistroCreate,
    VacunaRegistroUpdate,
    RevisionDentalSchema,
    RevisionDentalCreate,
    RevisionDentalUpdate,
    EstudioMedicoSchema,
    EstudioMedicoCreate,
    EstudioMedicoUpdate,
    HerrajeRegistroSchema,
    HerrajeRegistroCreate,
    HerrajeRegistroUpdate,
    AntiparasitarioRegistroSchema,
    AntiparasitarioRegistroCreate,
    AntiparasitarioRegistroUpdate
)
from app.schemas.historial_medico import HistorialMedicoSchema, HistorialMedicoCreate, HistorialMedicoUpdate
from app.schemas.plan_alimentacion import PlanAlimentacionSchema, PlanAlimentacionCreate, PlanAlimentacionUpdate
from app.services import caballo_service, historial_medico_service, plan_alimentacion_service

router = APIRouter()


@router.get("/", response_model=List[CaballoSchema])
async def listar_caballos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    propietario_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los caballos con paginación."""
    return caballo_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo,
        propietario_id=propietario_id
    )


@router.get("/buscar", response_model=List[CaballoSchema])
async def buscar_caballos(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Busca caballos por nombre o raza."""
    return caballo_service.buscar(db, termino=q, skip=skip, limit=limit)


@router.post("/debug")
async def debug_caballo(request: dict):
    """Endpoint temporal para debug - ver qué datos llegan"""
    import json
    print("=" * 50)
    print("DEBUG: Datos recibidos del frontend:")
    print(json.dumps(request, indent=2, default=str))
    print("=" * 50)
    return {"received": request}

@router.post(
    "/",
    response_model=CaballoSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_caballo(
    caballo: CaballoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo caballo."""
    try:
        import json
        print("=" * 50)
        print("Caballo data validated:")
        print(json.dumps(caballo.model_dump(), indent=2, default=str))
        print("=" * 50)
        return caballo_service.crear(db, caballo)
    except Exception as e:
        import traceback
        print(f"Error creating caballo: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise


@router.get("/{caballo_id}", response_model=CaballoSchema)
async def obtener_caballo(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un caballo específico por ID."""
    caballo = caballo_service.obtener_por_id(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )
    return caballo


@router.put("/{caballo_id}", response_model=CaballoSchema)
async def actualizar_caballo(
    caballo_id: UUID,
    caballo_update: CaballoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un caballo existente."""
    caballo = caballo_service.actualizar(db, caballo_id, caballo_update)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )
    return caballo


@router.delete("/{caballo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_caballo(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un caballo (soft delete)."""
    caballo = caballo_service.eliminar(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )
    return None


# Fotos
@router.get("/{caballo_id}/fotos", response_model=List[FotoCaballoSchema])
async def obtener_fotos_caballo(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene todas las fotos de un caballo."""
    return caballo_service.obtener_fotos(db, caballo_id)


@router.post("/{caballo_id}/fotos", response_model=FotoCaballoSchema, status_code=status.HTTP_201_CREATED)
async def agregar_foto_caballo(
    caballo_id: UUID,
    foto: FotoCaballoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Agrega una foto a un caballo."""
    # Verificar que el caballo existe
    caballo = caballo_service.obtener_por_id(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    foto.caballo_id = caballo_id
    return caballo_service.agregar_foto(db, foto)


# Historial Médico
@router.get("/{caballo_id}/historial-medico", response_model=List[HistorialMedicoSchema])
async def obtener_historial_medico(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene el historial médico completo de un caballo."""
    return historial_medico_service.obtener_por_caballo(db, caballo_id)


@router.post("/{caballo_id}/historial-medico", response_model=HistorialMedicoSchema, status_code=status.HTTP_201_CREATED)
async def crear_historial_medico(
    caballo_id: UUID,
    historial: HistorialMedicoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo registro en el historial médico."""
    # Verificar que el caballo existe
    caballo = caballo_service.obtener_por_id(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    historial.caballo_id = caballo_id
    return historial_medico_service.crear(db, historial)


# Plan de Alimentación
@router.get("/{caballo_id}/plan-alimentacion", response_model=PlanAlimentacionSchema)
async def obtener_plan_alimentacion(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene el plan de alimentación de un caballo."""
    plan = plan_alimentacion_service.obtener_por_caballo(db, caballo_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de alimentación no encontrado"
        )
    return plan


@router.post("/{caballo_id}/plan-alimentacion", response_model=PlanAlimentacionSchema, status_code=status.HTTP_201_CREATED)
async def crear_plan_alimentacion(
    caballo_id: UUID,
    plan: PlanAlimentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un plan de alimentación para un caballo."""
    # Verificar que el caballo existe
    caballo = caballo_service.obtener_por_id(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )

    plan.caballo_id = caballo_id
    return plan_alimentacion_service.crear(db, plan, current_user.id)


@router.put("/{caballo_id}/plan-alimentacion", response_model=PlanAlimentacionSchema)
async def actualizar_plan_alimentacion(
    caballo_id: UUID,
    plan_update: PlanAlimentacionUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza el plan de alimentación de un caballo."""
    plan = plan_alimentacion_service.actualizar(db, caballo_id, plan_update, current_user.id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de alimentación no encontrado"
        )
    return plan


# ========== CABALLO COMPLETO ==========

@router.get("/{caballo_id}/completo", response_model=CaballoCompleto)
async def obtener_caballo_completo(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un caballo con todas sus relaciones (fotos, vacunas, herrajes, antiparasitarios)."""
    caballo = caballo_service.obtener_por_id(db, caballo_id)
    if not caballo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caballo no encontrado"
        )
    return caballo


# ========== FOTOS - ENDPOINTS ADICIONALES ==========

@router.put("/fotos/{foto_id}/principal", response_model=FotoCaballoSchema)
async def marcar_foto_principal(
    foto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Marca una foto como principal."""
    return caballo_service.marcar_foto_como_principal(db, foto_id)


@router.delete("/fotos/{foto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_foto(
    foto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina una foto."""
    foto = caballo_service.eliminar_foto(db, foto_id)
    if not foto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto no encontrada"
        )
    return None


# ========== VACUNAS ==========

@router.get("/{caballo_id}/vacunas", response_model=List[VacunaRegistroSchema])
async def listar_vacunas(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todas las vacunas de un caballo."""
    return caballo_service.listar_vacunas_caballo(db, caballo_id)


@router.post("/{caballo_id}/vacunas", response_model=VacunaRegistroSchema, status_code=status.HTTP_201_CREATED)
async def registrar_vacuna(
    caballo_id: UUID,
    vacuna: VacunaRegistroCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra una nueva vacuna para un caballo."""
    vacuna.caballo_id = caballo_id
    return caballo_service.registrar_vacuna(db, vacuna)


@router.put("/vacunas/{vacuna_id}", response_model=VacunaRegistroSchema)
async def actualizar_vacuna(
    vacuna_id: UUID,
    vacuna_update: VacunaRegistroUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un registro de vacuna."""
    return caballo_service.actualizar_vacuna(db, vacuna_id, vacuna_update)


@router.delete("/vacunas/{vacuna_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_vacuna(
    vacuna_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un registro de vacuna."""
    caballo_service.eliminar_vacuna(db, vacuna_id)
    return None


# ========== HERRAJES ==========

@router.get("/{caballo_id}/herrajes", response_model=List[HerrajeRegistroSchema])
async def listar_herrajes(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los herrajes de un caballo."""
    return caballo_service.listar_herrajes_caballo(db, caballo_id)


@router.post("/{caballo_id}/herrajes", response_model=HerrajeRegistroSchema, status_code=status.HTTP_201_CREATED)
async def registrar_herraje(
    caballo_id: UUID,
    herraje: HerrajeRegistroCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra un nuevo herraje para un caballo."""
    herraje.caballo_id = caballo_id
    return caballo_service.registrar_herraje(db, herraje)


@router.put("/herrajes/{herraje_id}", response_model=HerrajeRegistroSchema)
async def actualizar_herraje(
    herraje_id: UUID,
    herraje_update: HerrajeRegistroUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un registro de herraje."""
    return caballo_service.actualizar_herraje(db, herraje_id, herraje_update)


@router.delete("/herrajes/{herraje_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_herraje(
    herraje_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un registro de herraje."""
    caballo_service.eliminar_herraje(db, herraje_id)
    return None


# ========== ANTIPARASITARIOS ==========

@router.get("/{caballo_id}/antiparasitarios", response_model=List[AntiparasitarioRegistroSchema])
async def listar_antiparasitarios(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los antiparasitarios de un caballo."""
    return caballo_service.listar_antiparasitarios_caballo(db, caballo_id)


@router.post("/{caballo_id}/antiparasitarios", response_model=AntiparasitarioRegistroSchema, status_code=status.HTTP_201_CREATED)
async def registrar_antiparasitario(
    caballo_id: UUID,
    antiparasitario: AntiparasitarioRegistroCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra un nuevo antiparasitario para un caballo."""
    antiparasitario.caballo_id = caballo_id
    return caballo_service.registrar_antiparasitario(db, antiparasitario)


@router.put("/antiparasitarios/{antiparasitario_id}", response_model=AntiparasitarioRegistroSchema)
async def actualizar_antiparasitario(
    antiparasitario_id: UUID,
    antiparasitario_update: AntiparasitarioRegistroUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un registro de antiparasitario."""
    return caballo_service.actualizar_antiparasitario(db, antiparasitario_id, antiparasitario_update)


@router.delete("/antiparasitarios/{antiparasitario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_antiparasitario(
    antiparasitario_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un registro de antiparasitario."""
    caballo_service.eliminar_antiparasitario(db, antiparasitario_id)
    return None


# ========== REVISIONES DENTALES ==========

@router.get("/{caballo_id}/revisiones-dentales", response_model=List[RevisionDentalSchema])
async def listar_revisiones_dentales(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todas las revisiones dentales de un caballo."""
    return caballo_service.listar_revisiones_dentales_caballo(db, caballo_id)


@router.post("/{caballo_id}/revisiones-dentales", response_model=RevisionDentalSchema, status_code=status.HTTP_201_CREATED)
async def registrar_revision_dental(
    caballo_id: UUID,
    revision: RevisionDentalCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra una nueva revisión dental para un caballo."""
    revision.caballo_id = caballo_id
    return caballo_service.registrar_revision_dental(db, revision)


@router.put("/revisiones-dentales/{revision_id}", response_model=RevisionDentalSchema)
async def actualizar_revision_dental(
    revision_id: UUID,
    revision_update: RevisionDentalUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza una revisión dental."""
    return caballo_service.actualizar_revision_dental(db, revision_id, revision_update)


@router.delete("/revisiones-dentales/{revision_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_revision_dental(
    revision_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina una revisión dental."""
    caballo_service.eliminar_revision_dental(db, revision_id)
    return None


# ========== ESTUDIOS MÉDICOS ==========

@router.get("/{caballo_id}/estudios-medicos", response_model=List[EstudioMedicoSchema])
async def listar_estudios_medicos(
    caballo_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los estudios médicos de un caballo."""
    return caballo_service.listar_estudios_medicos_caballo(db, caballo_id)


@router.post("/{caballo_id}/estudios-medicos", response_model=EstudioMedicoSchema, status_code=status.HTTP_201_CREATED)
async def registrar_estudio_medico(
    caballo_id: UUID,
    estudio: EstudioMedicoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Registra un nuevo estudio médico para un caballo."""
    estudio.caballo_id = caballo_id
    return caballo_service.registrar_estudio_medico(db, estudio)


@router.put("/estudios-medicos/{estudio_id}", response_model=EstudioMedicoSchema)
async def actualizar_estudio_medico(
    estudio_id: UUID,
    estudio_update: EstudioMedicoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un estudio médico."""
    return caballo_service.actualizar_estudio_medico(db, estudio_id, estudio_update)


@router.delete("/estudios-medicos/{estudio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_estudio_medico(
    estudio_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un estudio médico."""
    caballo_service.eliminar_estudio_medico(db, estudio_id)
    return None
