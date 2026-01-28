import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caballoService } from '@/services/caballoService';
import {
  CaballoCreate,
  CaballoUpdate,
  VacunaRegistroCreate,
  VacunaRegistroUpdate,
  HerrajeRegistroCreate,
  HerrajeRegistroUpdate,
  AntiparasitarioRegistroCreate,
  AntiparasitarioRegistroUpdate,
  RevisionDentalCreate,
  RevisionDentalUpdate,
  EstudioMedicoCreate,
  EstudioMedicoUpdate,
  FotoCaballoCreate,
} from '@/types/caballo';
import { useToast } from './use-toast';

// ========== CABALLO CRUD ==========

export function useCaballos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const caballosQuery = useQuery({
    queryKey: ['caballos'],
    queryFn: () => caballoService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CaballoCreate) => caballoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Éxito',
        description: 'Caballo creado correctamente. QR generado automáticamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al crear el caballo',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CaballoUpdate }) =>
      caballoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Éxito',
        description: 'Caballo actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar el caballo',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => caballoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Éxito',
        description: 'Caballo retirado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar el caballo',
        variant: 'destructive',
      });
    },
  });

  return {
    caballos: caballosQuery.data,
    isLoading: caballosQuery.isLoading,
    error: caballosQuery.error,
    createCaballo: createMutation.mutate,
    updateCaballo: updateMutation.mutate,
    deleteCaballo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCaballo(id: string) {
  return useQuery({
    queryKey: ['caballos', id],
    queryFn: () => caballoService.getById(id),
    enabled: !!id,
  });
}

export function useCaballoCompleto(id: string) {
  return useQuery({
    queryKey: ['caballos', id, 'completo'],
    queryFn: () => caballoService.getCompleto(id),
    enabled: !!id,
  });
}

// ========== FOTOS ==========

export function useFotos(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fotosQuery = useQuery({
    queryKey: ['caballos', caballoId, 'fotos'],
    queryFn: () => caballoService.getFotos(caballoId),
    enabled: !!caballoId,
  });

  const addFotoMutation = useMutation({
    mutationFn: (foto: FotoCaballoCreate) => caballoService.addFoto(caballoId, foto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'fotos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId] });
      toast({
        title: 'Éxito',
        description: 'Foto agregada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al agregar foto',
        variant: 'destructive',
      });
    },
  });

  const marcarPrincipalMutation = useMutation({
    mutationFn: (fotoId: string) => caballoService.marcarFotoPrincipal(fotoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'fotos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId] });
      toast({
        title: 'Éxito',
        description: 'Foto principal actualizada',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al marcar foto',
        variant: 'destructive',
      });
    },
  });

  const deleteFotoMutation = useMutation({
    mutationFn: (fotoId: string) => caballoService.deleteFoto(fotoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'fotos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId] });
      toast({
        title: 'Éxito',
        description: 'Foto eliminada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar foto',
        variant: 'destructive',
      });
    },
  });

  return {
    fotos: fotosQuery.data,
    isLoading: fotosQuery.isLoading,
    error: fotosQuery.error,
    addFoto: addFotoMutation.mutate,
    marcarPrincipal: marcarPrincipalMutation.mutate,
    deleteFoto: deleteFotoMutation.mutate,
    isAdding: addFotoMutation.isPending,
    isUpdating: marcarPrincipalMutation.isPending,
    isDeleting: deleteFotoMutation.isPending,
  };
}

// ========== VACUNAS ==========

export function useVacunas(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const vacunasQuery = useQuery({
    queryKey: ['caballos', caballoId, 'vacunas'],
    queryFn: () => caballoService.getVacunas(caballoId),
    enabled: !!caballoId,
  });

  const addVacunaMutation = useMutation({
    mutationFn: (vacuna: Omit<VacunaRegistroCreate, 'caballo_id'>) =>
      caballoService.addVacuna(caballoId, vacuna),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'vacunas'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Vacuna registrada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al registrar vacuna',
        variant: 'destructive',
      });
    },
  });

  const updateVacunaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VacunaRegistroUpdate }) =>
      caballoService.updateVacuna(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'vacunas'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Vacuna actualizada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar vacuna',
        variant: 'destructive',
      });
    },
  });

  const deleteVacunaMutation = useMutation({
    mutationFn: (id: string) => caballoService.deleteVacuna(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'vacunas'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Vacuna eliminada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar vacuna',
        variant: 'destructive',
      });
    },
  });

  return {
    vacunas: vacunasQuery.data,
    isLoading: vacunasQuery.isLoading,
    error: vacunasQuery.error,
    addVacuna: addVacunaMutation.mutate,
    updateVacuna: updateVacunaMutation.mutate,
    deleteVacuna: deleteVacunaMutation.mutate,
    isAdding: addVacunaMutation.isPending,
    isUpdating: updateVacunaMutation.isPending,
    isDeleting: deleteVacunaMutation.isPending,
  };
}

// ========== HERRAJES ==========

export function useHerrajes(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const herrajesQuery = useQuery({
    queryKey: ['caballos', caballoId, 'herrajes'],
    queryFn: () => caballoService.getHerrajes(caballoId),
    enabled: !!caballoId,
  });

  const addHerrajeMutation = useMutation({
    mutationFn: (herraje: Omit<HerrajeRegistroCreate, 'caballo_id'>) =>
      caballoService.addHerraje(caballoId, herraje),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'herrajes'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Herraje registrado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al registrar herraje',
        variant: 'destructive',
      });
    },
  });

  const updateHerrajeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HerrajeRegistroUpdate }) =>
      caballoService.updateHerraje(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'herrajes'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Herraje actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar herraje',
        variant: 'destructive',
      });
    },
  });

  const deleteHerrajeMutation = useMutation({
    mutationFn: (id: string) => caballoService.deleteHerraje(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'herrajes'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Herraje eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar herraje',
        variant: 'destructive',
      });
    },
  });

  return {
    herrajes: herrajesQuery.data,
    isLoading: herrajesQuery.isLoading,
    error: herrajesQuery.error,
    addHerraje: addHerrajeMutation.mutate,
    updateHerraje: updateHerrajeMutation.mutate,
    deleteHerraje: deleteHerrajeMutation.mutate,
    isAdding: addHerrajeMutation.isPending,
    isUpdating: updateHerrajeMutation.isPending,
    isDeleting: deleteHerrajeMutation.isPending,
  };
}

