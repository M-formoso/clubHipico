import api from './api';
import { Cliente, ClienteCreate, ClienteUpdate } from '@/types/cliente';

export const clienteService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    activo_solo?: boolean;
  }): Promise<Cliente[]> => {
    const { data } = await api.get('/clientes/', {
      params: {
        ...params,
        activo_solo: params?.activo_solo ?? false, // Por defecto traer todos
      }
    });
    return data;
  },

  getById: async (id: string): Promise<Cliente> => {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  create: async (cliente: ClienteCreate): Promise<Cliente> => {
    const { data } = await api.post('/clientes/', cliente);
    return data;
  },

  update: async (id: string, cliente: ClienteUpdate): Promise<Cliente> => {
    const { data } = await api.put(`/clientes/${id}`, cliente);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },

  search: async (query: string): Promise<Cliente[]> => {
    const { data } = await api.get('/clientes/buscar', {
      params: { q: query },
    });
    return data;
  },

  // Caballos del cliente
  getCaballos: async (clienteId: string) => {
    const { data } = await api.get(`/clientes/${clienteId}/caballos`);
    return data;
  },

  // Pagos del cliente
  getPagos: async (clienteId: string) => {
    const { data } = await api.get(`/clientes/${clienteId}/pagos`);
    return data;
  },

  // Historial del cliente
  getHistorial: async (clienteId: string) => {
    const { data } = await api.get(`/clientes/${clienteId}/historial`);
    return data;
  },

  // Documentos
  uploadDocumento: async (clienteId: string, file: File, tipo: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    const { data } = await api.post(`/clientes/${clienteId}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
