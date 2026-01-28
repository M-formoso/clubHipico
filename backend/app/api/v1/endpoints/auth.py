from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.models.usuario import Usuario
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioSchema,
    LoginRequest,
    Token,
    ChangePasswordRequest
)
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
async def register(
    usuario_data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema.
    """
    return auth_service.crear_usuario(db, usuario_data)


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Inicia sesión con email y password.
    Retorna access_token y refresh_token.
    """
    usuario = auth_service.autenticar_usuario(db, login_data)
    tokens = auth_service.generar_tokens(usuario)
    return tokens


@router.get("/me", response_model=UsuarioSchema)
async def get_current_user_info(
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene la información del usuario autenticado.
    """
    return current_user


@router.post("/change-password", response_model=UsuarioSchema)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cambia la contraseña del usuario autenticado.
    """
    return auth_service.cambiar_password(
        db,
        current_user,
        password_data.old_password,
        password_data.new_password
    )


@router.post("/logout")
async def logout(
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Cierra sesión del usuario.
    En JWT no es necesario hacer nada en el servidor,
    el cliente debe eliminar el token.
    """
    return {"message": "Sesión cerrada exitosamente"}
