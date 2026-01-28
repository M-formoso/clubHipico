# Skill: Crear formularios React con React Hook Form + Zod

## Objetivo
Crear formularios type-safe con validación robusta usando React Hook Form y Zod, usando los colores beige y gris del esquema.

## Patrón completo

### 1. Definir schema de validación Zod

```typescript
// types/caballo.ts
import { z } from 'zod';

export const caballoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  raza: z.string().min(1, "La raza es requerida"),
  edad: z.number().min(0).max(50),
  sexo: z.enum(['macho', 'hembra', 'castrado']),
  propietarioId: z.string().uuid().optional(),
  descripcion: z.string().optional(),
});

export type CaballoFormData = z.infer<typeof caballoSchema>;
```

### 2. Componente de formulario

```typescript
// components/caballos/CaballoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { caballoSchema, CaballoFormData } from '@/types/caballo';
import { caballoService } from '@/services/caballoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CaballoFormProps {
  initialData?: CaballoFormData;
  caballoId?: string;
}

export function CaballoForm({ initialData, caballoId }: CaballoFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CaballoFormData>({
    resolver: zodResolver(caballoSchema),
    defaultValues: initialData || {
      nombre: '',
      raza: '',
      edad: 0,
      sexo: 'macho',
      descripcion: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CaballoFormData) => {
      if (caballoId) {
        return caballoService.update(caballoId, data);
      }
      return caballoService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      toast({
        title: 'Éxito',
        description: `Caballo ${caballoId ? 'actualizado' : 'creado'} correctamente`,
      });
      navigate('/caballos');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Ocurrió un error',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CaballoFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del caballo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="raza"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raza *</FormLabel>
              <FormControl>
                <Input placeholder="Raza del caballo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="edad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <FormControl>
                <select {...field} className="w-full border border-gray-300 rounded p-2 focus:border-beige-500 focus:ring-beige-500">
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                  <option value="castrado">Castrado</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-beige-500 hover:bg-beige-600 text-white"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/caballos')}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3. Página de creación

```typescript
// pages/caballos/create.tsx
import { CaballoForm } from '@/components/caballos/CaballoForm';

export function CreateCaballoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Nuevo Caballo</h1>
      <div className="max-w-2xl bg-white shadow-md rounded-lg p-6">
        <CaballoForm />
      </div>
    </div>
  );
}
```

### 4. Página de edición

```typescript
// pages/caballos/[id].tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { caballoService } from '@/services/caballoService';
import { CaballoForm } from '@/components/caballos/CaballoForm';

export function EditCaballoPage() {
  const { id } = useParams<{ id: string }>();

  const { data: caballo, isLoading } = useQuery({
    queryKey: ['caballos', id],
    queryFn: () => caballoService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!caballo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caballo no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Editar Caballo</h1>
      <div className="max-w-2xl bg-white shadow-md rounded-lg p-6">
        <CaballoForm initialData={caballo} caballoId={id} />
      </div>
    </div>
  );
}
```

## Esquema de Colores

**Botones:**
- Primarios: `bg-beige-500 hover:bg-beige-600 text-white`
- Secundarios: `bg-gray-500 hover:bg-gray-600 text-white`
- Outline: `border-gray-300 text-gray-700 hover:bg-gray-100`

**Inputs:**
- Borde normal: `border-gray-300`
- Borde focus: `focus:border-beige-500 focus:ring-beige-500`

**Fondos:**
- Página: `bg-gray-50`
- Cards: `bg-white`
- Headers: `bg-beige-50` o `bg-gray-50`

## Checklist

- [ ] Schema Zod definido con validaciones
- [ ] Tipo TypeScript inferido del schema
- [ ] Formulario con React Hook Form + zodResolver
- [ ] Todos los campos con FormField
- [ ] Mensajes de error visibles
- [ ] Mutation con React Query
- [ ] Toast notifications
- [ ] Loading states
- [ ] Navegación al guardar
- [ ] Botón cancelar
- [ ] Colores beige y gris aplicados
