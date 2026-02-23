import { useState, useEffect } from 'react';
import {
  PermisosCaballoSecciones,
  SeccionCaballo,
  SECCIONES_CABALLO_INFO,
  SECCIONES_CABALLO_FULL,
} from '@/types/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Info,
  Utensils,
  Activity,
  ClipboardList,
  Syringe,
  Hammer,
  Bug,
  Camera,
  QrCode,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PermisosCaballoManagerProps {
  secciones: PermisosCaballoSecciones | undefined;
  onChange: (secciones: PermisosCaballoSecciones) => void;
  readonly?: boolean;
  caballosVerEnabled?: boolean;
}

const SECCIONES_ICONS: Record<SeccionCaballo, any> = {
  info_general: Info,
  alimentacion: Utensils,
  manejo_trabajo: Activity,
  historial_clinico: ClipboardList,
  vacunas: Syringe,
  herrajes: Hammer,
  antiparasitarios: Bug,
  fotos: Camera,
  qr: QrCode,
  plan_sanitario: Shield,
};

const SECCIONES_ORDER: SeccionCaballo[] = [
  'info_general',
  'alimentacion',
  'manejo_trabajo',
  'historial_clinico',
  'vacunas',
  'herrajes',
  'antiparasitarios',
  'fotos',
  'qr',
  'plan_sanitario',
];

export function PermisosCaballoManager({
  secciones,
  onChange,
  readonly = false,
  caballosVerEnabled = true,
}: PermisosCaballoManagerProps) {
  const [expanded, setExpanded] = useState(false);
  const [seccionesState, setSeccionesState] = useState<PermisosCaballoSecciones>(
    secciones || SECCIONES_CABALLO_FULL
  );

  useEffect(() => {
    if (secciones) {
      setSeccionesState(secciones);
    }
  }, [secciones]);

  const handleTogglePermiso = (seccion: SeccionCaballo, accion: 'ver' | 'editar') => {
    if (readonly) return;

    const nuevasSecciones = { ...seccionesState };
    nuevasSecciones[seccion] = {
      ...nuevasSecciones[seccion],
      [accion]: !nuevasSecciones[seccion][accion],
    };

    // Si se desmarca "ver", también desmarcar "editar"
    if (accion === 'ver' && !nuevasSecciones[seccion].ver) {
      nuevasSecciones[seccion].editar = false;
    }

    setSeccionesState(nuevasSecciones);
    onChange(nuevasSecciones);
  };

  const handleToggleTodasSecciones = (accion: 'ver' | 'editar', value: boolean) => {
    if (readonly) return;

    const nuevasSecciones = { ...seccionesState };
    SECCIONES_ORDER.forEach((seccion) => {
      nuevasSecciones[seccion] = {
        ...nuevasSecciones[seccion],
        [accion]: value,
      };
      // Si se desmarca "ver", también desmarcar "editar"
      if (accion === 'ver' && !value) {
        nuevasSecciones[seccion].editar = false;
      }
    });

    setSeccionesState(nuevasSecciones);
    onChange(nuevasSecciones);
  };

  const handleHabilitarTodo = () => {
    if (readonly) return;
    setSeccionesState(SECCIONES_CABALLO_FULL);
    onChange(SECCIONES_CABALLO_FULL);
  };

  const todasVerMarcadas = SECCIONES_ORDER.every((s) => seccionesState[s]?.ver);
  const todasEditarMarcadas = SECCIONES_ORDER.every((s) => seccionesState[s]?.editar);

  // Si el módulo caballos no tiene permiso de ver, no mostrar este componente
  if (!caballosVerEnabled) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center text-gray-500">
          <p>El usuario no tiene acceso al módulo de Caballos.</p>
          <p className="text-sm mt-1">Active el permiso "Ver" en Caballos para configurar las secciones.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-beige-200">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-beige-600" />
              Permisos de Secciones del Caballo
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Configure qué secciones puede ver y editar el usuario dentro del detalle de un caballo
            </p>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {/* Botón para habilitar todo */}
          {!readonly && (
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={handleHabilitarTodo}>
                Habilitar todas las secciones
              </Button>
            </div>
          )}

          {/* Tabla de secciones */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Sección
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    <div className="flex flex-col items-center">
                      <span>Ver</span>
                      {!readonly && (
                        <Checkbox
                          checked={todasVerMarcadas}
                          onCheckedChange={(checked) =>
                            handleToggleTodasSecciones('ver', checked as boolean)
                          }
                          className="mt-1"
                        />
                      )}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    <div className="flex flex-col items-center">
                      <span>Editar</span>
                      {!readonly && (
                        <Checkbox
                          checked={todasEditarMarcadas}
                          onCheckedChange={(checked) =>
                            handleToggleTodasSecciones('editar', checked as boolean)
                          }
                          className="mt-1"
                        />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {SECCIONES_ORDER.map((seccion) => {
                  const info = SECCIONES_CABALLO_INFO[seccion];
                  const Icon = SECCIONES_ICONS[seccion];
                  const permisoSeccion = seccionesState[seccion] || { ver: false, editar: false };

                  return (
                    <tr key={seccion} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-beige-100">
                            <Icon className="h-4 w-4 text-beige-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{info.nombre}</p>
                            <p className="text-xs text-gray-500">{info.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Checkbox
                          checked={permisoSeccion.ver}
                          onCheckedChange={() => handleTogglePermiso(seccion, 'ver')}
                          disabled={readonly}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Checkbox
                          checked={permisoSeccion.editar}
                          onCheckedChange={() => handleTogglePermiso(seccion, 'editar')}
                          disabled={readonly || !permisoSeccion.ver}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Nota:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Ver:</strong> El usuario puede ver esta sección en el detalle del caballo</li>
              <li><strong>Editar:</strong> El usuario puede agregar/modificar registros en esta sección</li>
              <li>Para poder editar una sección, primero debe tener permiso de verla</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
