import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/alertas/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4 lg:px-6">
        {/* Botón hamburguesa + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón hamburguesa solo en móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo y título - Responsive */}
          <h1 className="text-base font-bold text-beige-600 sm:text-lg lg:text-2xl">
            <span className="hidden sm:inline">Club Ecuestre</span>
            <span className="sm:hidden">Club</span>
          </h1>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {/* Notificaciones */}
          <NotificationBell />

          {/* Usuario - Desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-lg bg-beige-50 px-3 py-2">
              <User className="h-4 w-4 text-beige-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                  {user?.email}
                </span>
                <span className="text-xs capitalize text-gray-500">{user?.rol}</span>
              </div>
            </div>
          </div>

          {/* Ícono de usuario solo en móvil */}
          <div className="flex items-center lg:hidden">
            <div className="rounded-lg bg-beige-50 p-1.5 sm:p-2">
              <User className="h-4 w-4 text-beige-600 sm:h-5 sm:w-5" />
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <LogOut className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
