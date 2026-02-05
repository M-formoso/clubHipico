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
  numero_chip: z.string().min(1, 'El número de chip es requerido'),
  id_fomento: z.string().optional(),
  raza: z.string().optional(),
  edad: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
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
  estado: z.enum(['activo', 'retirado', 'en_tratamiento', 'fallecido']),
  pedigree: z.string().optional(),
  caracteristicas: z.string().optional(),

  // Plan sanitario
  categoria_sanitaria: z.enum(['A', 'B', '']).optional(),

  // Alimentación
  grano_balanceado: z.string().optional(),
  suplementos: z.string().optional(),
  cantidad_comidas_dia: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).optional()
  ),

  // Manejo
  tipo_manejo: z.enum(['box', 'box_piquete', 'piquete', 'palenque', 'cross_tie', '']).optional(),

  // Trabajo
  jinete_asignado: z.string().optional(),
  dias_trabajo: z.string().optional(),
  dias_descanso: z.string().optional(),
  tiempo_trabajo_diario: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  trabajo_caminador: z.boolean().optional(),
  trabajo_cuerda: z.boolean().optional(),
  trabajo_manga: z.boolean().optional(),
  trabajo_montado: z.boolean().optional(),

  // Otros detalles
  embocadura_1: z.string().optional(),
  embocadura_2: z.string().optional(),
  cuidados_especiales: z.string().optional(),
  otra_info_1: z.string().optional(),
  otra_info_2: z.string().optional(),
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
        numero_chip: caballo.numero_chip,
        id_fomento: caballo.id_fomento || '',
        raza: caballo.raza || '',
        edad: caballo.edad,
        fecha_nacimiento: caballo.fecha_nacimiento || '',
        sexo: caballo.sexo || undefined,
        color: caballo.color || '',
        altura: caballo.altura,
        peso: caballo.peso,
        propietario_id: caballo.propietario_id || '',
        box_asignado: caballo.box_asignado || '',
        estado: caballo.estado,
        pedigree: caballo.pedigree || '',
        caracteristicas: caballo.caracteristicas || '',
        // Plan sanitario
        categoria_sanitaria: (caballo.categoria_sanitaria as any) || '',
        // Alimentación
        grano_balanceado: caballo.grano_balanceado || '',
        suplementos: caballo.suplementos || '',
        cantidad_comidas_dia: caballo.cantidad_comidas_dia,
        // Manejo
        tipo_manejo: (caballo.tipo_manejo as any) || '',
        // Trabajo
        jinete_asignado: caballo.jinete_asignado || '',
        dias_trabajo: caballo.dias_trabajo || '',
        dias_descanso: caballo.dias_descanso || '',
        tiempo_trabajo_diario: caballo.tiempo_trabajo_diario,
        trabajo_caminador: caballo.trabajo_config?.caminador || false,
        trabajo_cuerda: caballo.trabajo_config?.cuerda || false,
        trabajo_manga: caballo.trabajo_config?.manga || false,
        trabajo_montado: caballo.trabajo_config?.montado || false,
        // Otros
        embocadura_1: caballo.embocadura_1 || '',
        embocadura_2: caballo.embocadura_2 || '',
        cuidados_especiales: caballo.cuidados_especiales || '',
        otra_info_1: caballo.otra_info_1 || '',
        otra_info_2: caballo.otra_info_2 || '',
      });
    }
  }, [caballo, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => caballoService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      queryClient.invalidateQueries({ queryKey: ['caballo', id] });
      queryClient.invalidateQueries({ queryKey: ['caballos', id, 'completo'] });
      toast({ title: 'Caballo actualizado', description: 'Los cambios se han guardado exitosamente.' });
      navigate(`/caballos/${id}`);
    },
    onError: (error: any) => {
      let errorMessage = 'No se pudo actualizar el caballo.';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') errorMessage = detail;
        else if (Array.isArray(detail)) errorMessage = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      toast({ title: 'Error al actualizar', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    const payload: any = {
      nombre: data.nombre,
      numero_chip: data.numero_chip,
      estado: data.estado,
    };

    if (data.id_fomento !== undefined) payload.id_fomento = data.id_fomento || null;
    if (data.raza !== undefined) payload.raza = data.raza || null;
    if (data.sexo) payload.sexo = data.sexo;
    if (data.edad !== undefined) payload.edad = data.edad;
    if (data.fecha_nacimiento !== undefined) payload.fecha_nacimiento = data.fecha_nacimiento || null;
    if (data.color !== undefined) payload.color = data.color || null;
    if (data.altura !== undefined) payload.altura = data.altura;
    if (data.peso !== undefined) payload.peso = data.peso;
    if (data.propietario_id !== undefined) payload.propietario_id = data.propietario_id || null;
    if (data.box_asignado !== undefined) payload.box_asignado = data.box_asignado || null;
    if (data.pedigree !== undefined) payload.pedigree = data.pedigree || null;
    if (data.caracteristicas !== undefined) payload.caracteristicas = data.caracteristicas || null;

    // Plan sanitario
    if (data.categoria_sanitaria !== undefined) payload.categoria_sanitaria = data.categoria_sanitaria || null;

    // Alimentación
    if (data.grano_balanceado !== undefined) payload.grano_balanceado = data.grano_balanceado || null;
    if (data.suplementos !== undefined) payload.suplementos = data.suplementos || null;
    if (data.cantidad_comidas_dia !== undefined) payload.cantidad_comidas_dia = data.cantidad_comidas_dia || null;

    // Manejo
    if (data.tipo_manejo !== undefined) payload.tipo_manejo = data.tipo_manejo || null;

    // Trabajo
    if (data.jinete_asignado !== undefined) payload.jinete_asignado = data.jinete_asignado || null;
    if (data.dias_trabajo !== undefined) payload.dias_trabajo = data.dias_trabajo || null;
    if (data.dias_descanso !== undefined) payload.dias_descanso = data.dias_descanso || null;
    if (data.tiempo_trabajo_diario !== undefined) payload.tiempo_trabajo_diario = data.tiempo_trabajo_diario || null;

    const trabajo_config: any = {};
    if (data.trabajo_caminador) trabajo_config.caminador = true;
    if (data.trabajo_cuerda) trabajo_config.cuerda = true;
    if (data.trabajo_manga) trabajo_config.manga = true;
    if (data.trabajo_montado) trabajo_config.montado = true;
    payload.trabajo_config = Object.keys(trabajo_config).length > 0 ? trabajo_config : null;

    // Otros
    if (data.embocadura_1 !== undefined) payload.embocadura_1 = data.embocadura_1 || null;
    if (data.embocadura_2 !== undefined) payload.embocadura_2 = data.embocadura_2 || null;
    if (data.cuidados_especiales !== undefined) payload.cuidados_especiales = data.cuidados_especiales || null;
    if (data.otra_info_1 !== undefined) payload.otra_info_1 = data.otra_info_1 || null;
    if (data.otra_info_2 !== undefined) payload.otra_info_2 = data.otra_info_2 || null;

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
        <Button variant="outline" className="mt-4" onClick={() => navigate('/caballos')}>
          Volver a Caballos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/caballos/${id}`)}>
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
                <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                <Input id="nombre" {...register('nombre')} placeholder="Nombre del caballo" />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_chip">Número de Chip <span className="text-red-500">*</span></Label>
                <Input id="numero_chip" {...register('numero_chip')} placeholder="Ej: 123456789" />
                {errors.numero_chip && <p className="text-sm text-red-500">{errors.numero_chip.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_fomento">ID Fomento</Label>
                <Input id="id_fomento" {...register('id_fomento')} placeholder="Número de fomento" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
                <Input id="raza" {...register('raza')} placeholder="Ej: Árabe, Pura Sangre" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <select id="sexo" {...register('sexo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar sexo</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                  <option value="castrado">Castrado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" {...register('color')} placeholder="Ej: Alazán, Tordillo" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad (años)</Label>
                <Input id="edad" type="number" {...register('edad')} placeholder="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input id="altura" type="number" step="0.01" {...register('altura')} placeholder="1.60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" type="number" step="0.1" {...register('peso')} placeholder="500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pedigree">Pedigree</Label>
              <textarea id="pedigree" {...register('pedigree')} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Línea de ascendencia..." />
            </div>
          </CardContent>
        </Card>

        {/* Propietario, Ubicación y Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Propietario, Ubicación y Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propietario_id">Propietario</Label>
                <select id="propietario_id" {...register('propietario_id')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar propietario</option>
                  {clientes?.map((cliente: any) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="box_asignado">Box Asignado</Label>
                <Input id="box_asignado" {...register('box_asignado')} placeholder="Ej: Box 1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado <span className="text-red-500">*</span></Label>
                <select id="estado" {...register('estado')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="activo">Activo</option>
                  <option value="en_tratamiento">En Tratamiento</option>
                  <option value="retirado">Retirado</option>
                  <option value="fallecido">Fallecido</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria_sanitaria">Categoría Sanitaria (Plan 2026)</Label>
                <select
                  id="categoria_sanitaria"
                  {...register('categoria_sanitaria')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-beige-500 focus:outline-none focus:ring-1 focus:ring-beige-500"
                >
                  <option value="">Sin categoría</option>
                  <option value="A">Categoría A - $45,000/mes</option>
                  <option value="B">Categoría B - $35,000/mes</option>
                </select>
                <p className="text-xs text-gray-500">
                  Plan sanitario según Resolución 1942 Haras Club 2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alimentación */}
        <Card>
          <CardHeader>
            <CardTitle>Alimentación</CardTitle>
            <CardDescription>Régimen alimentario del caballo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grano_balanceado">Grano / Balanceado</Label>
                <Input id="grano_balanceado" {...register('grano_balanceado')} placeholder="Tipo y cantidad" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplementos">Suplementos</Label>
                <Input id="suplementos" {...register('suplementos')} placeholder="Vitaminas, minerales..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad_comidas_dia">Cantidad de comidas al día</Label>
                <Input id="cantidad_comidas_dia" type="number" min="1" {...register('cantidad_comidas_dia')} placeholder="2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manejo Diario */}
        <Card>
          <CardHeader>
            <CardTitle>Manejo Diario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tipo_manejo">Tipo de Manejo</Label>
              <select id="tipo_manejo" {...register('tipo_manejo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar tipo de manejo</option>
                <option value="box">Box</option>
                <option value="box_piquete">Box y Piquete</option>
                <option value="piquete">Piquete</option>
                <option value="palenque">Palenque</option>
                <option value="cross_tie">Cross Tie</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Trabajo Diario */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajo Diario</CardTitle>
            <CardDescription>Configuración de trabajo y ejercicio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jinete_asignado">Jinete Asignado</Label>
                <Input id="jinete_asignado" {...register('jinete_asignado')} placeholder="Nombre del jinete" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiempo_trabajo_diario">Tiempo de trabajo diario (minutos)</Label>
                <Input id="tiempo_trabajo_diario" type="number" min="0" {...register('tiempo_trabajo_diario')} placeholder="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias_trabajo">Días de trabajo</Label>
                <Input id="dias_trabajo" {...register('dias_trabajo')} placeholder="Ej: Lun, Miér, Viern" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias_descanso">Días de descanso</Label>
                <Input id="dias_descanso" {...register('dias_descanso')} placeholder="Ej: Sábado, Domingo" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Tipos de trabajo</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('trabajo_caminador')} className="rounded" />
                  <span className="text-sm">Uso de caminador</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('trabajo_cuerda')} className="rounded" />
                  <span className="text-sm">Trabajo a la cuerda</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('trabajo_manga')} className="rounded" />
                  <span className="text-sm">Trabajo a la manga</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('trabajo_montado')} className="rounded" />
                  <span className="text-sm">Trabajo montado</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Otros Detalles */}
        <Card>
          <CardHeader>
            <CardTitle>Otros Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="embocadura_1">Embocadura 1</Label>
                <Input id="embocadura_1" {...register('embocadura_1')} placeholder="Tipo de embocadura" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="embocadura_2">Embocadura 2</Label>
                <Input id="embocadura_2" {...register('embocadura_2')} placeholder="Tipo de embocadura" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuidados_especiales">Cuidados Especiales</Label>
              <textarea id="cuidados_especiales" {...register('cuidados_especiales')} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alergias, condiciones médicas..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caracteristicas">Características</Label>
              <textarea id="caracteristicas" {...register('caracteristicas')} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Marcas, señas particulares, temperamento..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otra_info_1">Otra información 1</Label>
              <textarea id="otra_info_1" {...register('otra_info_1')} rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otra_info_2">Otra información 2</Label>
              <textarea id="otra_info_2" {...register('otra_info_2')} rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional..." />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/caballos/${id}`)} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando...' : (<><Save className="mr-2 h-4 w-4" />Guardar Cambios</>)}
          </Button>
        </div>
      </form>
    </div>
  );
}
