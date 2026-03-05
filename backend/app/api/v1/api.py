from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    usuarios,
    clientes,
    caballos,
    eventos,
    pagos,
    egresos,
    alertas,
    reportes,
    dashboard,
    public
)

api_router = APIRouter()

# Registrar todos los routers
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
api_router.include_router(caballos.router, prefix="/caballos", tags=["Caballos"])
api_router.include_router(eventos.router, prefix="/eventos", tags=["Eventos"])
api_router.include_router(pagos.router, prefix="/pagos", tags=["Pagos"])
api_router.include_router(egresos.router, prefix="/egresos", tags=["Egresos"])
api_router.include_router(alertas.router, prefix="/alertas", tags=["Alertas"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
api_router.include_router(public.router, prefix="/public", tags=["Web Pública"])
