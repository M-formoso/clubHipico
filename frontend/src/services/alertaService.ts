import api from './api';
import {
  Alerta,
  AlertaCreate,
  TipoAlertaConfig,
  TipoAlertaConfigCreate,
  TipoAlertaConfigUpdate,
  ConfiguracionAlertas,
  EstadisticasAlertas,
  FiltrosAlertas,
} from '@/types/alerta';

export const alertaService = {
  // ============ ALERTAS ============

  // Obtener mis alertas con filtros
  getMisAlertas: async (filtros?: FiltrosAlertas): Promise<Alerta[]> => {
    const { data } = await api.get('/alertas/', { params: filtros });
    return data;
  },

  // Obtener todas las alertas (admin)
  getAll: async (filtros?: FiltrosAlertas): Promise<Alerta[]> => {
    const { data } = await api.get('/alertas/all', { params: filtros });
    return data;
  },

  // Obtener alerta por ID
  getById: async (id: string): Promise<Alerta> => {
    const { data } = await api.get(`/alertas/${id}`);
    return data;
  },

  // Alertas no leídas
  getNoLeidas: async (): Promise<Alerta[]> => {
    const { data } = await api.get('/alertas/no-leidas');
    return data;
  },

  // Crear alerta manual
  create: async (alerta: AlertaCreate): Promise<Alerta> => {
    const { data } = await api.post('/alertas/', alerta);
    return data;
  },

  // Marcar como leída
  marcarLeida: async (alertaId: string): Promise<void> => {
    await api.put(`/alertas/${alertaId}/leer`);
  },

  // Marcar todas como leídas
  marcarTodasLeidas: async (): Promise<void> => {
    await api.put('/alertas/marcar-todas-leidas');
  },

  // Eliminar alerta
  delete: async (alertaId: string): Promise<void> => {
    await api.delete(`/alertas/${alertaId}`);
  },

  // Posponer alerta
  posponer: async (alertaId: string, dias: number): Promise<Alerta> => {
    const { data } = await api.put(`/alertas/${alertaId}/posponer`, { dias });
    return data;
  },

  // Estadísticas de alertas
  getEstadisticas: async (): Promise<EstadisticasAlertas> => {
    const { data } = await api.get('/alertas/estadisticas');
    return data;
  },

  // ============ TIPOS DE ALERTA (Configuración) ============

  // Obtener todos los tipos de alerta
  getTiposAlerta: async (): Promise<TipoAlertaConfig[]> => {
    const { data } = await api.get('/alertas/tipos');
    return data;
  },

  // Obtener tipo de alerta por ID
  getTipoAlertaById: async (id: string): Promise<TipoAlertaConfig> => {
    const { data } = await api.get(`/alertas/tipos/${id}`);
    return data;
  },

  // Crear tipo de alerta
  createTipoAlerta: async (tipo: TipoAlertaConfigCreate): Promise<TipoAlertaConfig> => {
    const { data } = await api.post('/alertas/tipos', tipo);
    return data;
  },

  // Actualizar tipo de alerta
  updateTipoAlerta: async (
    id: string,
    tipo: TipoAlertaConfigUpdate
  ): Promise<TipoAlertaConfig> => {
    const { data } = await api.put(`/alertas/tipos/${id}`, tipo);
    return data;
  },

  // Eliminar tipo de alerta
  deleteTipoAlerta: async (id: string): Promise<void> => {
    await api.delete(`/alertas/tipos/${id}`);
  },

  // Activar/desactivar tipo de alerta
  toggleTipoAlerta: async (id: string, activo: boolean): Promise<TipoAlertaConfig> => {
    const { data } = await api.put(`/alertas/tipos/${id}/toggle`, { activo });
    return data;
  },

  // ============ CONFIGURACIÓN DE USUARIO ============

  // Configuración de alertas del usuario
  getConfiguracion: async (): Promise<ConfiguracionAlertas> => {
    const { data } = await api.get('/alertas/configuracion');
    return data;
  },

  updateConfiguracion: async (
    configuracion: Partial<ConfiguracionAlertas>
  ): Promise<ConfiguracionAlertas> => {
    const { data } = await api.put('/alertas/configuracion', configuracion);
    return data;
  },

  // ============ PRUEBAS ============

  // Enviar alerta de prueba
  enviarPrueba: async (tipoAlertaId: string): Promise<void> => {
    await api.post(`/alertas/tipos/${tipoAlertaId}/prueba`);
  },
};
