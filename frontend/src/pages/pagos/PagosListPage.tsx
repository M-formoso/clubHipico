import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, TrendingUp, TrendingDown, DollarSign, Minus } from 'lucide-react';
import { pagoService } from '@/services/pagoService';
import { egresoService } from '@/services/egresoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { EgresoCreate } from '@/types/egreso';

export function PagosListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showEgresoDialog, setShowEgresoDialog] = useState(false);
  const [egresoForm, setEgresoForm] = useState<EgresoCreate>({
    concepto: '',
    tipo: 'otro',
    monto: 0,
    fecha_egreso: format(new Date(), 'yyyy-MM-dd'),
    proveedor: '',
    referencia: '',
    notas: '',
  });

  const { data: pagos, isLoading } = useQuery({
    queryKey: ['pagos'],
    queryFn: () => pagoService.getAll(),
  });

  // Balance del mes actual
  const inicioMes = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const finMes = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: balance } = useQuery({
    queryKey: ['balance', inicioMes, finMes],
    queryFn: () => pagoService.getBalance(inicioMes, finMes),
  });

  const createEgresoMutation = useMutation({
    mutationFn: (egreso: EgresoCreate) => egresoService.create(egreso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setShowEgresoDialog(false);
      setEgresoForm({
        concepto: '',
        tipo: 'otro',
        monto: 0,
        fecha_egreso: format(new Date(), 'yyyy-MM-dd'),
        proveedor: '',
        referencia: '',
        notas: '',
      });
      toast({
        title: 'Egreso registrado',
        description: 'El gasto ha sido registrado exitosamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo registrar el egreso.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateEgreso = () => {
    if (!egresoForm.concepto || !egresoForm.monto) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }
    createEgresoMutation.mutate(egresoForm);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Pagos y Gastos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los pagos de pensión, clases, servicios y gastos del club
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEgresoDialog(true)}>
            <Minus className="mr-2 h-4 w-4" />
            Registrar Egreso
          </Button>
          <Button onClick={() => navigate('/pagos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Pago
          </Button>
        </div>
      </div>

      {/* Diálogo para crear egreso */}
      <Dialog open={showEgresoDialog} onOpenChange={setShowEgresoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Egreso (Gasto)</DialogTitle>
            <DialogDescription>
              Registra un nuevo gasto del club hípico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concepto">
                  Concepto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="concepto"
                  value={egresoForm.concepto}
                  onChange={(e) => setEgresoForm({ ...egresoForm, concepto: e.target.value })}
                  placeholder="Ej: Compra de heno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={egresoForm.tipo}
                  onValueChange={(value: any) => setEgresoForm({ ...egresoForm, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alimentacion">Alimentación</SelectItem>
                    <SelectItem value="veterinario">Veterinario</SelectItem>
                    <SelectItem value="herrero">Herrero</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="salarios">Salarios</SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                    <SelectItem value="equipamiento">Equipamiento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">
                  Monto <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={egresoForm.monto}
                    onChange={(e) => setEgresoForm({ ...egresoForm, monto: Number(e.target.value) })}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_egreso">
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_egreso"
                  type="date"
                  value={egresoForm.fecha_egreso}
                  onChange={(e) => setEgresoForm({ ...egresoForm, fecha_egreso: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={egresoForm.proveedor}
                  onChange={(e) => setEgresoForm({ ...egresoForm, proveedor: e.target.value })}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia / Factura</Label>
                <Input
                  id="referencia"
                  value={egresoForm.referencia}
                  onChange={(e) => setEgresoForm({ ...egresoForm, referencia: e.target.value })}
                  placeholder="Número de factura"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={egresoForm.notas}
                  onChange={(e) => setEgresoForm({ ...egresoForm, notas: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEgresoDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateEgreso}
                disabled={createEgresoMutation.isPending}
              >
                {createEgresoMutation.isPending ? 'Guardando...' : 'Registrar Egreso'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resumen de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800 font-medium">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">
            ${Number(totalPendiente).toFixed(2)}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800 font-medium">Pagados</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            ${Number(totalPagado).toFixed(2)}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-800 font-medium">Vencidos</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            ${Number(totalVencido).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Balance Financiero del Mes */}
      {balance && (
        <Card className="bg-gradient-to-br from-beige-50 to-white border-beige-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-beige-600" />
              Balance Financiero del Mes
            </CardTitle>
            <CardDescription>
              Resumen de ingresos y egresos del {format(new Date(balance.fecha_inicio), "d 'de' MMMM", { locale: es })} al {format(new Date(balance.fecha_fin), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Ingresos
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${Number(balance.ingresos).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">Pagos recibidos</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Egresos
                </div>
                <div className="text-3xl font-bold text-red-600">
                  ${Number(balance.egresos).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">Gastos realizados</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-beige-600" />
                  Balance Neto
                </div>
                <div className={`text-3xl font-bold ${Number(balance.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Number(balance.balance).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">
                  {Number(balance.balance) >= 0 ? 'Superávit' : 'Déficit'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  ${Number(pago.monto).toFixed(2)}
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
