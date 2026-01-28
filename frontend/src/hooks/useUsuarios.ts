import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuarioService';
import { UsuarioCreate, UsuarioUpdate } from '@/types/usuario';
import { useToast } from './use-toast';

export function useUsuarios(params?: {
  skip?: number;
  limit?: number;
  activo_solo?: boolean;
  rol?: string;
  funcion?: string;
}) {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuarioService.getAll(params),
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuarioService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UsuarioCreate) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UsuarioUpdate }) =>
      usuarioService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', variables.id] });
      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo actualizar el usuario',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    },
  });
}
