from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario, RolEnum
from app.schemas.usuario import UsuarioSchema, UsuarioCreate, UsuarioUpdate
from app.services import usuario_service

router = APIRouter()


@router.get("/", response_model=List[UsuarioSchema])
async def listar_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Lista todos los usuarios con paginación. Solo accesible por admins."""
    return usuario_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo
    )


@router.get("/buscar", response_model=List[UsuarioSchema])
async def buscar_usuarios(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Busca usuarios por email. Solo accesible por admins."""
    return usuario_service.buscar(db, termino=q, skip=skip, limit=limit)


@router.get("/por-rol/{rol}", response_model=List[UsuarioSchema])
async def obtener_usuarios_por_rol(
    rol: RolEnum,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene usuarios por rol. Solo accesible por admins."""
    return usuario_service.obtener_por_rol(db, rol)


@router.get("/me", response_model=UsuarioSchema)
async def obtener_usuario_actual(
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene el perfil del usuario autenticado actual."""
    return current_user


@router.post(
    "/",
    response_model=UsuarioSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Crea un nuevo usuario.
    Solo accesible por admins o super admins.

    - **email**: Email único del usuario
    - **password**: Contraseña (mínimo 6 caracteres)
    - **rol**: Rol del usuario (super_admin, admin, empleado, cliente)
    - **permisos**: Opcional - Permisos granulares en formato JSONB
    """
    # Solo super_admin puede crear otros super_admin
    if usuario.rol == RolEnum.SUPER_ADMIN and current_user.rol != RolEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un super admin puede crear otros super admins"
        )

    return usuario_service.crear(db, usuario)


@router.get("/{usuario_id}", response_model=UsuarioSchema)
async def obtener_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene un usuario específico por ID.
    Los usuarios pueden ver su propio perfil.
    Los admins pueden ver cualquier usuario.
    """
    usuario = usuario_service.obtener_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Verificar permisos: solo admins o el propio usuario pueden ver
    if current_user.id != usuario_id and current_user.rol not in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver este usuario"
        )

    return usuario


@router.put("/{usuario_id}", response_model=UsuarioSchema)
async def actualizar_usuario(
    usuario_id: UUID,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Actualiza un usuario existente.
    Los usuarios pueden actualizar su propio perfil (excepto rol y permisos).
    Los admins pueden actualizar cualquier usuario.
    """
    usuario = usuario_service.obtener_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Verificar permisos
    es_propio_perfil = current_user.id == usuario_id
    es_admin = current_user.rol in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]

    if not es_propio_perfil and not es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para actualizar este usuario"
        )

    # Si no es admin, no puede cambiar rol ni permisos
    if es_propio_perfil and not es_admin:
        if usuario_update.rol is not None or usuario_update.permisos is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puede modificar su propio rol o permisos"
            )

    # Solo super_admin puede crear/modificar otros super_admin
    if usuario_update.rol == RolEnum.SUPER_ADMIN and current_user.rol != RolEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un super admin puede asignar el rol de super admin"
        )

    # No se puede modificar el último super_admin activo
    if usuario.rol == RolEnum.SUPER_ADMIN and (usuario_update.activo is False or usuario_update.rol != RolEnum.SUPER_ADMIN):
        super_admins_activos = usuario_service.obtener_por_rol(db, RolEnum.SUPER_ADMIN)
        if len([u for u in super_admins_activos if u.activo]) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede desactivar o cambiar el rol del último super admin activo"
            )

    return usuario_service.actualizar(db, usuario_id, usuario_update)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Elimina un usuario (soft delete).
    Solo accesible por admins.
    """
    usuario = usuario_service.obtener_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # No se puede eliminar el propio usuario
    if current_user.id == usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminar su propia cuenta"
        )

    # No se puede eliminar el último super_admin activo
    if usuario.rol == RolEnum.SUPER_ADMIN:
        super_admins_activos = usuario_service.obtener_por_rol(db, RolEnum.SUPER_ADMIN)
        if len([u for u in super_admins_activos if u.activo]) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el último super admin activo"
            )

    usuario_service.eliminar(db, usuario_id)
    return None


@router.put("/{usuario_id}/permisos", response_model=UsuarioSchema)
async def actualizar_permisos_usuario(
    usuario_id: UUID,
    permisos: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Actualiza los permisos granulares de un usuario.
    Solo accesible por admins.

    **Estructura de permisos:**
    ```json
    {
        "dashboard": {"ver": true, "crear": false, "editar": false, "eliminar": false},
        "caballos": {"ver": true, "crear": true, "editar": true, "eliminar": false},
        ...
    }
    ```
    """
    usuario = usuario_service.actualizar_permisos(db, usuario_id, permisos)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario
