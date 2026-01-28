import { useState } from 'react';
import { Bell, Check, CheckCheck, Eye, Trash2, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlertasNoLeidas, useMarcarLeida, useMarcarTodasLeidas, useDeleteAlerta } from '@/hooks/useAlertas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alerta, Prioridad } from '@/types/alerta';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PRIORIDAD_COLORS: Record<Prioridad, string> = {
  baja: 'bg-blue-100 text-blue-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

const PRIORIDAD_ICONS: Record<Prioridad, string> = {
  baja: '🔵',
  media: '🟡',
  alta: '🟠',
  critica: '🔴',
};

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: alertasNoLeidas = [], isLoading } = useAlertasNoLeidas();
  const marcarLeidaMutation = useMarcarLeida();
  const marcarTodasLeidasMutation = useMarcarTodasLeidas();
  const deleteAlertaMutation = useDeleteAlerta();

  const handleMarcarLeida = async (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    await marcarLeidaMutation.mutateAsync(alertaId);
  };

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasLeidasMutation.mutateAsync();
  };

  const handleDeleteAlerta = async (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta alerta?')) {
      await deleteAlertaMutation.mutateAsync(alertaId);
    }
  };

  const handleVerAlerta = (alerta: Alerta) => {
    // Marcar como leída al ver
    if (!alerta.leida) {
      marcarLeidaMutation.mutate(alerta.id);
    }

    // Navegar según el tipo de alerta
    if (alerta.entidad_relacionada_tipo && alerta.entidad_relacionada_id) {
      const modulo = alerta.entidad_relacionada_tipo;
      const id = alerta.entidad_relacionada_id;
      navigate(`/${modulo}s/${id}`);
    } else {
      navigate(`/alertas/${alerta.id}`);
    }

    setOpen(false);
  };

  const handleVerTodas = () => {
    navigate('/alertas');
    setOpen(false);
  };

  const formatFecha = (fecha: string) => {
    try {
      return formatDistanceToNow(new Date(fecha), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return 'Hace un momento';
    }
  };

  const cantidadNoLeidas = alertasNoLeidas.length;
  const alertasOrdenadas = alertasNoLeidas
    .slice()
    .sort((a, b) => {
      // Ordenar por prioridad y luego por fecha
      const prioridadOrder: Record<Prioridad, number> = {
        critica: 0,
        alta: 1,
        media: 2,
        baja: 3,
      };
      const prioridadDiff = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
      if (prioridadDiff !== 0) return prioridadDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5); // Mostrar solo las 5 más recientes

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          {cantidadNoLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs"
            >
              {cantidadNoLeidas > 99 ? '99+' : cantidadNoLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0" align="end">
        <div className="flex flex-col max-h-[70vh] sm:max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Notificaciones</h3>
              {cantidadNoLeidas > 0 && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  {cantidadNoLeidas} nuevas
                </Badge>
              )}
            </div>

            {cantidadNoLeidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarcarTodasLeidas}
                className="text-[10px] sm:text-xs h-6 sm:h-7 px-2"
              >
                <CheckCheck className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Marcar todas</span>
              </Button>
            )}
          </div>

          {/* Lista de alertas */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-xs sm:text-sm text-gray-500">Cargando...</div>
              </div>
            ) : alertasOrdenadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  No tienes notificaciones nuevas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alertasOrdenadas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => handleVerAlerta(alerta)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Icono de prioridad */}
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        <span className="text-base sm:text-lg">{PRIORIDAD_ICONS[alerta.prioridad]}</span>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                            {alerta.titulo}
                          </h4>
                          <Badge
                            className={`${PRIORIDAD_COLORS[alerta.prioridad]} text-[10px] sm:text-xs flex-shrink-0`}
                            variant="outline"
                          >
                            {alerta.prioridad}
                          </Badge>
                        </div>

                        <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 mb-1 sm:mb-2">
                          {alerta.mensaje}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatFecha(alerta.created_at)}</span>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleMarcarLeida(e, alerta.id)}
                              title="Marcar como leída"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-red-600"
                              onClick={(e) => handleDeleteAlerta(e, alerta.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alertasOrdenadas.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2 sm:px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVerTodas}
                className="w-full text-xs sm:text-sm text-beige-600 hover:text-beige-700 hover:bg-beige-50"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Ver todas las notificaciones
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
