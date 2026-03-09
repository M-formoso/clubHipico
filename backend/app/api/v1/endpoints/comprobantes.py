from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.usuario import Usuario
from app.models.comprobante import TipoComprobanteEnum, EstadoComprobanteEnum
from app.schemas.comprobante import (
    ComprobanteCreate, ComprobanteUpdate, ComprobanteSchema, ComprobanteConCliente,
    ComprobanteListSchema, ComprobanteItemCreate, ComprobanteItemSchema,
    EmitirComprobanteRequest, AnularComprobanteRequest, AplicarPagoRequest,
    EstadoCuentaResponse, MovimientoCuentaSchema,
    ReporteVentasResponse, ReporteCobranzasResponse, ReporteDeudoresResponse
)
from app.services.comprobante_service import get_comprobante_service

router = APIRouter()


# ============ COMPROBANTES CRUD ============

@router.post("/", response_model=ComprobanteSchema, status_code=status.HTTP_201_CREATED)
def crear_comprobante(
    data: ComprobanteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Crea un nuevo comprobante"""
    try:
        service = get_comprobante_service(db)
        return service.crear(data, created_by=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ComprobanteConCliente])
def listar_comprobantes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    cliente_id: Optional[UUID] = None,
    tipo: Optional[TipoComprobanteEnum] = None,
    estado: Optional[EstadoComprobanteEnum] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    busqueda: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista comprobantes con filtros"""
    service = get_comprobante_service(db)
    comprobantes = service.listar(
        skip=skip,
        limit=limit,
        cliente_id=cliente_id,
        tipo=tipo,
        estado=estado,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        busqueda=busqueda
    )

    # Agregar info del cliente
    result = []
    for c in comprobantes:
        c_dict = ComprobanteSchema.model_validate(c).model_dump()
        if c.cliente:
            c_dict["cliente"] = {
                "id": str(c.cliente.id),
                "nombre": c.cliente.nombre,
                "apellido": c.cliente.apellido,
                "dni": c.cliente.dni
            }
        result.append(c_dict)

    return result


@router.get("/{comprobante_id}", response_model=ComprobanteConCliente)
def obtener_comprobante(
    comprobante_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene un comprobante por ID"""
    service = get_comprobante_service(db)
    comprobante = service.obtener(comprobante_id)

    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")

    c_dict = ComprobanteSchema.model_validate(comprobante).model_dump()
    if comprobante.cliente:
        c_dict["cliente"] = {
            "id": str(comprobante.cliente.id),
            "nombre": comprobante.cliente.nombre,
            "apellido": comprobante.cliente.apellido,
            "dni": comprobante.cliente.dni,
            "telefono": comprobante.cliente.telefono,
            "email": comprobante.cliente.email
        }

    return c_dict


@router.put("/{comprobante_id}", response_model=ComprobanteSchema)
def actualizar_comprobante(
    comprobante_id: UUID,
    data: ComprobanteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Actualiza un comprobante (solo en borrador)"""
    try:
        service = get_comprobante_service(db)
        return service.actualizar(comprobante_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ ACCIONES ESPECIALES ============

@router.post("/{comprobante_id}/emitir", response_model=ComprobanteSchema)
def emitir_comprobante(
    comprobante_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Emite un comprobante en borrador"""
    try:
        service = get_comprobante_service(db)
        return service.emitir(comprobante_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{comprobante_id}/anular", response_model=ComprobanteSchema)
def anular_comprobante(
    comprobante_id: UUID,
    data: AnularComprobanteRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Anula un comprobante"""
    try:
        service = get_comprobante_service(db)
        return service.anular(comprobante_id, data, anulado_por=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{comprobante_id}/aplicar-pago", response_model=ComprobanteSchema)
def aplicar_pago_a_comprobante(
    comprobante_id: UUID,
    data: AplicarPagoRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Aplica un pago a un comprobante"""
    try:
        service = get_comprobante_service(db)
        return service.aplicar_pago(comprobante_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ CUENTA CORRIENTE ============

@router.get("/cuenta-corriente/{cliente_id}", response_model=EstadoCuentaResponse)
def obtener_cuenta_corriente(
    cliente_id: UUID,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene el estado de cuenta corriente de un cliente"""
    try:
        service = get_comprobante_service(db)
        return service.obtener_cuenta_corriente(
            cliente_id,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ REPORTES ============

@router.get("/reportes/ventas", response_model=ReporteVentasResponse)
def reporte_ventas(
    fecha_inicio: date = Query(...),
    fecha_fin: date = Query(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Genera reporte de ventas/facturación"""
    if fecha_inicio > fecha_fin:
        raise HTTPException(status_code=400, detail="La fecha de inicio debe ser anterior a la fecha de fin")

    service = get_comprobante_service(db)
    return service.reporte_ventas(fecha_inicio, fecha_fin)


@router.get("/reportes/cobranzas", response_model=ReporteCobranzasResponse)
def reporte_cobranzas(
    fecha_inicio: date = Query(...),
    fecha_fin: date = Query(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Genera reporte de cobranzas"""
    if fecha_inicio > fecha_fin:
        raise HTTPException(status_code=400, detail="La fecha de inicio debe ser anterior a la fecha de fin")

    service = get_comprobante_service(db)
    return service.reporte_cobranzas(fecha_inicio, fecha_fin)


@router.get("/reportes/deudores", response_model=ReporteDeudoresResponse)
def reporte_deudores(
    fecha_corte: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin)
):
    """Genera reporte de deudores"""
    service = get_comprobante_service(db)
    return service.reporte_deudores(fecha_corte)


# ============ ESTADÍSTICAS RÁPIDAS ============

@router.get("/stats/resumen")
def obtener_resumen_comprobantes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene resumen rápido de comprobantes"""
    from sqlalchemy import func
    from app.models.comprobante import Comprobante
    from decimal import Decimal

    # Totales por estado
    pendientes = db.query(
        func.count(Comprobante.id),
        func.sum(Comprobante.saldo_pendiente)
    ).filter(
        Comprobante.estado.in_([EstadoComprobanteEnum.EMITIDO, EstadoComprobanteEnum.PAGADO_PARCIAL])
    ).first()

    vencidos = db.query(
        func.count(Comprobante.id),
        func.sum(Comprobante.saldo_pendiente)
    ).filter(
        Comprobante.estado == EstadoComprobanteEnum.VENCIDO
    ).first()

    # Este mes
    hoy = date.today()
    primer_dia_mes = hoy.replace(day=1)

    facturado_mes = db.query(func.sum(Comprobante.total)).filter(
        Comprobante.fecha_emision >= primer_dia_mes,
        Comprobante.estado != EstadoComprobanteEnum.ANULADO,
        Comprobante.tipo.in_([TipoComprobanteEnum.FACTURA, TipoComprobanteEnum.RECIBO])
    ).scalar() or Decimal("0")

    cobrado_mes = db.query(func.sum(Comprobante.monto_pagado)).filter(
        Comprobante.fecha_emision >= primer_dia_mes,
        Comprobante.estado != EstadoComprobanteEnum.ANULADO
    ).scalar() or Decimal("0")

    return {
        "pendientes": {
            "cantidad": pendientes[0] or 0,
            "monto": float(pendientes[1] or 0)
        },
        "vencidos": {
            "cantidad": vencidos[0] or 0,
            "monto": float(vencidos[1] or 0)
        },
        "mes_actual": {
            "facturado": float(facturado_mes),
            "cobrado": float(cobrado_mes)
        }
    }
