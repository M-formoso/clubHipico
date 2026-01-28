import api from './api';
import { Empleado, EmpleadoCreate, EmpleadoUpdate } from '@/types/empleado';

export const empleadoService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    activo_solo?: boolean;
    funcion?: string;
  }): Promise<Empleado[]> => {
    const { data } = await api.get('/empleados/', { params });
    return data;
  },

  getById: async (id: string): Promise<Empleado> => {
    const { data } = await api.get(`/empleados/${id}`);
    return data;
  },

  create: async (empleado: EmpleadoCreate): Promise<Empleado> => {
    const { data } = await api.post('/empleados/', empleado);
    return data;
  },

  update: async (id: string, empleado: EmpleadoUpdate): Promise<Empleado> => {
    const { data } = await api.put(`/empleados/${id}`, empleado);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/empleados/${id}`);
  },

  // Horarios
  getHorarios: async (empleadoId: string) => {
    const { data } = await api.get(`/empleados/${empleadoId}/horarios`);
    return data;
  },

  updateHorarios: async (empleadoId: string, horarios: any) => {
    const { data } = await api.put(`/empleados/${empleadoId}/horarios`, horarios);
    return data;
  },

  // Asistencias
  getAsistencias: async (empleadoId: string, fecha_inicio?: string, fecha_fin?: string) => {
    const { data } = await api.get(`/empleados/${empleadoId}/asistencias`, {
      params: { fecha_inicio, fecha_fin },
    });
    return data;
  },

  registrarAsistencia: async (empleadoId: string, fecha: string, presente: boolean) => {
    const { data } = await api.post(`/empleados/${empleadoId}/asistencias`, {
      fecha,
      presente,
    });
    return data;
  },
};
