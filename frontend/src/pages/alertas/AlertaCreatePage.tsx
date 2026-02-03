import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Users, Calendar, Clock, Repeat } from 'lucide-react';
import { useCreateAlerta } from '@/hooks/useAlertas';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TipoAlerta, Prioridad, FrecuenciaAlerta } from '@/types/alerta';

const TIPO_LABELS: Record<TipoAlerta, string> = {
  vacuna: 'Vacuna',
  herraje: 'Herraje',
  pago: 'Pago',
  evento: 'Evento',
  cumpleaños: 'Cumpleaños',
  contrato: 'Contrato',
  stock: 'Stock',
  tarea: 'Tarea',
  mantenimiento: 'Mantenimiento',
  veterinaria: 'Veterinaria',
  otro: 'Otro',
};

const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

const FRECUENCIA_LABELS: Record<FrecuenciaAlerta, string> = {
  unica: 'Única (una sola vez)',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  cada_x_dias: 'Cada X días',
};

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'empleado', label: 'Empleado' },
  { value: 'cliente', label: 'Cliente' },
];

export function AlertaCreatePage() {
  const navigate = useNavigate();
  const createAlertaMutation = useCreateAlerta();
  const { data: usuarios = [] } = useUsuarios();

  const [formData, setFormData] = useState({
    // Básico
    tipo: '' as TipoAlerta,
    prioridad: 'media' as Prioridad,
    titulo: '',
    mensaje: '',

    // Fechas y eventos
    fecha_evento: '',
    fecha_vencimiento: '',
    dias_anticipacion: '',

    // Frecuencia
    frecuencia: 'unica' as FrecuenciaAlerta,
    intervalo_dias: '',
    hora_envio: '',
    dias_semana: [] as number[],

    // Destinatarios
    enviar_a_todos: false,
    enviar_a_roles: [] as string[],
    enviar_a_usuarios: [] as string[],

    // Canales
    canal_sistema: true,
    canal_email: false,
    canal_push: false,

    // Opcional
    entidad_relacionada_tipo: '',
    entidad_relacionada_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo || !formData.titulo || !formData.mensaje) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (!formData.enviar_a_todos && formData.enviar_a_roles.length === 0 && formData.enviar_a_usuarios.length === 0) {
      alert('Debes seleccionar al menos un destinatario (roles o usuarios específicos)');
      return;
    }

    if (formData.frecuencia === 'cada_x_dias' && !formData.intervalo_dias) {
      alert('Debes especificar cada cuántos días se repite la alerta');
      return;
    }

    try {
      await createAlertaMutation.mutateAsync({
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        fecha_evento: formData.fecha_evento || undefined,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        entidad_relacionada_tipo: formData.entidad_relacionada_tipo || undefined,
        entidad_relacionada_id: formData.entidad_relacionada_id || undefined,
        // Datos adicionales para la configuración
        datos_adicionales: {
          frecuencia: formData.frecuencia,
          intervalo_dias: formData.intervalo_dias ? parseInt(formData.intervalo_dias) : undefined,
          hora_envio: formData.hora_envio || undefined,
          dias_semana: formData.dias_semana.length > 0 ? formData.dias_semana : undefined,
          dias_anticipacion: formData.dias_anticipacion ? parseInt(formData.dias_anticipacion) : undefined,
          enviar_a_roles: formData.enviar_a_roles.length > 0 ? formData.enviar_a_roles : undefined,
          enviar_a_usuarios: formData.enviar_a_usuarios.length > 0 ? formData.enviar_a_usuarios : undefined,
          canal_sistema: formData.canal_sistema,
          canal_email: formData.canal_email,
          canal_push: formData.canal_push,
        },
      });
      navigate('/alertas');
    } catch (error) {
      console.error('Error al crear alerta:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRol = (rol: string) => {
    setFormData((prev) => ({
      ...prev,
      enviar_a_roles: prev.enviar_a_roles.includes(rol)
        ? prev.enviar_a_roles.filter((r) => r !== rol)
        : [...prev.enviar_a_roles, rol],
    }));
  };

  const toggleUsuario = (usuarioId: string) => {
    setFormData((prev) => ({
      ...prev,
      enviar_a_usuarios: prev.enviar_a_usuarios.includes(usuarioId)
        ? prev.enviar_a_usuarios.filter((id) => id !== usuarioId)
        : [...prev.enviar_a_usuarios, usuarioId],
    }));
  };

  const toggleDiaSemana = (dia: number) => {
    setFormData((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia],
    }));
  };

  const seleccionarTodosUsuarios = () => {
    setFormData((prev) => ({
      ...prev,
      enviar_a_usuarios: usuarios.map((u) => u.id),
    }));
  };

  const deseleccionarTodosUsuarios = () => {
    setFormData((prev) => ({
      ...prev,
      enviar_a_usuarios: [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/alertas')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Nueva Alerta
          </h1>
          <p className="text-gray-500 mt-1">
            Crea una nueva alerta con programación y destinatarios personalizados
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basico" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">
              <Bell className="h-4 w-4 mr-2" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="destinatarios">
              <Users className="h-4 w-4 mr-2" />
              Destinatarios
            </TabsTrigger>
            <TabsTrigger value="programacion">
              <Calendar className="h-4 w-4 mr-2" />
              Programación
            </TabsTrigger>
            <TabsTrigger value="frecuencia">
              <Repeat className="h-4 w-4 mr-2" />
              Frecuencia
            </TabsTrigger>
          </TabsList>

          {/* TAB: Básico */}
          <TabsContent value="basico">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo y Prioridad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleChange('tipo', value as TipoAlerta)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPO_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Prioridad <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value) => handleChange('prioridad', value as Prioridad)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORIDAD_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    placeholder="Ej: Vencimiento de vacuna antirrábica"
                    maxLength={255}
                  />
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.mensaje}
                    onChange={(e) => handleChange('mensaje', e.target.value)}
                    placeholder="Describe los detalles de la alerta..."
                    rows={4}
                  />
                </div>

                {/* Canales de envío */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Canales de Envío
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canal_sistema"
                        checked={formData.canal_sistema}
                        onCheckedChange={(checked) => handleChange('canal_sistema', checked)}
                      />
                      <label htmlFor="canal_sistema" className="text-sm text-gray-700">
                        Sistema (notificación en la aplicación)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canal_email"
                        checked={formData.canal_email}
                        onCheckedChange={(checked) => handleChange('canal_email', checked)}
                      />
                      <label htmlFor="canal_email" className="text-sm text-gray-700">
                        Email
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canal_push"
                        checked={formData.canal_push}
                        onCheckedChange={(checked) => handleChange('canal_push', checked)}
                      />
                      <label htmlFor="canal_push" className="text-sm text-gray-700">
                        Notificación Push
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Destinatarios */}
          <TabsContent value="destinatarios">
            <Card>
              <CardHeader>
                <CardTitle>Destinatarios de la Alerta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Por Roles */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Enviar a Roles
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((rol) => (
                      <div key={rol.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rol-${rol.value}`}
                          checked={formData.enviar_a_roles.includes(rol.value)}
                          onCheckedChange={() => toggleRol(rol.value)}
                        />
                        <label htmlFor={`rol-${rol.value}`} className="text-sm text-gray-700">
                          {rol.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Enviar a Usuarios Específicos
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={seleccionarTodosUsuarios}
                      >
                        Seleccionar todos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={deseleccionarTodosUsuarios}
                      >
                        Deseleccionar todos
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
                    {usuarios.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay usuarios disponibles
                      </p>
                    ) : (
                      usuarios.map((usuario) => (
                        <div key={usuario.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`usuario-${usuario.id}`}
                            checked={formData.enviar_a_usuarios.includes(usuario.id)}
                            onCheckedChange={() => toggleUsuario(usuario.id)}
                          />
                          <label
                            htmlFor={`usuario-${usuario.id}`}
                            className="text-sm text-gray-700 flex-1"
                          >
                            {usuario.email} - <span className="text-gray-500">{usuario.rol}</span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.enviar_a_usuarios.length} usuario(s) seleccionado(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Programación */}
          <TabsContent value="programacion">
            <Card>
              <CardHeader>
                <CardTitle>Programación y Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Fecha del Evento
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.fecha_evento}
                      onChange={(e) => handleChange('fecha_evento', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Cuándo ocurre el evento</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Fecha de Vencimiento
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.fecha_vencimiento}
                      onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Cuándo expira la alerta</p>
                  </div>
                </div>

                {/* Días de anticipación */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Días de Anticipación
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.dias_anticipacion}
                    onChange={(e) => handleChange('dias_anticipacion', e.target.value)}
                    placeholder="Ej: 7 (enviar 7 días antes del evento)"
                  />
                  <p className="text-xs text-gray-500">
                    Cuántos días antes del evento se debe enviar la alerta
                  </p>
                </div>

                {/* Hora de envío */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Hora de Envío
                  </label>
                  <Input
                    type="time"
                    value={formData.hora_envio}
                    onChange={(e) => handleChange('hora_envio', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    A qué hora se debe enviar la alerta (formato 24h)
                  </p>
                </div>

                {/* Entidad Relacionada (Opcional) */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Entidad Relacionada (Opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Tipo de Entidad</label>
                      <Input
                        value={formData.entidad_relacionada_tipo}
                        onChange={(e) => handleChange('entidad_relacionada_tipo', e.target.value)}
                        placeholder="Ej: caballo, cliente, pago"
                        maxLength={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">ID de Entidad</label>
                      <Input
                        value={formData.entidad_relacionada_id}
                        onChange={(e) => handleChange('entidad_relacionada_id', e.target.value)}
                        placeholder="UUID de la entidad"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Frecuencia */}
          <TabsContent value="frecuencia">
            <Card>
              <CardHeader>
                <CardTitle>Frecuencia de Repetición</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Frecuencia */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ¿Cada cuánto se repite?
                  </label>
                  <Select
                    value={formData.frecuencia}
                    onValueChange={(value) => handleChange('frecuencia', value as FrecuenciaAlerta)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FRECUENCIA_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intervalo de días (solo si es "cada_x_dias") */}
                {formData.frecuencia === 'cada_x_dias' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Cada cuántos días <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.intervalo_dias}
                      onChange={(e) => handleChange('intervalo_dias', e.target.value)}
                      placeholder="Ej: 3 (cada 3 días)"
                    />
                  </div>
                )}

                {/* Días de la semana (solo si es "semanal") */}
                {formData.frecuencia === 'semanal' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Días de la semana
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dia-${dia.value}`}
                            checked={formData.dias_semana.includes(dia.value)}
                            onCheckedChange={() => toggleDiaSemana(dia.value)}
                          />
                          <label htmlFor={`dia-${dia.value}`} className="text-sm text-gray-700">
                            {dia.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información adicional según frecuencia */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    {formData.frecuencia === 'unica' && '✓ Esta alerta se enviará una sola vez'}
                    {formData.frecuencia === 'diaria' && '✓ Esta alerta se enviará todos los días'}
                    {formData.frecuencia === 'semanal' && formData.dias_semana.length === 0 && '⚠️ Selecciona al menos un día de la semana'}
                    {formData.frecuencia === 'semanal' && formData.dias_semana.length > 0 && `✓ Esta alerta se enviará cada ${formData.dias_semana.map(d => DIAS_SEMANA.find(ds => ds.value === d)?.label).join(', ')}`}
                    {formData.frecuencia === 'mensual' && '✓ Esta alerta se enviará una vez al mes'}
                    {formData.frecuencia === 'cada_x_dias' && !formData.intervalo_dias && '⚠️ Especifica cada cuántos días'}
                    {formData.frecuencia === 'cada_x_dias' && formData.intervalo_dias && `✓ Esta alerta se enviará cada ${formData.intervalo_dias} días`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {formData.enviar_a_roles.length > 0 && (
                  <span className="mr-3">
                    📋 {formData.enviar_a_roles.length} rol(es)
                  </span>
                )}
                {formData.enviar_a_usuarios.length > 0 && (
                  <span className="mr-3">
                    👥 {formData.enviar_a_usuarios.length} usuario(s)
                  </span>
                )}
                {formData.frecuencia !== 'unica' && (
                  <span>
                    🔁 {FRECUENCIA_LABELS[formData.frecuencia]}
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/alertas')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createAlertaMutation.isPending}
                >
                  {createAlertaMutation.isPending ? 'Creando...' : 'Crear Alerta'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
