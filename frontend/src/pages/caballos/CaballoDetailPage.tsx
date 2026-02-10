import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCaballoCompleto,
  useFotos,
  useVacunas,
  useHerrajes,
  useAntiparasitarios,
  useRevisionesDentales,
  useEstudiosMedicos,
} from '@/hooks/useCaballos';
import { PlanSanitarioTab } from '@/components/caballos/PlanSanitarioTab';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Ruler,
  Weight,
  Home,
  QrCode,
  Syringe,
  Hammer,
  Pill,
  Image as ImageIcon,
  Activity,
  Plus,
  ClipboardList,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ──────────────────────────────────────────────────────────
// Labels y colores
// ──────────────────────────────────────────────────────────
const estadoColors: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  retirado: 'bg-gray-100 text-gray-800',
  en_tratamiento: 'bg-orange-100 text-orange-800',
  fallecido: 'bg-red-100 text-red-800',
};

const estadoLabels: Record<string, string> = {
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

const TIPOS_VACUNA = [
  { value: 'anemia', label: 'Anemia' },
  { value: 'influenza', label: 'Vacuna Influenza' },
  { value: 'encefalomielitis', label: 'Vacuna Encefalomielitis' },
  { value: 'rinoneumonitis', label: 'Vacuna Rinoneumonitis' },
  { value: 'rabia', label: 'Vacuna Rabia' },
  { value: 'otra_vacuna_1', label: 'Otra Vacuna 1' },
  { value: 'otra_vacuna_2', label: 'Otra Vacuna 2' },
  { value: 'perfil', label: 'Perfil' },
];

const TIPOS_ESTUDIO = [
  { value: 'radiografia', label: 'Radiografía' },
  { value: 'ecografia', label: 'Ecografía' },
  { value: 'resonancia', label: 'Resonancia' },
  { value: 'endoscopia', label: 'Endoscopía' },
  { value: 'otros', label: 'Otros' },
];

// ──────────────────────────────────────────────────────────
// Tipo unificado para el historial clínico
// ──────────────────────────────────────────────────────────
type HistorialTipo = 'vacuna' | 'herraje' | 'antiparasitario' | 'revision_dental' | 'estudio_medico';

interface HistorialItem {
  id: string;
  tipo: HistorialTipo;
  fecha: string;
  titulo: string;
  detalles: string[];
  proximo?: string;
}

const historialColors: Record<HistorialTipo, string> = {
  vacuna: 'bg-blue-100 text-blue-800',
  herraje: 'bg-amber-100 text-amber-800',
  antiparasitario: 'bg-purple-100 text-purple-800',
  revision_dental: 'bg-green-100 text-green-800',
  estudio_medico: 'bg-pink-100 text-pink-800',
};

const historialLabels: Record<HistorialTipo, string> = {
  vacuna: 'Vacuna',
  herraje: 'Herraje',
  antiparasitario: 'Antiparasitario',
  revision_dental: 'Revisión Dental',
  estudio_medico: 'Estudio Médico',
};

// ──────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────
export function CaballoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isCliente = user?.rol === 'cliente';

  const { data: caballo, isLoading } = useCaballoCompleto(id!);
  const { vacunas, addVacuna, deleteVacuna } = useVacunas(id!);
  const { herrajes, addHerraje, deleteHerraje } = useHerrajes(id!);
  const { antiparasitarios, addAntiparasitario, deleteAntiparasitario } = useAntiparasitarios(id!);
  const { revisiones, addRevision, deleteRevision } = useRevisionesDentales(id!);
  const { estudios, addEstudio, deleteEstudio } = useEstudiosMedicos(id!);
  const { fotos, addFoto, marcarPrincipal, deleteFoto } = useFotos(id!);

  // ── Modal states ──
  const [modalVacuna, setModalVacuna] = useState(false);
  const [modalHerraje, setModalHerraje] = useState(false);
  const [modalAntiparasitario, setModalAntiparasitario] = useState(false);
  const [modalRevisionDental, setModalRevisionDental] = useState(false);
  const [modalEstudioMedico, setModalEstudioMedico] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);

  // ── Form states ──
  const [formFoto, setFormFoto] = useState<{ file: File | null; descripcion: string }>({ file: null, descripcion: '' });
  const [formVacuna, setFormVacuna] = useState({ tipo: 'anemia', fecha: '', veterinario: '', marca: '', frecuencia_dias: '', observaciones: '', aplicada: true });
  const [formHerraje, setFormHerraje] = useState({ fecha: '', herrador: '', observaciones: '', proximo_herraje: '', costo: '' });
  const [formAntiparasitario, setFormAntiparasitario] = useState({ fecha: '', marca: '', drogas: '', dosis: '', proxima_aplicacion: '', observaciones: '' });
  const [formRevisionDental, setFormRevisionDental] = useState({ fecha: '', veterinario: '', observaciones: '', proxima_revision: '' });
  const [formEstudioMedico, setFormEstudioMedico] = useState({ tipo: 'radiografia', fecha: '', veterinario: '', zona_estudiada: '', diagnostico: '', observaciones: '' });

  // ── Historial unificado ──
  const historialItems: HistorialItem[] = [
    ...(vacunas || []).map((v) => ({
      id: v.id,
      tipo: 'vacuna' as HistorialTipo,
      fecha: v.fecha,
      titulo: v.tipo,
      detalles: [
        v.veterinario && `Veterinario: ${v.veterinario}`,
        v.marca && `Marca: ${v.marca}`,
        v.observaciones && v.observaciones,
      ].filter(Boolean) as string[],
      proximo: v.proxima_fecha,
    })),
    ...(herrajes || []).map((h) => ({
      id: h.id,
      tipo: 'herraje' as HistorialTipo,
      fecha: h.fecha,
      titulo: 'Herraje',
      detalles: [
        h.herrador && `Herrador: ${h.herrador}`,
        h.costo && `Costo: $${h.costo}`,
        h.observaciones && h.observaciones,
      ].filter(Boolean) as string[],
      proximo: h.proximo_herraje,
    })),
    ...(antiparasitarios || []).map((a) => ({
      id: a.id,
      tipo: 'antiparasitario' as HistorialTipo,
      fecha: a.fecha,
      titulo: 'Antiparasitario',
      detalles: [
        a.marca && `Marca: ${a.marca}`,
        a.drogas && `Drogas: ${a.drogas}`,
        a.dosis && `Dosis: ${a.dosis}`,
        a.observaciones && a.observaciones,
      ].filter(Boolean) as string[],
      proximo: a.proxima_aplicacion,
    })),
    ...(revisiones || []).map((r) => ({
      id: r.id,
      tipo: 'revision_dental' as HistorialTipo,
      fecha: r.fecha,
      titulo: 'Revisión Dental',
      detalles: [
        r.veterinario && `Veterinario: ${r.veterinario}`,
        r.observaciones && r.observaciones,
      ].filter(Boolean) as string[],
      proximo: r.proxima_revision,
    })),
    ...(estudios || []).map((e) => ({
      id: e.id,
      tipo: 'estudio_medico' as HistorialTipo,
      fecha: e.fecha,
      titulo: e.tipo,
      detalles: [
        e.veterinario && `Veterinario: ${e.veterinario}`,
        e.zona_estudiada && `Zona: ${e.zona_estudiada}`,
        e.diagnostico && `Diagnóstico: ${e.diagnostico}`,
        e.observaciones && e.observaciones,
      ].filter(Boolean) as string[],
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // ── Submit handlers ──
  const handleSubmitVacuna = () => {
    if (!formVacuna.fecha) return;
    addVacuna({
      tipo: formVacuna.tipo,
      fecha: formVacuna.fecha,
      veterinario: formVacuna.veterinario || undefined,
      marca: formVacuna.marca || undefined,
      frecuencia_dias: formVacuna.frecuencia_dias ? Number(formVacuna.frecuencia_dias) : undefined,
      observaciones: formVacuna.observaciones || undefined,
      aplicada: formVacuna.aplicada,
    });
    setModalVacuna(false);
    setFormVacuna({ tipo: 'anemia', fecha: '', veterinario: '', marca: '', frecuencia_dias: '', observaciones: '', aplicada: true });
  };

  const handleSubmitHerraje = () => {
    if (!formHerraje.fecha) return;
    addHerraje({
      fecha: formHerraje.fecha,
      herrador: formHerraje.herrador || undefined,
      observaciones: formHerraje.observaciones || undefined,
      proximo_herraje: formHerraje.proximo_herraje || undefined,
      costo: formHerraje.costo ? Number(formHerraje.costo) : undefined,
    });
    setModalHerraje(false);
    setFormHerraje({ fecha: '', herrador: '', observaciones: '', proximo_herraje: '', costo: '' });
  };

  const handleSubmitAntiparasitario = () => {
    if (!formAntiparasitario.fecha) return;
    addAntiparasitario({
      fecha: formAntiparasitario.fecha,
      marca: formAntiparasitario.marca || undefined,
      drogas: formAntiparasitario.drogas || undefined,
      dosis: formAntiparasitario.dosis || undefined,
      proxima_aplicacion: formAntiparasitario.proxima_aplicacion || undefined,
      observaciones: formAntiparasitario.observaciones || undefined,
    });
    setModalAntiparasitario(false);
    setFormAntiparasitario({ fecha: '', marca: '', drogas: '', dosis: '', proxima_aplicacion: '', observaciones: '' });
  };

  const handleSubmitRevisionDental = () => {
    if (!formRevisionDental.fecha) return;
    addRevision({
      fecha: formRevisionDental.fecha,
      veterinario: formRevisionDental.veterinario || undefined,
      observaciones: formRevisionDental.observaciones || undefined,
      proxima_revision: formRevisionDental.proxima_revision || undefined,
    });
    setModalRevisionDental(false);
    setFormRevisionDental({ fecha: '', veterinario: '', observaciones: '', proxima_revision: '' });
  };

  const handleSubmitFoto = () => {
    if (!formFoto.file) return;
    addFoto({
      file: formFoto.file,
      descripcion: formFoto.descripcion || undefined,
      es_principal: !fotos || fotos.length === 0,
    });
    setModalFoto(false);
    setFormFoto({ file: null, descripcion: '' });
  };

  const handleSubmitEstudioMedico = () => {
    if (!formEstudioMedico.fecha) return;
    addEstudio({
      tipo: formEstudioMedico.tipo,
      fecha: formEstudioMedico.fecha,
      veterinario: formEstudioMedico.veterinario || undefined,
      zona_estudiada: formEstudioMedico.zona_estudiada || undefined,
      diagnostico: formEstudioMedico.diagnostico || undefined,
      observaciones: formEstudioMedico.observaciones || undefined,
    });
    setModalEstudioMedico(false);
    setFormEstudioMedico({ tipo: 'radiografia', fecha: '', veterinario: '', zona_estudiada: '', diagnostico: '', observaciones: '' });
  };

  // ── Loading / Not found ──
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
        <Button variant="outline" className="mt-4" onClick={() => navigate('/caballos')}>
          Volver a Caballos
        </Button>
      </div>
    );
  }

  // ── Render ──
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
            <p className="text-xs text-gray-400 font-mono mt-1">Chip: {caballo.numero_chip}</p>
          </div>
        </div>
        {!isCliente && (
          <Button onClick={() => navigate(`/caballos/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
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
              <p className="text-xs text-gray-500">{format(new Date(caballo.fecha_nacimiento), 'dd/MM/yyyy')}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Altura</CardTitle>
            <Ruler className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caballo.altura ? `${caballo.altura} m` : 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso</CardTitle>
            <Weight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caballo.peso ? `${caballo.peso} kg` : 'N/A'}</div>
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="historial">
            <Activity className="h-4 w-4 mr-1" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="vacunas">
            <Syringe className="h-4 w-4 mr-1" />
            Vacunas
          </TabsTrigger>
          <TabsTrigger value="herrajes">
            <Hammer className="h-4 w-4 mr-1" />
            Herrajes
          </TabsTrigger>
          <TabsTrigger value="antiparasitarios">
            <Pill className="h-4 w-4 mr-1" />
            Antipar.
          </TabsTrigger>
          <TabsTrigger value="fotos">
            <ImageIcon className="h-4 w-4 mr-1" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="h-4 w-4 mr-1" />
            QR
          </TabsTrigger>
          <TabsTrigger value="plan-sanitario">
            <ClipboardList className="h-4 w-4 mr-1" />
            Plan
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════
            TAB: Info General
            ════════════════════════════════════════════════════ */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Nombre</p><p className="text-gray-900">{caballo.nombre}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Número de Chip</p><p className="text-gray-900 font-mono text-sm">{caballo.numero_chip}</p></div>
                {caballo.id_fomento && <div><p className="text-sm font-medium text-gray-500">ID Fomento</p><p className="text-gray-900 font-mono text-sm">{caballo.id_fomento}</p></div>}
                <div><p className="text-sm font-medium text-gray-500">Raza</p><p className="text-gray-900">{caballo.raza || 'No especificada'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Sexo</p><p className="text-gray-900">{caballo.sexo ? sexoLabels[caballo.sexo] : 'No especificado'}</p></div>
                {caballo.color && <div><p className="text-sm font-medium text-gray-500">Color</p><p className="text-gray-900">{caballo.color}</p></div>}
                {caballo.propietario && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Propietario</p>
                    <p className="text-gray-900">{caballo.propietario.nombre} {caballo.propietario.apellido}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate(`/clientes/${caballo.propietario_id}`)}>
                      Ver perfil del propietario
                    </Button>
                  </div>
                )}
                {caballo.pedigree && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Pedigree</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{caballo.pedigree}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alimentación */}
          <Card>
            <CardHeader><CardTitle>Alimentación</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Grano / Balanceado</p><p className="text-gray-900">{caballo.grano_balanceado || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Suplementos</p><p className="text-gray-900">{caballo.suplementos || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Comidas al día</p><p className="text-gray-900">{caballo.cantidad_comidas_dia || '—'}</p></div>
              </div>
              {caballo.detalles_alimentacion && (
                <div className="mt-3"><p className="text-sm font-medium text-gray-500">Detalles</p><p className="text-gray-900 whitespace-pre-wrap">{caballo.detalles_alimentacion}</p></div>
              )}
            </CardContent>
          </Card>

          {/* Manejo y Trabajo */}
          <Card>
            <CardHeader><CardTitle>Manejo y Trabajo</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Tipo de Manejo</p><p className="text-gray-900">{caballo.tipo_manejo ? manejoLabels[caballo.tipo_manejo] : '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Jinete Asignado</p><p className="text-gray-900">{caballo.jinete_asignado || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Días de Trabajo</p><p className="text-gray-900">{caballo.dias_trabajo || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Días de Descanso</p><p className="text-gray-900">{caballo.dias_descanso || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Tiempo de Trabajo Diario</p><p className="text-gray-900">{caballo.tiempo_trabajo_diario ? `${caballo.tiempo_trabajo_diario} min` : '—'}</p></div>
              </div>
              {caballo.trabajo_config && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-500 mb-2">Tipos de Trabajo</p>
                  <div className="flex flex-wrap gap-2">
                    {caballo.trabajo_config.caminador && <Badge variant="secondary">Caminador</Badge>}
                    {caballo.trabajo_config.cuerda && <Badge variant="secondary">Cuerda</Badge>}
                    {caballo.trabajo_config.manga && <Badge variant="secondary">Manga</Badge>}
                    {caballo.trabajo_config.montado && <Badge variant="secondary">Montado</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Otros Detalles */}
          <Card>
            <CardHeader><CardTitle>Otros Detalles</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Embocadura 1</p><p className="text-gray-900">{caballo.embocadura_1 || '—'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Embocadura 2</p><p className="text-gray-900">{caballo.embocadura_2 || '—'}</p></div>
              </div>
              {caballo.cuidados_especiales && (
                <div className="mt-3"><p className="text-sm font-medium text-gray-500">Cuidados Especiales</p><p className="text-gray-900 whitespace-pre-wrap">{caballo.cuidados_especiales}</p></div>
              )}
              {caballo.caracteristicas && (
                <div className="mt-3"><p className="text-sm font-medium text-gray-500">Características</p><p className="text-gray-900 whitespace-pre-wrap">{caballo.caracteristicas}</p></div>
              )}
              {caballo.otra_info_1 && (
                <div className="mt-3"><p className="text-sm font-medium text-gray-500">Otra información 1</p><p className="text-gray-900 whitespace-pre-wrap">{caballo.otra_info_1}</p></div>
              )}
              {caballo.otra_info_2 && (
                <div className="mt-3"><p className="text-sm font-medium text-gray-500">Otra información 2</p><p className="text-gray-900 whitespace-pre-wrap">{caballo.otra_info_2}</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Historial Clínico (unified timeline)
            ════════════════════════════════════════════════════ */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial Clínico</CardTitle>
              <CardDescription>Línea de tiempo completa de todos los eventos médicos</CardDescription>
            </CardHeader>
            <CardContent>
              {historialItems.length > 0 ? (
                <div className="space-y-3">
                  {historialItems.map((item) => (
                    <div key={`${item.tipo}-${item.id}`} className="flex gap-3">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${historialColors[item.tipo].split(' ')[0]}`} />
                        <div className="w-px bg-gray-200 flex-1 mt-1" />
                      </div>
                      {/* Card */}
                      <div className="border rounded-lg p-3 flex-1 mb-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={historialColors[item.tipo]} variant="outline">
                              {historialLabels[item.tipo]}
                            </Badge>
                            <Badge variant="outline">{item.titulo}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(item.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                        {item.detalles.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {item.detalles.map((d, i) => (
                              <p key={i} className="text-sm text-gray-600">{d}</p>
                            ))}
                          </div>
                        )}
                        {item.proximo && (
                          <p className="text-sm font-medium text-orange-600 mt-1.5">
                            Próximo: {format(new Date(item.proximo), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">No hay registros médicos aún</p>
                  <p className="text-sm text-gray-400 mt-1">Agregue vacunas, herrajes o estudios desde sus respectivas pestañas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Vacunas & Análisis
            ════════════════════════════════════════════════════ */}
        <TabsContent value="vacunas" className="space-y-4">
          {/* Vacunas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vacunas</CardTitle>
                <CardDescription>Historial de vacunación</CardDescription>
              </div>
              {!isCliente && (
                <Button size="sm" onClick={() => setModalVacuna(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {vacunas && vacunas.length > 0 ? (
                <div className="space-y-3">
                  {vacunas.map((vacuna) => (
                    <div key={vacuna.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={vacuna.aplicada ? 'default' : 'outline'}>{vacuna.tipo}</Badge>
                          <p className="text-sm text-gray-500">{format(new Date(vacuna.fecha), 'dd/MM/yyyy')}</p>
                        </div>
                        {vacuna.veterinario && <p className="text-sm text-gray-500">Veterinario: {vacuna.veterinario}</p>}
                        {vacuna.marca && <p className="text-sm text-gray-500">Marca: {vacuna.marca}</p>}
                        {vacuna.frecuencia_dias && <p className="text-sm text-gray-500">Frecuencia: cada {vacuna.frecuencia_dias} días</p>}
                        {vacuna.proxima_fecha && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próxima: {format(new Date(vacuna.proxima_fecha), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      {!isCliente && (
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteVacuna(vacuna.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No hay vacunas registradas</p>
              )}
            </CardContent>
          </Card>

          {/* Revisión Dental */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revisión Dental</CardTitle>
                <CardDescription>Historial de revisiones dentales</CardDescription>
              </div>
              {!isCliente && (
                <Button size="sm" onClick={() => setModalRevisionDental(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {revisiones && revisiones.length > 0 ? (
                <div className="space-y-3">
                  {revisiones.map((r) => (
                    <div key={r.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{format(new Date(r.fecha), 'dd/MM/yyyy')}</p>
                        {r.veterinario && <p className="text-sm text-gray-500">Veterinario: {r.veterinario}</p>}
                        {r.observaciones && <p className="text-sm text-gray-600 mt-1">{r.observaciones}</p>}
                        {r.proxima_revision && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próxima: {format(new Date(r.proxima_revision), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      {!isCliente && (
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteRevision(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No hay revisiones dentales</p>
              )}
            </CardContent>
          </Card>

          {/* Estudios Médicos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Otros Estudios</CardTitle>
                <CardDescription>Radiografías, ecografías y otros estudios</CardDescription>
              </div>
              {!isCliente && (
                <Button size="sm" onClick={() => setModalEstudioMedico(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {estudios && estudios.length > 0 ? (
                <div className="space-y-3">
                  {estudios.map((e) => (
                    <div key={e.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{e.tipo}</Badge>
                          <p className="text-sm text-gray-500">{format(new Date(e.fecha), 'dd/MM/yyyy')}</p>
                        </div>
                        {e.veterinario && <p className="text-sm text-gray-500">Veterinario: {e.veterinario}</p>}
                        {e.zona_estudiada && <p className="text-sm text-gray-500">Zona: {e.zona_estudiada}</p>}
                        {e.diagnostico && <p className="text-sm text-gray-600 mt-1">Diagnóstico: {e.diagnostico}</p>}
                        {e.observaciones && <p className="text-sm text-gray-600">{e.observaciones}</p>}
                      </div>
                      {!isCliente && (
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteEstudio(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No hay estudios médicos</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Herrajes
            ════════════════════════════════════════════════════ */}
        <TabsContent value="herrajes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Herrajes</CardTitle>
                <CardDescription>Historial de herrajes y próximas fechas</CardDescription>
              </div>
              {!isCliente && (
                <Button size="sm" onClick={() => setModalHerraje(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {herrajes && herrajes.length > 0 ? (
                <div className="space-y-3">
                  {herrajes.map((herraje) => (
                    <div key={herraje.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{format(new Date(herraje.fecha), 'dd/MM/yyyy')}</p>
                        {herraje.herrador && <p className="text-sm text-gray-500">Herrador: {herraje.herrador}</p>}
                        {herraje.observaciones && <p className="text-sm text-gray-700 mt-1">{herraje.observaciones}</p>}
                        {herraje.proximo_herraje && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próximo: {format(new Date(herraje.proximo_herraje), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {herraje.costo && <p className="font-bold text-sm">${herraje.costo}</p>}
                        {!isCliente && (
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteHerraje(herraje.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No hay herrajes registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Antiparasitarios
            ════════════════════════════════════════════════════ */}
        <TabsContent value="antiparasitarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Antiparasitarios</CardTitle>
                <CardDescription>Historial de aplicaciones antiparasitarias</CardDescription>
              </div>
              {!isCliente && (
                <Button size="sm" onClick={() => setModalAntiparasitario(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {antiparasitarios && antiparasitarios.length > 0 ? (
                <div className="space-y-3">
                  {antiparasitarios.map((ap) => (
                    <div key={ap.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{format(new Date(ap.fecha), 'dd/MM/yyyy')}</p>
                        {ap.marca && <p className="text-sm text-gray-500">Marca: {ap.marca}</p>}
                        {ap.drogas && <p className="text-sm text-gray-500">Drogas: {ap.drogas}</p>}
                        {ap.dosis && <p className="text-sm text-gray-500">Dosis: {ap.dosis}</p>}
                        {ap.observaciones && <p className="text-sm text-gray-600 mt-1">{ap.observaciones}</p>}
                        {ap.proxima_aplicacion && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Próxima: {format(new Date(ap.proxima_aplicacion), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      {!isCliente && (
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteAntiparasitario(ap.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No hay antiparasitarios registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Fotos
            ════════════════════════════════════════════════════ */}
        <TabsContent value="fotos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Galería de Fotos</CardTitle>
                <CardDescription>Fotos del caballo</CardDescription>
              </div>
              <Button size="sm" onClick={() => setModalFoto(true)}>
                <Plus className="h-4 w-4 mr-1" /> Agregar Foto
              </Button>
            </CardHeader>
            <CardContent>
              {fotos && fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fotos.map((foto) => (
                    <div key={foto.id} className="relative border rounded-lg overflow-hidden">
                      <img src={foto.url} alt={foto.descripcion || caballo.nombre} className="w-full h-48 object-cover" />
                      {foto.es_principal && <Badge className="absolute top-2 left-2 bg-blue-600">Principal</Badge>}
                      <div className="p-2 bg-white border-t">
                        {foto.descripcion && <p className="text-sm text-gray-600 mb-2 truncate">{foto.descripcion}</p>}
                        <div className="flex gap-1">
                          {!foto.es_principal && (
                            <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => marcarPrincipal(foto.id)}>
                              Principal
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 text-xs h-7 px-2" onClick={() => deleteFoto(foto.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">No hay fotos registradas</p>
                  <Button variant="outline" className="mt-3" onClick={() => setModalFoto(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar primera foto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: QR Code
            ════════════════════════════════════════════════════ */}
        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>Código QR único del caballo para acceso rápido</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              {caballo.qr_code ? (
                <div className="text-center space-y-4">
                  <img src={caballo.qr_code} alt={`QR Code de ${caballo.nombre}`} className="w-64 h-64 border-4 border-gray-200 rounded-lg" />
                  <p className="text-sm text-gray-500">Escanea este código para acceder a la ficha del caballo</p>
                  <Button variant="outline" onClick={() => window.print()}>Imprimir QR</Button>
                </div>
              ) : (
                <p className="text-gray-500">No hay código QR disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            TAB: Plan Sanitario
            ════════════════════════════════════════════════════ */}
        <TabsContent value="plan-sanitario">
          <PlanSanitarioTab caballoId={id!} />
        </TabsContent>
      </Tabs>

      {/* ════════════════════════════════════════════════════
          MODALES
          ════════════════════════════════════════════════════ */}

      {/* Modal: Agregar Vacuna */}
      <Dialog open={modalVacuna} onOpenChange={setModalVacuna}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Vacuna / Análisis</DialogTitle>
            <DialogDescription>Registre una nueva vacuna o análisis</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Tipo <span className="text-red-500">*</span></Label>
              <select value={formVacuna.tipo} onChange={(e) => setFormVacuna({ ...formVacuna, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TIPOS_VACUNA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={formVacuna.fecha} onChange={(e) => setFormVacuna({ ...formVacuna, fecha: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Veterinario</Label>
                <Input value={formVacuna.veterinario} onChange={(e) => setFormVacuna({ ...formVacuna, veterinario: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="space-y-1">
                <Label>Marca</Label>
                <Input value={formVacuna.marca} onChange={(e) => setFormVacuna({ ...formVacuna, marca: e.target.value })} placeholder="Marca" />
              </div>
              <div className="space-y-1">
                <Label>Frecuencia (días)</Label>
                <Input type="number" value={formVacuna.frecuencia_dias} onChange={(e) => setFormVacuna({ ...formVacuna, frecuencia_dias: e.target.value })} placeholder="30" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="aplicada" checked={formVacuna.aplicada} onChange={(e) => setFormVacuna({ ...formVacuna, aplicada: e.target.checked })} />
              <label htmlFor="aplicada" className="text-sm">Ya fue aplicada</label>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <textarea value={formVacuna.observaciones} onChange={(e) => setFormVacuna({ ...formVacuna, observaciones: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notas..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalVacuna(false)}>Cancelar</Button>
            <Button onClick={handleSubmitVacuna} disabled={!formVacuna.fecha}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Herraje */}
      <Dialog open={modalHerraje} onOpenChange={setModalHerraje}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Herraje</DialogTitle>
            <DialogDescription>Registre un nuevo herraje</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={formHerraje.fecha} onChange={(e) => setFormHerraje({ ...formHerraje, fecha: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Herrador</Label>
                <Input value={formHerraje.herrador} onChange={(e) => setFormHerraje({ ...formHerraje, herrador: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="space-y-1">
                <Label>Próximo Herraje</Label>
                <Input type="date" value={formHerraje.proximo_herraje} onChange={(e) => setFormHerraje({ ...formHerraje, proximo_herraje: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Costo ($)</Label>
                <Input type="number" step="0.01" value={formHerraje.costo} onChange={(e) => setFormHerraje({ ...formHerraje, costo: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <textarea value={formHerraje.observaciones} onChange={(e) => setFormHerraje({ ...formHerraje, observaciones: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notas..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalHerraje(false)}>Cancelar</Button>
            <Button onClick={handleSubmitHerraje} disabled={!formHerraje.fecha}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Antiparasitario */}
      <Dialog open={modalAntiparasitario} onOpenChange={setModalAntiparasitario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Antiparasitario</DialogTitle>
            <DialogDescription>Registre una nueva aplicación antiparasitaria</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={formAntiparasitario.fecha} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, fecha: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Marca</Label>
                <Input value={formAntiparasitario.marca} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, marca: e.target.value })} placeholder="Marca" />
              </div>
              <div className="space-y-1">
                <Label>Drogas</Label>
                <Input value={formAntiparasitario.drogas} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, drogas: e.target.value })} placeholder="Nombre del producto" />
              </div>
              <div className="space-y-1">
                <Label>Dosis</Label>
                <Input value={formAntiparasitario.dosis} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, dosis: e.target.value })} placeholder="Ej: 10ml" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Próxima aplicación</Label>
                <Input type="date" value={formAntiparasitario.proxima_aplicacion} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, proxima_aplicacion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <textarea value={formAntiparasitario.observaciones} onChange={(e) => setFormAntiparasitario({ ...formAntiparasitario, observaciones: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notas..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalAntiparasitario(false)}>Cancelar</Button>
            <Button onClick={handleSubmitAntiparasitario} disabled={!formAntiparasitario.fecha}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Revisión Dental */}
      <Dialog open={modalRevisionDental} onOpenChange={setModalRevisionDental}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Revisión Dental</DialogTitle>
            <DialogDescription>Registre una nueva revisión dental</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={formRevisionDental.fecha} onChange={(e) => setFormRevisionDental({ ...formRevisionDental, fecha: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Veterinario</Label>
                <Input value={formRevisionDental.veterinario} onChange={(e) => setFormRevisionDental({ ...formRevisionDental, veterinario: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Próxima Revisión</Label>
                <Input type="date" value={formRevisionDental.proxima_revision} onChange={(e) => setFormRevisionDental({ ...formRevisionDental, proxima_revision: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <textarea value={formRevisionDental.observaciones} onChange={(e) => setFormRevisionDental({ ...formRevisionDental, observaciones: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Estado dental, tratamientos..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalRevisionDental(false)}>Cancelar</Button>
            <Button onClick={handleSubmitRevisionDental} disabled={!formRevisionDental.fecha}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Foto */}
      <Dialog open={modalFoto} onOpenChange={setModalFoto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Foto</DialogTitle>
            <DialogDescription>Seleccione una foto del caballo desde su dispositivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Archivo de imagen <span className="text-red-500">*</span></Label>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setFormFoto({ ...formFoto, file });
                }}
              />
              <p className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, GIF, WEBP (máx. 10MB)</p>
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input value={formFoto.descripcion} onChange={(e) => setFormFoto({ ...formFoto, descripcion: e.target.value })} placeholder="Ej: Foto de perfil" />
            </div>
            {formFoto.file && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                <img src={URL.createObjectURL(formFoto.file)} alt="Preview" className="w-full h-32 object-cover rounded border" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalFoto(false)}>Cancelar</Button>
            <Button onClick={handleSubmitFoto} disabled={!formFoto.file}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Estudio Médico */}
      <Dialog open={modalEstudioMedico} onOpenChange={setModalEstudioMedico}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Estudio Médico</DialogTitle>
            <DialogDescription>Registre una nueva radiografía, ecografía u otro estudio</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Tipo de estudio <span className="text-red-500">*</span></Label>
              <select value={formEstudioMedico.tipo} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TIPOS_ESTUDIO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={formEstudioMedico.fecha} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, fecha: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Veterinario</Label>
                <Input value={formEstudioMedico.veterinario} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, veterinario: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Zona estudiada</Label>
                <Input value={formEstudioMedico.zona_estudiada} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, zona_estudiada: e.target.value })} placeholder="Ej: Miembros delanteros" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Diagnóstico</Label>
              <textarea value={formEstudioMedico.diagnostico} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, diagnostico: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Resultados del estudio..." />
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <textarea value={formEstudioMedico.observaciones} onChange={(e) => setFormEstudioMedico({ ...formEstudioMedico, observaciones: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notas adicionales..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalEstudioMedico(false)}>Cancelar</Button>
            <Button onClick={handleSubmitEstudioMedico} disabled={!formEstudioMedico.fecha}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
