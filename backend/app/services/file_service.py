import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status


# Directorio base para archivos subidos
UPLOAD_DIR = Path("uploads")
CABALLOS_DIR = UPLOAD_DIR / "caballos"
USUARIOS_DIR = UPLOAD_DIR / "usuarios"
CLIENTES_DIR = UPLOAD_DIR / "clientes"

# Extensiones permitidas
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def init_upload_directories():
    """Crea los directorios de upload si no existen."""
    UPLOAD_DIR.mkdir(exist_ok=True)
    CABALLOS_DIR.mkdir(exist_ok=True)
    USUARIOS_DIR.mkdir(exist_ok=True)
    CLIENTES_DIR.mkdir(exist_ok=True)


def validate_image_file(file: UploadFile) -> None:
    """Valida que el archivo sea una imagen válida."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de archivo no proporcionado"
        )

    # Verificar extensión
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )


def save_upload_file(file: UploadFile, destination_dir: Path, prefix: str = "") -> str:
    """
    Guarda un archivo subido y retorna la ruta relativa.

    Args:
        file: Archivo subido
        destination_dir: Directorio de destino
        prefix: Prefijo para el nombre del archivo (opcional)

    Returns:
        Ruta relativa del archivo guardado
    """
    try:
        # Generar nombre único
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{prefix}{uuid.uuid4()}{file_ext}"
        file_path = destination_dir / unique_filename

        # Guardar archivo
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Retornar ruta relativa desde el directorio de uploads
        return str(file_path.relative_to(UPLOAD_DIR))

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar archivo: {str(e)}"
        )
    finally:
        file.file.close()


def delete_file(relative_path: str) -> bool:
    """
    Elimina un archivo del sistema.

    Args:
        relative_path: Ruta relativa del archivo desde el directorio uploads

    Returns:
        True si se eliminó correctamente, False si no existía
    """
    try:
        file_path = UPLOAD_DIR / relative_path
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False


def save_caballo_photo(file: UploadFile, caballo_id: str) -> str:
    """
    Guarda una foto de caballo.

    Args:
        file: Archivo de imagen
        caballo_id: ID del caballo

    Returns:
        Ruta relativa de la foto guardada
    """
    validate_image_file(file)
    init_upload_directories()
    return save_upload_file(file, CABALLOS_DIR, prefix=f"caballo_{caballo_id}_")


def save_usuario_photo(file: UploadFile, usuario_id: str) -> str:
    """
    Guarda una foto de perfil de usuario.

    Args:
        file: Archivo de imagen
        usuario_id: ID del usuario

    Returns:
        Ruta relativa de la foto guardada
    """
    validate_image_file(file)
    init_upload_directories()
    return save_upload_file(file, USUARIOS_DIR, prefix=f"usuario_{usuario_id}_")


def save_cliente_photo(file: UploadFile, cliente_id: str) -> str:
    """
    Guarda una foto de perfil de cliente.

    Args:
        file: Archivo de imagen
        cliente_id: ID del cliente

    Returns:
        Ruta relativa de la foto guardada
    """
    validate_image_file(file)
    init_upload_directories()
    return save_upload_file(file, CLIENTES_DIR, prefix=f"cliente_{cliente_id}_")


def get_file_url(relative_path: str, base_url: str = "/uploads") -> str:
    """
    Genera la URL completa para acceder a un archivo.

    Args:
        relative_path: Ruta relativa del archivo
        base_url: URL base del servidor

    Returns:
        URL completa del archivo
    """
    return f"{base_url}/{relative_path}"
