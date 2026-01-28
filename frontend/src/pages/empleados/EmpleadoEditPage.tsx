import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { empleadoService } from '@/services/empleadoService';
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

const empleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  funcion: z.enum(['veterinario', 'instructor', 'cuidador', 'admin', 'mantenimiento']),
  fecha_ingreso: z.string().optional(),
  salario: z.number().min(0, 'El salario debe ser mayor a 0').optional(),
  activo: z.boolean(),
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
  contacto_emergencia_relacion: z.string().optional(),
});

type EmpleadoFormData = z.infer<typeof empleadoSchema>;

const funcionLabels = {
  veterinario: 'Veterinario',
  instructor: 'Instructor',
  cuidador: 'Cuidador',
  admin: 'Administrativo',
  mantenimiento: 'Mantenimiento',
};

export function EmpleadoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: empleado, isLoading } = useQuery({
    queryKey: ['empleado', id],
    queryFn: () => empleadoService.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpleadoFormData>({
    resolver: zodResolver(empleadoSchema),
  });

  useEffect(() => {
    if (empleado) {
      reset({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        dni: empleado.dni || '',
        fecha_nacimiento: empleado.fecha_nacimiento || '',
        telefono: empleado.telefono || '',
        direccion: empleado.direccion || '',
        funcion: empleado.funcion,
        fecha_ingreso: empleado.fecha_ingreso || '',
        salario: empleado.salario,
        activo: empleado.activo,
        contacto_emergencia_nombre: empleado.contacto_emergencia?.nombre || '',
        contacto_emergencia_telefono: empleado.contacto_emergencia?.telefono || '',
        contacto_emergencia_relacion: empleado.contacto_emergencia?.relacion || '',
      });
    }
  }, [empleado, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => empleadoService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado', id] });
      toast({
        title: 'Empleado actualizado',
        description: 'Los cambios se han guardado exitosamente.',
      });
      navigate(`/empleados/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar',
        description: error.response?.data?.detail || 'No se pudo actualizar el empleado.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EmpleadoFormData) => {
    const payload: any = {
      nombre: data.nombre,
      apellido: data.apellido,
      funcion: data.funcion,
      activo: data.activo,
    };

    if (data.dni) payload.dni = data.dni;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.telefono) payload.telefono = data.telefono;
    if (data.direccion) payload.direccion = data.direccion;
    if (data.fecha_ingreso) payload.fecha_ingreso = data.fecha_ingreso;
    if (data.salario) payload.salario = data.salario;

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
        <div className="text-gray-500">Cargando empleado...</div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Empleado no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/empleados')}
        >
          Volver a Empleados
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
          onClick={() => navigate(`/empleados/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Empleado</h1>
          <p className="text-gray-500 mt-1">
            Actualiza la información de {empleado.nombre} {empleado.apellido}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos básicos del empleado</CardDescription>
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
                  placeholder="Nombre del empleado"
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
                  placeholder="Apellido del empleado"
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

        {/* Información Laboral */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
            <CardDescription>Datos del puesto y función</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="funcion">
                  Función <span className="text-red-500">*</span>
                </Label>
                <select
                  id="funcion"
                  {...register('funcion')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(funcionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.funcion && (
                  <p className="text-sm text-red-500">{errors.funcion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                <Input id="fecha_ingreso" type="date" {...register('fecha_ingreso')} />
                {errors.fecha_ingreso && (
                  <p className="text-sm text-red-500">{errors.fecha_ingreso.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  {...register('salario', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.salario && (
                  <p className="text-sm text-red-500">{errors.salario.message}</p>
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
                    Empleado Activo
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/empleados/${id}`)}
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
