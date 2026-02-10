import api from './api';
import {
  Caballo,
  CaballoCreate,
  CaballoUpdate,
  CaballoCompleto,
  FotoCaballo,
  FotoCaballoCreate,
  VacunaRegistro,
  VacunaRegistroCreate,
  VacunaRegistroUpdate,
  RevisionDental,
  RevisionDentalCreate,
  RevisionDentalUpdate,
  EstudioMedico,
  EstudioMedicoCreate,
  EstudioMedicoUpdate,
  HerrajeRegistro,
  HerrajeRegistroCreate,
  HerrajeRegistroUpdate,
  AntiparasitarioRegistro,
  AntiparasitarioRegistroCreate,
  AntiparasitarioRegistroUpdate,
} from '@/types/caballo';

export const caballoService = {
  // ========== CRUD CABALLO ==========

  getAll: async (params?: {
    skip?: number;
    limit?: number;
    activo_solo?: boolean;
    propietario_id?: string;
  }): Promise<Caballo[]> => {
    const { data } = await api.get('/caballos/', { params });
    return data;
  },

  // Obtener caballos del cliente actual
  getMe: async (): Promise<Caballo[]> => {
    const { data } = await api.get('/caballos/me');
    return data;
  },

  getById: async (id: string): Promise<Caballo> => {
    const { data } = await api.get(`/caballos/${id}`);
    return data;
  },

  getCompleto: async (id: string): Promise<CaballoCompleto> => {
    const { data } = await api.get(`/caballos/${id}/completo`);
    return data;
  },

  create: async (caballo: CaballoCreate): Promise<Caballo> => {
    const { data } = await api.post('/caballos/', caballo);
    return data;
  },

  update: async (id: string, caballo: CaballoUpdate): Promise<Caballo> => {
    const { data } = await api.put(`/caballos/${id}`, caballo);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/caballos/${id}`);
  },

  search: async (query: string): Promise<Caballo[]> => {
    const { data } = await api.get('/caballos/buscar', {
      params: { q: query },
    });
    return data;
  },

  // ========== FOTOS ==========

  getFotos: async (caballoId: string): Promise<FotoCaballo[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/fotos`);
    return data;
  },

  addFoto: async (caballoId: string, file: File, descripcion?: string, es_principal?: boolean): Promise<FotoCaballo> => {
    const formData = new FormData();
    formData.append('file', file);
    if (descripcion) formData.append('descripcion', descripcion);
    formData.append('es_principal', String(es_principal || false));

    const { data } = await api.post(`/caballos/${caballoId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  marcarFotoPrincipal: async (fotoId: string): Promise<FotoCaballo> => {
    const { data } = await api.put(`/caballos/fotos/${fotoId}/principal`);
    return data;
  },

  deleteFoto: async (fotoId: string): Promise<void> => {
    await api.delete(`/caballos/fotos/${fotoId}`);
  },

  // ========== VACUNAS ==========

  getVacunas: async (caballoId: string): Promise<VacunaRegistro[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/vacunas`);
    return data;
  },

  addVacuna: async (caballoId: string, vacuna: Omit<VacunaRegistroCreate, 'caballo_id'>): Promise<VacunaRegistro> => {
    const { data } = await api.post(`/caballos/${caballoId}/vacunas`, vacuna);
    return data;
  },

  updateVacuna: async (vacunaId: string, vacuna: VacunaRegistroUpdate): Promise<VacunaRegistro> => {
    const { data } = await api.put(`/caballos/vacunas/${vacunaId}`, vacuna);
    return data;
  },

  deleteVacuna: async (vacunaId: string): Promise<void> => {
    await api.delete(`/caballos/vacunas/${vacunaId}`);
  },

  // ========== HERRAJES ==========

  getHerrajes: async (caballoId: string): Promise<HerrajeRegistro[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/herrajes`);
    return data;
  },

  addHerraje: async (caballoId: string, herraje: Omit<HerrajeRegistroCreate, 'caballo_id'>): Promise<HerrajeRegistro> => {
    const { data } = await api.post(`/caballos/${caballoId}/herrajes`, herraje);
    return data;
  },

  updateHerraje: async (herrajeId: string, herraje: HerrajeRegistroUpdate): Promise<HerrajeRegistro> => {
    const { data } = await api.put(`/caballos/herrajes/${herrajeId}`, herraje);
    return data;
  },

  deleteHerraje: async (herrajeId: string): Promise<void> => {
    await api.delete(`/caballos/herrajes/${herrajeId}`);
  },

  // ========== ANTIPARASITARIOS ==========

  getAntiparasitarios: async (caballoId: string): Promise<AntiparasitarioRegistro[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/antiparasitarios`);
    return data;
  },

  addAntiparasitario: async (
    caballoId: string,
    antiparasitario: Omit<AntiparasitarioRegistroCreate, 'caballo_id'>
  ): Promise<AntiparasitarioRegistro> => {
    const { data } = await api.post(`/caballos/${caballoId}/antiparasitarios`, antiparasitario);
    return data;
  },

  updateAntiparasitario: async (
    antiparasitarioId: string,
    antiparasitario: AntiparasitarioRegistroUpdate
  ): Promise<AntiparasitarioRegistro> => {
    const { data } = await api.put(`/caballos/antiparasitarios/${antiparasitarioId}`, antiparasitario);
    return data;
  },

  deleteAntiparasitario: async (antiparasitarioId: string): Promise<void> => {
    await api.delete(`/caballos/antiparasitarios/${antiparasitarioId}`);
  },

  // ========== REVISIONES DENTALES ==========

  getRevisionesDentales: async (caballoId: string): Promise<RevisionDental[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/revisiones-dentales`);
    return data;
  },

  addRevisionDental: async (
    caballoId: string,
    revision: Omit<RevisionDentalCreate, 'caballo_id'>
  ): Promise<RevisionDental> => {
    const { data } = await api.post(`/caballos/${caballoId}/revisiones-dentales`, revision);
    return data;
  },

  updateRevisionDental: async (
    revisionId: string,
    revision: RevisionDentalUpdate
  ): Promise<RevisionDental> => {
    const { data } = await api.put(`/caballos/revisiones-dentales/${revisionId}`, revision);
    return data;
  },

  deleteRevisionDental: async (revisionId: string): Promise<void> => {
    await api.delete(`/caballos/revisiones-dentales/${revisionId}`);
  },

  // ========== ESTUDIOS MÉDICOS ==========

  getEstudiosMedicos: async (caballoId: string): Promise<EstudioMedico[]> => {
    const { data } = await api.get(`/caballos/${caballoId}/estudios-medicos`);
    return data;
  },

  addEstudioMedico: async (
    caballoId: string,
    estudio: Omit<EstudioMedicoCreate, 'caballo_id'>
  ): Promise<EstudioMedico> => {
    const { data } = await api.post(`/caballos/${caballoId}/estudios-medicos`, estudio);
    return data;
  },

  updateEstudioMedico: async (
    estudioId: string,
    estudio: EstudioMedicoUpdate
  ): Promise<EstudioMedico> => {
    const { data } = await api.put(`/caballos/estudios-medicos/${estudioId}`, estudio);
    return data;
  },

  deleteEstudioMedico: async (estudioId: string): Promise<void> => {
    await api.delete(`/caballos/estudios-medicos/${estudioId}`);
  },

  // ========== HISTORIAL MÉDICO (legacy) ==========

  getHistorialMedico: async (caballoId: string) => {
    const { data } = await api.get(`/caballos/${caballoId}/historial-medico`);
    return data;
  },

  addHistorialMedico: async (caballoId: string, historial: any) => {
    const { data } = await api.post(`/caballos/${caballoId}/historial-medico`, historial);
    return data;
  },

  // ========== PLAN ALIMENTACIÓN (legacy) ==========

  getAlimentacion: async (caballoId: string) => {
    const { data } = await api.get(`/caballos/${caballoId}/plan-alimentacion`);
    return data;
  },

  updateAlimentacion: async (caballoId: string, alimentacion: any) => {
    const { data } = await api.put(`/caballos/${caballoId}/plan-alimentacion`, alimentacion);
    return data;
  },
};
