from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime
from uuid import UUID

from app.models.usuario import Usuario, RolEnum
from app.schemas.usuario import UsuarioCreate, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token


def crear_usuario(db: Session, usuario_data: UsuarioCreate) -> Usuario:
    """
    Crea un nuevo usuario.

    Args:
        db: Sesión de base de datos
        usuario_data: Datos del usuario a crear

    Returns:
        Usuario: Usuario creado

    Raises:
        HTTPException: Si el email ya existe
    """
    # Verificar si el email ya existe
    usuario_existe = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if usuario_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    try:
        # Crear usuario
        password_hash = get_password_hash(usuario_data.password)
        db_usuario = Usuario(
            email=usuario_data.email,
            password_hash=password_hash,
            rol=usuario_data.rol,
            activo=True
        )
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear el usuario"
        )


def autenticar_usuario(db: Session, login_data: LoginRequest) -> Usuario:
    """
    Autentica un usuario con email/DNI y password.

    Args:
        db: Sesión de base de datos
        login_data: Username (email o DNI) y password

    Returns:
        Usuario: Usuario autenticado

    Raises:
        HTTPException: Si las credenciales son incorrectas
    """
    # Importar aquí para evitar dependencia circular
    from app.models.empleado import Empleado
    from app.models.cliente import Cliente

    usuario = None
    username = login_data.username

    # Intentar buscar por email primero
    if '@' in username:
        usuario = db.query(Usuario).filter(Usuario.email == username).first()
    else:
        # Buscar por DNI en empleados
        empleado = db.query(Empleado).filter(Empleado.dni == username).first()
        if empleado and empleado.usuario_id:
            usuario = db.query(Usuario).filter(Usuario.id == empleado.usuario_id).first()

        # Si no se encuentra en empleados, buscar en clientes
        if not usuario:
            cliente = db.query(Cliente).filter(Cliente.dni == username).first()
            if cliente and cliente.usuario_id:
                usuario = db.query(Usuario).filter(Usuario.id == cliente.usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    if not verify_password(login_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    # Actualizar último acceso
    usuario.ultimo_acceso = datetime.utcnow()
    db.commit()

    return usuario


def generar_tokens(usuario: Usuario) -> dict:
    """
    Genera access token y refresh token para un usuario.

    Args:
        usuario: Usuario autenticado

    Returns:
        dict: Tokens generados con información del usuario
    """
    access_token = create_access_token(data={"sub": str(usuario.id)})
    refresh_token = create_refresh_token(data={"sub": str(usuario.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(usuario.id),
            "email": usuario.email,
            "rol": usuario.rol,
            "activo": usuario.activo,
            "ultimo_acceso": usuario.ultimo_acceso,
            "created_at": usuario.created_at,
            "updated_at": usuario.updated_at
        }
    }


def cambiar_password(db: Session, usuario: Usuario, old_password: str, new_password: str) -> Usuario:
    """
    Cambia la contraseña de un usuario.

    Args:
        db: Sesión de base de datos
        usuario: Usuario actual
        old_password: Contraseña anterior
        new_password: Nueva contraseña

    Returns:
        Usuario: Usuario actualizado

    Raises:
        HTTPException: Si la contraseña anterior es incorrecta
    """
    if not verify_password(old_password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )

    usuario.password_hash = get_password_hash(new_password)
    db.commit()
    db.refresh(usuario)

    return usuario


def obtener_usuario_por_id(db: Session, usuario_id: UUID) -> Usuario:
    """
    Obtiene un usuario por ID.

    Args:
        db: Sesión de base de datos
        usuario_id: ID del usuario

    Returns:
        Usuario: Usuario encontrado

    Raises:
        HTTPException: Si el usuario no existe
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario
