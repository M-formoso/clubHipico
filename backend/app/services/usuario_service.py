from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional, Dict, Any
from datetime import date

from app.models.usuario import Usuario, RolEnum
from app.models.empleado import Empleado, FuncionEmpleadoEnum
from app.models.cliente import Cliente
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
    """Crea un nuevo usuario con sus datos de empleado/cliente."""
    # Verificar si el email ya existe
    if obtener_por_email(db, usuario_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    try:
        # Hashear la contraseña
        password_hash = get_password_hash(usuario_data.password)

        # Separar los campos de usuario de los campos de empleado/cliente
        usuario_fields = ['email', 'rol', 'permisos']
        usuario_dict = {k: v for k, v in usuario_data.model_dump(exclude={'password'}).items() if k in usuario_fields}

        db_usuario = Usuario(
            **usuario_dict,
            password_hash=password_hash
        )

        # Si no se proporcionan permisos, asignar permisos por defecto según el rol
        if not db_usuario.permisos:
            db_usuario.permisos = _obtener_permisos_por_defecto(usuario_data.rol)

        db.add(db_usuario)
        db.flush()  # Obtener el ID sin hacer commit

        # Crear empleado o cliente según el rol
        if usuario_data.rol in [RolEnum.SUPER_ADMIN, RolEnum.ADMIN, RolEnum.EMPLEADO]:
            # Crear registro de empleado
            if usuario_data.nombre and usuario_data.apellido:
                empleado_data = {
                    'usuario_id': db_usuario.id,
                    'nombre': usuario_data.nombre,
                    'apellido': usuario_data.apellido,
                }

                if usuario_data.dni:
                    empleado_data['dni'] = usuario_data.dni
                if usuario_data.fecha_nacimiento:
                    empleado_data['fecha_nacimiento'] = date.fromisoformat(usuario_data.fecha_nacimiento)
                if usuario_data.telefono:
                    empleado_data['telefono'] = usuario_data.telefono
                if usuario_data.direccion:
                    empleado_data['direccion'] = usuario_data.direccion
                if usuario_data.funcion:
                    empleado_data['funcion'] = FuncionEmpleadoEnum(usuario_data.funcion)
                else:
                    empleado_data['funcion'] = FuncionEmpleadoEnum.ADMINISTRATIVO  # Default
                if usuario_data.fecha_ingreso:
                    empleado_data['fecha_ingreso'] = date.fromisoformat(usuario_data.fecha_ingreso)
                if usuario_data.salario:
                    empleado_data['salario'] = usuario_data.salario
                if usuario_data.contacto_emergencia:
                    empleado_data['contacto_emergencia'] = usuario_data.contacto_emergencia

                db_empleado = Empleado(**empleado_data)
                db.add(db_empleado)

        elif usuario_data.rol == RolEnum.CLIENTE:
            # Crear registro de cliente
            if usuario_data.nombre and usuario_data.apellido:
                cliente_data = {
                    'usuario_id': db_usuario.id,
                    'nombre': usuario_data.nombre,
                    'apellido': usuario_data.apellido,
                }

                if usuario_data.dni:
                    cliente_data['dni'] = usuario_data.dni
                if usuario_data.fecha_nacimiento:
                    cliente_data['fecha_nacimiento'] = date.fromisoformat(usuario_data.fecha_nacimiento)
                if usuario_data.telefono:
                    cliente_data['telefono'] = usuario_data.telefono
                if usuario_data.direccion:
                    cliente_data['direccion'] = usuario_data.direccion
                if usuario_data.contacto_emergencia:
                    cliente_data['contacto_emergencia'] = usuario_data.contacto_emergencia

                db_cliente = Cliente(**cliente_data)
                db.add(db_cliente)

        db.commit()
        db.refresh(db_usuario)

        # Enriquecer con datos relacionados
        _enriquecer_usuarios_con_info_relacionada([db_usuario])

        return db_usuario
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos. Verifique que el email o DNI no estén duplicados."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear usuario: {str(e)}"
        )


