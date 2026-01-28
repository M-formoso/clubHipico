import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { empleadoService } from '@/services/empleadoService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Briefcase,
  Clock,
} from 'lucide-react';

const funcionLabels = {
  veterinario: 'Veterinario',
  instructor: 'Instructor',
  cuidador: 'Cuidador',
  admin: 'Administrativo',
  mantenimiento: 'Mantenimiento',
};

const funcionColors = {
  veterinario: 'bg-blue-100 text-blue-800',
  instructor: 'bg-green-100 text-green-800',
  cuidador: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-purple-100 text-purple-800',
  mantenimiento: 'bg-gray-100 text-gray-800',
};

export function EmpleadoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: empleado, isLoading } = useQuery({
    queryKey: ['empleado', id],
    queryFn: () => empleadoService.getById(id!),
    enabled: !!id,
  });

  const { data: horarios } = useQuery({
    queryKey: ['empleado-horarios', id],
    queryFn: () => empleadoService.getHorarios(id!),
    enabled: !!id,
  });

  const { data: asistencias } = useQuery({
    queryKey: ['empleado-asistencias', id],
    queryFn: () => empleadoService.getAsistencias(id!),
    enabled: !!id,
  });

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/empleados')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {empleado.nombre} {empleado.apellido}
              </h1>
              <Badge variant={empleado.activo ? 'default' : 'secondary'}>
                {empleado.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Empleado desde{' '}
              {empleado.fecha_ingreso
                ? new Date(empleado.fecha_ingreso).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/empleados/${id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Función</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge className={funcionColors[empleado.funcion]} variant="outline">
              {funcionLabels[empleado.funcion]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNI</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{empleado.dni || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {empleado.salario ? `$${empleado.salario.toFixed(2)}` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empleado.dni && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">DNI</p>
                      <p className="text-gray-900">{empleado.dni}</p>
                    </div>
                  </div>
                )}

                {empleado.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{empleado.telefono}</p>
                    </div>
                  </div>
                )}

                {empleado.fecha_nacimiento && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                      <p className="text-gray-900">
                        {new Date(empleado.fecha_nacimiento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {empleado.fecha_ingreso && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Ingreso</p>
                      <p className="text-gray-900">
                        {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {empleado.direccion && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección</p>
                      <p className="text-gray-900">{empleado.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Función</p>
                    <Badge className={funcionColors[empleado.funcion]} variant="outline">
                      {funcionLabels[empleado.funcion]}
                    </Badge>
                  </div>
                </div>

                {empleado.salario && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Salario</p>
                      <p className="text-gray-900">${empleado.salario.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {empleado.contacto_emergencia && (
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="text-gray-900">{empleado.contacto_emergencia.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{empleado.contacto_emergencia.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relación</p>
                    <p className="text-gray-900">{empleado.contacto_emergencia.relacion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Horarios */}
        <TabsContent value="horarios">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Trabajo</CardTitle>
              <CardDescription>
                Horarios asignados al empleado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {horarios && horarios.length > 0 ? (
                <div className="space-y-4">
                  {horarios.map((horario: any) => (
                    <div
                      key={horario.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{horario.dia}</p>
                        <p className="text-sm text-gray-500">
                          {horario.hora_inicio} - {horario.hora_fin}
                        </p>
                      </div>
                      <Badge>{horario.tipo}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay horarios asignados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Asistencias */}
        <TabsContent value="asistencias">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Asistencias</CardTitle>
              <CardDescription>
                Historial de asistencias del empleado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asistencias && asistencias.length > 0 ? (
                <div className="space-y-4">
                  {asistencias.map((asistencia: any) => (
                    <div
                      key={asistencia.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(asistencia.fecha).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{asistencia.hora || 'N/A'}</p>
                      </div>
                      <Badge variant={asistencia.presente ? 'default' : 'secondary'}>
                        {asistencia.presente ? 'Presente' : 'Ausente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay registros de asistencia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
