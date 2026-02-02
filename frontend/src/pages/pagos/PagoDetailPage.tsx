import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { pagoService } from '@/services/pagoService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Receipt,
  FileText,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const tipoPagoLabels = {
  pension: 'Pensión',
  clase: 'Clase',
  evento: 'Evento',
  servicio_extra: 'Servicio Extra',
  otro: 'Otro',
};

const tipoPagoColors = {
  pension: 'bg-purple-100 text-purple-800',
  clase: 'bg-blue-100 text-blue-800',
  evento: 'bg-green-100 text-green-800',
  servicio_extra: 'bg-orange-100 text-orange-800',
  otro: 'bg-gray-100 text-gray-800',
};

const metodoPagoLabels = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  cheque: 'Cheque',
};

const estadoPagoLabels = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
};

const estadoPagoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-green-100 text-green-800',
  vencido: 'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-800',
};

const estadoPagoIcons = {
  pendiente: Clock,
  pagado: CheckCircle,
  vencido: AlertTriangle,
  cancelado: XCircle,
};

export function PagoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pago, isLoading } = useQuery({
    queryKey: ['pago', id],
    queryFn: () => pagoService.getById(id!),
    enabled: !!id,
  });

  const handleDescargarRecibo = async () => {
    try {
      await pagoService.descargarRecibo(id!);
      toast({
        title: 'Recibo descargado',
        description: 'El recibo se ha descargado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el recibo.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando pago...</div>
      </div>
    );
  }

  if (!pago) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pago no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/pagos')}
        >
          Volver a Pagos
        </Button>
      </div>
    );
  }

  const EstadoIcon = estadoPagoIcons[pago.estado];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pagos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{pago.concepto}</h1>
              <Badge className={estadoPagoColors[pago.estado]} variant="outline">
                <EstadoIcon className="h-3 w-3 mr-1" />
                {estadoPagoLabels[pago.estado]}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Pago #{pago.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {pago.recibo_url && (
            <Button variant="outline" onClick={handleDescargarRecibo}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Recibo
            </Button>
          )}
          <Button onClick={() => navigate(`/pagos/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Number(pago.monto).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo</CardTitle>
            <Receipt className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge className={tipoPagoColors[pago.tipo]} variant="outline">
              {tipoPagoLabels[pago.tipo]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Método</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {pago.metodo_pago ? metodoPagoLabels[pago.metodo_pago] : 'No especificado'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {pago.fecha_pago ? 'Fecha de Pago' : 'Vencimiento'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {pago.fecha_pago
                ? format(new Date(pago.fecha_pago), "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
                : pago.fecha_vencimiento
                ? format(new Date(pago.fecha_vencimiento), "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
                : 'No especificada'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Pago */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Concepto</p>
                    <p className="text-gray-900">{pago.concepto}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monto</p>
                    <p className="text-gray-900 text-lg font-bold">
                      ${Number(pago.monto).toFixed(2)}
                    </p>
                  </div>
                </div>

                {pago.fecha_vencimiento && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Fecha de Vencimiento
                      </p>
                      <p className="text-gray-900">
                        {format(new Date(pago.fecha_vencimiento), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {pago.fecha_pago && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Pago</p>
                      <p className="text-gray-900">
                        {format(new Date(pago.fecha_pago), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {pago.metodo_pago && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                      <p className="text-gray-900">{metodoPagoLabels[pago.metodo_pago]}</p>
                    </div>
                  </div>
                )}

                {pago.referencia && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Referencia</p>
                      <p className="text-gray-900">{pago.referencia}</p>
                    </div>
                  </div>
                )}
              </div>

              {pago.notas && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-500 mb-2">Notas</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{pago.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de Cambios */}
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
              <CardDescription>Registro de cambios y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Pago creado</p>
                    <p className="text-gray-500">
                      {format(new Date(pago.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                {pago.updated_at !== pago.created_at && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Última actualización</p>
                      <p className="text-gray-500">
                        {format(new Date(pago.updated_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cliente */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pago.cliente ? (
                <>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="text-gray-900 font-medium">
                        {pago.cliente.nombre} {pago.cliente.apellido}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/clientes/${pago.cliente_id}`)}
                  >
                    Ver Perfil del Cliente
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-500">Información del cliente no disponible</p>
              )}
            </CardContent>
          </Card>

          {pago.recibo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Recibo</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDescargarRecibo}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Recibo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
