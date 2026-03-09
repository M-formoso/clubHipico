import api from './api';
import {
  Comprobante,
  ComprobanteConCliente,
  ComprobanteCreate,
  ComprobanteUpdate,
  ComprobanteFilters,
  AnularComprobanteRequest,
  AplicarPagoRequest,
  EstadoCuentaResponse,
  ReporteVentasResponse,
  ReporteCobranzasResponse,
  ReporteDeudoresResponse,
  ResumenComprobantes,
} from '@/types/comprobante';

export const comprobanteService = {
  // ============ CRUD ============

  getAll: async (filters?: ComprobanteFilters): Promise<ComprobanteConCliente[]> => {
    const { data } = await api.get('/comprobantes/', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ComprobanteConCliente> => {
    const { data } = await api.get(`/comprobantes/${id}`);
    return data;
  },

  create: async (comprobante: ComprobanteCreate): Promise<Comprobante> => {
    const { data } = await api.post('/comprobantes/', comprobante);
    return data;
  },

  update: async (id: string, comprobante: ComprobanteUpdate): Promise<Comprobante> => {
    const { data } = await api.put(`/comprobantes/${id}`, comprobante);
    return data;
  },

  // ============ ACCIONES ESPECIALES ============

  emitir: async (id: string): Promise<Comprobante> => {
    const { data } = await api.post(`/comprobantes/${id}/emitir`);
    return data;
  },

  anular: async (id: string, request: AnularComprobanteRequest): Promise<Comprobante> => {
    const { data } = await api.post(`/comprobantes/${id}/anular`, request);
    return data;
  },

  aplicarPago: async (id: string, request: AplicarPagoRequest): Promise<Comprobante> => {
    const { data } = await api.post(`/comprobantes/${id}/aplicar-pago`, request);
    return data;
  },

  // ============ CUENTA CORRIENTE ============

  getCuentaCorriente: async (
    clienteId: string,
    params?: {
      fecha_desde?: string;
      fecha_hasta?: string;
      limit?: number;
    }
  ): Promise<EstadoCuentaResponse> => {
    const { data } = await api.get(`/comprobantes/cuenta-corriente/${clienteId}`, { params });
    return data;
  },

  // ============ REPORTES ============

  reporteVentas: async (fechaInicio: string, fechaFin: string): Promise<ReporteVentasResponse> => {
    const { data } = await api.get('/comprobantes/reportes/ventas', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return data;
  },

  reporteCobranzas: async (fechaInicio: string, fechaFin: string): Promise<ReporteCobranzasResponse> => {
    const { data } = await api.get('/comprobantes/reportes/cobranzas', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return data;
  },

  reporteDeudores: async (fechaCorte?: string): Promise<ReporteDeudoresResponse> => {
    const { data } = await api.get('/comprobantes/reportes/deudores', {
      params: fechaCorte ? { fecha_corte: fechaCorte } : undefined,
    });
    return data;
  },

  // ============ ESTADÍSTICAS ============

  getResumen: async (): Promise<ResumenComprobantes> => {
    const { data } = await api.get('/comprobantes/stats/resumen');
    return data;
  },

  // ============ HELPERS ============

  getTipoLabel: (tipo: string): string => {
    const labels: Record<string, string> = {
      factura: 'Factura',
      recibo: 'Recibo',
      nota_credito: 'Nota de Crédito',
      nota_debito: 'Nota de Débito',
      presupuesto: 'Presupuesto',
    };
    return labels[tipo] || tipo;
  },

  getEstadoLabel: (estado: string): string => {
    const labels: Record<string, string> = {
      borrador: 'Borrador',
      emitido: 'Emitido',
      pagado_parcial: 'Pago Parcial',
      pagado_total: 'Pagado',
      anulado: 'Anulado',
      vencido: 'Vencido',
    };
    return labels[estado] || estado;
  },

  getEstadoColor: (estado: string): string => {
    const colors: Record<string, string> = {
      borrador: 'bg-gray-100 text-gray-800',
      emitido: 'bg-blue-100 text-blue-800',
      pagado_parcial: 'bg-yellow-100 text-yellow-800',
      pagado_total: 'bg-green-100 text-green-800',
      anulado: 'bg-red-100 text-red-800',
      vencido: 'bg-orange-100 text-orange-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  },

  getTipoColor: (tipo: string): string => {
    const colors: Record<string, string> = {
      factura: 'bg-primary/10 text-primary',
      recibo: 'bg-green-100 text-green-800',
      nota_credito: 'bg-purple-100 text-purple-800',
      nota_debito: 'bg-orange-100 text-orange-800',
      presupuesto: 'bg-gray-100 text-gray-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  },

  formatNumero: (numero: string): string => {
    return numero;
  },

  formatMonto: (monto: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(monto);
  },
};
