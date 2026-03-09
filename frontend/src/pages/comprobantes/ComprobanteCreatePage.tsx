import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { comprobanteService } from '@/services/comprobanteService';
import { clienteService } from '@/services/clienteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ComprobanteCreate, ComprobanteItemCreate, TipoComprobante } from '@/types/comprobante';
import { format, addDays } from 'date-fns';

interface ItemForm extends ComprobanteItemCreate {
  tempId: string;
}

export function ComprobanteCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState<Omit<ComprobanteCreate, 'items'>>({
    tipo: 'factura',
    cliente_id: '',
    fecha_emision: format(new Date(), 'yyyy-MM-dd'),
    fecha_vencimiento: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    descuento_porcentaje: 0,
    iva_porcentaje: 0,
    concepto_general: '',
    observaciones: '',
    condicion_pago: 'Contado',
    emitir: false,
  });

  const [items, setItems] = useState<ItemForm[]>([
    {
      tempId: '1',
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_porcentaje: 0,
    },
  ]);

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ComprobanteCreate) => comprobanteService.create(data),
    onSuccess: (comprobante) => {
      queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
      toast({
        title: 'Comprobante creado',
        description: `El comprobante ${comprobante.numero_completo} ha sido creado exitosamente.`,
      });
      navigate(`/comprobantes/${comprobante.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear el comprobante.',
        variant: 'destructive',
      });
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        tempId: Date.now().toString(),
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento_porcentaje: 0,
      },
    ]);
  };

  const removeItem = (tempId: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.tempId !== tempId));
    }
  };

  const updateItem = (tempId: string, field: keyof ComprobanteItemCreate, value: any) => {
    setItems(
      items.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  const calcularSubtotalItem = (item: ItemForm) => {
    const cantidad = item.cantidad || 1;
    const descuentoPct = item.descuento_porcentaje || 0;
    const subtotal = cantidad * item.precio_unitario;
    const descuento = subtotal * (descuentoPct / 100);
    return subtotal - descuento;
  };

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + calcularSubtotalItem(item), 0);
    const descuentoPct = form.descuento_porcentaje || 0;
    const ivaPct = form.iva_porcentaje || 0;
    const descuento = subtotal * (descuentoPct / 100);
    const baseImponible = subtotal - descuento;
    const iva = baseImponible * (ivaPct / 100);
    const total = baseImponible + iva;
    return { subtotal, descuento, iva, total };
  };

  const handleSubmit = (emitir: boolean) => {
    if (!form.cliente_id) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un cliente.',
        variant: 'destructive',
      });
      return;
    }

    const itemsValidos = items.filter(
      (item) => item.descripcion.trim() && item.precio_unitario > 0
    );

    if (itemsValidos.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes agregar al menos un item con descripción y precio.',
        variant: 'destructive',
      });
      return;
    }

    const data: ComprobanteCreate = {
      ...form,
      emitir,
      items: itemsValidos.map(({ tempId, ...item }) => ({
        ...item,
        cantidad: item.cantidad || 1,
        descuento_porcentaje: item.descuento_porcentaje || 0,
      })),
    };

    createMutation.mutate(data);
  };

  const totales = calcularTotales();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/comprobantes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Comprobante</h1>
          <p className="text-gray-500">Crea una factura, recibo o nota</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Comprobante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Comprobante *</Label>
                  <Select
                    value={form.tipo}
                    onValueChange={(value: TipoComprobante) =>
                      setForm({ ...form, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="factura">Factura</SelectItem>
                      <SelectItem value="recibo">Recibo</SelectItem>
                      <SelectItem value="nota_credito">Nota de Crédito</SelectItem>
                      <SelectItem value="nota_debito">Nota de Débito</SelectItem>
                      <SelectItem value="presupuesto">Presupuesto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select
                    value={form.cliente_id}
                    onValueChange={(value) => setForm({ ...form, cliente_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Emisión</Label>
                  <Input
                    type="date"
                    value={form.fecha_emision}
                    onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Vencimiento</Label>
                  <Input
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condición de Pago</Label>
                  <Select
                    value={form.condicion_pago}
                    onValueChange={(value) => setForm({ ...form, condicion_pago: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                      <SelectItem value="30 días">30 días</SelectItem>
                      <SelectItem value="60 días">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Concepto General</Label>
                  <Input
                    value={form.concepto_general}
                    onChange={(e) => setForm({ ...form, concepto_general: e.target.value })}
                    placeholder="Ej: Pensión Marzo 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.tempId} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 md:col-span-5">
                      {index === 0 && <Label className="text-xs text-gray-500">Descripción</Label>}
                      <Input
                        value={item.descripcion}
                        onChange={(e) => updateItem(item.tempId, 'descripcion', e.target.value)}
                        placeholder="Descripción del item"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      {index === 0 && <Label className="text-xs text-gray-500">Cantidad</Label>}
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={item.cantidad}
                        onChange={(e) => updateItem(item.tempId, 'cantidad', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      {index === 0 && <Label className="text-xs text-gray-500">Precio</Label>}
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precio_unitario}
                        onChange={(e) => updateItem(item.tempId, 'precio_unitario', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      {index === 0 && <Label className="text-xs text-gray-500">Subtotal</Label>}
                      <Input
                        value={comprobanteService.formatMonto(calcularSubtotalItem(item))}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      {index === 0 && <Label className="text-xs text-gray-500 invisible">-</Label>}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.tempId)}
                        disabled={items.length === 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral - Totales */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descuento General (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.descuento_porcentaje}
                  onChange={(e) => setForm({ ...form, descuento_porcentaje: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>IVA (%)</Label>
                <Select
                  value={form.iva_porcentaje?.toString()}
                  onValueChange={(value) => setForm({ ...form, iva_porcentaje: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin IVA (0%)</SelectItem>
                    <SelectItem value="10.5">IVA 10.5%</SelectItem>
                    <SelectItem value="21">IVA 21%</SelectItem>
                    <SelectItem value="27">IVA 27%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{comprobanteService.formatMonto(totales.subtotal)}</span>
                </div>
                {totales.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="text-red-600">-{comprobanteService.formatMonto(totales.descuento)}</span>
                  </div>
                )}
                {totales.iva > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IVA</span>
                    <span>{comprobanteService.formatMonto(totales.iva)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{comprobanteService.formatMonto(totales.total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={createMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar como Borrador
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(true)}
                  disabled={createMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Crear y Emitir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
