import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FileText, Receipt, CreditCard,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import { comprobanteService } from '@/services/comprobanteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { TipoComprobante, EstadoComprobante } from '@/types/comprobante';

export function ComprobantesListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const { data: comprobantes, isLoading } = useQuery({
    queryKey: ['comprobantes', filterTipo, filterEstado],
    queryFn: () => comprobanteService.getAll({
      tipo: filterTipo !== 'todos' ? filterTipo as TipoComprobante : undefined,
      estado: filterEstado !== 'todos' ? filterEstado as EstadoComprobante : undefined,
    }),
  });

  const { data: resumen } = useQuery({
    queryKey: ['comprobantes-resumen'],
    queryFn: () => comprobanteService.getResumen(),
  });

  const filteredComprobantes = comprobantes?.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.numero_completo.toLowerCase().includes(searchLower) ||
      c.cliente?.nombre?.toLowerCase().includes(searchLower) ||
      c.cliente?.apellido?.toLowerCase().includes(searchLower) ||
      c.concepto_general?.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando comprobantes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Comprobantes</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Gestiona facturas, recibos y notas
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/comprobantes/nuevo')}>
            <Plus className="mr-1 md:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo </span>Comprobante
          </Button>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs md:text-sm text-blue-800 font-medium">Pendientes</span>
              </div>
              <div className="mt-1 md:mt-2">
                <div className="text-lg md:text-2xl font-bold text-blue-900">{resumen.pendientes.cantidad}</div>
                <div className="text-xs md:text-sm text-blue-700">{comprobanteService.formatMonto(resumen.pendientes.monto)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs md:text-sm text-orange-800 font-medium">Vencidos</span>
              </div>
              <div className="mt-1 md:mt-2">
                <div className="text-lg md:text-2xl font-bold text-orange-900">{resumen.vencidos.cantidad}</div>
                <div className="text-xs md:text-sm text-orange-700">{comprobanteService.formatMonto(resumen.vencidos.monto)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs md:text-sm text-green-800 font-medium">Facturado</span>
              </div>
              <div className="mt-1 md:mt-2">
                <div className="text-lg md:text-2xl font-bold text-green-900 truncate">
                  {comprobanteService.formatMonto(resumen.mes_actual.facturado)}
                </div>
                <div className="text-xs text-green-700">Este mes</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs md:text-sm text-primary font-medium">Cobrado</span>
              </div>
              <div className="mt-1 md:mt-2">
                <div className="text-lg md:text-2xl font-bold text-primary truncate">
                  {comprobanteService.formatMonto(resumen.mes_actual.cobrado)}
                </div>
                <div className="text-xs text-primary/70">Este mes</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por número, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="factura">Facturas</SelectItem>
            <SelectItem value="recibo">Recibos</SelectItem>
            <SelectItem value="nota_credito">Notas de Crédito</SelectItem>
            <SelectItem value="nota_debito">Notas de Débito</SelectItem>
            <SelectItem value="presupuesto">Presupuestos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="emitido">Emitido</SelectItem>
            <SelectItem value="pagado_parcial">Pago Parcial</SelectItem>
            <SelectItem value="pagado_total">Pagado</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="anulado">Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vista móvil - Cards */}
      <div className="md:hidden space-y-3">
        {filteredComprobantes?.map((comprobante) => (
          <div
            key={comprobante.id}
            className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer active:bg-gray-50"
            onClick={() => navigate(`/comprobantes/${comprobante.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {comprobante.tipo === 'factura' && <FileText className="h-4 w-4 text-primary" />}
                  {comprobante.tipo === 'recibo' && <Receipt className="h-4 w-4 text-green-600" />}
                  <span className="font-medium text-gray-900">{comprobante.numero_completo}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {comprobante.cliente ? `${comprobante.cliente.nombre} ${comprobante.cliente.apellido}` : 'Sin cliente'}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="font-bold text-gray-900">{comprobanteService.formatMonto(comprobante.total)}</p>
                <Badge className={`${comprobanteService.getEstadoColor(comprobante.estado)} text-xs mt-1`} variant="outline">
                  {comprobanteService.getEstadoLabel(comprobante.estado)}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <Badge className={`${comprobanteService.getTipoColor(comprobante.tipo)} text-xs`} variant="outline">
                {comprobanteService.getTipoLabel(comprobante.tipo)}
              </Badge>
              <span>
                {comprobante.fecha_emision
                  ? format(new Date(comprobante.fecha_emision), 'dd/MM/yy', { locale: es })
                  : '-'}
              </span>
            </div>
            {comprobante.saldo_pendiente > 0 && comprobante.estado !== 'anulado' && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Saldo pendiente:</span>
                <span className="font-semibold text-orange-600">
                  {comprobanteService.formatMonto(comprobante.saldo_pendiente)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComprobantes?.map((comprobante) => (
              <TableRow
                key={comprobante.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/comprobantes/${comprobante.id}`)}
              >
                <TableCell className="font-medium">{comprobante.numero_completo}</TableCell>
                <TableCell>
                  <Badge className={comprobanteService.getTipoColor(comprobante.tipo)} variant="outline">
                    {comprobanteService.getTipoLabel(comprobante.tipo)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {comprobante.cliente
                    ? `${comprobante.cliente.nombre} ${comprobante.cliente.apellido}`
                    : '-'}
                </TableCell>
                <TableCell>
                  {comprobante.fecha_emision
                    ? format(new Date(comprobante.fecha_emision), 'dd/MM/yyyy', { locale: es })
                    : '-'}
                </TableCell>
                <TableCell className="font-semibold">
                  {comprobanteService.formatMonto(comprobante.total)}
                </TableCell>
                <TableCell className="text-green-600">
                  {comprobanteService.formatMonto(comprobante.monto_pagado)}
                </TableCell>
                <TableCell className={comprobante.saldo_pendiente > 0 ? 'text-orange-600 font-medium' : ''}>
                  {comprobanteService.formatMonto(comprobante.saldo_pendiente)}
                </TableCell>
                <TableCell>
                  <Badge className={comprobanteService.getEstadoColor(comprobante.estado)} variant="outline">
                    {comprobanteService.getEstadoLabel(comprobante.estado)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredComprobantes?.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="text-gray-500 text-sm md:text-base mt-4">No se encontraron comprobantes</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/comprobantes/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear primer comprobante
          </Button>
        </div>
      )}
    </div>
  );
}
