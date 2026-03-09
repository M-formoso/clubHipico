import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, TrendingUp, TrendingDown,
  FileText, CreditCard, Calendar, Filter
} from 'lucide-react';
import { comprobanteService } from '@/services/comprobanteService';
import { clienteService } from '@/services/clienteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export function CuentaCorrientePage() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [fechaDesde, setFechaDesde] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: cliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => clienteService.getById(clienteId!),
    enabled: !!clienteId,
  });

  const { data: estadoCuenta, isLoading } = useQuery({
    queryKey: ['cuenta-corriente', clienteId, fechaDesde, fechaHasta],
    queryFn: () =>
      comprobanteService.getCuentaCorriente(clienteId!, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      }),
    enabled: !!clienteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando cuenta corriente...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cuenta Corriente</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <User className="h-4 w-4" />
              {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/comprobantes/nuevo?cliente=${clienteId}`)}>
          <FileText className="mr-2 h-4 w-4" />
          Nuevo Comprobante
        </Button>
      </div>

      {/* Resumen */}
      {estadoCuenta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={estadoCuenta.saldo_actual > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className={`h-5 w-5 ${estadoCuenta.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <span className="text-sm font-medium">Saldo Actual</span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${estadoCuenta.saldo_actual > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {comprobanteService.formatMonto(Math.abs(estadoCuenta.saldo_actual))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {estadoCuenta.saldo_actual > 0 ? 'Debe' : estadoCuenta.saldo_actual < 0 ? 'A favor' : 'Sin saldo'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Facturado</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-blue-700">
                {comprobanteService.formatMonto(estadoCuenta.total_facturado)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Total Pagado</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-green-700">
                {comprobanteService.formatMonto(estadoCuenta.total_pagado)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Pendientes</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-orange-700">
                {estadoCuenta.comprobantes_pendientes}
              </div>
              <div className="text-xs text-gray-500 mt-1">comprobantes</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros de fecha */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFechaDesde(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
                  setFechaHasta(format(new Date(), 'yyyy-MM-dd'));
                }}
              >
                Último mes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFechaDesde(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
                  setFechaHasta(format(new Date(), 'yyyy-MM-dd'));
                }}
              >
                Últimos 3 meses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFechaDesde(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
                  setFechaHasta(format(new Date(), 'yyyy-MM-dd'));
                }}
              >
                Último año
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>
            Historial de débitos y créditos de la cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Vista móvil */}
          <div className="md:hidden space-y-3">
            {estadoCuenta?.movimientos?.map((mov) => (
              <div
                key={mov.id}
                className={`p-4 rounded-lg border ${
                  mov.tipo === 'debito' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{mov.descripcion}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(mov.fecha), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className={`text-right ${mov.tipo === 'debito' ? 'text-red-600' : 'text-green-600'}`}>
                    <div className="font-bold">
                      {mov.tipo === 'debito' ? '+' : '-'}
                      {comprobanteService.formatMonto(mov.monto)}
                    </div>
                    <Badge variant="outline" className={mov.tipo === 'debito' ? 'bg-red-100' : 'bg-green-100'}>
                      {mov.tipo === 'debito' ? 'Débito' : 'Crédito'}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  Saldo: {comprobanteService.formatMonto(mov.saldo_posterior)}
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Débito</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estadoCuenta?.movimientos?.map((mov) => (
                  <TableRow
                    key={mov.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (mov.comprobante_id) {
                        navigate(`/comprobantes/${mov.comprobante_id}`);
                      } else if (mov.pago_id) {
                        navigate(`/pagos/${mov.pago_id}`);
                      }
                    }}
                  >
                    <TableCell>
                      {format(new Date(mov.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{mov.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={mov.tipo === 'debito' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                        {mov.tipo === 'debito' ? 'Débito' : 'Crédito'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {mov.tipo === 'debito' ? comprobanteService.formatMonto(mov.monto) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {mov.tipo === 'credito' ? comprobanteService.formatMonto(mov.monto) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {comprobanteService.formatMonto(mov.saldo_posterior)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {estadoCuenta?.movimientos?.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-gray-500 mt-4">No hay movimientos en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
