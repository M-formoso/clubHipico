// Enums
export type TipoComprobante = 'factura' | 'recibo' | 'nota_credito' | 'nota_debito' | 'presupuesto';
export type EstadoComprobante = 'borrador' | 'emitido' | 'pagado_parcial' | 'pagado_total' | 'anulado' | 'vencido';

// Comprobante Item
export interface ComprobanteItem {
  id: string;
  comprobante_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
  subtotal: number;
  tipo_servicio?: string;
  orden: number;
  created_at: string;
}

export interface ComprobanteItemCreate {
  descripcion: string;
  cantidad?: number;
  precio_unitario: number;
  descuento_porcentaje?: number;
  tipo_servicio?: string;
  orden?: number;
}

// Comprobante
export interface Comprobante {
  id: string;
  numero: number;
  punto_venta: number;
  numero_completo: string;
  tipo: TipoComprobante;
  cliente_id: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  descuento_porcentaje: number;
  iva_porcentaje: number;
  concepto_general?: string;
  observaciones?: string;
  condicion_pago?: string;
  subtotal: number;
  descuento_monto: number;
  iva_monto: number;
  total: number;
  monto_pagado: number;
  saldo_pendiente: number;
  estado: EstadoComprobante;
  comprobante_relacionado_id?: string;
  pdf_url?: string;
  created_by?: string;
  anulado_por?: string;
  fecha_anulacion?: string;
  motivo_anulacion?: string;
  created_at: string;
  updated_at: string;
  items: ComprobanteItem[];
}

export interface ComprobanteConCliente extends Comprobante {
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
    dni?: string;
    telefono?: string;
    email?: string;
  };
}

export interface ComprobanteCreate {
  tipo: TipoComprobante;
  cliente_id: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  descuento_porcentaje?: number;
  iva_porcentaje?: number;
  concepto_general?: string;
  observaciones?: string;
  condicion_pago?: string;
  items: ComprobanteItemCreate[];
  emitir?: boolean;
}

export interface ComprobanteUpdate {
  fecha_vencimiento?: string;
  descuento_porcentaje?: number;
  iva_porcentaje?: number;
  concepto_general?: string;
  observaciones?: string;
  condicion_pago?: string;
}

// Operaciones especiales
export interface AnularComprobanteRequest {
  motivo: string;
}

export interface AplicarPagoRequest {
  pago_id: string;
  monto: number;
}

// Movimientos de Cuenta
export interface MovimientoCuenta {
  id: string;
  cliente_id: string;
  tipo: 'debito' | 'credito';
  comprobante_id?: string;
  pago_id?: string;
  descripcion: string;
  monto: number;
  saldo_anterior: number;
  saldo_posterior: number;
  fecha: string;
  created_at: string;
}

export interface EstadoCuentaResponse {
  cliente_id: string;
  cliente_nombre: string;
  saldo_actual: number;
  total_facturado: number;
  total_pagado: number;
  comprobantes_pendientes: number;
  movimientos: MovimientoCuenta[];
}

// Reportes
export interface ReporteVentasResponse {
  fecha_inicio: string;
  fecha_fin: string;
  total_facturado: number;
  total_cobrado: number;
  total_pendiente: number;
  cantidad_comprobantes: number;
  por_tipo: Record<string, { cantidad: number; total: number }>;
  por_estado: Record<string, { cantidad: number; total: number }>;
}

export interface ReporteCobranzasResponse {
  fecha_inicio: string;
  fecha_fin: string;
  total_cobrado: number;
  cantidad_pagos: number;
  por_metodo: Record<string, number>;
  por_tipo: Record<string, number>;
}

export interface DeudorInfo {
  cliente_id: string;
  nombre: string;
  deuda: number;
  antiguedad_dias: number;
}

export interface ReporteDeudoresResponse {
  fecha_corte: string;
  total_deuda: number;
  cantidad_deudores: number;
  deudores: DeudorInfo[];
}

// Resumen rápido
export interface ResumenComprobantes {
  pendientes: {
    cantidad: number;
    monto: number;
  };
  vencidos: {
    cantidad: number;
    monto: number;
  };
  mes_actual: {
    facturado: number;
    cobrado: number;
  };
}

// Filtros de listado
export interface ComprobanteFilters {
  skip?: number;
  limit?: number;
  cliente_id?: string;
  tipo?: TipoComprobante;
  estado?: EstadoComprobante;
  fecha_desde?: string;
  fecha_hasta?: string;
  busqueda?: string;
}
