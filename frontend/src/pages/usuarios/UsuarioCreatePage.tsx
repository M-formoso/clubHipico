import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateUsuario } from '@/hooks/useUsuarios';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermisosManager } from '@/components/usuarios/PermisosManager';
import { PERMISOS_POR_ROL, Permisos } from '@/types/usuario';
import { ArrowLeft, Save } from 'lucide-react';

const usuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  rol: z.enum(['super_admin', 'admin', 'empleado', 'cliente']),
  funcion: z.enum(['veterinario', 'instructor', 'cuidador', 'admin', 'mantenimiento']).optional(),
  fecha_ingreso: z.string().optional(),
  salario: z.number().min(0, 'El salario debe ser mayor a 0').optional(),
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
  contacto_emergencia_relacion: z.string().optional(),
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

export function UsuarioCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateUsuario();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      rol: 'empleado',
      fecha_ingreso: new Date().toISOString().split('T')[0],
    },
  });

  const rolActual = watch('rol');
  const [permisos, setPermisos] = useState<Permisos>(PERMISOS_POR_ROL['empleado']);

  const onSubmit = (data: UsuarioFormData) => {
    const payload: any = {
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      permisos: permisos,
    };

    if (data.dni) payload.dni = data.dni;
    if (data.fecha_nacimiento) payload.fecha_nacimiento = data.fecha_nacimiento;
    if (data.telefono) payload.telefono = data.telefono;
    if (data.direccion) payload.direccion = data.direccion;
    if (data.funcion) payload.funcion = data.funcion;
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

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        navigate(`/usuarios/${data.id}`);
      },
    });
  };

  const handleRolChange = (newRol: string) => {
    setValue('rol', newRol as any);
    setPermisos(PERMISOS_POR_ROL[newRol] || PERMISOS_POR_ROL['empleado']);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/usuarios')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
          <p className="text-gray-500 mt-1">Registra un nuevo usuario en el sistema</p>
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
                <CardDescription>Datos básicos del usuario</CardDescription>
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
                      placeholder="Nombre del usuario"
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
                      placeholder="Apellido del usuario"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      {...register('telefono')}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      {...register('direccion')}
                      placeholder="Calle 123, Ciudad, Provincia"
                    />
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-4">Contacto de Emergencia</h4>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cuenta y Rol */}
          <TabsContent value="cuenta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de Cuenta</CardTitle>
                <CardDescription>Credenciales y rol del usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Contraseña <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rol">
                      Rol <span className="text-red-500">*</span>
                    </Label>
                    <Select value={rolActual} onValueChange={handleRolChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(rolLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rol && (
                      <p className="text-sm text-red-500">{errors.rol.message}</p>
                    )}
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
                <CardDescription>Datos del puesto y función (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcion">Función</Label>
                    <Select onValueChange={(value) => setValue('funcion', value as any)}>
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
                      placeholder="0.00"
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
            onClick={() => navigate('/usuarios')}
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
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
