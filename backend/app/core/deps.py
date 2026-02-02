from typing import Generator, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario, RolEnum

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Obtiene el usuario actual desde el JWT token.

    Args:
        credentials: Bearer token de autorización
        db: Sesión de base de datos

    Returns:
        Usuario: Usuario autenticado

    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta subject"
        )

    user = db.query(Usuario).filter(Usuario.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    return user


async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Verifica que el usuario esté activo.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario: Usuario activo

    Raises:
        HTTPException: Si el usuario está inactivo
    """
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user


async def require_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Requiere que el usuario sea administrador.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario: Usuario con permisos de admin

    Raises:
        HTTPException: Si el usuario no es admin
    """
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user


async def require_super_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Requiere que el usuario sea super administrador.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario: Usuario con permisos de super admin

    Raises:
        HTTPException: Si el usuario no es super admin
    """
    if current_user.rol != RolEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super administradores pueden realizar esta acción"
        )
    return current_user


async def require_empleado_or_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Requiere que el usuario sea empleado o administrador.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario: Usuario con permisos de empleado o admin

    Raises:
        HTTPException: Si el usuario es solo cliente
    """
    if current_user.rol == RolEnum.CLIENTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso solo para empleados o administradores"
        )
    return current_user


# ============================================================================
# PERMISOS GRANULARES
# ============================================================================

def verificar_permiso(usuario: Usuario, modulo: str, accion: str) -> bool:
    """
    Verifica si un usuario tiene un permiso específico.

    Args:
        usuario: Usuario a verificar
        modulo: Nombre del módulo (ej: "caballos", "clientes")
        accion: Tipo de acción (ej: "ver", "crear", "editar", "eliminar")

    Returns:
        bool: True si tiene permiso, False en caso contrario
    """
    # Super admin siempre tiene todos los permisos
    if usuario.rol == RolEnum.SUPER_ADMIN:
        return True

    # Usuario inactivo no tiene permisos
    if not usuario.activo:
        return False

    # Si no hay permisos configurados, denegar acceso por seguridad
    if not usuario.permisos:
        return False

    # Verificar permiso en el módulo
    permisos_modulo = usuario.permisos.get(modulo, {})
    return permisos_modulo.get(accion, False)


def require_permission(modulo: str, accion: str) -> Callable:
    """
    Factory que crea una dependencia para verificar permisos granulares.

    Args:
        modulo: Nombre del módulo (ej: "caballos", "clientes")
        accion: Tipo de acción (ej: "ver", "crear", "editar", "eliminar")

    Returns:
        Callable: Función de dependencia para FastAPI

    Example:
        @router.get("/", dependencies=[Depends(require_permission("caballos", "ver"))])
        async def listar_caballos():
            ...
    """
    async def permission_checker(
        current_user: Usuario = Depends(get_current_active_user)
    ) -> Usuario:
        if not verificar_permiso(current_user, modulo, accion):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para {accion} en el módulo {modulo}"
            )
        return current_user

    return permission_checker


# Dependencias específicas por módulo
def require_caballos_ver(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para ver caballos"""
    if not verificar_permiso(current_user, "caballos", "ver"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver caballos"
        )
    return current_user


def require_caballos_crear(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para crear caballos"""
    if not verificar_permiso(current_user, "caballos", "crear"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear caballos"
        )
    return current_user


def require_caballos_editar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para editar caballos"""
    if not verificar_permiso(current_user, "caballos", "editar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar caballos"
        )
    return current_user


def require_caballos_eliminar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para eliminar caballos"""
    if not verificar_permiso(current_user, "caballos", "eliminar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar caballos"
        )
    return current_user


def require_clientes_ver(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para ver clientes"""
    if not verificar_permiso(current_user, "clientes", "ver"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver clientes"
        )
    return current_user


def require_clientes_crear(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para crear clientes"""
    if not verificar_permiso(current_user, "clientes", "crear"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear clientes"
        )
    return current_user


def require_clientes_editar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para editar clientes"""
    if not verificar_permiso(current_user, "clientes", "editar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar clientes"
        )
    return current_user


def require_clientes_eliminar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para eliminar clientes"""
    if not verificar_permiso(current_user, "clientes", "eliminar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar clientes"
        )
    return current_user


def require_pagos_ver(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para ver pagos"""
    if not verificar_permiso(current_user, "pagos", "ver"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver pagos"
        )
    return current_user


def require_pagos_crear(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para crear pagos"""
    if not verificar_permiso(current_user, "pagos", "crear"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear pagos"
        )
    return current_user


def require_pagos_editar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para editar pagos"""
    if not verificar_permiso(current_user, "pagos", "editar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar pagos"
        )
    return current_user


def require_eventos_ver(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para ver eventos"""
    if not verificar_permiso(current_user, "eventos", "ver"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver eventos"
        )
    return current_user


def require_eventos_crear(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para crear eventos"""
    if not verificar_permiso(current_user, "eventos", "crear"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear eventos"
        )
    return current_user


def require_eventos_editar(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Requiere permiso para editar eventos"""
    if not verificar_permiso(current_user, "eventos", "editar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar eventos"
        )
    return current_user
