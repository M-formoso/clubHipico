import api from './api';
import { Egreso, EgresoCreate, EgresoUpdate } from '@/types/egreso';

export const egresoService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<Egreso[]> => {
    const { data } = await api.get('/egresos/', { params });
    return data;
  },

  getById: async (id: string): Promise<Egreso> => {
    const { data } = await api.get(`/egresos/${id}`);
    return data;
  },

  create: async (egreso: EgresoCreate): Promise<Egreso> => {
    const { data } = await api.post('/egresos/', egreso);
    return data;
  },

  update: async (id: string, egreso: EgresoUpdate): Promise<Egreso> => {
    const { data } = await api.put(`/egresos/${id}`, egreso);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/egresos/${id}`);
  },
};
