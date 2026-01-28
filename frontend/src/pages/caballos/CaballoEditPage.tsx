import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { caballoService } from '@/services/caballoService';
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

const caballoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  raza: z.string().min(2, 'La raza es requerida'),
  edad: z.number().min(0, 'La edad debe ser mayor a 0').optional(),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(['macho', 'hembra', 'castrado']),
  color: z.string().optional(),
  altura: z.number().min(0).optional(),
  peso: z.number().min(0).optional(),
  propietario_id: z.string().optional(),
  box_asignado: z.string().optional(),
  estado: z.enum(['activo', 'retirado', 'en_tratamiento', 'fallecido']),
  activo: z.boolean(),
  caracteristicas: z.string().optional(),
});

type CaballoFormData = z.infer<typeof caballoSchema>;

export function CaballoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caballo, isLoading } = useQuery({
    queryKey: ['caballo', id],
    queryFn: () => caballoService.getById(id!),
    enabled: !!id,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaballoFormData>({
    resolver: zodResolver(caballoSchema),
  });

  useEffect(() => {
    if (caballo) {
      reset({
        nombre: caballo.nombre,
        raza: caballo.raza,
        edad: caballo.edad,
        fecha_nacimiento: caballo.fecha_nacimiento || '',
        sexo: caballo.sexo,
        color: caballo.color || '',
        altura: caballo.altura,
        peso: caballo.peso,
        propietario_id: caballo.propietario_id || '',
        box_asignado: caballo.box_asignado || '',
        estado: caballo.estado,
        activo: caballo.activo,
        caracteristicas: caballo.caracteristicas || '',
      });
    }
  }, [caballo, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => caballoService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      queryClient.invalidateQueries({ queryKey: ['caballo', id] });
      toast({
        title: 'Caballo actualizado',
        description: 'Los cambios se han guardado exitosamente.',
      });
      navigate(`/caballos/${id}`);
    },
    onError: (error: any) => {
      let errorMessage = 'No se pudo actualizar el caballo.';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // Errores de validación de Pydantic
          errorMessage = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      }

      toast({
        title: 'Error al actualizar',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    const payload: any = {
      nombre: data.nombre,
      raza: data.raza,
      sexo: data.sexo,
      estado: data.estado,
      activo: data.activo,
    };

    if (data.edad) payload.edad = data.edad;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.color) payload.color = data.color;
    if (data.altura) payload.altura = data.altura;
    if (data.peso) payload.peso = data.peso;
    if (data.propietario_id) payload.propietario_id = data.propietario_id;
    if (data.box_asignado) payload.box_asignado = data.box_asignado;
    if (data.caracteristicas) payload.caracteristicas = data.caracteristicas;

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando caballo...</div>
      </div>
    );
  }

  if (!caballo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Caballo no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/caballos')}
        >
          Volver a Caballos
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
          onClick={() => navigate(`/caballos/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Caballo</h1>
          <p className="text-gray-500 mt-1">Actualiza la información de {caballo.nombre}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del caballo</CardDescription>
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
                  placeholder="Nombre del caballo"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">
                  Raza <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="raza"
                  {...register('raza')}
                  placeholder="Ej: Árabe, Pura Sangre, Criollo"
                />
                {errors.raza && (
                  <p className="text-sm text-red-500">{errors.raza.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="sexo"
                  {...register('sexo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                  <option value="castrado">Castrado</option>
                </select>
                {errors.sexo && (
                  <p className="text-sm text-red-500">{errors.sexo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder="Ej: Alazán, Tordillo, Zaino"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad (años)</Label>
                <Input
                  id="edad"
                  type="number"
                  {...register('edad', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.edad && (
                  <p className="text-sm text-red-500">{errors.edad.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  {...register('altura', { valueAsNumber: true })}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  {...register('peso', { valueAsNumber: true })}
                  placeholder="0.0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propietario y Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Propietario y Ubicación</CardTitle>
            <CardDescription>Información del propietario y box asignado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propietario_id">Propietario</Label>
                <select
                  id="propietario_id"
                  {...register('propietario_id')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar propietario</option>
                  {clientes?.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="box_asignado">Box Asignado</Label>
                <Input
                  id="box_asignado"
                  {...register('box_asignado')}
                  placeholder="Ej: Box 1, Box A-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado y Características */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y Características</CardTitle>
            <CardDescription>Estado actual y características especiales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <select
                  id="estado"
                  {...register('estado')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="en_tratamiento">En Tratamiento</option>
                  <option value="retirado">Retirado</option>
                  <option value="fallecido">Fallecido</option>
                </select>
                {errors.estado && (
                  <p className="text-sm text-red-500">{errors.estado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="activo">Estado General</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="activo"
                    {...register('activo')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="activo" className="font-normal">
                    Caballo Activo
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caracteristicas">Características</Label>
              <textarea
                id="caracteristicas"
                {...register('caracteristicas')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Marcas, señas particulares, temperamento, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/caballos/${id}`)}
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
