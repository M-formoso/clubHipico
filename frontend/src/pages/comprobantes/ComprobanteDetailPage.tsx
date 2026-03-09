import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Send, XCircle, Printer,
  User, CreditCard, AlertTriangle
} from 'lucide-react';
import { comprobanteService } from '@/services/comprobanteService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';

export function ComprobanteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAnularDialog, setShowAnularDialog] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  const { data: comprobante, isLoading } = useQuery({
    queryKey: ['comprobante', id],
    queryFn: () => comprobanteService.getById(id!),
    enabled: !!id,
  });

  const emitirMutation = useMutation({
    mutationFn: () => comprobanteService.emitir(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprobante', id] });
      toast({
        title: 'Comprobante emitido',
        description: 'El comprobante ha sido emitido exitosamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo emitir el comprobante.',
        variant: 'destructive',
      });
    },
  });

  const anularMutation = useMutation({
    mutationFn: (motivo: string) => comprobanteService.anular(id!, { motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprobante', id] });
      setShowAnularDialog(false);
      toast({
        title: 'Comprobante anulado',
        description: 'El comprobante ha sido anulado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo anular el comprobante.',
        variant: 'destructive',
      });
    },
  });

  const handleAnular = () => {
    if (!motivoAnulacion.trim()) {
      toast({
        title: 'Error',
        description: 'Debes ingresar un motivo de anulación.',
        variant: 'destructive',
      });
      return;
    }
    anularMutation.mutate(motivoAnulacion);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando comprobante...</div>
      </div>
    );
  }

  if (!comprobante) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Comprobante no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/comprobantes')}>
          Volver a comprobantes
        </Button>
      </div>
    );
  }

  const esAnulable = comprobante.estado !== 'anulado' && comprobante.estado !== 'pagado_total';
  const esEmitable = comprobante.estado === 'borrador';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/comprobantes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{comprobante.numero_completo}</h1>
              <Badge className={comprobanteService.getEstadoColor(comprobante.estado)}>
                {comprobanteService.getEstadoLabel(comprobante.estado)}
              </Badge>
            </div>
            <p className="text-gray-500">
              {comprobanteService.getTipoLabel(comprobante.tipo)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {esEmitable && (
            <Button
              onClick={() => emitirMutation.mutate()}
              disabled={emitirMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Emitir
            </Button>
          )}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {esAnulable && (
            <Button
              variant="destructive"
              onClick={() => setShowAnularDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Anular
            </Button>
          )}
        </div>
      </div>

      {/* Información del comprobante y cliente */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Datos del Comprobante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <Badge className={comprobanteService.getTipoColor(comprobante.tipo)}>
                  {comprobanteService.getTipoLabel(comprobante.tipo)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Número</p>
                <p className="font-medium">{comprobante.numero_completo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">
                  {comprobante.fecha_emision
                    ? format(new Date(comprobante.fecha_emision), 'dd/MM/yyyy', { locale: es })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                <p className="font-medium">
                  {comprobante.fecha_vencimiento
                    ? format(new Date(comprobante.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })
                    : '-'}
                </p>
              </div>
            </div>
            {comprobante.condicion_pago && (
              <div>
                <p className="text-sm text-gray-500">Condición de Pago</p>
                <p className="font-medium">{comprobante.condicion_pago}</p>
              </div>
            )}
            {comprobante.concepto_general && (
              <div>
                <p className="text-sm text-gray-500">Concepto</p>
                <p className="font-medium">{comprobante.concepto_general}</p>
              </div>
            )}
            {comprobante.observaciones && (
              <div>
                <p className="text-sm text-gray-500">Observaciones</p>
                <p className="font-medium">{comprobante.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comprobante.cliente ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-lg">
                    {comprobante.cliente.nombre} {comprobante.cliente.apellido}
                  </p>
                </div>
                {comprobante.cliente.dni && (
                  <div>
                    <p className="text-sm text-gray-500">DNI/CUIT</p>
                    <p className="font-medium">{comprobante.cliente.dni}</p>
                  </div>
                )}
                {comprobante.cliente.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{comprobante.cliente.email}</p>
                  </div>
                )}
                {comprobante.cliente.telefono && (
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{comprobante.cliente.telefono}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/comprobantes/cuenta-corriente/${comprobante.cliente_id}`)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ver Cuenta Corriente
                </Button>
              </>
            ) : (
              <p className="text-gray-500">Sin cliente asignado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items del comprobante */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Desc. %</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comprobante.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell className="text-right">{item.cantidad}</TableCell>
                  <TableCell className="text-right">
                    {comprobanteService.formatMonto(item.precio_unitario)}
                  </TableCell>
                  <TableCell className="text-right">{item.descuento_porcentaje}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {comprobanteService.formatMonto(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{comprobanteService.formatMonto(comprobante.subtotal)}</span>
              </div>
              {comprobante.descuento_monto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento ({comprobante.descuento_porcentaje}%)</span>
                  <span className="text-red-600">-{comprobanteService.formatMonto(comprobante.descuento_monto)}</span>
                </div>
              )}
              {comprobante.iva_monto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA ({comprobante.iva_porcentaje}%)</span>
                  <span>{comprobanteService.formatMonto(comprobante.iva_monto)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{comprobanteService.formatMonto(comprobante.total)}</span>
              </div>
              {comprobante.monto_pagado > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Pagado</span>
                  <span>{comprobanteService.formatMonto(comprobante.monto_pagado)}</span>
                </div>
              )}
              {comprobante.saldo_pendiente > 0 && (
                <div className="flex justify-between text-sm font-medium text-orange-600">
                  <span>Saldo Pendiente</span>
                  <span>{comprobanteService.formatMonto(comprobante.saldo_pendiente)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de anulación */}
      {comprobante.estado === 'anulado' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Comprobante Anulado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-red-700">Motivo</p>
              <p className="font-medium text-red-900">{comprobante.motivo_anulacion}</p>
            </div>
            {comprobante.fecha_anulacion && (
              <div>
                <p className="text-sm text-red-700">Fecha de anulación</p>
                <p className="font-medium text-red-900">
                  {format(new Date(comprobante.fecha_anulacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para anular */}
      <Dialog open={showAnularDialog} onOpenChange={setShowAnularDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Comprobante</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El comprobante quedará marcado como anulado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de anulación *</Label>
              <Textarea
                id="motivo"
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Ingrese el motivo de la anulación..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnularDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleAnular}
              disabled={anularMutation.isPending}
            >
              {anularMutation.isPending ? 'Anulando...' : 'Confirmar Anulación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
