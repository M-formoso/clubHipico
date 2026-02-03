from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional, Dict, Any

from app.models.usuario import Usuario, RolEnum
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash


def _enriquecer_usuarios_con_info_relacionada(usuarios: List[Usuario]) -> List[Usuario]:
    """Enriquece los usuarios con información de empleado/cliente."""
    for usuario in usuarios:
        if usuario.empleado:
            usuario.nombre = usuario.empleado.nombre
            usuario.apellido = usuario.empleado.apellido
            usuario.dni = usuario.empleado.dni
            usuario.funcion = usuario.empleado.funcion
        elif usuario.cliente:
            usuario.nombre = usuario.cliente.nombre
            usuario.apellido = usuario.cliente.apellido
            usuario.dni = usuario.cliente.dni
            usuario.funcion = None
    return usuarios


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False
) -> List[Usuario]:
    """Obtiene lista de usuarios con paginación."""
    query = db.query(Usuario).options(
        joinedload(Usuario.empleado),
        joinedload(Usuario.cliente)
    )

    if activo_solo:
        query = query.filter(Usuario.activo == True)

    usuarios = query.offset(skip).limit(limit).all()
    return _enriquecer_usuarios_con_info_relacionada(usuarios)


def obtener_por_id(db: Session, usuario_id: UUID) -> Optional[Usuario]:
    """Obtiene un usuario por ID."""
    usuario = db.query(Usuario).options(
        joinedload(Usuario.empleado),
        joinedload(Usuario.cliente)
    ).filter(Usuario.id == usuario_id).first()

    if usuario:
        _enriquecer_usuarios_con_info_relacionada([usuario])
    return usuario


def obtener_por_email(db: Session, email: str) -> Optional[Usuario]:
    """Obtiene un usuario por email."""
    return db.query(Usuario).filter(Usuario.email == email).first()


def crear(db: Session, usuario_data: UsuarioCreate) -> Usuario:
    """Crea un nuevo usuario."""
    # Verificar si el email ya existe
    if obtener_por_email(db, usuario_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    try:
        # Hashear la contraseña
        password_hash = get_password_hash(usuario_data.password)

        # Crear el usuario sin el campo password
        usuario_dict = usuario_data.model_dump(exclude={'password'})
        db_usuario = Usuario(
            **usuario_dict,
            password_hash=password_hash
        )

        # Si no se proporcionan permisos, asignar permisos por defecto según el rol
        if not db_usuario.permisos:
            db_usuario.permisos = _obtener_permisos_por_defecto(usuario_data.rol)

        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos. Verifique que el email no esté duplicado."
        )


def actualizar(
    db: Session,
    usuario_id: UUID,
    usuario_update: UsuarioUpdate
) -> Optional[Usuario]:
    """Actualiza un usuario existente."""
    db_usuario = obtener_por_id(db, usuario_id)
    if not db_usuario:
        return None

    update_data = usuario_update.model_dump(exclude_unset=True)

    # Si se actualiza el password, hashearlo
    if 'password' in update_data and update_data['password']:
        password_hash = get_password_hash(update_data['password'])
        update_data['password_hash'] = password_hash
        del update_data['password']

    # Si se actualiza el email, verificar que no exista
    if 'email' in update_data and update_data['email'] != db_usuario.email:
        if obtener_por_email(db, update_data['email']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

    for field, value in update_data.items():
        setattr(db_usuario, field, value)

    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def eliminar(db: Session, usuario_id: UUID) -> Optional[Usuario]:
    """Elimina un usuario (soft delete marcando como inactivo)."""
    db_usuario = obtener_por_id(db, usuario_id)
    if not db_usuario:
        return None

    # Soft delete
    db_usuario.activo = False
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[Usuario]:
    """Busca usuarios por email."""
    usuarios = db.query(Usuario).options(
        joinedload(Usuario.empleado),
        joinedload(Usuario.cliente)
    ).filter(
        Usuario.email.ilike(f"%{termino}%"),
        Usuario.activo == True
    ).offset(skip).limit(limit).all()
    return _enriquecer_usuarios_con_info_relacionada(usuarios)


def obtener_por_rol(db: Session, rol: RolEnum) -> List[Usuario]:
    """Obtiene usuarios por rol."""
    usuarios = db.query(Usuario).options(
        joinedload(Usuario.empleado),
        joinedload(Usuario.cliente)
    ).filter(
        Usuario.rol == rol,
        Usuario.activo == True
    ).all()
    return _enriquecer_usuarios_con_info_relacionada(usuarios)


def actualizar_permisos(
    db: Session,
    usuario_id: UUID,
    permisos: Dict[str, Any]
) -> Optional[Usuario]:
    """Actualiza los permisos de un usuario."""
    db_usuario = obtener_por_id(db, usuario_id)
    if not db_usuario:
        return None

    db_usuario.permisos = permisos
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def _obtener_permisos_por_defecto(rol: RolEnum) -> Dict[str, Any]:
    """Retorna los permisos por defecto según el rol."""

    # Permisos completos para super_admin
    if rol == RolEnum.SUPER_ADMIN:
        return {
            "dashboard": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "empleados": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "pagos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "usuarios": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "alertas": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "reportes": {"ver": True, "crear": True, "editar": True, "eliminar": True}
        }

    # Permisos para admin (casi completos excepto usuarios)
    elif rol == RolEnum.ADMIN:
        return {
            "dashboard": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "empleados": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "pagos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "usuarios": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "reportes": {"ver": True, "crear": True, "editar": True, "eliminar": False}
        }

    # Permisos para empleado (lectura y algunas escrituras)
    elif rol == RolEnum.EMPLEADO:
        return {
            "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "caballos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "clientes": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "empleados": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "eventos": {"ver": True, "crear": True, "editar": True, "eliminar": False},
            "pagos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "usuarios": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "reportes": {"ver": True, "crear": False, "editar": False, "eliminar": False}
        }

    # Permisos para cliente (solo lectura limitada)
    else:  # RolEnum.CLIENTE
        return {
            "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "caballos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "clientes": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "empleados": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "eventos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "pagos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "usuarios": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "reportes": {"ver": False, "crear": False, "editar": False, "eliminar": False}
        }
