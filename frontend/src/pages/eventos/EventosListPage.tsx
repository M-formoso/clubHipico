import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { eventoService } from '@/services/eventoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function EventosListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => eventoService.getAll(),
  });

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'default';
      case 'en_curso':
        return 'secondary';
      case 'finalizado':
        return 'success';
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'clase_grupal':
        return 'bg-blue-100 text-blue-800';
      case 'clase_privada':
        return 'bg-purple-100 text-purple-800';
      case 'competencia':
        return 'bg-red-100 text-red-800';
      case 'salida':
        return 'bg-green-100 text-green-800';
      case 'evento_social':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando eventos...</div>
      </div>
    );
  }

  const filteredEventos = eventos?.filter((evento) =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona clases, competencias y actividades del club
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/eventos/calendario')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Ver Calendario
          </Button>
          <Button onClick={() => navigate('/eventos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEventos?.map((evento) => (
          <Card
            key={evento.id}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/eventos/${evento.id}`)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {evento.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {evento.descripcion}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={getEstadoBadgeVariant(evento.estado)}
                  className="capitalize"
                >
                  {evento.estado.replace('_', ' ')}
                </Badge>
                <Badge
                  className={getTipoBadgeColor(evento.tipo)}
                  variant="outline"
                >
                  {evento.tipo.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(evento.fecha_inicio), 'PPP', { locale: es })}
                  </span>
                </div>
                {evento.instructor && (
                  <div className="text-gray-600">
                    Instructor: {evento.instructor.nombre} {evento.instructor.apellido}
                  </div>
                )}
                {evento.capacidad_maxima && (
                  <div className="text-gray-600">
                    Capacidad: {evento.capacidad_maxima} personas
                  </div>
                )}
                {evento.costo > 0 && (
                  <div className="text-beige-600 font-semibold">
                    ${evento.costo.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEventos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron eventos</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/eventos/nuevo')}
          >
            Crear primer evento
          </Button>
        </div>
      )}
    </div>
  );
}
