from typing import Generator
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
