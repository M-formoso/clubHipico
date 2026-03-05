from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.schemas.evento import EventoPublicoSchema
from app.services import evento_service

router = APIRouter()


@router.get("/eventos", response_model=List[EventoPublicoSchema])
async def listar_eventos_publicos(
    db: Session = Depends(get_db)
):
    """Lista los eventos marcados como públicos para la web."""
    return evento_service.obtener_eventos_publicos(db)
