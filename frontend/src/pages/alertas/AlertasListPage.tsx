import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Filter, Settings, Plus } from 'lucide-react';
import { useAlertas, useMarcarLeida, useDeleteAlerta, useMarcarTodasLeidas, useEstadisticasAlertas } from '@/hooks/useAlertas';
import { usePermisos } from '@/hooks/usePermisos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alerta, Prioridad, TipoAlerta } from '@/types/alerta';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PRIORIDAD_COLORS: Record<Prioridad, string> = {
  baja: 'bg-blue-100 text-blue-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

const TIPO_LABELS: Record<TipoAlerta, string> = {
  vacuna: 'Vacuna',
  herraje: 'Herraje',
  pago: 'Pago',
  evento: 'Evento',
  cumpleaños: 'Cumpleaños',
  contrato: 'Contrato',
  stock: 'Stock',
  tarea: 'Tarea',
  mantenimiento: 'Mantenimiento',
  veterinaria: 'Veterinaria',
  otro: 'Otro',
};

export function AlertasListPage() {
  const navigate = useNavigate();
  const { puedeCrear } = usePermisos();
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | 'todos'>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | 'todos'>('todos');
  const [filtroLeida, setFiltroLeida] = useState<'todos' | 'leidas' | 'no_leidas'>('todos');

  const { data: estadisticas } = useEstadisticasAlertas();
  const { data: alertas = [], isLoading } = useAlertas({
    tipo: filtroTipo !== 'todos' ? filtroTipo : undefined,
    prioridad: filtroPrioridad !== 'todos' ? filtroPrioridad : undefined,
    leida: filtroLeida === 'leidas' ? true : filtroLeida === 'no_leidas' ? false : undefined,
  });

  const marcarLeidaMutation = useMarcarLeida();
  const marcarTodasLeidasMutation = useMarcarTodasLeidas();
  const deleteAlertaMutation = useDeleteAlerta();

  const handleVerAlerta = (alerta: Alerta) => {
    if (!alerta.leida) {
      marcarLeidaMutation.mutate(alerta.id);
    }
    navigate(`/alertas/${alerta.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta alerta?')) {
      await deleteAlertaMutation.mutateAsync(alertaId);
    }
  };

  const handleMarcarLeida = async (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    await marcarLeidaMutation.mutateAsync(alertaId);
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

  const alertasFiltradas = alertas.sort((a, b) => {
    // Ordenar por no leídas primero, luego por fecha
    if (a.leida !== b.leida) return a.leida ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas y Notificaciones</h1>
          <p className="text-gray-500 mt-1">
            Gestiona todas las alertas y notificaciones del sistema
          </p>
        </div>
        {puedeCrear('alertas') && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/alertas/tipos')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Gestionar Tipos
            </Button>
            <Button onClick={() => navigate('/alertas/nueva')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Alerta
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {estadisticas.total_alertas}
                  </h3>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No Leídas</p>
                  <h3 className="text-2xl font-bold text-orange-600 mt-2">
                    {estadisticas.alertas_no_leidas}
                  </h3>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-bold">{estadisticas.alertas_no_leidas}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoy</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {estadisticas.alertas_hoy}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {estadisticas.alertas_esta_semana}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(TIPO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Prioridad</label>
              <Select value={filtroPrioridad} onValueChange={(value) => setFiltroPrioridad(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={filtroLeida} onValueChange={(value) => setFiltroLeida(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="no_leidas">No leídas</SelectItem>
                  <SelectItem value="leidas">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {estadisticas && estadisticas.alertas_no_leidas > 0 && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => marcarTodasLeidasMutation.mutate()}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marcar todas como leídas
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Cargando alertas...</p>
            </CardContent>
          </Card>
        ) : alertasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay alertas con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          alertasFiltradas.map((alerta) => (
            <Card
              key={alerta.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !alerta.leida ? 'border-l-4 border-l-beige-500 bg-beige-50/30' : ''
              }`}
              onClick={() => handleVerAlerta(alerta)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Indicador no leída */}
                  {!alerta.leida && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-beige-500" />
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={`text-base ${!alerta.leida ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                          {alerta.titulo}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={PRIORIDAD_COLORS[alerta.prioridad]} variant="outline">
                          {alerta.prioridad}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {TIPO_LABELS[alerta.tipo]}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{alerta.mensaje}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatFecha(alerta.created_at)}
                      </p>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {!alerta.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarcarLeida(e, alerta.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar leída
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, alerta.id)}
                          className="hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
