import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { caballoService } from '@/services/caballoService';
import { Caballo } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const estadoColors = {
  activo: 'bg-green-100 text-green-800',
  retirado: 'bg-gray-100 text-gray-800',
  en_tratamiento: 'bg-orange-100 text-orange-800',
  fallecido: 'bg-red-100 text-red-800',
};

const estadoLabels = {
  activo: 'Activo',
  retirado: 'Retirado',
  en_tratamiento: 'En Tratamiento',
  fallecido: 'Fallecido',
};

export function CaballosListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');

  const isCliente = user?.rol === 'cliente';

  const { data: caballos, isLoading, error } = useQuery({
    queryKey: isCliente ? ['caballos', 'me'] : ['caballos'],
    queryFn: () => isCliente ? caballoService.getMe() : caballoService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: caballoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Caballo eliminado',
        description: 'El caballo ha sido eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar',
        description: error.response?.data?.detail || 'No se pudo eliminar el caballo',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al caballo "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filtrar caballos
  const filteredCaballos = caballos?.filter((caballo: Caballo) => {
    const matchesSearch = caballo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caballo.raza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caballo.numero_chip?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === 'todos' || caballo.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando caballos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error al cargar los caballos</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isCliente ? 'Mis Caballos' : 'Caballos'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {isCliente
              ? 'Información de tus caballos'
              : 'Gestiona los caballos del club'}
          </p>
        </div>
        {!isCliente && (
          <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate('/caballos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caballo
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-beige-500 focus:ring-beige-500"
        >
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="en_tratamiento">En Tratamiento</option>
          <option value="retirado">Retirado</option>
          <option value="fallecido">Fallecido</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-xs md:text-sm text-gray-600">
        {filteredCaballos?.length || 0} de {caballos?.length || 0} caballos
      </div>

      {/* Caballos Grid */}
      {filteredCaballos && filteredCaballos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredCaballos.map((caballo: Caballo) => (
            <Card key={caballo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{caballo.nombre}</CardTitle>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{caballo.raza}</p>
                  </div>
                  <Badge className={`${estadoColors[caballo.estado]} text-xs shrink-0`}>
                    {estadoLabels[caballo.estado]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-3 md:space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                  <div className="col-span-2">
                    <p className="text-gray-500">Nº Chip</p>
                    <p className="font-medium font-mono text-xs truncate">{caballo.numero_chip || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Edad</p>
                    <p className="font-medium">{caballo.edad || 'N/A'} años</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sexo</p>
                    <p className="font-medium capitalize">{caballo.sexo || 'N/A'}</p>
                  </div>
                  {caballo.propietario && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Propietario</p>
                      <p className="font-medium truncate">
                        {caballo.propietario.nombre} {caballo.propietario.apellido}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs md:text-sm"
                    onClick={() => navigate(`/caballos/${caballo.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Ver
                  </Button>
                  {!isCliente && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs md:text-sm"
                        onClick={() => navigate(`/caballos/${caballo.id}/editar`)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(caballo.id, caballo.nombre)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No se encontraron caballos</p>
              <p className="text-sm mt-2">
                {searchTerm || estadoFilter !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando un nuevo caballo'}
              </p>
              {!searchTerm && estadoFilter === 'todos' && (
                <Button
                  className="mt-4"
                  onClick={() => navigate('/caballos/nuevo')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Caballo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
