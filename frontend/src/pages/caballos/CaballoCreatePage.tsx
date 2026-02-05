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
  pedigree: z.string().optional(),
  caracteristicas: z.string().optional(),

  // Plan sanitario
  categoria_sanitaria: z.enum(['A', 'B']).optional(),

  // Alimentación
  grano_balanceado: z.string().optional(),
  suplementos: z.string().optional(),
  cantidad_comidas_dia: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).optional()
  ),

  // Manejo
  tipo_manejo: z.enum(['box', 'box_piquete', 'piquete', 'palenque', 'cross_tie']).optional(),

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
    defaultValues: {
      trabajo_caminador: false,
      trabajo_cuerda: false,
      trabajo_manga: false,
      trabajo_montado: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => caballoService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Caballo creado',
        description: 'El caballo ha sido creado exitosamente. QR generado automáticamente.',
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
          errorMessage = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        }
      }
      toast({ title: 'Error al crear caballo', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    const payload: any = {
      nombre: data.nombre,
      numero_chip: data.numero_chip,
    };

    // Campos opcionales de básico
    if (data.id_fomento?.trim()) payload.id_fomento = data.id_fomento;
    if (data.raza?.trim()) payload.raza = data.raza;
    if (data.sexo) payload.sexo = data.sexo;
    if (data.edad !== undefined && !isNaN(data.edad)) payload.edad = data.edad;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.color?.trim()) payload.color = data.color;
    if (data.altura !== undefined && !isNaN(data.altura)) payload.altura = data.altura;
    if (data.peso !== undefined && !isNaN(data.peso)) payload.peso = data.peso;
    if (data.propietario_id?.trim()) payload.propietario_id = data.propietario_id;
    if (data.box_asignado?.trim()) payload.box_asignado = data.box_asignado;
    if (data.pedigree?.trim()) payload.pedigree = data.pedigree;
    if (data.caracteristicas?.trim()) payload.caracteristicas = data.caracteristicas;

    // Plan sanitario
    if (data.categoria_sanitaria) payload.categoria_sanitaria = data.categoria_sanitaria;

    // Alimentación
    if (data.grano_balanceado?.trim()) payload.grano_balanceado = data.grano_balanceado;
    if (data.suplementos?.trim()) payload.suplementos = data.suplementos;
    if (data.cantidad_comidas_dia !== undefined && !isNaN(data.cantidad_comidas_dia))
      payload.cantidad_comidas_dia = data.cantidad_comidas_dia;

    // Manejo
    if (data.tipo_manejo) payload.tipo_manejo = data.tipo_manejo;

    // Trabajo
    if (data.jinete_asignado?.trim()) payload.jinete_asignado = data.jinete_asignado;
    if (data.dias_trabajo?.trim()) payload.dias_trabajo = data.dias_trabajo;
    if (data.dias_descanso?.trim()) payload.dias_descanso = data.dias_descanso;
    if (data.tiempo_trabajo_diario !== undefined && !isNaN(data.tiempo_trabajo_diario))
      payload.tiempo_trabajo_diario = data.tiempo_trabajo_diario;

    const trabajo_config: any = {};
    if (data.trabajo_caminador) trabajo_config.caminador = true;
    if (data.trabajo_cuerda) trabajo_config.cuerda = true;
    if (data.trabajo_manga) trabajo_config.manga = true;
    if (data.trabajo_montado) trabajo_config.montado = true;
    if (Object.keys(trabajo_config).length > 0) payload.trabajo_config = trabajo_config;

    // Otros detalles
    if (data.embocadura_1?.trim()) payload.embocadura_1 = data.embocadura_1;
    if (data.embocadura_2?.trim()) payload.embocadura_2 = data.embocadura_2;
    if (data.cuidados_especiales?.trim()) payload.cuidados_especiales = data.cuidados_especiales;
    if (data.otra_info_1?.trim()) payload.otra_info_1 = data.otra_info_1;
    if (data.otra_info_2?.trim()) payload.otra_info_2 = data.otra_info_2;

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
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
                <Input id="raza" {...register('raza')} placeholder="Ej: Árabe, Pura Sangre, Criollo" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" {...register('color')} placeholder="Ej: Alazán, Tordillo, Zaino" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad (años)</Label>
                <Input id="edad" type="number" {...register('edad')} placeholder="0" />
                {errors.edad && <p className="text-sm text-red-500">{errors.edad.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input id="altura" type="number" step="0.01" {...register('altura')} placeholder="Ej: 1.60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" type="number" step="0.1" {...register('peso')} placeholder="Ej: 500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pedigree">Pedigree</Label>
              <textarea
                id="pedigree"
                {...register('pedigree')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Línea de ascendencia del caballo..."
              />
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
                  {clientes?.map((cliente: any) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="box_asignado">Box Asignado</Label>
                <Input id="box_asignado" {...register('box_asignado')} placeholder="Ej: Box 1, Box A-3" />
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
                <Input id="grano_balanceado" {...register('grano_balanceado')} placeholder="Tipo y cantidad de grano" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suplementos">Suplementos</Label>
                <Input id="suplementos" {...register('suplementos')} placeholder="Vitaminas, minerales, etc." />
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
            <CardDescription>Tipo de manejo y alojamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tipo_manejo">Tipo de Manejo</Label>
              <select
                id="tipo_manejo"
                {...register('tipo_manejo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
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
            <CardDescription>Información adicional del caballo</CardDescription>
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
              <textarea
                id="cuidados_especiales"
                {...register('cuidados_especiales')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alergias, condiciones médicas, instrucciones especiales..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caracteristicas">Características</Label>
              <textarea
                id="caracteristicas"
                {...register('caracteristicas')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Marcas, señas particulares, temperamento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otra_info_1">Otra información 1</Label>
              <textarea
                id="otra_info_1"
                {...register('otra_info_1')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otra_info_2">Otra información 2</Label>
              <textarea
                id="otra_info_2"
                {...register('otra_info_2')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/caballos')} disabled={createMutation.isPending}>
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
