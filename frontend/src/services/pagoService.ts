import api from './api';
import { Pago, PagoCreate, PagoUpdate } from '@/types/pago';

export const pagoService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    cliente_id?: string;
    estado?: string;
    tipo?: string;
  }): Promise<Pago[]> => {
    const { data } = await api.get('/pagos/', { params });
    return data;
  },

  getById: async (id: string): Promise<Pago> => {
    const { data } = await api.get(`/pagos/${id}`);
    return data;
  },

  create: async (pago: PagoCreate): Promise<Pago> => {
    const { data } = await api.post('/pagos/', pago);
    return data;
  },

  update: async (id: string, pago: PagoUpdate): Promise<Pago> => {
    const { data } = await api.put(`/pagos/${id}`, pago);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pagos/${id}`);
  },

  // Pagos pendientes
  getPendientes: async () => {
    const { data } = await api.get('/pagos/pendientes');
    return data;
  },

  // Pagos vencidos
  getVencidos: async () => {
    const { data } = await api.get('/pagos/vencidos');
    return data;
  },

  // Pagos por cliente
  getPorCliente: async (clienteId: string) => {
    const { data } = await api.get(`/pagos/cliente/${clienteId}`);
    return data;
  },

  // Generar recibo
  generarRecibo: async (pagoId: string) => {
    const { data } = await api.get(`/pagos/${pagoId}/recibo`, {
      responseType: 'blob',
    });
    return data;
  },

  // Descargar recibo
  descargarRecibo: async (pagoId: string) => {
    const response = await api.get(`/pagos/${pagoId}/recibo`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recibo-${pagoId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Cambiar estado
  cambiarEstado: async (pagoId: string, estado: string): Promise<Pago> => {
    const { data } = await api.patch(`/pagos/${pagoId}/estado`, null, {
      params: { estado },
    });
    return data;
  },

  // Obtener balance
  getBalance: async (fecha_inicio: string, fecha_fin: string): Promise<{
    ingresos: number;
    egresos: number;
    balance: number;
    fecha_inicio: string;
    fecha_fin: string;
  }> => {
    const { data } = await api.get('/pagos/balance/periodo', {
      params: { fecha_inicio, fecha_fin },
    });
    return data;
  },
};
