import { useParams, useNavigate } from 'react-router-dom';
import { useUsuario, useDeleteUsuario } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermisosManager } from '@/components/usuarios/PermisosManager';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

const rolLabels: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  empleado: 'Empleado',
  cliente: 'Cliente',
};

export function UsuarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: usuario, isLoading } = useUsuario(id!);
  const deleteMutation = useDeleteUsuario();

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteMutation.mutate(id!, {
        onSuccess: () => navigate('/usuarios'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando usuario...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/usuarios')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {usuario.nombre} {usuario.apellido}
            </h1>
            <p className="text-gray-500 mt-1">{usuario.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/usuarios/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <Badge variant={usuario.activo ? 'default' : 'destructive'}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </Badge>
        <Badge className="bg-blue-100 text-blue-800">
          {rolLabels[usuario.rol]}
        </Badge>
        {usuario.funcion && (
          <Badge variant="outline" className="capitalize">
            {usuario.funcion}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{usuario.email}</p>
                  </div>
                </div>

                {usuario.telefono && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-sm text-gray-900">{usuario.telefono}</p>
                    </div>
                  </div>
                )}

                {usuario.dni && (
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 flex items-center justify-center text-gray-400 mt-0.5">
                      ID
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">DNI</p>
                      <p className="text-sm text-gray-900">{usuario.dni}</p>
                    </div>
                  </div>
                )}

                {usuario.direccion && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección</p>
                      <p className="text-sm text-gray-900">{usuario.direccion}</p>
                    </div>
                  </div>
                )}

                {usuario.fecha_nacimiento && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                      <p className="text-sm text-gray-900">
                        {new Date(usuario.fecha_nacimiento).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Laboral */}
          {(usuario.fecha_ingreso || usuario.salario) && (
            <Card>
              <CardHeader>
                <CardTitle>Información Laboral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usuario.fecha_ingreso && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Ingreso</p>
                        <p className="text-sm text-gray-900">
                          {new Date(usuario.fecha_ingreso).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  )}

                  {usuario.salario && (
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Salario</p>
                        <p className="text-sm text-gray-900">
                          ${usuario.salario.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contacto de Emergencia */}
          {usuario.contacto_emergencia && (
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{usuario.contacto_emergencia.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-900">{usuario.contacto_emergencia.telefono}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Relación</p>
                  <p className="text-sm text-gray-900">{usuario.contacto_emergencia.relacion}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permisos">
          {usuario.permisos ? (
            <PermisosManager
              permisos={usuario.permisos}
              rol={usuario.rol}
              onChange={() => {}}
              readonly
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No hay permisos configurados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