// ========== ANTIPARASITARIOS ==========

export function useAntiparasitarios(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const antiparasitariosQuery = useQuery({
    queryKey: ['caballos', caballoId, 'antiparasitarios'],
    queryFn: () => caballoService.getAntiparasitarios(caballoId),
    enabled: !!caballoId,
  });

  const addAntiparasitarioMutation = useMutation({
    mutationFn: (antiparasitario: Omit<AntiparasitarioRegistroCreate, 'caballo_id'>) =>
      caballoService.addAntiparasitario(caballoId, antiparasitario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'antiparasitarios'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Antiparasitario registrado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al registrar antiparasitario',
        variant: 'destructive',
      });
    },
  });

  const updateAntiparasitarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AntiparasitarioRegistroUpdate }) =>
      caballoService.updateAntiparasitario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'antiparasitarios'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Antiparasitario actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar antiparasitario',
        variant: 'destructive',
      });
    },
  });

  const deleteAntiparasitarioMutation = useMutation({
    mutationFn: (id: string) => caballoService.deleteAntiparasitario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'antiparasitarios'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Antiparasitario eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar antiparasitario',
        variant: 'destructive',
      });
    },
  });

  return {
    antiparasitarios: antiparasitariosQuery.data,
    isLoading: antiparasitariosQuery.isLoading,
    error: antiparasitariosQuery.error,
    addAntiparasitario: addAntiparasitarioMutation.mutate,
    updateAntiparasitario: updateAntiparasitarioMutation.mutate,
    deleteAntiparasitario: deleteAntiparasitarioMutation.mutate,
    isAdding: addAntiparasitarioMutation.isPending,
    isUpdating: updateAntiparasitarioMutation.isPending,
    isDeleting: deleteAntiparasitarioMutation.isPending,
  };
}

// ========== REVISIONES DENTALES ==========

export function useRevisionesDentales(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const revisionesQuery = useQuery({
    queryKey: ['caballos', caballoId, 'revisiones-dentales'],
    queryFn: () => caballoService.getRevisionesDentales(caballoId),
    enabled: !!caballoId,
  });

  const addRevisionMutation = useMutation({
    mutationFn: (revision: Omit<RevisionDentalCreate, 'caballo_id'>) =>
      caballoService.addRevisionDental(caballoId, revision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'revisiones-dentales'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Revisión dental registrada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al registrar revisión dental',
        variant: 'destructive',
      });
    },
  });

  const updateRevisionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RevisionDentalUpdate }) =>
      caballoService.updateRevisionDental(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'revisiones-dentales'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Revisión dental actualizada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar revisión dental',
        variant: 'destructive',
      });
    },
  });

  const deleteRevisionMutation = useMutation({
    mutationFn: (id: string) => caballoService.deleteRevisionDental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'revisiones-dentales'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Revisión dental eliminada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar revisión dental',
        variant: 'destructive',
      });
    },
  });

  return {
    revisiones: revisionesQuery.data,
    isLoading: revisionesQuery.isLoading,
    error: revisionesQuery.error,
    addRevision: addRevisionMutation.mutate,
    updateRevision: updateRevisionMutation.mutate,
    deleteRevision: deleteRevisionMutation.mutate,
    isAdding: addRevisionMutation.isPending,
    isUpdating: updateRevisionMutation.isPending,
    isDeleting: deleteRevisionMutation.isPending,
  };
}

// ========== ESTUDIOS MÉDICOS ==========

export function useEstudiosMedicos(caballoId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const estudiosQuery = useQuery({
    queryKey: ['caballos', caballoId, 'estudios-medicos'],
    queryFn: () => caballoService.getEstudiosMedicos(caballoId),
    enabled: !!caballoId,
  });

  const addEstudioMutation = useMutation({
    mutationFn: (estudio: Omit<EstudioMedicoCreate, 'caballo_id'>) =>
      caballoService.addEstudioMedico(caballoId, estudio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'estudios-medicos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Estudio médico registrado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al registrar estudio médico',
        variant: 'destructive',
      });
    },
  });

  const updateEstudioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstudioMedicoUpdate }) =>
      caballoService.updateEstudioMedico(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'estudios-medicos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Estudio médico actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar estudio médico',
        variant: 'destructive',
      });
    },
  });

  const deleteEstudioMutation = useMutation({
    mutationFn: (id: string) => caballoService.deleteEstudioMedico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'estudios-medicos'] });
      queryClient.invalidateQueries({ queryKey: ['caballos', caballoId, 'completo'] });
      toast({
        title: 'Éxito',
        description: 'Estudio médico eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar estudio médico',
        variant: 'destructive',
      });
    },
  });

  return {
    estudios: estudiosQuery.data,
    isLoading: estudiosQuery.isLoading,
    error: estudiosQuery.error,
    addEstudio: addEstudioMutation.mutate,
    updateEstudio: updateEstudioMutation.mutate,
    deleteEstudio: deleteEstudioMutation.mutate,
    isAdding: addEstudioMutation.isPending,
    isUpdating: updateEstudioMutation.isPending,
    isDeleting: deleteEstudioMutation.isPending,
  };
}
