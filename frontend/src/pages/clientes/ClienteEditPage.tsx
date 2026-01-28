import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  tipo_cliente: z.enum(['socio_pleno', 'pensionista', 'alumno']),
  estado_cuenta: z.enum(['al_dia', 'debe', 'moroso']),
  saldo: z.number(),
  activo: z.boolean(),
  notas: z.string().optional(),
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
  contacto_emergencia_relacion: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export function ClienteEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (cliente) {
      reset({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        dni: cliente.dni || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        tipo_cliente: cliente.tipo_cliente,
        estado_cuenta: cliente.estado_cuenta,
        saldo: cliente.saldo,
        activo: cliente.activo,
        notas: cliente.notas || '',
        contacto_emergencia_nombre: cliente.contacto_emergencia?.nombre || '',
        contacto_emergencia_telefono: cliente.contacto_emergencia?.telefono || '',
        contacto_emergencia_relacion: cliente.contacto_emergencia?.relacion || '',
      });
    }
  }, [cliente, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => clienteService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      toast({
        title: 'Cliente actualizado',
        description: 'Los cambios se han guardado exitosamente.',
      });
      navigate(`/clientes/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar',
        description: error.response?.data?.detail || 'No se pudo actualizar el cliente.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ClienteFormData) => {
    const payload: any = {
      nombre: data.nombre,
      apellido: data.apellido,
      tipo_cliente: data.tipo_cliente,
      estado_cuenta: data.estado_cuenta,
      saldo: data.saldo,
      activo: data.activo,
    };

    if (data.dni) payload.dni = data.dni;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.telefono) payload.telefono = data.telefono;
    if (data.email) payload.email = data.email;
    if (data.direccion) payload.direccion = data.direccion;
    if (data.notas) payload.notas = data.notas;

    if (
      data.contacto_emergencia_nombre ||
      data.contacto_emergencia_telefono ||
      data.contacto_emergencia_relacion
    ) {
      payload.contacto_emergencia = {
        nombre: data.contacto_emergencia_nombre || '',
        telefono: data.contacto_emergencia_telefono || '',
        relacion: data.contacto_emergencia_relacion || '',
      };
    }

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando cliente...</div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/clientes/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-500 mt-1">
            Actualiza la información de {cliente.nombre} {cliente.apellido}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos básicos del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register('nombre')}
                  placeholder="Nombre del cliente"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellido"
                  {...register('apellido')}
                  placeholder="Apellido del cliente"
                />
                {errors.apellido && (
                  <p className="text-sm text-red-500">{errors.apellido.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" {...register('dni')} placeholder="12345678" />
                {errors.dni && (
                  <p className="text-sm text-red-500">{errors.dni.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
                {errors.fecha_nacimiento && (
                  <p className="text-sm text-red-500">{errors.fecha_nacimiento.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register('telefono')}
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && (
                  <p className="text-sm text-red-500">{errors.telefono.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="cliente@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  {...register('direccion')}
                  placeholder="Calle 123, Ciudad, Provincia"
                />
                {errors.direccion && (
                  <p className="text-sm text-red-500">{errors.direccion.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado y Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y Cuenta</CardTitle>
            <CardDescription>Información de membresía y cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_cliente">
                  Tipo de Cliente <span className="text-red-500">*</span>
                </Label>
                <select
                  id="tipo_cliente"
                  {...register('tipo_cliente')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alumno">Alumno</option>
                  <option value="pensionista">Pensionista</option>
                  <option value="socio_pleno">Socio Pleno</option>
                </select>
                {errors.tipo_cliente && (
                  <p className="text-sm text-red-500">{errors.tipo_cliente.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_cuenta">
                  Estado de Cuenta <span className="text-red-500">*</span>
                </Label>
                <select
                  id="estado_cuenta"
                  {...register('estado_cuenta')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="al_dia">Al Día</option>
                  <option value="debe">Debe</option>
                  <option value="moroso">Moroso</option>
                </select>
                {errors.estado_cuenta && (
                  <p className="text-sm text-red-500">{errors.estado_cuenta.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="saldo">
                  Saldo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="saldo"
                  type="number"
                  step="0.01"
                  {...register('saldo', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.saldo && (
                  <p className="text-sm text-red-500">{errors.saldo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="activo">Estado</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="activo"
                    {...register('activo')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="activo" className="font-normal">
                    Cliente Activo
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
            <CardDescription>Persona a contactar en caso de emergencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contacto_emergencia_nombre">Nombre</Label>
                <Input
                  id="contacto_emergencia_nombre"
                  {...register('contacto_emergencia_nombre')}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto_emergencia_telefono">Teléfono</Label>
                <Input
                  id="contacto_emergencia_telefono"
                  {...register('contacto_emergencia_telefono')}
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto_emergencia_relacion">Relación</Label>
                <Input
                  id="contacto_emergencia_relacion"
                  {...register('contacto_emergencia_relacion')}
                  placeholder="Ej: Padre, Madre, Esposo/a"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
            <CardDescription>Información adicional sobre el cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <textarea
                id="notas"
                {...register('notas')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas, observaciones, preferencias, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/clientes/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              'Guardando...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
