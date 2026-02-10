from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal

from app.models.pago import Pago, EstadoPagoEnum
from app.models.cliente import Cliente
from app.models.alerta import TipoAlertaEnum, PrioridadAlertaEnum
from app.schemas.pago import PagoCreate, PagoUpdate, RegistrarPagoRequest
from app.schemas.alerta import AlertaCreate
from app.services import cliente_service, alerta_service


def obtener_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    cliente_id: Optional[UUID] = None,
    estado: Optional[EstadoPagoEnum] = None
) -> List[Pago]:
    """Obtiene lista de pagos con paginación."""
    query = db.query(Pago)

    if cliente_id:
        query = query.filter(Pago.cliente_id == cliente_id)

    if estado:
        query = query.filter(Pago.estado == estado)

    return query.order_by(Pago.created_at.desc()).offset(skip).limit(limit).all()


def obtener_por_id(db: Session, pago_id: UUID) -> Optional[Pago]:
    """Obtiene un pago por ID."""
    return db.query(Pago).filter(Pago.id == pago_id).first()


def crear(db: Session, pago_data: PagoCreate, usuario_id: UUID) -> Pago:
    """Crea un nuevo pago."""
    pago_dict = pago_data.model_dump()

    # Si el pago tiene metodo_pago, es porque ya fue pagado
    # En ese caso, marcarlo como PAGADO automáticamente
    if pago_dict.get('metodo_pago'):
        pago_dict['estado'] = EstadoPagoEnum.PAGADO
        # Si no tiene fecha_pago, usar la fecha actual
        if not pago_dict.get('fecha_pago'):
            from datetime import date
            pago_dict['fecha_pago'] = date.today()

    db_pago = Pago(
        **pago_dict,
        created_by=usuario_id
    )
    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)

    # Si el pago es pendiente, actualizar saldo del cliente (restar porque debe)
    if db_pago.estado == EstadoPagoEnum.PENDIENTE:
        cliente_service.actualizar_saldo(db, pago_data.cliente_id, -float(pago_data.monto))
    # Si el pago ya está pagado, actualizar saldo del cliente (sumar porque pagó)
    elif db_pago.estado == EstadoPagoEnum.PAGADO:
        cliente_service.actualizar_saldo(db, pago_data.cliente_id, float(pago_data.monto))

    # Crear notificaciones
    try:
        cliente = db.query(Cliente).filter(Cliente.id == pago_data.cliente_id).first()
        cliente_nombre = f"{cliente.nombre} {cliente.apellido}" if cliente else "Un cliente"

        # Notificar a admins sobre nuevo pago creado
        if db_pago.estado == EstadoPagoEnum.PENDIENTE:
            alerta_admin_data = AlertaCreate(
                tipo=TipoAlertaEnum.PAGO,
                prioridad=PrioridadAlertaEnum.MEDIA,
                titulo=f"Nuevo pago pendiente: {cliente_nombre}",
                mensaje=f"Se ha creado un pago pendiente de ${float(db_pago.monto):.2f} para {cliente_nombre}. Concepto: {db_pago.concepto}. Vence el {db_pago.fecha_vencimiento.strftime('%d/%m/%Y') if db_pago.fecha_vencimiento else 'sin fecha'}.",
                entidad_relacionada_tipo="pago",
                entidad_relacionada_id=db_pago.id,
                fecha_evento=db_pago.fecha_vencimiento,
                acciones_disponibles=[
                    {
                        "tipo": "ver_detalle",
                        "etiqueta": "Ver Pago",
                        "url": f"/pagos"
                    }
                ],
                datos_adicionales={
                    "pago_id": str(db_pago.id),
                    "cliente_nombre": cliente_nombre,
                    "monto": float(db_pago.monto),
                    "concepto": db_pago.concepto
                }
            )
            alerta_service.crear_para_admins(db, alerta_admin_data)

        # Notificar al cliente si tiene usuario
        if cliente and cliente.usuario_id:
            if db_pago.estado == EstadoPagoEnum.PENDIENTE:
                alerta_cliente_data = AlertaCreate(
                    tipo=TipoAlertaEnum.PAGO,
                    prioridad=PrioridadAlertaEnum.ALTA,
                    titulo=f"Nuevo pago pendiente",
                    mensaje=f"Tienes un pago pendiente de ${float(db_pago.monto):.2f}. Concepto: {db_pago.concepto}. Vence el {db_pago.fecha_vencimiento.strftime('%d/%m/%Y') if db_pago.fecha_vencimiento else 'próximamente'}.",
                    usuario_id=cliente.usuario_id,
                    entidad_relacionada_tipo="pago",
                    entidad_relacionada_id=db_pago.id,
                    fecha_evento=db_pago.fecha_vencimiento,
                    acciones_disponibles=[
                        {
                            "tipo": "ver_detalle",
                            "etiqueta": "Ver Pagos",
                            "url": f"/pagos"
                        }
                    ],
                    datos_adicionales={
                        "pago_id": str(db_pago.id),
                        "monto": float(db_pago.monto),
                        "concepto": db_pago.concepto
                    }
                )
                alerta_service.crear(db, alerta_cliente_data)
    except Exception as e:
        print(f"Error al crear notificaciones de pago: {e}")

    return db_pago


