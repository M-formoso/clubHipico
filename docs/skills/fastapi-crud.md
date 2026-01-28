# Skill: Generar CRUD completo en FastAPI

## Objetivo
Generar un módulo CRUD completo siguiendo las mejores prácticas de FastAPI con SQLAlchemy.

## Pasos para generar un CRUD

### 1. Modelo SQLAlchemy (models/{nombre}.py)

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid
from datetime import datetime

class NombreModelo(Base):
    __tablename__ = "nombre_tabla"

    # Campos obligatorios
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Campos personalizados
    nombre = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)

    # Relaciones (si aplica)
    # propietario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    # propietario = relationship("Usuario", back_populates="items")
```

### 2. Schemas Pydantic (schemas/{nombre}.py)

```python
from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional

# Base schema con campos comunes
class NombreBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    activo: bool = True

# Schema para creación (sin ID, sin timestamps)
class NombreCreate(NombreBase):
    pass

# Schema para actualización (todos los campos opcionales)
class NombreUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    activo: Optional[bool] = None

# Schema para respuesta (incluye ID y timestamps)
class NombreSchema(NombreBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Para SQLAlchemy 2.0
```

### 3. Service (services/{nombre}_service.py)

```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.{nombre} import NombreModelo
from app.schemas.{nombre} import NombreCreate, NombreUpdate

def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    activo_solo: bool = False
) -> List[NombreModelo]:
    """Obtiene lista de items con paginación."""
    query = db.query(NombreModelo)

    if activo_solo:
        query = query.filter(NombreModelo.activo == True)

    return query.offset(skip).limit(limit).all()

def obtener_por_id(db: Session, id: UUID) -> Optional[NombreModelo]:
    """Obtiene un item por ID."""
    return db.query(NombreModelo).filter(NombreModelo.id == id).first()

def crear(db: Session, item_data: NombreCreate, usuario_id: UUID) -> NombreModelo:
    """Crea un nuevo item."""
    try:
        db_item = NombreModelo(**item_data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos"
        )

def actualizar(
    db: Session,
    id: UUID,
    item_update: NombreUpdate
) -> Optional[NombreModelo]:
    """Actualiza un item existente."""
    db_item = obtener_por_id(db, id)
    if not db_item:
        return None

    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

def eliminar(db: Session, id: UUID) -> Optional[NombreModelo]:
    """Elimina un item (soft delete marcando como inactivo)."""
    db_item = obtener_por_id(db, id)
    if not db_item:
        return None

    # Soft delete
    db_item.activo = False
    db.commit()
    db.refresh(db_item)
    return db_item

def buscar(
    db: Session,
    termino: str,
    skip: int = 0,
    limit: int = 100
) -> List[NombreModelo]:
    """Busca items por nombre."""
    return db.query(NombreModelo).filter(
        NombreModelo.nombre.ilike(f"%{termino}%"),
        NombreModelo.activo == True
    ).offset(skip).limit(limit).all()
```

### 4. Endpoints (api/v1/endpoints/{nombre}.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_active_user, require_admin
from app.models.usuario import Usuario
from app.schemas.{nombre} import NombreSchema, NombreCreate, NombreUpdate
from app.services import {nombre}_service

router = APIRouter()

@router.get("/", response_model=List[NombreSchema])
async def listar_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo_solo: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los items con paginación."""
    return {nombre}_service.obtener_todos(
        db,
        skip=skip,
        limit=limit,
        activo_solo=activo_solo
    )

@router.get("/buscar", response_model=List[NombreSchema])
async def buscar_items(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Busca items por nombre."""
    return {nombre}_service.buscar(db, termino=q, skip=skip, limit=limit)

@router.post(
    "/",
    response_model=NombreSchema,
    status_code=status.HTTP_201_CREATED
)
async def crear_item(
    item: NombreCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo item."""
    return {nombre}_service.crear(db, item, current_user.id)

@router.get("/{id}", response_model=NombreSchema)
async def obtener_item(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene un item específico por ID."""
    item = {nombre}_service.obtener_por_id(db, id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return item

@router.put("/{id}", response_model=NombreSchema)
async def actualizar_item(
    id: UUID,
    item_update: NombreUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un item existente."""
    item = {nombre}_service.actualizar(db, id, item_update)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return item

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_item(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina un item (soft delete)."""
    item = {nombre}_service.eliminar(db, id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    return None
```

### 5. Registrar router en api.py

```python
from app.api.v1.endpoints import {nombre}

api_router.include_router(
    {nombre}.router,
    prefix="/{nombre}s",
    tags=["{Nombre}s"]
)
```

### 6. Tests básicos (tests/api/test_{nombre}.py)

```python
import pytest
from uuid import uuid4

def test_crear_item(client, auth_headers, db):
    response = client.post(
        "/api/v1/{nombre}s/",
        json={"nombre": "Test Item"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["nombre"] == "Test Item"

def test_listar_items(client, auth_headers):
    response = client.get("/api/v1/{nombre}s/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_obtener_item_inexistente(client, auth_headers):
    fake_id = str(uuid4())
    response = client.get(f"/api/v1/{nombre}s/{fake_id}", headers=auth_headers)
    assert response.status_code == 404

def test_actualizar_item(client, auth_headers, db, item_fixture):
    response = client.put(
        f"/api/v1/{nombre}s/{item_fixture.id}",
        json={"nombre": "Updated Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Updated Name"

def test_eliminar_item(client, auth_headers, item_fixture):
    response = client.delete(
        f"/api/v1/{nombre}s/{item_fixture.id}",
        headers=auth_headers
    )
    assert response.status_code == 204
```

## Checklist

- [ ] Modelo SQLAlchemy creado con campos correctos
- [ ] Schemas Pydantic (Base, Create, Update, Schema)
- [ ] Service con todas las operaciones CRUD
- [ ] Endpoints FastAPI con validaciones
- [ ] Router registrado en api.py
- [ ] Tests básicos implementados
- [ ] Migración Alembic creada y aplicada
