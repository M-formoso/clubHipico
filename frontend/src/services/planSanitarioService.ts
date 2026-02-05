import api from './api';
import { PlanSanitarioResponse, EstadisticasPlanSanitario } from '@/types/caballo';

export const planSanitarioService = {
  /**
   * Obtiene el plan sanitario completo de un caballo para un año específico
   */
  async getPlanSanitario(caballoId: string, anio?: number): Promise<PlanSanitarioResponse> {
    const params = anio ? { anio } : {};
    const response = await api.get(`/caballos/${caballoId}/plan-sanitario`, { params });
    return response.data;
  },

  /**
   * Obtiene estadísticas de cumplimiento del plan sanitario
   */
  async getEstadisticas(caballoId: string, anio?: number): Promise<EstadisticasPlanSanitario> {
    const params = anio ? { anio } : {};
    const response = await api.get(`/caballos/${caballoId}/plan-sanitario/estadisticas`, { params });
    return response.data;
  },
};
