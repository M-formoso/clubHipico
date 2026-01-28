import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';
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
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  Waves,
  Receipt,
  History,
} from 'lucide-react';

const tipoClienteLabels = {
  socio_pleno: 'Socio Pleno',
  pensionista: 'Pensionista',
  alumno: 'Alumno',
};

const tipoClienteColors = {
  socio_pleno: 'bg-purple-100 text-purple-800',
  pensionista: 'bg-blue-100 text-blue-800',
  alumno: 'bg-green-100 text-green-800',
};

const estadoCuentaLabels = {
  al_dia: 'Al Día',
  debe: 'Debe',
  moroso: 'Moroso',
};

const estadoCuentaColors = {
  al_dia: 'bg-green-100 text-green-800',
  debe: 'bg-yellow-100 text-yellow-800',
  moroso: 'bg-red-100 text-red-800',
};

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.getById(id!),
    enabled: !!id,
  });

  const { data: caballos } = useQuery({
    queryKey: ['cliente-caballos', id],
    queryFn: () => clienteService.getCaballos(id!),
    enabled: false, // Deshabilitar temporalmente hasta implementar el endpoint
  });

  const { data: pagos } = useQuery({
    queryKey: ['cliente-pagos', id],
    queryFn: () => clienteService.getPagos(id!),
    enabled: false, // Deshabilitar temporalmente hasta implementar el endpoint
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando cliente...</div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clientes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {cliente.nombre} {cliente.apellido}
              </h1>
              <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Cliente desde{' '}
              {cliente.fecha_alta
                ? new Date(cliente.fecha_alta).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/clientes/${id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Cliente</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge className={tipoClienteColors[cliente.tipo_cliente]} variant="outline">
              {tipoClienteLabels[cliente.tipo_cliente]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Cuenta</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Badge
              className={estadoCuentaColors[cliente.estado_cuenta]}
              variant="outline"
            >
              {estadoCuentaLabels[cliente.estado_cuenta]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                Number(cliente.saldo) < 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              ${Number(cliente.saldo || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="caballos">Caballos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cliente.dni && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">DNI</p>
                      <p className="text-gray-900">{cliente.dni}</p>
                    </div>
                  </div>
                )}

                {cliente.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{cliente.email}</p>
                    </div>
                  </div>
                )}

                {cliente.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{cliente.telefono}</p>
                    </div>
                  </div>
                )}

                {cliente.fecha_nacimiento && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                      <p className="text-gray-900">
                        {new Date(cliente.fecha_nacimiento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {cliente.direccion && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección</p>
                      <p className="text-gray-900">{cliente.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {cliente.contacto_emergencia && (
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="text-gray-900">{cliente.contacto_emergencia.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{cliente.contacto_emergencia.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relación</p>
                    <p className="text-gray-900">{cliente.contacto_emergencia.relacion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {cliente.notas && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{cliente.notas}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Caballos */}
        <TabsContent value="caballos">
          <Card>
            <CardHeader>
              <CardTitle>Caballos del Cliente</CardTitle>
              <CardDescription>
                Caballos asociados a este cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caballos && caballos.length > 0 ? (
                <div className="space-y-4">
                  {caballos.map((caballo: any) => (
                    <div
                      key={caballo.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{caballo.nombre}</p>
                        <p className="text-sm text-gray-500">{caballo.raza}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/caballos/${caballo.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay caballos asociados a este cliente
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pagos */}
        <TabsContent value="pagos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Pagos y transacciones del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pagos && pagos.length > 0 ? (
                <div className="space-y-4">
                  {pagos.map((pago: any) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{pago.concepto}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(pago.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${pago.monto.toFixed(2)}</p>
                        <Badge variant={pago.estado === 'pagado' ? 'default' : 'secondary'}>
                          {pago.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay pagos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
              <CardDescription>
                Registro de actividades y eventos del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                El historial de actividad estará disponible próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
