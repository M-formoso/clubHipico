import { useParams, useNavigate } from 'react-router-dom';
import { useCaballoCompleto, useVacunas, useHerrajes, useAntiparasitarios } from '@/hooks/useCaballos';
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
  Calendar,
  User,
  Ruler,
  Weight,
  Home,
  QrCode,
  Syringe,
  Hammer,
  Pill,
  Image as ImageIcon,
  FileText,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { caballoService } from '@/services/caballoService';

const estadoColors = {
  activo: 'bg-green-100 text-green-800',
  retirado: 'bg-gray-100 text-gray-800',
  en_tratamiento: 'bg-orange-100 text-orange-800',
  fallecido: 'bg-red-100 text-red-800',
};

const estadoLabels = {
  activo: 'Activo',
  retirado: 'Retirado',
  en_tratamiento: 'En Tratamiento',
  fallecido: 'Fallecido',
};

const sexoLabels: Record<string, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
  castrado: 'Castrado',
};

const manejoLabels: Record<string, string> = {
  box: 'Box',
  box_piquete: 'Box y Piquete',
  piquete: 'Piquete',
  palenque: 'Palenque',
  cross_tie: 'Cross Tie',
};

export function CaballoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: caballo, isLoading } = useCaballoCompleto(id!);
  const { vacunas } = useVacunas(id!);
  const { herrajes } = useHerrajes(id!);
  const { antiparasitarios } = useAntiparasitarios(id!);

  const { data: historialMedico = [] } = useQuery({
    queryKey: ['historialMedico', id],
    queryFn: () => caballoService.getHistorialMedico(id!),
    enabled: !!id,
  });

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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/caballos')}
        >
          Volver a Caballos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/caballos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{caballo.nombre}</h1>
              <Badge className={estadoColors[caballo.estado]} variant="outline">
                {estadoLabels[caballo.estado]}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {caballo.raza || 'Sin raza'} • {caballo.sexo ? sexoLabels[caballo.sexo] : 'N/A'} • {caballo.edad ? `${caballo.edad} años` : 'Edad desconocida'}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Chip: {caballo.numero_chip}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/caballos/${id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edad</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caballo.edad || 'N/A'} {caballo.edad ? 'años' : ''}</div>
            {caballo.fecha_nacimiento && (
              <p className="text-xs text-gray-500">
                {format(new Date(caballo.fecha_nacimiento), 'dd/MM/yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Altura</CardTitle>
            <Ruler className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {caballo.altura ? `${caballo.altura} m` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso</CardTitle>
            <Weight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {caballo.peso ? `${caballo.peso} kg` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Box</CardTitle>
            <Home className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{caballo.box_asignado || 'Sin asignar'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="info">Info General</TabsTrigger>
          <TabsTrigger value="historial">
            <Activity className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="vacunas">
            <Syringe className="h-4 w-4 mr-2" />
            Vacunas
          </TabsTrigger>
          <TabsTrigger value="herrajes">
            <Hammer className="h-4 w-4 mr-2" />
            Herrajes
          </TabsTrigger>
          <TabsTrigger value="antiparasitarios">
            <Pill className="h-4 w-4 mr-2" />
            Antiparasitarios
          </TabsTrigger>
          <TabsTrigger value="fotos">
            <ImageIcon className="h-4 w-4 mr-2" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-gray-900">{caballo.nombre}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Número de Chip</p>
                  <p className="text-gray-900 font-mono text-sm">{caballo.numero_chip}</p>
                </div>

                {caballo.id_fomento && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID Fomento</p>
                    <p className="text-gray-900 font-mono text-sm">{caballo.id_fomento}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Raza</p>
                  <p className="text-gray-900">{caballo.raza || 'No especificada'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Sexo</p>
                  <p className="text-gray-900">{caballo.sexo ? sexoLabels[caballo.sexo] : 'No especificado'}</p>
                </div>

                {caballo.color && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Color</p>
                    <p className="text-gray-900">{caballo.color}</p>
                  </div>
                )}

                {caballo.propietario && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Propietario</p>
                    <p className="text-gray-900">
                      {caballo.propietario.nombre} {caballo.propietario.apellido}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => navigate(`/clientes/${caballo.propietario_id}`)}
                    >
                      Ver perfil del propietario
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alimentación */}
          {(caballo.grano_balanceado || caballo.suplementos) && (
            <Card>
              <CardHeader>
                <CardTitle>Alimentación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caballo.grano_balanceado && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Grano/Balanceado</p>
                    <p className="text-gray-900">{caballo.grano_balanceado}</p>
                  </div>
                )}
                {caballo.suplementos && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Suplementos</p>
                    <p className="text-gray-900">{caballo.suplementos}</p>
                  </div>
                )}
                {caballo.cantidad_comidas_dia && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Comidas al día</p>
                    <p className="text-gray-900">{caballo.cantidad_comidas_dia}</p>
                  </div>
                )}
                {caballo.detalles_alimentacion && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Detalles</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{caballo.detalles_alimentacion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manejo y Trabajo */}
          {(caballo.tipo_manejo || caballo.jinete_asignado) && (
            <Card>
              <CardHeader>
                <CardTitle>Manejo y Trabajo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caballo.tipo_manejo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Manejo</p>
                    <p className="text-gray-900">{manejoLabels[caballo.tipo_manejo]}</p>
                  </div>
                )}
                {caballo.jinete_asignado && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jinete Asignado</p>
                    <p className="text-gray-900">{caballo.jinete_asignado}</p>
                  </div>
                )}
                {caballo.dias_trabajo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Días de Trabajo</p>
                    <p className="text-gray-900">{caballo.dias_trabajo}</p>
                  </div>
                )}
                {caballo.tiempo_trabajo_diario && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tiempo de Trabajo Diario</p>
                    <p className="text-gray-900">{caballo.tiempo_trabajo_diario} minutos</p>
                  </div>
                )}
                {caballo.trabajo_config && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Tipos de Trabajo</p>
                    <div className="flex flex-wrap gap-2">
                      {caballo.trabajo_config.caminador && <Badge>Caminador</Badge>}
                      {caballo.trabajo_config.cuerda && <Badge>Cuerda</Badge>}
                      {caballo.trabajo_config.manga && <Badge>Manga</Badge>}
                      {caballo.trabajo_config.montado && <Badge>Montado</Badge>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Otros Detalles */}
          {(caballo.cuidados_especiales || caballo.caracteristicas) && (
            <Card>
              <CardHeader>
                <CardTitle>Otros Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caballo.embocadura_1 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Embocadura 1</p>
                    <p className="text-gray-900">{caballo.embocadura_1}</p>
                  </div>
                )}
                {caballo.embocadura_2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Embocadura 2</p>
                    <p className="text-gray-900">{caballo.embocadura_2}</p>
                  </div>
                )}
                {caballo.cuidados_especiales && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cuidados Especiales</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{caballo.cuidados_especiales}</p>
                  </div>
                )}
                {caballo.caracteristicas && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Características</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{caballo.caracteristicas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Historial Médico */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial Médico</CardTitle>
              <CardDescription>
                Registro completo de eventos médicos del caballo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historialMedico && historialMedico.length > 0 ? (
                <div className="space-y-4">
                  {historialMedico.map((registro: any) => (
                    <div
                      key={registro.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{registro.tipo}</Badge>
                            <p className="text-sm font-medium">
                              {format(new Date(registro.fecha), "d 'de' MMMM, yyyy", {
                                locale: es,
                              })}
                            </p>
                          </div>
                          {registro.veterinario && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Veterinario:</span> {registro.veterinario}
                            </p>
                          )}
                          {registro.descripcion && (
                            <p className="text-sm text-gray-600">{registro.descripcion}</p>
                          )}
                          {registro.medicamento && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Medicamento:</span> {registro.medicamento}
                              {registro.dosis && ` - ${registro.dosis}`}
                            </p>
                          )}
                          {registro.proxima_aplicacion && (
                            <p className="text-sm text-blue-600">
                              <span className="font-medium">Próxima aplicación:</span>{' '}
                              {format(new Date(registro.proxima_aplicacion), "d 'de' MMMM, yyyy", {
                                locale: es,
                              })}
                            </p>
                          )}
                          {registro.costo && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Costo:</span> ${registro.costo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay registros médicos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Vacunas */}
        <TabsContent value="vacunas">
          <Card>
            <CardHeader>
              <CardTitle>Vacunas y Análisis</CardTitle>
              <CardDescription>
                Historial de vacunación y próximas aplicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vacunas && vacunas.length > 0 ? (
                <div className="space-y-4">
                  {vacunas.map((vacuna) => (
                    <div
                      key={vacuna.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={vacuna.aplicada ? 'default' : 'outline'}>
                            {vacuna.tipo}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {format(new Date(vacuna.fecha), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        {vacuna.veterinario && (
                          <p className="text-sm text-gray-500">
                            Veterinario: {vacuna.veterinario}
                          </p>
                        )}
                        {vacuna.marca && (
                          <p className="text-sm text-gray-500">
                            Marca: {vacuna.marca}
                          </p>
                        )}
                        {vacuna.proxima_fecha && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próxima: {format(new Date(vacuna.proxima_fecha), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay vacunas registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Herrajes */}
        <TabsContent value="herrajes">
          <Card>
            <CardHeader>
              <CardTitle>Herrajes</CardTitle>
              <CardDescription>
                Historial de herrajes y próximas fechas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {herrajes && herrajes.length > 0 ? (
                <div className="space-y-4">
                  {herrajes.map((herraje) => (
                    <div
                      key={herraje.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">
                            {format(new Date(herraje.fecha), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        {herraje.herrador && (
                          <p className="text-sm text-gray-500">
                            Herrador: {herraje.herrador}
                          </p>
                        )}
                        {herraje.observaciones && (
                          <p className="text-sm text-gray-700 mt-2">
                            {herraje.observaciones}
                          </p>
                        )}
                        {herraje.proximo_herraje && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próximo: {format(new Date(herraje.proximo_herraje), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        )}
                      </div>
                      {herraje.costo && (
                        <div className="text-right">
                          <p className="font-bold">${herraje.costo}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay herrajes registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Antiparasitarios */}
        <TabsContent value="antiparasitarios">
          <Card>
            <CardHeader>
              <CardTitle>Antiparasitarios</CardTitle>
              <CardDescription>
                Historial de aplicaciones antiparasitarias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {antiparasitarios && antiparasitarios.length > 0 ? (
                <div className="space-y-4">
                  {antiparasitarios.map((antiparasitario) => (
                    <div
                      key={antiparasitario.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">
                            {format(new Date(antiparasitario.fecha), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        {antiparasitario.marca && (
                          <p className="text-sm text-gray-500">
                            Marca: {antiparasitario.marca}
                          </p>
                        )}
                        {antiparasitario.drogas && (
                          <p className="text-sm text-gray-500">
                            Drogas: {antiparasitario.drogas}
                          </p>
                        )}
                        {antiparasitario.dosis && (
                          <p className="text-sm text-gray-500">
                            Dosis: {antiparasitario.dosis}
                          </p>
                        )}
                        {antiparasitario.proxima_aplicacion && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próxima: {format(new Date(antiparasitario.proxima_aplicacion), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay antiparasitarios registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fotos */}
        <TabsContent value="fotos">
          <Card>
            <CardHeader>
              <CardTitle>Galería de Fotos</CardTitle>
              <CardDescription>
                Fotos del caballo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caballo.fotos && caballo.fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {caballo.fotos.map((foto) => (
                    <div key={foto.id} className="relative">
                      <img
                        src={foto.url}
                        alt={foto.descripcion || caballo.nombre}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {foto.es_principal && (
                        <Badge className="absolute top-2 right-2">Principal</Badge>
                      )}
                      {foto.descripcion && (
                        <p className="text-sm text-gray-500 mt-2">{foto.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay fotos registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: QR Code */}
        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>
                Código QR único del caballo para acceso rápido
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              {caballo.qr_code ? (
                <div className="text-center space-y-4">
                  <img
                    src={caballo.qr_code}
                    alt={`QR Code de ${caballo.nombre}`}
                    className="w-64 h-64 border-4 border-gray-200 rounded-lg"
                  />
                  <div>
                    <p className="text-sm text-gray-500">
                      Escanea este código para acceder rápidamente a la ficha del caballo
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => window.print()}>
                      Imprimir QR
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No hay código QR disponible
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
