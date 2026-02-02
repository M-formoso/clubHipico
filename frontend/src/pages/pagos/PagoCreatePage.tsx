import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { pagoService } from '@/services/pagoService';
import { clienteService } from '@/services/clienteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';

const pagoSchema = z.object({
  cliente_id: z.string().min(1, 'Debe seleccionar un cliente'),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  tipo: z.enum(['pension', 'clase', 'evento', 'servicio_extra', 'otro']),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']).optional(),
  fecha_vencimiento: z.string().optional(),
  fecha_pago: z.string().optional(),
  referencia: z.string().optional(),
  notas: z.string().optional(),
});

type PagoFormData = z.infer<typeof pagoSchema>;

export function PagoCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      tipo: 'pension',
      metodo_pago: 'efectivo',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => pagoService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      toast({
        title: 'Pago registrado',
        description: 'El pago ha sido registrado exitosamente.',
      });
      navigate(`/pagos/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al registrar pago',
        description: error.response?.data?.detail || 'No se pudo registrar el pago.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PagoFormData) => {
    const payload: any = {
      cliente_id: data.cliente_id,
      concepto: data.concepto,
      tipo: data.tipo,
      monto: Number(data.monto),
    };

    if (data.metodo_pago) payload.metodo_pago = data.metodo_pago;
    if (data.fecha_vencimiento) payload.fecha_vencimiento = data.fecha_vencimiento;
    if (data.fecha_pago) payload.fecha_pago = data.fecha_pago;
    if (data.referencia) payload.referencia = data.referencia;
    if (data.notas) payload.notas = data.notas;

    createMutation.mutate(payload);
  };

  const selectedClienteId = watch('cliente_id');
  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pagos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Pago</h1>
          <p className="text-gray-500 mt-1">Registra un nuevo pago en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Selecciona el cliente que realiza el pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">
                Cliente <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('cliente_id', value)}
                disabled={loadingClientes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido}
                      {cliente.dni && ` - DNI: ${cliente.dni}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cliente_id && (
                <p className="text-sm text-red-500">{errors.cliente_id.message}</p>
              )}
            </div>

            {selectedCliente && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email:</p>
                      <p className="font-medium">{selectedCliente.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono:</p>
                      <p className="font-medium">{selectedCliente.telefono || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo:</p>
                      <p className="font-medium capitalize">
                        {selectedCliente.tipo_cliente.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Saldo actual:</p>
                      <p
                        className={`font-bold ${
                          Number(selectedCliente.saldo) < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        ${Number(selectedCliente.saldo || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Detalles del Pago */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pago</CardTitle>
            <CardDescription>Información sobre el pago a registrar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concepto">
                  Concepto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="concepto"
                  {...register('concepto')}
                  placeholder="Ej: Pensión Enero 2024"
                />
                {errors.concepto && (
                  <p className="text-sm text-red-500">{errors.concepto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo de Pago <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue('tipo', value as any)
                  }
                  defaultValue="pension"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pension">Pensión</SelectItem>
                    <SelectItem value="clase">Clase</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="servicio_extra">Servicio Extra</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-red-500">{errors.tipo.message}</p>
                )}
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
                    {...register('monto')}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                {errors.monto && (
                  <p className="text-sm text-red-500">{errors.monto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo_pago">Método de Pago</Label>
                <Select
                  onValueChange={(value) =>
                    setValue('metodo_pago', value as any)
                  }
                  defaultValue="efectivo"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  {...register('fecha_vencimiento')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_pago">Fecha de Pago (si ya fue pagado)</Label>
                <Input id="fecha_pago" type="date" {...register('fecha_pago')} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="referencia">Referencia / Comprobante</Label>
                <Input
                  id="referencia"
                  {...register('referencia')}
                  placeholder="Número de comprobante, transferencia, etc."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  {...register('notas')}
                  placeholder="Observaciones adicionales sobre el pago..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/pagos')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Guardando...' : 'Registrar Pago'}
          </Button>
        </div>
      </form>
    </div>
  );
}
