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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bienvenido de vuelta, {user?.email || 'Usuario'}
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  ${dashboard?.ingresos_mes?.toLocaleString() || '0'}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                +{dashboard?.variacion_ingresos || 0}%
              </span>
              <span className="text-gray-500 ml-2">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Clientes Activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {dashboard?.clientes_activos || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              {dashboard?.clientes_nuevos || 0} nuevos este mes
            </div>
          </CardContent>
        </Card>

        {/* Caballos Activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Caballos Activos</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {dashboard?.caballos_activos || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-beige-100 flex items-center justify-center">
                <Waves className="h-6 w-6 text-beige-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium">{dashboard?.ocupacion_boxes || 0}%</span> ocupación de boxes
            </div>
          </CardContent>
        </Card>

        {/* Eventos del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos del Mes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {dashboard?.eventos_mes || 0}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium">{dashboard?.tasa_asistencia || 0}%</span> tasa de asistencia
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">
                ${dashboard?.pagos_pendientes?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500">
                {dashboard?.cantidad_pagos_pendientes || 0} pagos
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Pagos Vencidos</p>
              <p className="text-2xl font-bold text-red-600">
                ${dashboard?.pagos_vencidos?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500">
                {dashboard?.cantidad_pagos_vencidos || 0} pagos
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Pagados Este Mes</p>
              <p className="text-2xl font-bold text-green-600">
                ${dashboard?.pagos_mes?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500">
                {dashboard?.cantidad_pagos_mes || 0} pagos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
