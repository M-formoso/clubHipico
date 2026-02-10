import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reporteService } from '@/services/reporteService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, Waves, DollarSign, Calendar } from 'lucide-react';

export function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['reportes-dashboard'],
    queryFn: reporteService.getReportesDashboard,
  });

  const handleExportar = async (tipo: string, formato: 'pdf' | 'excel') => {
    try {
      await reporteService.exportar(tipo, formato, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-500 mt-1">
          Análisis y reportes del club ecuestre
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:border-beige-500 focus:ring-beige-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:border-beige-500 focus:ring-beige-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  ${Number(dashboard?.ingresos_mes || 0).toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              Ingresos del mes actual
            </div>
          </CardContent>
        </Card>

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
              {dashboard?.pagos_pendientes || 0} pagos pendientes
            </div>
          </CardContent>
        </Card>

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
              Caballos en estado activo
            </div>
          </CardContent>
        </Card>

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
              Eventos programados este mes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reportes Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reporte Financiero</h4>
              <p className="text-sm text-gray-600 mb-4">
                Ingresos, egresos, pagos pendientes y estado de cuenta
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('financiero', 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('financiero', 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reporte de Clientes</h4>
              <p className="text-sm text-gray-600 mb-4">
                Listado de clientes, estado de cuenta y actividad
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('clientes', 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('clientes', 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reporte de Caballos</h4>
              <p className="text-sm text-gray-600 mb-4">
                Estado de caballos, próximas vacunas y herrajes
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('caballos', 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('caballos', 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reporte de Eventos</h4>
              <p className="text-sm text-gray-600 mb-4">
                Asistencia, eventos realizados y programados
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('eventos', 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportar('eventos', 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
