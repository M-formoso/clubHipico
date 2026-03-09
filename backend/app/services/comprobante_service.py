from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from app.models.comprobante import (
    Comprobante, ComprobanteItem, PagoComprobante, MovimientoCuenta,
    TipoComprobanteEnum, EstadoComprobanteEnum
)
from app.models.pago import Pago, EstadoPagoEnum
from app.models.cliente import Cliente, EstadoCuentaEnum
from app.schemas.comprobante import (
    ComprobanteCreate, ComprobanteUpdate, ComprobanteItemCreate,
    AnularComprobanteRequest, AplicarPagoRequest
)


class ComprobanteService:
    """Servicio para gestión de comprobantes"""

    # Prefijos por tipo de comprobante
    PREFIJOS = {
        TipoComprobanteEnum.FACTURA: "F",
        TipoComprobanteEnum.RECIBO: "R",
        TipoComprobanteEnum.NOTA_CREDITO: "NC",
        TipoComprobanteEnum.NOTA_DEBITO: "ND",
        TipoComprobanteEnum.PRESUPUESTO: "P",
    }

    def __init__(self, db: Session):
        self.db = db

    def _generar_numero(self, tipo: TipoComprobanteEnum, punto_venta: int = 1) -> Tuple[int, str]:
        """Genera el próximo número de comprobante"""
        # Obtener el último número para este tipo y punto de venta
        ultimo = self.db.query(func.max(Comprobante.numero)).filter(
            Comprobante.tipo == tipo,
            Comprobante.punto_venta == punto_venta
        ).scalar()

        nuevo_numero = (ultimo or 0) + 1
        prefijo = self.PREFIJOS.get(tipo, "X")
        numero_completo = f"{prefijo}-{punto_venta:04d}-{nuevo_numero:08d}"

        return nuevo_numero, numero_completo

    def crear(
        self,
        data: ComprobanteCreate,
        created_by: Optional[UUID] = None
    ) -> Comprobante:
        """Crea un nuevo comprobante"""
        # Generar numeración
        numero, numero_completo = self._generar_numero(data.tipo)

        # Crear comprobante
        comprobante = Comprobante(
            tipo=data.tipo,
            numero=numero,
            punto_venta=1,
            numero_completo=numero_completo,
            cliente_id=data.cliente_id,
            fecha_emision=data.fecha_emision or date.today(),
            fecha_vencimiento=data.fecha_vencimiento,
            descuento_porcentaje=data.descuento_porcentaje,
            iva_porcentaje=data.iva_porcentaje,
            concepto_general=data.concepto_general,
            observaciones=data.observaciones,
            condicion_pago=data.condicion_pago,
            estado=EstadoComprobanteEnum.BORRADOR,
            created_by=created_by
        )

        self.db.add(comprobante)
        self.db.flush()  # Para obtener el ID

        # Crear items
        for i, item_data in enumerate(data.items):
            item = ComprobanteItem(
                comprobante_id=comprobante.id,
                descripcion=item_data.descripcion,
                cantidad=item_data.cantidad,
                precio_unitario=item_data.precio_unitario,
                descuento_porcentaje=item_data.descuento_porcentaje,
                tipo_servicio=item_data.tipo_servicio,
                orden=item_data.orden or i
            )
            item.calcular_subtotal()
            self.db.add(item)

        self.db.flush()

        # Calcular totales
        comprobante.calcular_totales()

        # Si se solicita emitir inmediatamente
        if data.emitir:
            self._emitir(comprobante)

        self.db.commit()
        self.db.refresh(comprobante)

        return comprobante

    def _emitir(self, comprobante: Comprobante) -> None:
        """Emite un comprobante (cambia de borrador a emitido)"""
        if comprobante.estado != EstadoComprobanteEnum.BORRADOR:
            raise ValueError("Solo se pueden emitir comprobantes en borrador")

        comprobante.estado = EstadoComprobanteEnum.EMITIDO

        # Registrar movimiento en cuenta corriente (débito)
        if comprobante.tipo in [TipoComprobanteEnum.FACTURA, TipoComprobanteEnum.NOTA_DEBITO]:
            self._registrar_movimiento(
                cliente_id=comprobante.cliente_id,
                tipo="debito",
                monto=comprobante.total,
                descripcion=f"{comprobante.tipo.value.upper()} {comprobante.numero_completo}",
                comprobante_id=comprobante.id
            )
        elif comprobante.tipo == TipoComprobanteEnum.NOTA_CREDITO:
            self._registrar_movimiento(
                cliente_id=comprobante.cliente_id,
                tipo="credito",
                monto=comprobante.total,
                descripcion=f"NOTA CRÉDITO {comprobante.numero_completo}",
                comprobante_id=comprobante.id
            )

    def emitir(self, comprobante_id: UUID) -> Comprobante:
        """Emite un comprobante por ID"""
        comprobante = self.obtener(comprobante_id)
        if not comprobante:
            raise ValueError("Comprobante no encontrado")

        self._emitir(comprobante)
        self.db.commit()
        self.db.refresh(comprobante)

        return comprobante

    def obtener(self, comprobante_id: UUID) -> Optional[Comprobante]:
        """Obtiene un comprobante por ID"""
        return self.db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

    def listar(
        self,
        skip: int = 0,
        limit: int = 50,
        cliente_id: Optional[UUID] = None,
        tipo: Optional[TipoComprobanteEnum] = None,
        estado: Optional[EstadoComprobanteEnum] = None,
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        busqueda: Optional[str] = None
    ) -> List[Comprobante]:
        """Lista comprobantes con filtros"""
        query = self.db.query(Comprobante)

        if cliente_id:
            query = query.filter(Comprobante.cliente_id == cliente_id)
        if tipo:
            query = query.filter(Comprobante.tipo == tipo)
        if estado:
            query = query.filter(Comprobante.estado == estado)
        if fecha_desde:
            query = query.filter(Comprobante.fecha_emision >= fecha_desde)
        if fecha_hasta:
            query = query.filter(Comprobante.fecha_emision <= fecha_hasta)
        if busqueda:
            query = query.filter(
                or_(
                    Comprobante.numero_completo.ilike(f"%{busqueda}%"),
                    Comprobante.concepto_general.ilike(f"%{busqueda}%")
                )
            )

        return query.order_by(desc(Comprobante.created_at)).offset(skip).limit(limit).all()

    def actualizar(self, comprobante_id: UUID, data: ComprobanteUpdate) -> Comprobante:
        """Actualiza un comprobante (solo en borrador)"""
        comprobante = self.obtener(comprobante_id)
        if not comprobante:
            raise ValueError("Comprobante no encontrado")

        if comprobante.estado != EstadoComprobanteEnum.BORRADOR:
            raise ValueError("Solo se pueden editar comprobantes en borrador")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(comprobante, field, value)

        comprobante.calcular_totales()
        self.db.commit()
        self.db.refresh(comprobante)

        return comprobante

    def anular(
        self,
        comprobante_id: UUID,
        data: AnularComprobanteRequest,
        anulado_por: Optional[UUID] = None
    ) -> Comprobante:
        """Anula un comprobante"""
        comprobante = self.obtener(comprobante_id)
        if not comprobante:
            raise ValueError("Comprobante no encontrado")

        if comprobante.estado == EstadoComprobanteEnum.ANULADO:
            raise ValueError("El comprobante ya está anulado")

        # Si tiene pagos asociados, no se puede anular
        if comprobante.monto_pagado > 0:
            raise ValueError("No se puede anular un comprobante con pagos asociados")

        # Revertir movimiento de cuenta si estaba emitido
        if comprobante.estado in [EstadoComprobanteEnum.EMITIDO, EstadoComprobanteEnum.VENCIDO]:
            tipo_movimiento = "credito" if comprobante.tipo in [TipoComprobanteEnum.FACTURA, TipoComprobanteEnum.NOTA_DEBITO] else "debito"
            self._registrar_movimiento(
                cliente_id=comprobante.cliente_id,
                tipo=tipo_movimiento,
                monto=comprobante.total,
                descripcion=f"ANULACIÓN {comprobante.numero_completo}",
                comprobante_id=comprobante.id
            )

        comprobante.estado = EstadoComprobanteEnum.ANULADO
        comprobante.anulado_por = anulado_por
        comprobante.fecha_anulacion = datetime.utcnow()
        comprobante.motivo_anulacion = data.motivo

        self.db.commit()
        self.db.refresh(comprobante)

        return comprobante

    def aplicar_pago(
        self,
        comprobante_id: UUID,
        data: AplicarPagoRequest
    ) -> Comprobante:
        """Aplica un pago a un comprobante"""
        comprobante = self.obtener(comprobante_id)
        if not comprobante:
            raise ValueError("Comprobante no encontrado")

        if comprobante.estado in [EstadoComprobanteEnum.BORRADOR, EstadoComprobanteEnum.ANULADO, EstadoComprobanteEnum.PAGADO_TOTAL]:
            raise ValueError(f"No se puede aplicar pago a comprobante en estado {comprobante.estado.value}")

        pago = self.db.query(Pago).filter(Pago.id == data.pago_id).first()
        if not pago:
            raise ValueError("Pago no encontrado")

        if pago.cliente_id != comprobante.cliente_id:
            raise ValueError("El pago no pertenece al mismo cliente")

        # Calcular monto disponible del pago
        monto_disponible = pago.monto - (pago.monto_aplicado or Decimal("0"))
        if data.monto > monto_disponible:
            raise ValueError(f"El pago solo tiene ${monto_disponible} disponible")

        if data.monto > comprobante.saldo_pendiente:
            raise ValueError(f"El comprobante solo tiene ${comprobante.saldo_pendiente} pendiente")

        # Crear asociación
        asociacion = PagoComprobante(
            pago_id=pago.id,
            comprobante_id=comprobante.id,
            monto_aplicado=data.monto
        )
        self.db.add(asociacion)

        # Actualizar pago
        pago.monto_aplicado = (pago.monto_aplicado or Decimal("0")) + data.monto
        pago.monto_disponible = pago.monto - pago.monto_aplicado
        if pago.monto_disponible == 0:
            pago.estado = EstadoPagoEnum.PAGADO
        else:
            pago.estado = EstadoPagoEnum.APLICADO_PARCIAL

        # Actualizar comprobante
        comprobante.monto_pagado += data.monto
        comprobante.actualizar_estado_pago()

        self.db.commit()
        self.db.refresh(comprobante)

        return comprobante

    def _registrar_movimiento(
        self,
        cliente_id: UUID,
        tipo: str,
        monto: Decimal,
        descripcion: str,
        comprobante_id: Optional[UUID] = None,
        pago_id: Optional[UUID] = None
    ) -> MovimientoCuenta:
        """Registra un movimiento en la cuenta corriente"""
        cliente = self.db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if not cliente:
            raise ValueError("Cliente no encontrado")

        saldo_anterior = cliente.saldo

        if tipo == "debito":
            cliente.saldo -= monto
        else:
            cliente.saldo += monto

        # Actualizar estado de cuenta
        if cliente.saldo < 0:
            cliente.estado_cuenta = EstadoCuentaEnum.DEBE
        elif cliente.saldo < -1000:  # Umbral de morosidad configurable
            cliente.estado_cuenta = EstadoCuentaEnum.MOROSO
        else:
            cliente.estado_cuenta = EstadoCuentaEnum.AL_DIA

        movimiento = MovimientoCuenta(
            cliente_id=cliente_id,
            tipo=tipo,
            comprobante_id=comprobante_id,
            pago_id=pago_id,
            descripcion=descripcion,
            monto=monto,
            saldo_anterior=saldo_anterior,
            saldo_posterior=cliente.saldo,
            fecha=date.today()
        )
        self.db.add(movimiento)

        return movimiento

    def obtener_cuenta_corriente(
        self,
        cliente_id: UUID,
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        limit: int = 100
    ) -> dict:
        """Obtiene el estado de cuenta corriente de un cliente"""
        cliente = self.db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if not cliente:
            raise ValueError("Cliente no encontrado")

        query = self.db.query(MovimientoCuenta).filter(
            MovimientoCuenta.cliente_id == cliente_id
        )

        if fecha_desde:
            query = query.filter(MovimientoCuenta.fecha >= fecha_desde)
        if fecha_hasta:
            query = query.filter(MovimientoCuenta.fecha <= fecha_hasta)

        movimientos = query.order_by(desc(MovimientoCuenta.created_at)).limit(limit).all()

        # Calcular totales
        total_facturado = self.db.query(func.sum(Comprobante.total)).filter(
            Comprobante.cliente_id == cliente_id,
            Comprobante.tipo.in_([TipoComprobanteEnum.FACTURA, TipoComprobanteEnum.NOTA_DEBITO]),
            Comprobante.estado != EstadoComprobanteEnum.ANULADO
        ).scalar() or Decimal("0")

        total_pagado = self.db.query(func.sum(Pago.monto)).filter(
            Pago.cliente_id == cliente_id,
            Pago.estado == EstadoPagoEnum.PAGADO
        ).scalar() or Decimal("0")

        comprobantes_pendientes = self.db.query(func.count(Comprobante.id)).filter(
            Comprobante.cliente_id == cliente_id,
            Comprobante.estado.in_([EstadoComprobanteEnum.EMITIDO, EstadoComprobanteEnum.PAGADO_PARCIAL, EstadoComprobanteEnum.VENCIDO])
        ).scalar() or 0

        return {
            "cliente_id": cliente_id,
            "cliente_nombre": f"{cliente.nombre} {cliente.apellido}",
            "saldo_actual": cliente.saldo,
            "total_facturado": total_facturado,
            "total_pagado": total_pagado,
            "comprobantes_pendientes": comprobantes_pendientes,
            "movimientos": movimientos
        }

    def reporte_ventas(
        self,
        fecha_inicio: date,
        fecha_fin: date
    ) -> dict:
        """Genera reporte de ventas"""
        comprobantes = self.db.query(Comprobante).filter(
            Comprobante.fecha_emision >= fecha_inicio,
            Comprobante.fecha_emision <= fecha_fin,
            Comprobante.estado != EstadoComprobanteEnum.ANULADO,
            Comprobante.tipo.in_([TipoComprobanteEnum.FACTURA, TipoComprobanteEnum.RECIBO])
        ).all()

        total_facturado = sum(c.total for c in comprobantes)
        total_cobrado = sum(c.monto_pagado for c in comprobantes)
        total_pendiente = sum(c.saldo_pendiente for c in comprobantes)

        por_tipo = {}
        por_estado = {}

        for c in comprobantes:
            # Por tipo
            tipo = c.tipo.value
            if tipo not in por_tipo:
                por_tipo[tipo] = {"cantidad": 0, "total": Decimal("0")}
            por_tipo[tipo]["cantidad"] += 1
            por_tipo[tipo]["total"] += c.total

            # Por estado
            estado = c.estado.value
            if estado not in por_estado:
                por_estado[estado] = {"cantidad": 0, "total": Decimal("0")}
            por_estado[estado]["cantidad"] += 1
            por_estado[estado]["total"] += c.total

        return {
            "fecha_inicio": fecha_inicio,
            "fecha_fin": fecha_fin,
            "total_facturado": total_facturado,
            "total_cobrado": total_cobrado,
            "total_pendiente": total_pendiente,
            "cantidad_comprobantes": len(comprobantes),
            "por_tipo": por_tipo,
            "por_estado": por_estado
        }

    def reporte_cobranzas(
        self,
        fecha_inicio: date,
        fecha_fin: date
    ) -> dict:
        """Genera reporte de cobranzas"""
        pagos = self.db.query(Pago).filter(
            Pago.fecha_pago >= fecha_inicio,
            Pago.fecha_pago <= fecha_fin,
            Pago.estado == EstadoPagoEnum.PAGADO
        ).all()

        total_cobrado = sum(p.monto for p in pagos)

        por_metodo = {}
        por_tipo = {}

        for p in pagos:
            # Por método
            metodo = p.metodo_pago.value if p.metodo_pago else "sin_especificar"
            if metodo not in por_metodo:
                por_metodo[metodo] = Decimal("0")
            por_metodo[metodo] += p.monto

            # Por tipo
            tipo = p.tipo.value
            if tipo not in por_tipo:
                por_tipo[tipo] = Decimal("0")
            por_tipo[tipo] += p.monto

        return {
            "fecha_inicio": fecha_inicio,
            "fecha_fin": fecha_fin,
            "total_cobrado": total_cobrado,
            "cantidad_pagos": len(pagos),
            "por_metodo": por_metodo,
            "por_tipo": por_tipo
        }

    def reporte_deudores(self, fecha_corte: Optional[date] = None) -> dict:
        """Genera reporte de deudores"""
        if not fecha_corte:
            fecha_corte = date.today()

        # Clientes con saldo negativo
        clientes_deudores = self.db.query(Cliente).filter(
            Cliente.saldo < 0,
            Cliente.activo == True
        ).all()

        deudores = []
        total_deuda = Decimal("0")

        for cliente in clientes_deudores:
            deuda = abs(cliente.saldo)
            total_deuda += deuda

            # Obtener comprobante más antiguo pendiente
            comprobante_antiguo = self.db.query(Comprobante).filter(
                Comprobante.cliente_id == cliente.id,
                Comprobante.estado.in_([EstadoComprobanteEnum.EMITIDO, EstadoComprobanteEnum.VENCIDO, EstadoComprobanteEnum.PAGADO_PARCIAL])
            ).order_by(Comprobante.fecha_emision).first()

            antiguedad_dias = 0
            if comprobante_antiguo:
                antiguedad_dias = (fecha_corte - comprobante_antiguo.fecha_emision).days

            deudores.append({
                "cliente_id": str(cliente.id),
                "nombre": f"{cliente.nombre} {cliente.apellido}",
                "dni": cliente.dni,
                "telefono": cliente.telefono,
                "email": cliente.email,
                "deuda": deuda,
                "antiguedad_dias": antiguedad_dias,
                "estado_cuenta": cliente.estado_cuenta.value
            })

        # Ordenar por deuda descendente
        deudores.sort(key=lambda x: x["deuda"], reverse=True)

        return {
            "fecha_corte": fecha_corte,
            "total_deuda": total_deuda,
            "cantidad_deudores": len(deudores),
            "deudores": deudores
        }


# Instancia singleton
comprobante_service = None


def get_comprobante_service(db: Session) -> ComprobanteService:
    return ComprobanteService(db)
