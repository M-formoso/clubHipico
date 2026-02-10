import api from './api';

export interface ReporteFiltros {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo?: string;
}

export const reporteService = {
  // Dashboard general (estadísticas completas con estructura anidada)
  getDashboard: async () => {
    const { data } = await api.get('/dashboard/');
    return data;
  },

  // Dashboard de reportes (estadísticas simplificadas para página de reportes)
  getReportesDashboard: async () => {
    const { data } = await api.get('/reportes/dashboard');
    return data;
  },

  // Reporte financiero
  getFinanciero: async (filtros: ReporteFiltros) => {
    const { data } = await api.get('/reportes/financiero', { params: filtros });
    return data;
  },

  // Reporte de ocupación
  getOcupacion: async () => {
    const { data } = await api.get('/reportes/ocupacion');
    return data;
  },

  // Reporte de clientes
  getClientes: async (filtros: ReporteFiltros) => {
    const { data } = await api.get('/reportes/clientes', { params: filtros });
    return data;
  },

  // Reporte de caballos
  getCaballos: async () => {
    const { data } = await api.get('/reportes/caballos');
    return data;
  },

  // Reporte de eventos
  getEventos: async (filtros: ReporteFiltros) => {
    const { data } = await api.get('/reportes/eventos', { params: filtros });
    return data;
  },

  // Exportar reporte
  exportar: async (tipo: string, formato: 'pdf' | 'excel', filtros: any) => {
    const response = await api.post(
      '/reportes/export',
      { tipo, formato, filtros },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
    link.setAttribute('download', `reporte-${tipo}-${Date.now()}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
