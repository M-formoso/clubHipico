export type TipoEgreso =
  | 'alimentacion'
  | 'veterinario'
  | 'herrero'
  | 'mantenimiento'
  | 'servicios'
  | 'salarios'
  | 'suministros'
  | 'equipamiento'
  | 'otro';

export interface Egreso {
  id: string;
  concepto: string;
  tipo: TipoEgreso;
  monto: number;
  fecha_egreso: string;
  proveedor?: string;
  referencia?: string;
  notas?: string;
  comprobante_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EgresoCreate {
  concepto: string;
  tipo: TipoEgreso;
  monto: number;
  fecha_egreso: string;
  proveedor?: string;
  referencia?: string;
  notas?: string;
}

export interface EgresoUpdate {
  concepto?: string;
  tipo?: TipoEgreso;
  monto?: number;
  fecha_egreso?: string;
  proveedor?: string;
  referencia?: string;
  notas?: string;
  comprobante_url?: string;
}
