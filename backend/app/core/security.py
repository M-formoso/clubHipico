from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Configuración de bcrypt para hashing de passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que el password coincida con el hash.

    Args:
        plain_password: Password en texto plano
        hashed_password: Password hasheado

    Returns:
        bool: True si coinciden, False si no
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Genera hash del password.

    Args:
        password: Password en texto plano

    Returns:
        str: Password hasheado
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea JWT access token.

    Args:
        data: Datos a incluir en el token (generalmente user_id)
        expires_delta: Tiempo de expiración custom

    Returns:
        str: JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crea JWT refresh token.

    Args:
        data: Datos a incluir en el token

    Returns:
        str: JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodifica y valida un JWT.

    Args:
        token: JWT token a decodificar

    Returns:
        dict | None: Payload del token si es válido, None si no
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
