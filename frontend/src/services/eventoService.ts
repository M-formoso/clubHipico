import api from './api';
import { Evento, EventoCreate, EventoUpdate } from '@/types/evento';

export const eventoService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    tipo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<Evento[]> => {
    const { data } = await api.get('/eventos/', { params });
    return data;
  },

  getById: async (id: string): Promise<Evento> => {
    const { data } = await api.get(`/eventos/${id}`);
    return data;
  },

  create: async (evento: EventoCreate): Promise<Evento> => {
    const { data } = await api.post('/eventos/', evento);
    return data;
  },

  update: async (id: string, evento: EventoUpdate): Promise<Evento> => {
    const { data } = await api.put(`/eventos/${id}`, evento);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/eventos/${id}`);
  },

  // Calendario
  getCalendario: async (fecha_inicio: string, fecha_fin: string) => {
    const { data } = await api.get('/eventos/calendario', {
      params: { fecha_inicio, fecha_fin },
    });
    return data;
  },

  // Inscripciones
  getInscripciones: async (eventoId: string) => {
    const { data } = await api.get(`/eventos/${eventoId}/inscripciones`);
    return data;
  },

  inscribirse: async (eventoId: string, clienteId: string, caballoId?: string) => {
    const { data } = await api.post('/eventos/inscripciones', {
      evento_id: eventoId,
      cliente_id: clienteId,
      caballo_id: caballoId,
    });
    return data;
  },

  desinscribirse: async (inscripcionId: string) => {
    await api.delete(`/eventos/inscripciones/${inscripcionId}`);
  },

  // Asistencia
  marcarAsistencia: async (_eventoId: string, inscripcionId: string, asistio: boolean) => {
    const { data } = await api.put(`/eventos/inscripciones/${inscripcionId}/asistencia`, {
      asistio,
    });
    return data;
  },
};
