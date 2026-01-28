import { useState } from 'react';
import { Permisos, PermisoModulo, Modulo, PERMISOS_POR_ROL } from '@/types/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Waves,
  Users,
  Calendar,
  UserCog,
  DollarSign,
  FileText,
  Bell,
  Settings
} from 'lucide-react';

interface PermisosManagerProps {
  permisos: Permisos;
  rol?: string;
  onChange: (permisos: Permisos) => void;
  readonly?: boolean;
}

const MODULOS_INFO: Record<Modulo, { label: string; icon: any; description: string }> = {
  dashboard: {
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Vista general y estadísticas',
  },
  caballos: {
    label: 'Caballos',
    icon: Waves,
    description: 'Gestión de caballos y boxes',
  },
  clientes: {
    label: 'Clientes',
    icon: Users,
    description: 'Gestión de clientes',
  },
  eventos: {
    label: 'Eventos',
    icon: Calendar,
    description: 'Clases, competencias y eventos',
  },
  usuarios: {
    label: 'Usuarios',
    icon: UserCog,
    description: 'Gestión de usuarios del sistema',
  },
  pagos: {
    label: 'Pagos',
    icon: DollarSign,
    description: 'Gestión de pagos y facturación',
  },
  reportes: {
    label: 'Reportes',
    icon: FileText,
    description: 'Informes y reportes del sistema',
  },
  alertas: {
    label: 'Alertas',
    icon: Bell,
    description: 'Notificaciones y alertas',
  },
  configuracion: {
    label: 'Configuración',
    icon: Settings,
    description: 'Configuración del sistema',
  },
};

export function PermisosManager({ permisos, rol, onChange, readonly = false }: PermisosManagerProps) {
  const [permisosState, setPermisosState] = useState<Permisos>(permisos);

  const handleTogglePermiso = (modulo: Modulo, accion: keyof PermisoModulo) => {
    if (readonly) return;

    const nuevosPermisos = { ...permisosState };
    nuevosPermisos[modulo] = {
      ...nuevosPermisos[modulo],
      [accion]: !nuevosPermisos[modulo][accion],
    };

    setPermisosState(nuevosPermisos);
    onChange(nuevosPermisos);
  };

  const handleToggleTodosPermisosModulo = (modulo: Modulo, value: boolean) => {
    if (readonly) return;

    const nuevosPermisos = { ...permisosState };
    nuevosPermisos[modulo] = {
      modulo,
      ver: value,
      crear: value,
      editar: value,
      eliminar: value,
    };

    setPermisosState(nuevosPermisos);
    onChange(nuevosPermisos);
  };

  const handleCargarPermisosPorDefecto = () => {
    if (readonly || !rol) return;

    const permisosDefecto = PERMISOS_POR_ROL[rol];
    if (permisosDefecto) {
      setPermisosState(permisosDefecto);
      onChange(permisosDefecto);
    }
  };

  const modulos = Object.keys(MODULOS_INFO) as Modulo[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Permisos por Módulo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure los permisos específicos para cada módulo del sistema
          </p>
        </div>
        {!readonly && rol && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCargarPermisosPorDefecto}
          >
            Cargar permisos por defecto del rol
          </Button>
        )}
      </div>

      {/* Tabla de permisos */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Módulo
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Ver
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Crear
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Editar
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Eliminar
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Todos
                  </th>
                </tr>
              </thead>
              <tbody>
                {modulos.map((modulo) => {
                  const info = MODULOS_INFO[modulo];
                  const Icon = info.icon;
                  const permisoModulo = permisosState[modulo];
                  const todosMarcados =
                    permisoModulo.ver &&
                    permisoModulo.crear &&
                    permisoModulo.editar &&
                    permisoModulo.eliminar;

                  return (
                    <tr key={modulo} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-beige-100">
                            <Icon className="h-4 w-4 text-beige-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{info.label}</p>
                            <p className="text-xs text-gray-500">{info.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={permisoModulo.ver}
                          onCheckedChange={() => handleTogglePermiso(modulo, 'ver')}
                          disabled={readonly}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={permisoModulo.crear}
                          onCheckedChange={() => handleTogglePermiso(modulo, 'crear')}
                          disabled={readonly}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={permisoModulo.editar}
                          onCheckedChange={() => handleTogglePermiso(modulo, 'editar')}
                          disabled={readonly}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={permisoModulo.eliminar}
                          onCheckedChange={() => handleTogglePermiso(modulo, 'eliminar')}
                          disabled={readonly}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={todosMarcados}
                          onCheckedChange={(checked) =>
                            handleToggleTodosPermisosModulo(modulo, checked as boolean)
                          }
                          disabled={readonly}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Descripción de permisos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[80px]">Ver:</span>
            <span>Permite visualizar la información del módulo</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[80px]">Crear:</span>
            <span>Permite crear nuevos registros en el módulo</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[80px]">Editar:</span>
            <span>Permite modificar registros existentes en el módulo</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[80px]">Eliminar:</span>
            <span>Permite eliminar registros del módulo</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[80px]">Todos:</span>
            <span>Marca/desmarca todos los permisos del módulo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
