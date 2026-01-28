from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency para obtener sesión de base de datos.
    Se cierra automáticamente al terminar la request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
