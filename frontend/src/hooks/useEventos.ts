import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '@/services/eventoService';
import { EventoCreate, EventoUpdate } from '@/types/evento';
import { useToast } from './use-toast';

export function useEventos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const eventosQuery = useQuery({
    queryKey: ['eventos'],
    queryFn: () => eventoService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: EventoCreate) => eventoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Éxito',
        description: 'Evento creado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al crear el evento',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventoUpdate }) =>
      eventoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Éxito',
        description: 'Evento actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar el evento',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Éxito',
        description: 'Evento eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar el evento',
        variant: 'destructive',
      });
    },
  });

  return {
    eventos: eventosQuery.data,
    isLoading: eventosQuery.isLoading,
    error: eventosQuery.error,
    createEvento: createMutation.mutate,
    updateEvento: updateMutation.mutate,
    deleteEvento: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: ['eventos', id],
    queryFn: () => eventoService.getById(id),
    enabled: !!id,
  });
}
