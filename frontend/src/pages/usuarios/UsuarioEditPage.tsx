import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuario, useUpdateUsuario } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermisosManager } from '@/components/usuarios/PermisosManager';
import { PERMISOS_POR_ROL, Permisos } from '@/types/usuario';
import { ArrowLeft, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const usuarioSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').optional(),
  dni: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  rol: z.enum(['super_admin', 'admin', 'empleado', 'cliente']).optional(),
  funcion: z.enum(['veterinario', 'instructor', 'cuidador', 'admin', 'mantenimiento']).optional(),
  fecha_ingreso: z.string().optional(),
  salario: z.number().optional(),
  activo: z.boolean().optional(),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

const rolLabels = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  empleado: 'Empleado',
  cliente: 'Cliente',
};

const funcionLabels = {
  veterinario: 'Veterinario',
  instructor: 'Instructor',
  cuidador: 'Cuidador',
  admin: 'Administrativo',
  mantenimiento: 'Mantenimiento',
};

export function UsuarioEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: usuario, isLoading } = useUsuario(id!);
  const updateMutation = useUpdateUsuario();

  const [permisos, setPermisos] = useState<Permisos | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  const rolActual = watch('rol');

  useEffect(() => {
    if (usuario) {
      reset({
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        rol: usuario.rol,
        funcion: usuario.funcion || undefined,
        fecha_ingreso: usuario.fecha_ingreso || '',
        salario: usuario.salario || undefined,
        activo: usuario.activo,
      });
      setPermisos(usuario.permisos || PERMISOS_POR_ROL[usuario.rol]);
    }
  }, [usuario, reset]);

  const onSubmit = (data: UsuarioFormData) => {
    const payload: any = {};

    if (data.email) payload.email = data.email;
    if (data.password) payload.password = data.password;
    if (data.nombre) payload.nombre = data.nombre;
    if (data.apellido) payload.apellido = data.apellido;
    if (data.dni) payload.dni = data.dni;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.telefono) payload.telefono = data.telefono;
    if (data.direccion) payload.direccion = data.direccion;
    if (data.rol) payload.rol = data.rol;
    if (data.funcion) payload.funcion = data.funcion;
    if (data.fecha_ingreso) payload.fecha_ingreso = data.fecha_ingreso;
    if (data.salario !== undefined) payload.salario = data.salario;
    if (data.activo !== undefined) payload.activo = data.activo;
    if (permisos) payload.permisos = permisos;

    updateMutation.mutate(
      { id: id!, data: payload },
      {
        onSuccess: () => {
          navigate(`/usuarios/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando usuario...</div>
      </div>
    );
  }

  if (!usuario || !permisos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/usuarios/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-500 mt-1">
            {usuario.nombre} {usuario.apellido}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="cuenta">Cuenta y Rol</TabsTrigger>
            <TabsTrigger value="laboral">Laboral</TabsTrigger>
            <TabsTrigger value="permisos">Permisos</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...register('nombre')} />
                    {errors.nombre && (
                      <p className="text-sm text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" {...register('apellido')} />
                    {errors.apellido && (
                      <p className="text-sm text-red-500">{errors.apellido.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" {...register('dni')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" {...register('telefono')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" {...register('direccion')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cuenta y Rol */}
          <TabsContent value="cuenta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={rolActual} onValueChange={(value) => setValue('rol', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(rolLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="activo"
                      checked={watch('activo')}
                      onCheckedChange={(checked) => setValue('activo', checked as boolean)}
                    />
                    <Label htmlFor="activo">Usuario activo</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Laboral */}
          <TabsContent value="laboral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Laboral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcion">Función</Label>
                    <Select value={watch('funcion')} onValueChange={(value) => setValue('funcion', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una función" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(funcionLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                    <Input id="fecha_ingreso" type="date" {...register('fecha_ingreso')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salario">Salario</Label>
                    <Input
                      id="salario"
                      type="number"
                      step="0.01"
                      {...register('salario', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permisos */}
          <TabsContent value="permisos" className="space-y-4">
            <PermisosManager
              permisos={permisos}
              rol={rolActual}
              onChange={setPermisos}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-white py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/usuarios/${id}`)}
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
