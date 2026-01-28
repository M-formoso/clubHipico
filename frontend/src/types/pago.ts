export interface Pago {
  id: string;
  cliente_id: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  concepto: string;
  tipo: 'pension' | 'clase' | 'evento' | 'servicio_extra' | 'otro';
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  fecha_vencimiento?: string;
  fecha_pago?: string;
  referencia?: string;
  notas?: string;
  recibo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PagoCreate {
  cliente_id: string;
  concepto: string;
  tipo: 'pension' | 'clase' | 'evento' | 'servicio_extra' | 'otro';
  monto: number;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  fecha_vencimiento?: string;
  fecha_pago?: string;
  referencia?: string;
  notas?: string;
}

export interface PagoUpdate {
  concepto?: string;
  tipo?: 'pension' | 'clase' | 'evento' | 'servicio_extra' | 'otro';
  monto?: number;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  estado?: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  fecha_vencimiento?: string;
  fecha_pago?: string;
  referencia?: string;
  notas?: string;
}
