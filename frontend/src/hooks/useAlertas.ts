import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertaService } from '@/services/alertaService';
import { AlertaCreate, FiltrosAlertas, TipoAlertaConfigCreate, TipoAlertaConfigUpdate } from '@/types/alerta';
import { useToast } from './use-toast';

// ============ ALERTAS ============

export function useAlertas(filtros?: FiltrosAlertas) {
  return useQuery({
    queryKey: ['alertas', filtros],
    queryFn: () => alertaService.getMisAlertas(filtros),
  });
}

export function useAlertasNoLeidas() {
  return useQuery({
    queryKey: ['alertas-no-leidas'],
    queryFn: () => alertaService.getNoLeidas(),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });
}

export function useAlerta(id: string) {
  return useQuery({
    queryKey: ['alerta', id],
    queryFn: () => alertaService.getById(id),
    enabled: !!id,
  });
}

export function useEstadisticasAlertas() {
  return useQuery({
    queryKey: ['alertas-estadisticas'],
    queryFn: () => alertaService.getEstadisticas(),
  });
}

export function useMarcarLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertaId: string) => alertaService.marcarLeida(alertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-estadisticas'] });
    },
  });
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => alertaService.marcarTodasLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-estadisticas'] });
      toast({
        title: 'Alertas marcadas',
        description: 'Todas las alertas han sido marcadas como leídas',
      });
    },
  });
}

export function useCreateAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (alerta: AlertaCreate) => alertaService.create(alerta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-estadisticas'] });
      toast({
        title: 'Alerta creada',
        description: 'La alerta ha sido creada exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear la alerta',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (alertaId: string) => alertaService.delete(alertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-estadisticas'] });
      toast({
        title: 'Alerta eliminada',
        description: 'La alerta ha sido eliminada',
      });
    },
  });
}

export function usePostponerAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ alertaId, dias }: { alertaId: string; dias: number }) =>
      alertaService.posponer(alertaId, dias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      toast({
        title: 'Alerta pospuesta',
        description: 'La alerta ha sido pospuesta',
      });
    },
  });
}

// ============ TIPOS DE ALERTA ============

export function useTiposAlerta() {
  return useQuery({
    queryKey: ['tipos-alerta'],
    queryFn: () => alertaService.getTiposAlerta(),
  });
}

export function useTipoAlerta(id: string) {
  return useQuery({
    queryKey: ['tipo-alerta', id],
    queryFn: () => alertaService.getTipoAlertaById(id),
    enabled: !!id,
  });
}

export function useCreateTipoAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (tipo: TipoAlertaConfigCreate) => alertaService.createTipoAlerta(tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-alerta'] });
      toast({
        title: 'Tipo de alerta creado',
        description: 'El tipo de alerta ha sido creado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear el tipo de alerta',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTipoAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TipoAlertaConfigUpdate }) =>
      alertaService.updateTipoAlerta(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-alerta'] });
      queryClient.invalidateQueries({ queryKey: ['tipo-alerta', variables.id] });
      toast({
        title: 'Tipo de alerta actualizado',
        description: 'El tipo de alerta ha sido actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo actualizar el tipo de alerta',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTipoAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => alertaService.deleteTipoAlerta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-alerta'] });
      toast({
        title: 'Tipo de alerta eliminado',
        description: 'El tipo de alerta ha sido eliminado',
      });
    },
  });
}

export function useToggleTipoAlerta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      alertaService.toggleTipoAlerta(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-alerta'] });
    },
  });
}

export function useEnviarAlertaPrueba() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (tipoAlertaId: string) => alertaService.enviarPrueba(tipoAlertaId),
    onSuccess: () => {
      toast({
        title: 'Alerta de prueba enviada',
        description: 'La alerta de prueba ha sido enviada',
      });
    },
  });
}

// ============ CONFIGURACIÓN ============

export function useConfiguracionAlertas() {
  return useQuery({
    queryKey: ['configuracion-alertas'],
    queryFn: () => alertaService.getConfiguracion(),
  });
}

export function useUpdateConfiguracionAlertas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (configuracion: any) => alertaService.updateConfiguracion(configuracion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-alertas'] });
      toast({
        title: 'Configuración actualizada',
        description: 'La configuración de alertas ha sido actualizada',
      });
    },
  });
}
