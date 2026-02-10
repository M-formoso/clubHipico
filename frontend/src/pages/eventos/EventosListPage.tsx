import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import { eventoService } from '@/services/eventoService';
import { caballoService } from '@/services/caballoService';
import { clienteService } from '@/services/clienteService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function EventosListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [inscripcionDialogOpen, setInscripcionDialogOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
  const [caballoSeleccionado, setCaballoSeleccionado] = useState<string>('');

  const isCliente = user?.rol === 'cliente';

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => eventoService.getAll(),
  });

  // Obtener datos del cliente actual si es cliente
  const { data: clienteActual } = useQuery({
    queryKey: ['cliente', 'me'],
    queryFn: () => clienteService.getMe(),
    enabled: isCliente,
  });

  // Obtener caballos del cliente si es cliente
  const { data: misCaballos } = useQuery({
    queryKey: ['caballos', 'me'],
    queryFn: () => caballoService.getMe(),
    enabled: isCliente,
  });

  // Obtener inscripciones por evento
  const { data: inscripcionesPorEvento } = useQuery({
    queryKey: ['inscripciones-por-evento'],
    queryFn: async () => {
      if (!eventos) return {};
      const result: Record<string, any[]> = {};
      for (const evento of eventos) {
        const inscripciones = await eventoService.getInscripciones(evento.id);
        result[evento.id] = inscripciones;
      }
      return result;
    },
    enabled: !!eventos && eventos.length > 0,
  });

  const inscripcionMutation = useMutation({
    mutationFn: ({ eventoId, clienteId, caballoId }: { eventoId: string; clienteId: string; caballoId?: string }) =>
      eventoService.inscribirse(eventoId, clienteId, caballoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones-por-evento'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Inscripción exitosa',
        description: 'Te has inscrito al evento correctamente',
      });
      setInscripcionDialogOpen(false);
      setEventoSeleccionado(null);
      setCaballoSeleccionado('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error al inscribirse',
        description: error.response?.data?.detail || 'No se pudo completar la inscripción',
        variant: 'destructive',
      });
    },
  });

  const handleInscribirse = (evento: any) => {
    setEventoSeleccionado(evento);
    setInscripcionDialogOpen(true);
  };

  const confirmarInscripcion = () => {
    if (!eventoSeleccionado || !clienteActual) return;

    inscripcionMutation.mutate({
      eventoId: eventoSeleccionado.id,
      clienteId: clienteActual.id,
      caballoId: caballoSeleccionado && caballoSeleccionado !== 'sin-caballo' ? caballoSeleccionado : undefined,
    });
  };

  const estaInscrito = (eventoId: string) => {
    if (!isCliente || !clienteActual || !inscripcionesPorEvento) return false;
    const inscripciones = inscripcionesPorEvento[eventoId] || [];
    return inscripciones.some((i: any) => i.cliente_id === clienteActual.id);
  };

  const getInscritosCount = (eventoId: string) => {
    if (!inscripcionesPorEvento) return 0;
    return (inscripcionesPorEvento[eventoId] || []).length;
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-blue-100 text-blue-800';
      case 'en_curso':
        return 'bg-orange-100 text-orange-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      programado: 'Programado',
      en_curso: 'En Curso',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return labels[estado] || estado;
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
            {isCliente
              ? 'Inscríbete a clases, competencias y actividades del club'
              : 'Gestiona clases, competencias y actividades del club'}
          </p>
        </div>
        {!isCliente && (
          <Button onClick={() => navigate('/eventos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        )}
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
        {filteredEventos?.map((evento) => {
          const inscritosCount = getInscritosCount(evento.id);
          const inscrito = estaInscrito(evento.id);
          const lleno = evento.capacidad_maxima && inscritosCount >= evento.capacidad_maxima;

          return (
            <Card
              key={evento.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                >
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

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      className={getEstadoBadgeColor(evento.estado)}
                      variant="outline"
                    >
                      {getEstadoLabel(evento.estado)}
                    </Badge>
                    <Badge
                      className={getTipoBadgeColor(evento.tipo)}
                      variant="outline"
                    >
                      {({ clase_grupal: 'Clase Grupal', clase_privada: 'Clase Privada', competencia: 'Competencia', salida: 'Salida', evento_social: 'Evento Social', otro: 'Otro' } as Record<string, string>)[evento.tipo] || evento.tipo}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mt-3">
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
                      <div className={`text-gray-600 ${lleno ? 'text-red-600 font-semibold' : ''}`}>
                        Inscritos: {inscritosCount} / {evento.capacidad_maxima}
                      </div>
                    )}
                    {evento.costo > 0 && (
                      <div className="text-beige-600 font-semibold">
                        ${Number(evento.costo).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {isCliente && evento.estado === 'programado' && (
                  <div className="pt-2 border-t">
                    {inscrito ? (
                      <Badge className="bg-green-100 text-green-800 w-full justify-center py-2">
                        Ya estás inscrito
                      </Badge>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInscribirse(evento);
                        }}
                        disabled={lleno}
                        className="w-full"
                        variant={lleno ? 'secondary' : 'default'}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {lleno ? 'Cupos Llenos' : 'Inscribirse'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredEventos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron eventos</p>
          {!isCliente && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/eventos/nuevo')}
            >
              Crear primer evento
            </Button>
          )}
        </div>
      )}

      {/* Inscripción Dialog */}
      <Dialog open={inscripcionDialogOpen} onOpenChange={setInscripcionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribirse al Evento</DialogTitle>
            <DialogDescription>
              {eventoSeleccionado && (
                <>
                  Te estás inscribiendo a: <strong>{eventoSeleccionado.titulo}</strong>
                  <br />
                  Fecha: {format(new Date(eventoSeleccionado.fecha_inicio), 'PPP', { locale: es })}
                  {eventoSeleccionado.costo > 0 && (
                    <>
                      <br />
                      Costo: ${Number(eventoSeleccionado.costo).toFixed(2)}
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecciona un caballo (opcional)
              </label>
              <Select value={caballoSeleccionado} onValueChange={setCaballoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin caballo asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-caballo">Sin caballo asignado</SelectItem>
                  {misCaballos?.map((caballo: any) => (
                    <SelectItem key={caballo.id} value={caballo.id}>
                      {caballo.nombre} - {caballo.raza}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInscripcionDialogOpen(false);
                setEventoSeleccionado(null);
                setCaballoSeleccionado('');
              }}
              disabled={inscripcionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarInscripcion}
              disabled={inscripcionMutation.isPending}
            >
              {inscripcionMutation.isPending ? 'Inscribiendo...' : 'Confirmar Inscripción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
