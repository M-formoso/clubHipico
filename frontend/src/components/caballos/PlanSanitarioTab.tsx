import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { planSanitarioService } from '@/services/planSanitarioService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PlanSanitarioTabProps {
  caballoId: string;
}

export function PlanSanitarioTab({ caballoId }: PlanSanitarioTabProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Obtener plan sanitario
  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['plan-sanitario', caballoId, selectedYear],
    queryFn: () => planSanitarioService.getPlanSanitario(caballoId, selectedYear),
  });

  // Obtener estadísticas
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['plan-sanitario-stats', caballoId, selectedYear],
    queryFn: () => planSanitarioService.getEstadisticas(caballoId, selectedYear),
  });

  if (isLoadingPlan || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando plan sanitario...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar el plan sanitario</p>
      </div>
    );
  }

  // Si no tiene categoría asignada
  if (!plan.categoria) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Sanitario 2026</CardTitle>
          <CardDescription>
            Este caballo no tiene una categoría sanitaria asignada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Para habilitar el seguimiento del plan sanitario, edite el caballo y asigne una categoría (A o B).
            </p>
            <p className="text-sm text-gray-500">
              {plan.descripcion}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vacuna':
        return '💉';
      case 'desparasitacion':
        return '💊';
      case 'analisis':
        return '🔬';
      default:
        return '📋';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'vacuna':
        return 'bg-blue-100 text-blue-800';
      case 'desparasitacion':
        return 'bg-green-100 text-green-800';
      case 'analisis':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con selector de año */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Plan Sanitario {plan.categoria} - {selectedYear}
          </h2>
          <p className="text-gray-500 mt-1">{plan.descripcion}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear(selectedYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">{selectedYear}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= currentYear + 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && stats.tiene_plan && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.porcentaje_cumplimiento}%
              </div>
              <p className="text-xs text-gray-500">
                {stats.actividades_realizadas} de {stats.total_actividades} realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Mensual</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${Number(stats.costo_mensual || 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">
                ${Number(stats.costo_anual || 0).toFixed(2)} por año
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <CalendarIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.actividades_pendientes}
              </div>
              <p className="text-xs text-gray-500">Actividades por realizar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.actividades_vencidas.length}
              </div>
              <p className="text-xs text-gray-500">Requieren atención</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actividades vencidas (si las hay) */}
      {stats && stats.actividades_vencidas.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Actividades Vencidas
            </CardTitle>
            <CardDescription className="text-red-700">
              Las siguientes actividades no se realizaron en el mes programado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.actividades_vencidas.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTipoIcon(act.tipo)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{act.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {act.mes_nombre} - {act.descripcion}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {act.dias_vencido} días atrasado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de cumplimiento por tratamiento */}
      {plan.dosis_anuales && plan.calendario && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cumplimiento por Tratamiento</CardTitle>
            <CardDescription>Dosis aplicadas vs requeridas según plan sanitario {plan.categoria}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(plan.dosis_anuales).map(([tipoKey, cantidadRequerida]) => {
                // Contar cuántas actividades de este tipo se han realizado
                const tipoNormalizado = tipoKey.includes('desparasit') ? 'desparasitacion' :
                                        tipoKey.includes('aie') ? 'analisis' : 'vacuna';

                const actividadesRealizadas = plan.calendario
                  .flatMap(mes => mes.actividades)
                  .filter(act => {
                    const nombreLower = act.nombre.toLowerCase();
                    const tipoKeyLower = tipoKey.toLowerCase();

                    // Mapeo de tipos
                    if (tipoKeyLower.includes('desparasit')) {
                      return act.tipo === 'desparasitacion' && act.realizada;
                    } else if (tipoKeyLower.includes('aie')) {
                      return nombreLower.includes('aie') && act.realizada;
                    } else if (tipoKeyLower.includes('influenza')) {
                      return nombreLower.includes('influenza') && act.realizada;
                    } else if (tipoKeyLower.includes('quintuple') || tipoKeyLower.includes('quíntuple')) {
                      return (nombreLower.includes('quintuple') || nombreLower.includes('quíntuple')) && act.realizada;
                    } else if (tipoKeyLower.includes('adenitis')) {
                      return nombreLower.includes('adenitis') && act.realizada;
                    } else if (tipoKeyLower.includes('rabia')) {
                      return (nombreLower.includes('rabia') || nombreLower.includes('rabica')) && act.realizada;
                    }
                    return false;
                  }).length;

                const porcentaje = cantidadRequerida > 0 ? Math.round((actividadesRealizadas / cantidadRequerida) * 100) : 0;
                const estaCompleto = actividadesRealizadas >= cantidadRequerida;
                const tieneRetraso = actividadesRealizadas < cantidadRequerida;

                return (
                  <div key={tipoKey} className={`p-4 rounded-lg border-2 ${
                    estaCompleto ? 'bg-green-50 border-green-200' :
                    tieneRetraso ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTipoIcon(tipoNormalizado)}</span>
                        <div>
                          <p className="text-sm font-semibold capitalize text-gray-900">
                            {tipoKey.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {actividadesRealizadas}/{cantidadRequerida} aplicadas
                          </p>
                        </div>
                      </div>
                      {estaCompleto && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {tieneRetraso && !estaCompleto && (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${
                          estaCompleto ? 'bg-green-600' :
                          porcentaje >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{porcentaje}% completado</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendario mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario Anual {selectedYear}</CardTitle>
          <CardDescription>
            Plan mes a mes según Resolución 1942 Haras Club 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.calendario.map((mes) => (
              <div
                key={mes.mes}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{mes.mes_nombre}</h3>
                  <Badge variant="outline" className="text-xs">
                    {mes.actividades.filter(a => a.realizada).length}/{mes.actividades.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {mes.actividades.map((actividad, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg ${actividad.realizada ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-2">
                        {actividad.realizada ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {actividad.nombre}
                          </p>
                          <p className="text-xs text-gray-500">{actividad.descripcion}</p>
                          {actividad.realizada && actividad.fecha_realizada && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {new Date(actividad.fecha_realizada).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          <Badge variant="outline" className={`${getTipoColor(actividad.tipo)} text-xs mt-1`}>
                            {actividad.tipo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
