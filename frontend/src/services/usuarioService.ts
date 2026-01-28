import api from './api';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types/usuario';

export const usuarioService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    activo_solo?: boolean;
    rol?: string;
    funcion?: string;
  }): Promise<Usuario[]> => {
    const { data } = await api.get('/usuarios/', { params });
    return data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  create: async (usuario: UsuarioCreate): Promise<Usuario> => {
    const { data } = await api.post('/usuarios/', usuario);
    return data;
  },

  update: async (id: string, usuario: UsuarioUpdate): Promise<Usuario> => {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  // Permisos
  updatePermisos: async (id: string, permisos: any) => {
    const { data } = await api.put(`/usuarios/${id}/permisos`, permisos);
    return data;
  },

  // Horarios
  getHorarios: async (usuarioId: string) => {
    const { data } = await api.get(`/usuarios/${usuarioId}/horarios`);
    return data;
  },

  updateHorarios: async (usuarioId: string, horarios: any) => {
    const { data } = await api.put(`/usuarios/${usuarioId}/horarios`, horarios);
    return data;
  },

  // Asistencias
  getAsistencias: async (usuarioId: string, fecha_inicio?: string, fecha_fin?: string) => {
    const { data } = await api.get(`/usuarios/${usuarioId}/asistencias`, {
      params: { fecha_inicio, fecha_fin },
    });
    return data;
  },

  registrarAsistencia: async (usuarioId: string, fecha: string, presente: boolean) => {
    const { data } = await api.post(`/usuarios/${usuarioId}/asistencias`, {
      fecha,
      presente,
    });
    return data;
  },
};