def actualizar(
    db: Session,
    usuario_id: UUID,
    usuario_update: UsuarioUpdate
) -> Optional[Usuario]:
    """Actualiza un usuario existente y sus datos de empleado/cliente."""
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

    # Separar campos de usuario de campos de empleado/cliente
    usuario_fields = ['email', 'rol', 'permisos', 'activo', 'password_hash']
    empleado_cliente_fields = ['nombre', 'apellido', 'dni', 'fecha_nacimiento',
                                'telefono', 'direccion', 'funcion', 'fecha_ingreso',
                                'salario', 'contacto_emergencia']

    # Actualizar campos del usuario
    for field, value in update_data.items():
        if field in usuario_fields:
            setattr(db_usuario, field, value)

    # Actualizar empleado o cliente según corresponda
    if db_usuario.rol in [RolEnum.SUPER_ADMIN, RolEnum.ADMIN, RolEnum.EMPLEADO]:
        if db_usuario.empleado:
            # Actualizar empleado existente
            for field, value in update_data.items():
                if field in empleado_cliente_fields and hasattr(db_usuario.empleado, field):
                    if field == 'fecha_nacimiento' and isinstance(value, str):
                        value = date.fromisoformat(value)
                    elif field == 'fecha_ingreso' and isinstance(value, str):
                        value = date.fromisoformat(value)
                    elif field == 'funcion' and isinstance(value, str):
                        value = FuncionEmpleadoEnum(value)
                    setattr(db_usuario.empleado, field, value)
        else:
            # Crear empleado si no existe
            if 'nombre' in update_data and 'apellido' in update_data:
                empleado_data = {
                    'usuario_id': db_usuario.id,
                    'nombre': update_data.get('nombre'),
                    'apellido': update_data.get('apellido'),
                    'funcion': FuncionEmpleadoEnum(update_data.get('funcion', 'admin'))
                }
                for field in ['dni', 'telefono', 'direccion', 'contacto_emergencia']:
                    if field in update_data:
                        empleado_data[field] = update_data[field]
                if 'fecha_nacimiento' in update_data:
                    empleado_data['fecha_nacimiento'] = date.fromisoformat(update_data['fecha_nacimiento'])
                if 'fecha_ingreso' in update_data:
                    empleado_data['fecha_ingreso'] = date.fromisoformat(update_data['fecha_ingreso'])
                if 'salario' in update_data:
                    empleado_data['salario'] = update_data['salario']

                db_empleado = Empleado(**empleado_data)
                db.add(db_empleado)

    elif db_usuario.rol == RolEnum.CLIENTE:
        if db_usuario.cliente:
            # Actualizar cliente existente
            for field, value in update_data.items():
                if field in empleado_cliente_fields and hasattr(db_usuario.cliente, field):
                    if field == 'fecha_nacimiento' and isinstance(value, str):
                        value = date.fromisoformat(value)
                    setattr(db_usuario.cliente, field, value)
        else:
            # Crear cliente si no existe
            if 'nombre' in update_data and 'apellido' in update_data:
                cliente_data = {
                    'usuario_id': db_usuario.id,
                    'nombre': update_data.get('nombre'),
                    'apellido': update_data.get('apellido'),
                }
                for field in ['dni', 'telefono', 'direccion', 'contacto_emergencia']:
                    if field in update_data:
                        cliente_data[field] = update_data[field]
                if 'fecha_nacimiento' in update_data:
                    cliente_data['fecha_nacimiento'] = date.fromisoformat(update_data['fecha_nacimiento'])

                db_cliente = Cliente(**cliente_data)
                db.add(db_cliente)

    db.commit()
    db.refresh(db_usuario)

    # Enriquecer con datos relacionados
    _enriquecer_usuarios_con_info_relacionada([db_usuario])

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


def _obtener_secciones_caballo_full() -> Dict[str, Any]:
    """Retorna permisos completos para todas las secciones de caballos."""
    return {
        "info_general": {"ver": True, "editar": True},
        "alimentacion": {"ver": True, "editar": True},
        "manejo_trabajo": {"ver": True, "editar": True},
        "historial_clinico": {"ver": True, "editar": True},
        "vacunas": {"ver": True, "editar": True},
        "herrajes": {"ver": True, "editar": True},
        "antiparasitarios": {"ver": True, "editar": True},
        "fotos": {"ver": True, "editar": True},
        "qr": {"ver": True, "editar": True},
        "plan_sanitario": {"ver": True, "editar": True},
    }


def _obtener_secciones_caballo_empleado() -> Dict[str, Any]:
    """Retorna permisos de secciones de caballos para empleados (sin QR ni plan sanitario)."""
    return {
        "info_general": {"ver": True, "editar": True},
        "alimentacion": {"ver": True, "editar": True},
        "manejo_trabajo": {"ver": True, "editar": True},
        "historial_clinico": {"ver": True, "editar": True},
        "vacunas": {"ver": True, "editar": True},
        "herrajes": {"ver": True, "editar": True},
        "antiparasitarios": {"ver": True, "editar": True},
        "fotos": {"ver": True, "editar": True},
        "qr": {"ver": False, "editar": False},
        "plan_sanitario": {"ver": False, "editar": False},
    }


def _obtener_secciones_caballo_cliente() -> Dict[str, Any]:
    """Retorna permisos de secciones de caballos para clientes (solo lectura, sin QR ni plan sanitario)."""
    return {
        "info_general": {"ver": True, "editar": False},
        "alimentacion": {"ver": True, "editar": False},
        "manejo_trabajo": {"ver": True, "editar": False},
        "historial_clinico": {"ver": True, "editar": False},
        "vacunas": {"ver": True, "editar": False},
        "herrajes": {"ver": True, "editar": False},
        "antiparasitarios": {"ver": True, "editar": False},
        "fotos": {"ver": True, "editar": False},
        "qr": {"ver": False, "editar": False},
        "plan_sanitario": {"ver": False, "editar": False},
    }


def _obtener_permisos_por_defecto(rol: RolEnum) -> Dict[str, Any]:
    """Retorna los permisos por defecto según el rol."""

    # Permisos completos para super_admin
    if rol == RolEnum.SUPER_ADMIN:
        return {
            "dashboard": {"ver": True, "crear": True, "editar": True, "eliminar": True},
            "caballos": {
                "ver": True, "crear": True, "editar": True, "eliminar": True,
                "secciones": _obtener_secciones_caballo_full()
            },
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
            "caballos": {
                "ver": True, "crear": True, "editar": True, "eliminar": True,
                "secciones": _obtener_secciones_caballo_full()
            },
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
            "caballos": {
                "ver": True, "crear": True, "editar": True, "eliminar": False,
                "secciones": _obtener_secciones_caballo_empleado()
            },
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
            "caballos": {
                "ver": True, "crear": False, "editar": False, "eliminar": False,
                "secciones": _obtener_secciones_caballo_cliente()
            },
            "clientes": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "empleados": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "eventos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "pagos": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "usuarios": {"ver": False, "crear": False, "editar": False, "eliminar": False},
            "alertas": {"ver": True, "crear": False, "editar": False, "eliminar": False},
            "reportes": {"ver": False, "crear": False, "editar": False, "eliminar": False}
        }
