import { useAuthStore } from '@/stores/authStore';
import { Modulo, AccionPermiso } from '@/types/usuario';

export function usePermisos() {
  const { user } = useAuthStore();

  const tienePermiso = (modulo: Modulo, accion: AccionPermiso): boolean => {
    if (!user) return false;

    // Super admin tiene todos los permisos
    if (user.rol === 'super_admin') return true;

    // Si no hay permisos definidos, usar permisos por defecto del rol
    if (!user.permisos) return false;

    const permisoModulo = user.permisos[modulo];
    if (!permisoModulo) return false;

    return permisoModulo[accion];
  };

  const puedeVer = (modulo: Modulo) => tienePermiso(modulo, 'ver');
  const puedeCrear = (modulo: Modulo) => tienePermiso(modulo, 'crear');
  const puedeEditar = (modulo: Modulo) => tienePermiso(modulo, 'editar');
  const puedeEliminar = (modulo: Modulo) => tienePermiso(modulo, 'eliminar');

  const tieneAccesoModulo = (modulo: Modulo): boolean => {
    return puedeVer(modulo);
  };

  return {
    tienePermiso,
    puedeVer,
    puedeCrear,
    puedeEditar,
    puedeEliminar,
    tieneAccesoModulo,
    permisos: user?.permisos,
  };
}
