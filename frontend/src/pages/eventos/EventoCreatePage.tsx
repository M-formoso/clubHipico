import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '@/services/eventoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const eventoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(255),
  tipo: z.enum(['clase_grupal', 'clase_privada', 'competencia', 'salida', 'evento_social', 'otro']),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  ubicacion: z.string().optional(),
  capacidad_maxima: z.number().min(0).optional(),
  costo: z.number().min(0).optional(),
});

type EventoFormData = z.infer<typeof eventoSchema>;

export function EventoCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      titulo: '',
      tipo: 'clase_grupal',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      ubicacion: '',
      capacidad_maxima: 0,
      costo: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: eventoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Éxito',
        description: 'Evento creado correctamente',
      });
      navigate('/eventos');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al crear el evento',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EventoFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Evento</h1>
        <p className="text-gray-500 mt-1">Crear un nuevo evento o clase</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Clase de Salto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border border-gray-300 rounded-md p-2 focus:border-beige-500 focus:ring-beige-500"
                      >
                        <option value="clase_grupal">Clase Grupal</option>
                        <option value="clase_privada">Clase Privada</option>
                        <option value="competencia">Competencia</option>
                        <option value="salida">Salida</option>
                        <option value="evento_social">Evento Social</option>
                        <option value="otro">Otro</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md p-2 focus:border-beige-500 focus:ring-beige-500"
                        placeholder="Descripción del evento..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora Inicio *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora Fin *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Picadero 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacidad_maxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad Máxima</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creando...' : 'Crear Evento'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/eventos')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
