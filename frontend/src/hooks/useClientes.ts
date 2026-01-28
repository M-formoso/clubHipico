import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/clienteService';
import { ClienteCreate, ClienteUpdate } from '@/types/cliente';
import { useToast } from './use-toast';

export function useClientes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ClienteCreate) => clienteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Éxito',
        description: 'Cliente creado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al crear el cliente',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClienteUpdate }) =>
      clienteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Éxito',
        description: 'Cliente actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al actualizar el cliente',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clienteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Éxito',
        description: 'Cliente eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al eliminar el cliente',
        variant: 'destructive',
      });
    },
  });

  return {
    clientes: clientesQuery.data,
    isLoading: clientesQuery.isLoading,
    error: clientesQuery.error,
    createCliente: createMutation.mutate,
    updateCliente: updateMutation.mutate,
    deleteCliente: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => clienteService.getById(id),
    enabled: !!id,
  });
}
