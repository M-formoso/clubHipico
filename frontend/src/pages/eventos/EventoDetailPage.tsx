import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { eventoService } from '@/services/eventoService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const tipoEventoLabels = {
  clase_grupal: 'Clase Grupal',
  clase_privada: 'Clase Privada',
  competencia: 'Competencia',
  salida: 'Salida',
  evento_social: 'Evento Social',
  otro: 'Otro',
};

const tipoEventoColors = {
  clase_grupal: 'bg-blue-100 text-blue-800',
  clase_privada: 'bg-purple-100 text-purple-800',
  competencia: 'bg-red-100 text-red-800',
  salida: 'bg-green-100 text-green-800',
  evento_social: 'bg-yellow-100 text-yellow-800',
  otro: 'bg-gray-100 text-gray-800',
};

const estadoEventoLabels = {
  programado: 'Programado',
  en_curso: 'En Curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const estadoEventoColors = {
  programado: 'bg-blue-100 text-blue-800',
  en_curso: 'bg-green-100 text-green-800',
  finalizado: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800',
};

const estadoInscripcionLabels = {
  confirmado: 'Confirmado',
  en_espera: 'En Espera',
  cancelado: 'Cancelado',
};

const estadoInscripcionColors = {
  confirmado: 'bg-green-100 text-green-800',
  en_espera: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-red-100 text-red-800',
};

export function EventoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: () => eventoService.getById(id!),
    enabled: !!id,
  });

  // Query para inscripciones (simulado por ahora)
  const { data: inscripciones = [] } = useQuery({
    queryKey: ['evento-inscripciones', id],
    queryFn: async () => {
      // TODO: Implementar endpoint de inscripciones
      return [];
    },
    enabled: false, // Deshabilitado hasta implementar el endpoint
  });

  const marcarAsistenciaMutation = useMutation({
    mutationFn: ({ inscripcionId, asistio }: { inscripcionId: string; asistio: boolean }) =>
      eventoService.marcarAsistencia(id!, inscripcionId, asistio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento-inscripciones', id] });
      toast({
        title: 'Asistencia actualizada',
        description: 'La asistencia se ha registrado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo registrar la asistencia.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando evento...</div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Evento no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/eventos')}
        >
          Volver a Eventos
        </Button>
      </div>
    );
  }

  const inscritos = inscripciones.length;
  const capacidadRestante = evento.capacidad_maxima
    ? evento.capacidad_maxima - inscritos
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/eventos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {evento.titulo}
              </h1>
              <Badge className={estadoEventoColors[evento.estado]} variant="outline">
                {estadoEventoLabels[evento.estado]}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {format(new Date(evento.fecha_inicio), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/eventos/${id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Evento</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge className={tipoEventoColors[evento.tipo]} variant="outline">
              {tipoEventoLabels[evento.tipo]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inscritos}
              {evento.capacidad_maxima && ` / ${evento.capacidad_maxima}`}
            </div>
            {capacidadRestante !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {capacidadRestante > 0
                  ? `${capacidadRestante} lugares disponibles`
                  : 'Cupo completo'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(evento.costo || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {format(new Date(evento.fecha_inicio), 'HH:mm')} -{' '}
              {format(new Date(evento.fecha_fin), 'HH:mm')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(
                (new Date(evento.fecha_fin).getTime() -
                  new Date(evento.fecha_inicio).getTime()) /
                  (1000 * 60)
              )}{' '}
              minutos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="inscripciones">
            Inscripciones ({inscritos})
          </TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha y Hora</p>
                    <p className="text-gray-900">
                      {format(new Date(evento.fecha_inicio), "d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(evento.fecha_inicio), 'HH:mm')} -{' '}
                      {format(new Date(evento.fecha_fin), 'HH:mm')}
                    </p>
                  </div>
                </div>

                {evento.instructor && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Instructor</p>
                      <p className="text-gray-900">
                        {evento.instructor.nombre} {evento.instructor.apellido}
                      </p>
                    </div>
                  </div>
                )}

                {evento.ubicacion && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ubicación</p>
                      <p className="text-gray-900">{evento.ubicacion}</p>
                    </div>
                  </div>
                )}

                {evento.capacidad_maxima && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Capacidad Máxima
                      </p>
                      <p className="text-gray-900">{evento.capacidad_maxima} personas</p>
                    </div>
                  </div>
                )}
              </div>

              {evento.descripcion && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Descripción
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {evento.descripcion}
                  </p>
                </div>
              )}

              {evento.es_recurrente && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <p className="text-sm font-medium text-gray-900">
                      Este es un evento recurrente
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Inscripciones */}
        <TabsContent value="inscripciones">
          <Card>
            <CardHeader>
              <CardTitle>Participantes Inscritos</CardTitle>
              <CardDescription>
                Lista de participantes registrados para este evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inscripciones.length > 0 ? (
                <div className="space-y-3">
                  {inscripciones.map((inscripcion: any) => (
                    <div
                      key={inscripcion.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">
                            {inscripcion.cliente?.nombre} {inscripcion.cliente?.apellido}
                          </p>
                          <Badge
                            className={estadoInscripcionColors[inscripcion.estado]}
                            variant="outline"
                          >
                            {estadoInscripcionLabels[inscripcion.estado]}
                          </Badge>
                        </div>
                        {inscripcion.caballo && (
                          <p className="text-sm text-gray-500 mt-1">
                            Caballo: {inscripcion.caballo.nombre}
                          </p>
                        )}
                        {inscripcion.comentarios && (
                          <p className="text-sm text-gray-600 mt-1">
                            {inscripcion.comentarios}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {inscripcion.asistio !== null && (
                          <Badge
                            variant={inscripcion.asistio ? 'default' : 'secondary'}
                          >
                            {inscripcion.asistio ? 'Asistió' : 'No asistió'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay inscripciones para este evento
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Asistencia */}
        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencia</CardTitle>
              <CardDescription>
                Registra la asistencia de los participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inscripciones.length > 0 ? (
                <div className="space-y-3">
                  {inscripciones.map((inscripcion: any) => (
                    <div
                      key={inscripcion.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {inscripcion.cliente?.nombre} {inscripcion.cliente?.apellido}
                        </p>
                        {inscripcion.caballo && (
                          <p className="text-sm text-gray-500">
                            Caballo: {inscripcion.caballo.nombre}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={inscripcion.asistio === true ? 'default' : 'outline'}
                          onClick={() =>
                            marcarAsistenciaMutation.mutate({
                              inscripcionId: inscripcion.id,
                              asistio: true,
                            })
                          }
                          disabled={evento.estado === 'cancelado'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Asistió
                        </Button>
                        <Button
                          size="sm"
                          variant={inscripcion.asistio === false ? 'destructive' : 'outline'}
                          onClick={() =>
                            marcarAsistenciaMutation.mutate({
                              inscripcionId: inscripcion.id,
                              asistio: false,
                            })
                          }
                          disabled={evento.estado === 'cancelado'}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          No asistió
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay inscripciones para registrar asistencia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