def actualizar(
    db: Session,
    pago_id: UUID,
    pago_update: PagoUpdate
) -> Optional[Pago]:
    """Actualiza un pago existente."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        return None

    update_data = pago_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pago, field, value)

    db.commit()
    db.refresh(db_pago)
    return db_pago


def eliminar(db: Session, pago_id: UUID) -> Optional[Pago]:
    """Elimina un pago (marcándolo como cancelado)."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        return None

    # Si estaba pendiente, devolver el monto al saldo del cliente
    if db_pago.estado == EstadoPagoEnum.PENDIENTE:
        cliente_service.actualizar_saldo(db, db_pago.cliente_id, float(db_pago.monto))

    db_pago.estado = EstadoPagoEnum.CANCELADO
    db.commit()
    db.refresh(db_pago)
    return db_pago


def registrar_pago(
    db: Session,
    pago_id: UUID,
    pago_request: RegistrarPagoRequest
) -> Pago:
    """Registra el pago de una deuda pendiente."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )

    if db_pago.estado != EstadoPagoEnum.PENDIENTE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden registrar pagos pendientes"
        )

    # Actualizar pago
    db_pago.metodo_pago = pago_request.metodo_pago
    db_pago.fecha_pago = pago_request.fecha_pago
    db_pago.referencia = pago_request.referencia
    db_pago.notas = pago_request.notas or db_pago.notas
    db_pago.estado = EstadoPagoEnum.PAGADO

    # Actualizar saldo del cliente (devolver el monto que se había restado)
    cliente_service.actualizar_saldo(db, db_pago.cliente_id, float(db_pago.monto))

    db.commit()
    db.refresh(db_pago)

    # Crear notificaciones sobre pago completado
    try:
        cliente = db.query(Cliente).filter(Cliente.id == db_pago.cliente_id).first()
        cliente_nombre = f"{cliente.nombre} {cliente.apellido}" if cliente else "Un cliente"

        # Notificar a admins sobre pago completado
        alerta_admin_data = AlertaCreate(
            tipo=TipoAlertaEnum.PAGO,
            prioridad=PrioridadAlertaEnum.BAJA,
            titulo=f"Pago recibido: {cliente_nombre}",
            mensaje=f"{cliente_nombre} ha realizado un pago de ${float(db_pago.monto):.2f}. Concepto: {db_pago.concepto}. Método: {db_pago.metodo_pago}.",
            entidad_relacionada_tipo="pago",
            entidad_relacionada_id=db_pago.id,
            acciones_disponibles=[
                {
                    "tipo": "ver_detalle",
                    "etiqueta": "Ver Pago",
                    "url": f"/pagos"
                }
            ],
            datos_adicionales={
                "pago_id": str(db_pago.id),
                "cliente_nombre": cliente_nombre,
                "monto": float(db_pago.monto),
                "concepto": db_pago.concepto,
                "metodo_pago": db_pago.metodo_pago
            }
        )
        alerta_service.crear_para_admins(db, alerta_admin_data)

        # Notificar al cliente si tiene usuario
        if cliente and cliente.usuario_id:
            alerta_cliente_data = AlertaCreate(
                tipo=TipoAlertaEnum.PAGO,
                prioridad=PrioridadAlertaEnum.MEDIA,
                titulo=f"Pago registrado exitosamente",
                mensaje=f"Tu pago de ${float(db_pago.monto):.2f} ha sido registrado. Concepto: {db_pago.concepto}. Gracias!",
                usuario_id=cliente.usuario_id,
                entidad_relacionada_tipo="pago",
                entidad_relacionada_id=db_pago.id,
                acciones_disponibles=[
                    {
                        "tipo": "ver_detalle",
                        "etiqueta": "Ver Pagos",
                        "url": f"/pagos"
                    }
                ],
                datos_adicionales={
                    "pago_id": str(db_pago.id),
                    "monto": float(db_pago.monto),
                    "concepto": db_pago.concepto
                }
            )
            alerta_service.crear(db, alerta_cliente_data)
    except Exception as e:
        print(f"Error al crear notificaciones de pago completado: {e}")

    return db_pago


def obtener_pagos_pendientes(db: Session) -> List[Pago]:
    """Obtiene todos los pagos pendientes."""
    return db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE
    ).all()


def obtener_pagos_vencidos(db: Session) -> List[Pago]:
    """Obtiene pagos vencidos."""
    return db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE,
        Pago.fecha_vencimiento < date.today()
    ).all()


def obtener_ingresos_periodo(
    db: Session,
    fecha_inicio: date,
    fecha_fin: date
) -> Decimal:
    """Calcula los ingresos de un período."""
    pagos = db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PAGADO,
        Pago.fecha_pago >= fecha_inicio,
        Pago.fecha_pago <= fecha_fin
    ).all()

    total = sum(pago.monto for pago in pagos)
    return Decimal(total)


def cambiar_estado(
    db: Session,
    pago_id: UUID,
    nuevo_estado: EstadoPagoEnum
) -> Optional[Pago]:
    """Cambia el estado de un pago."""
    db_pago = obtener_por_id(db, pago_id)
    if not db_pago:
        return None

    estado_anterior = db_pago.estado
    db_pago.estado = nuevo_estado

    # Si cambia de PENDIENTE a PAGADO, actualizar saldo
    if estado_anterior == EstadoPagoEnum.PENDIENTE and nuevo_estado == EstadoPagoEnum.PAGADO:
        # Devolver el monto (sumar porque ya pagó)
        cliente_service.actualizar_saldo(db, db_pago.cliente_id, float(db_pago.monto))
        # Establecer fecha de pago si no tiene
        if not db_pago.fecha_pago:
            db_pago.fecha_pago = date.today()

    # Si cambia de PAGADO a PENDIENTE, actualizar saldo
    elif estado_anterior == EstadoPagoEnum.PAGADO and nuevo_estado == EstadoPagoEnum.PENDIENTE:
        # Restar el monto (debe dinero)
        cliente_service.actualizar_saldo(db, db_pago.cliente_id, -float(db_pago.monto))
        db_pago.fecha_pago = None

    db.commit()
    db.refresh(db_pago)
    return db_pago


def actualizar_pagos_vencidos(db: Session) -> int:
    """Actualiza pagos pendientes que han vencido."""
    pagos_vencidos = db.query(Pago).filter(
        Pago.estado == EstadoPagoEnum.PENDIENTE,
        Pago.fecha_vencimiento < date.today()
    ).all()

    count = 0
    for pago in pagos_vencidos:
        pago.estado = EstadoPagoEnum.VENCIDO
        count += 1

    if count > 0:
        db.commit()

    return count
