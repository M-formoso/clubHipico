import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download } from 'lucide-react';
import { pagoService } from '@/services/pagoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PagosListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const { data: pagos, isLoading } = useQuery({
    queryKey: ['pagos'],
    queryFn: () => pagoService.getAll(),
  });

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pagado: 'Pagado',
      pendiente: 'Pendiente',
      vencido: 'Vencido',
      cancelado: 'Cancelado',
    };
    return labels[estado] || estado;
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'pension':
        return 'bg-blue-100 text-blue-800';
      case 'clase':
        return 'bg-green-100 text-green-800';
      case 'evento':
        return 'bg-purple-100 text-purple-800';
      case 'servicio_extra':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDescargarRecibo = async (pagoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pagoService.descargarRecibo(pagoId);
    } catch (error) {
      console.error('Error al descargar recibo:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando pagos...</div>
      </div>
    );
  }

  const filteredPagos = pagos
    ?.filter((pago) => {
      const matchesSearch =
        pago.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado =
        filterEstado === 'todos' || pago.estado === filterEstado;

      return matchesSearch && matchesEstado;
    });

  // Calcular totales
  const totalPendiente = pagos
    ?.filter((p) => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0) || 0;

  const totalPagado = pagos
    ?.filter((p) => p.estado === 'pagado')
    .reduce((sum, p) => sum + p.monto, 0) || 0;

  const totalVencido = pagos
    ?.filter((p) => p.estado === 'vencido')
    .reduce((sum, p) => sum + p.monto, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los pagos de pensión, clases y servicios
          </p>
        </div>
        <Button onClick={() => navigate('/pagos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </div>

      {/* Resumen de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800 font-medium">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">
            ${totalPendiente.toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800 font-medium">Pagados</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            ${totalPagado.toLocaleString()}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-800 font-medium">Vencidos</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            ${totalVencido.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por concepto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:border-beige-500 focus:ring-beige-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagado">Pagados</option>
          <option value="vencido">Vencidos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPagos?.map((pago) => (
              <TableRow
                key={pago.id}
                className="cursor-pointer"
                onClick={() => navigate(`/pagos/${pago.id}`)}
              >
                <TableCell className="font-medium">
                  {pago.cliente ? `${pago.cliente.nombre} ${pago.cliente.apellido}` : '-'}
                </TableCell>
                <TableCell>{pago.concepto}</TableCell>
                <TableCell>
                  <Badge
                    className={getTipoBadgeColor(pago.tipo)}
                    variant="outline"
                  >
                    {pago.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  ${pago.monto.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={getEstadoBadgeColor(pago.estado)} variant="outline">
                    {getEstadoLabel(pago.estado)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pago.fecha_vencimiento
                    ? format(new Date(pago.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })
                    : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDescargarRecibo(pago.id, e)}
                    disabled={pago.estado !== 'pagado'}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPagos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron pagos</p>
        </div>
      )}
    </div>
  );
}
