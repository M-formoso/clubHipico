import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  numero_chip: z.string().min(1, 'El número de chip es requerido'),
  raza: z.string().optional(),
  edad: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'La edad debe ser mayor a 0').optional()
  ),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(['macho', 'hembra', 'castrado']).optional(),
  color: z.string().optional(),
  altura: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  peso: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  propietario_id: z.string().optional(),
  box_asignado: z.string().optional(),
  caracteristicas: z.string().optional(),
});

type CaballoFormData = z.infer<typeof caballoSchema>;

export function CaballoCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaballoFormData>({
    resolver: zodResolver(caballoSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => caballoService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Caballo creado',
        description: 'El caballo ha sido creado exitosamente.',
      });
      navigate(`/caballos/${data.id}`);
    },
    onError: (error: any) => {
      let errorMessage = 'No se pudo crear el caballo.';

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
        title: 'Error al crear caballo',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    const payload: any = {
      nombre: data.nombre,
      numero_chip: data.numero_chip,
    };

    // Solo agregar campos opcionales si tienen valores
    if (data.raza && data.raza.trim()) payload.raza = data.raza;
    if (data.sexo) payload.sexo = data.sexo;
    if (data.edad !== undefined && data.edad !== null && !isNaN(data.edad)) payload.edad = data.edad;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.color && data.color.trim()) payload.color = data.color;
    if (data.altura !== undefined && data.altura !== null && !isNaN(data.altura)) payload.altura = data.altura;
    if (data.peso !== undefined && data.peso !== null && !isNaN(data.peso)) payload.peso = data.peso;
    if (data.propietario_id && data.propietario_id.trim()) payload.propietario_id = data.propietario_id;
    if (data.box_asignado && data.box_asignado.trim()) payload.box_asignado = data.box_asignado;
    if (data.caracteristicas && data.caracteristicas.trim()) payload.caracteristicas = data.caracteristicas;

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/caballos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Caballo</h1>
          <p className="text-gray-500 mt-1">Registra un nuevo caballo en el sistema</p>
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
                <Label htmlFor="numero_chip">
                  Número de Chip <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero_chip"
                  {...register('numero_chip')}
                  placeholder="Ej: 123456789"
                />
                {errors.numero_chip && (
                  <p className="text-sm text-red-500">{errors.numero_chip.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
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
                <Label htmlFor="sexo">Sexo</Label>
                <select
                  id="sexo"
                  {...register('sexo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar sexo</option>
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

        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
            <CardDescription>Características especiales del caballo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            onClick={() => navigate('/caballos')}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              'Creando...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Caballo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
