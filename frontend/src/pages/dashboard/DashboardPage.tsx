import { useQuery } from '@tanstack/react-query';
import { reporteService } from '@/services/reporteService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import {
  TrendingUp,
  Users,
  Waves,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reporteService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Bienvenido, {user?.email || 'Usuario'}
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {/* Ingresos del Mes */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Ingresos</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2 truncate">
                  ${Number(dashboard?.estadisticas_pagos?.total_cobrado_mes || 0).toFixed(0)}
                </h3>
              </div>
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 ml-2">
                <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
              {dashboard?.estadisticas_pagos?.cantidad_pagos_mes || 0} pagos
            </div>
          </CardContent>
        </Card>

        {/* Clientes Activos */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Clientes</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboard?.estadisticas_generales?.total_clientes || 0}
                </h3>
              </div>
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 ml-2">
                <Users className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
              {dashboard?.estadisticas_clientes?.clientes_al_dia || 0} al día
            </div>
          </CardContent>
        </Card>

        {/* Caballos Activos */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Caballos</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboard?.estadisticas_generales?.total_caballos || 0}
                </h3>
              </div>
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-beige-100 flex items-center justify-center shrink-0 ml-2">
                <Waves className="h-4 w-4 md:h-6 md:w-6 text-beige-600" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
              activos
            </div>
          </CardContent>
        </Card>

        {/* Eventos del Mes */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Eventos</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboard?.estadisticas_generales?.total_eventos_mes || 0}
                </h3>
              </div>
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0 ml-2">
                <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
              {dashboard?.estadisticas_eventos?.eventos_hoy || 0} hoy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Alertas Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alertas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard?.alertas_recientes && dashboard.alertas_recientes.length > 0 ? (
                dashboard.alertas_recientes.map((alerta: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alerta.titulo}</p>
                      <p className="text-xs text-gray-600 mt-1">{alerta.mensaje}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No hay alertas pendientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard?.proximos_eventos && dashboard.proximos_eventos.length > 0 ? (
                dashboard.proximos_eventos.map((evento: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{evento.titulo}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(evento.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay eventos programados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Financiero */}
      <Card>
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="text-base md:text-lg">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="space-y-1 md:space-y-2">
              <p className="text-xs md:text-sm text-gray-600">Pendientes</p>
              <p className="text-lg md:text-2xl font-bold text-orange-600 truncate">
                ${Number(dashboard?.estadisticas_pagos?.total_pendiente_mes || 0).toFixed(0)}
              </p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-xs md:text-sm text-gray-600">Vencidos</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">
                {dashboard?.estadisticas_pagos?.cantidad_pagos_vencidos || 0}
              </p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-xs md:text-sm text-gray-600">Cobrado</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 truncate">
                ${Number(dashboard?.estadisticas_pagos?.total_cobrado_mes || 0).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
