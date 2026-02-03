import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Waves,
  Users,
  Calendar,
  UserCog,
  Briefcase,
  DollarSign,
  FileText,
  Bell,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // Si no se especifica, todos los roles pueden acceder
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Caballos',
    href: '/caballos',
    icon: Waves,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Eventos',
    href: '/eventos',
    icon: Calendar,
  },
  {
    title: 'Empleados',
    href: '/empleados',
    icon: Briefcase,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: UserCog,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Pagos',
    href: '/pagos',
    icon: DollarSign,
    roles: ['super_admin', 'admin', 'empleado'],
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: FileText,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Alertas',
    href: '/alertas',
    icon: Bell,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.rol);
  });

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
          'lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header del sidebar en móvil */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 lg:hidden">
          <h2 className="text-lg font-bold text-beige-600">Menú</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col space-y-1 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-beige-100 text-beige-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
